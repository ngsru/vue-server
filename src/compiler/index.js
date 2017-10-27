var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();

var htmlparser = require('htmlparser2');
var utils = require('./../utils.js');
var strFnObj = require('../serializer');
var log4js = require('log4js');
var logger = log4js.getLogger('[VueServer Compile]');

var noCloseTags = {
    input: true,
    img: true,
    br: true,
    hr: true,
    meta: true,
    link: true
};

var directiveOptions = {
    'v-model': ['lazy', 'number', 'options', 'debounce'],
    'v-repeat': ['track-by'],
    'v-for': ['track-by'],
    'v-component': ['keep-alive', 'transition-mode', 'inline-template']
};

var vueConfig = require('vue/src/config');
vueConfig.silent = true;

var parsers = {
    directive: require('vue/src/parsers/directive'),
    directiveNew: require('vue/src/parsers/directive-new'),
    expression: require('vue/src/parsers/expression'),
    path: require('vue/src/parsers/path'),
    text: require('vue/src/parsers/text')
};

var tokensToFn = function (tokens) {
    var expr = parsers.text.tokensToExp(tokens);
    return parsers.expression.parse(expr).get;
};

var textToFn = function (text) {
    var tokens = parsers.text.parse(text);
    var expr = parsers.text.tokensToExp(tokens);
    return parsers.expression.parse(expr).get;
};

var parseDirective = function (value) {
    // Decoding entities.
    // Looks like browsers perfrom the operation automatically,
    // while we need to do it manually
    value = entities.decode(value);

    var result = parsers.directive.parse(value);

    var item;
    for (var i = 0; i < result.length; i++) {
        item = result[i];

        var parsedExp = parsers.expression.parse(item.expression);
        if (!parsedExp) {
            logger.warn('Invalid expression: "' + item.expression + '"');
            result = false;
            break;
        }
        item.get = parsedExp.get;
        delete item.raw;
    }

    return result;
};

var dashToCamelCase = function (value) {
    return value.replace(/-(\w)/g, function (a, b) {
        return b.toUpperCase();
    });
};

var getMetaValue = function (value) {
    // Decoding entities.
    // Looks like browsers perfrom the operation automatically,
    // while we need to do it manually
    value = entities.decode(value);
    var result = [];
    var tokens = parsers.text.parse(value);

    if (tokens) {
        var token;
        for (var i = 0; i < tokens.length; i++) {
            token = tokens[i];

            if (token.tag) {

                var parsedToken = parsers.directive.parse(token.value)[0];
                var exp = parsers.expression.parse(parsedToken.expression);

                if (!exp) {
                    logger.warn('Invalid expression: "' + parsedToken.expression + '"');
                    result = false;
                    break;
                }
                var item = {
                    value: exp.get,
                    isEscape: token.html ? false : true,
                    isClean: true
                };

                if (parsedToken.filters) {
                    item.filters = parsedToken.filters;
                }
                result.push(item);
            } else {
                result.push({
                    value: token.value,
                    isEscape: false,
                    isClean: false
                });
            }
        }

        if (result && result.length === 1) {
            return result[0];
        } else {
            return result;
        }

    } else {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        if (Number(value) == value && !(Number(value) === 0 && value !== '0')) {
            return Number(value);
        }

        return value;
    }
};

var makeTxtNode = function (current, value) {
    if (value) {
        current.inner.push({
            'type': 'text',
            'text': getMetaValue(value)
        });
    }
};

var bindRE = /^:|^v-bind:/;
var refRE = /^v-ref:/;
var elRE = /^v-el:/;
var onRE = /^@|^v-on:/;
var argRE = /:(.*)$/;
var onArgRE = /[:|@](.*)$/;
var vForValRE = /\((.+)\)/;

// Converting raw HTML into special array-objects tree
var Compile = function (template) {
    if (template === undefined || template === null) {
        template = '';
    }

    if (typeof template !== 'string') {
        console.log('vue-html-compile: template is not fit for compiling');
        return template;
    }

    var mass = {'inner': []};
    var current = mass;
    var preIsActive = false;

    // v-pre directive dom tree depth count
    // Necessary to detect the moment to turn preIsActive flag
    var preIsActiveDepth = 0;
    var elementsCount = 0;

    var repeatItems = [];

    var parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            var element;

            if ('v-pre' in attribs && !preIsActive) {
                element = {
                    'type': 'text',
                    'text': '',
                    'parent': current
                };

                preIsActive = true;
                element.pre = true;

                current.inner.push(element);

                current = element;

                utils.each(attribs, function (attrVal, attr) {
                    // Removing Vue-directives from tree
                    if (attr.match(/^v-/)) {
                        delete attribs[attr];
                    }
                });
            }

            // If element is inside of v-pre directive
            if (preIsActive) {
                preIsActiveDepth++;

                var tag = '<' + name;

                for (var key in attribs) {
                    tag += ' ' + key + '=\"' + attribs[key] + '\"';
                }

                tag += '>';

                current.text += tag;

            } else {

                // COMMON TAG - begin
                element = {
                    'id': elementsCount,
                    'type': 'tag',
                    'name': name,
                    'attribs': {},
                    'inner': [],
                    'dirs': {},
                    'parent': current,
                    'close': true,
                    'pre': false
                };

                elementsCount++;

                // Tags that do not need to have a closing tag
                if (noCloseTags[element.name]) {
                    element.close = false;
                }

                var attribsForExclude = [];
                var attribsCounter = 0;

                utils.each(attribs, function (value, name) {
                    // v-bind
                    if (name.match(bindRE)) {
                        (function () {
                            var attr = name.match(argRE)[1].replace(/\.sync$|\.once$/, '');

                            element.dirs.bind = element.dirs.bind || {};

                            var dirValue = parseDirective(attribs[name]);

                            if (dirValue) {
                                element.dirs.bind[attr] = {
                                    value: dirValue[0]
                                };
                            }
                        })();
                    } else if (name === 'v-bind') {
                        (function () {
                            element.dirs.bindMany = element.dirs.bindMany || {};

                            var dirValue = parseDirective(attribs[name]);

                            if (dirValue) {
                                element.dirs.bindMany = {
                                    value: dirValue[0]
                                };
                            }
                        })();
                    }

                    // v-on:name
                    if (name.match(onRE)) {
                        (function () {
                            var event = name.match(onArgRE);
                            var parsedDir = parseDirective(attribs[name]);
                            var handler = parsedDir[0].get;
                            if (event) {
                                element.dirs.on = element.dirs.on || {};
                                element.dirs.on[event[1]] = {
                                    value: {
                                        handler: handler,
                                        hasArgs: /\((.*)\)/.test(value)
                                    }
                                };
                            }
                        })();
                    }

                    // v-ref:name
                    if (name.match(refRE)) {
                        (function () {
                            var ref = name.match(argRE)[1];

                            if (ref) {
                                element.dirs.ref = {
                                    value: dashToCamelCase(ref)
                                };
                            }
                        })();
                    }

                    // v-el:name
                    if (name.match(elRE)) {
                        (function () {
                            var el = name.match(argRE)[1];

                            if (el) {
                                element.dirs.el = {
                                    value: dashToCamelCase(el)
                                };
                            }
                        })();
                    }

                    // v-for
                    if (name === 'v-for' && attribs['v-for']) {
                        (function () {
                            var value = attribs['v-for'];
                            var text = value.split(' in ');
                            var expression = text[1];
                            if (!expression) {
                                logger.warn('Invalid expression: "' + value + '"');
                                return;
                            }
                            var arg = text[0].match(vForValRE);
                            var index;
                            var rawValue = parseDirective(expression);

                            if (arg) {
                                arg = arg[1].replace(/ /g, '').split(',');
                                index = arg[0];
                                arg = arg[1];
                            } else {
                                arg = text[0];
                            }

                            if (arg && rawValue) {
                                rawValue = rawValue[0];

                                element.dirs.for = {
                                    value: {
                                        arg: arg,
                                        expression: expression,
                                        get: rawValue.get
                                    }
                                };

                                element.dirs.for.value.index = index;

                                if (rawValue.filters) {
                                    element.dirs.for.value.filters = rawValue.filters;
                                }

                                repeatItems.push(element);
                            } else {
                                logger.warn('Invalid expression: "' + value + '"');
                            }
                        })();

                    }

                    if (name === 'v-else') {
                        // Searching for closest tag, checking it for v-if
                        (function () {
                            for (var i = current.inner.length - 1; i >= 0; i--) {
                                if (current.inner[i].type === 'tag') {
                                    if (current.inner[i].dirs) {
                                        // v-if
                                        if (current.inner[i].dirs.if) {
                                            var vIfDir = parseDirective(
                                                '!(' + current.inner[i].dirs.if.value.expression + ')'
                                            );
                                            if (vIfDir) {
                                                element.dirs.if = {
                                                    value: vIfDir[0]
                                                };
                                            }

                                            break;
                                        }

                                        // v-show
                                        if (current.inner[i].dirs.show) {
                                            var vIfDir = parseDirective(
                                                '!(' + current.inner[i].dirs.show.value.expression + ')'
                                            );
                                            if (vIfDir) {
                                                element.dirs.show = {
                                                    value: vIfDir[0]
                                                };
                                            }
                                        }
                                    }

                                    break;
                                }
                            }
                        })();
                    }

                    if (name === 'v-text') {
                        var vTextDir = parseDirective(attribs['v-text']);
                        if (vTextDir) {
                            element.dirs.text = {
                                value: vTextDir[0]
                            };
                        }
                    }

                    if (name === 'v-html') {
                        var vHtmlDir = parseDirective(attribs['v-html']);
                        if (vHtmlDir) {
                            element.dirs.html = {
                                value: vHtmlDir[0]
                            };
                        }
                    }

                    if (name === 'v-if') {
                        var vIfDir = parseDirective(attribs['v-if']);
                        if (vIfDir) {
                            element.dirs.if = {
                                value: vIfDir[0]
                            };
                        }
                    }

                    if (name === 'v-model') {
                        var vModelDir = parseDirective(attribs['v-model']);
                        if (vModelDir) {
                            element.dirs.model = {
                                value: vModelDir[0],
                                options: {}
                            };

                            if (attribs.options) {
                                var vModelDirOptions = parseDirective(attribs.options);
                                if (vModelDirOptions) {
                                    element.dirs.model.options.options = vModelDirOptions[0];
                                }
                            }
                        }
                    }

                    if (name === 'v-component') {
                        (function () {
                            element.dirs.component = {
                                options: {}
                            };

                            var tokens = parsers.text.parse(attribs['v-component']);

                            if (!tokens) {
                                element.dirs.component.value = attribs['v-component'].trim();
                            } else {
                                element.dirs.component.value = tokensToFn(tokens);
                            }
                        })();
                    }

                    if (name === 'v-repeat') {
                        var vRepeatDir = parseDirective(attribs['v-repeat']);
                        if (vRepeatDir) {
                            element.dirs.repeat = {
                                value: vRepeatDir[0]
                            };
                            repeatItems.push(element);
                        }
                    }

                    if (name === 'v-with') {
                        var vWithDir = parseDirective(attribs['v-with']);
                        if (vWithDir) {
                            element.dirs.with = {
                                value: vWithDir
                            };
                        }
                    }

                    if (name === 'v-class') {
                        var vClassDir = parseDirective(attribs['v-class']);

                        if (vClassDir) {
                            element.dirs.class = {
                                value: null
                            };

                            // When classes is inside a directive
                            if (vClassDir[0].arg) {
                                element.dirs.class.value = vClassDir;

                            // When directive value is Object
                            } else {
                                element.dirs.class.value = parsers.expression.parse(vClassDir[0].expression);
                            }
                        }
                    }

                    if (name === 'v-style') {
                        var vStyleDir = parseDirective(attribs['v-style']);

                        if (vStyleDir) {
                            element.dirs.style = {
                                value: null,
                                order: attribsCounter
                            };

                            // When classes is inside a directive
                            if (vStyleDir[0].arg) {
                                element.dirs.style.value = vStyleDir;

                            // When directive value is Object
                            } else {
                                element.dirs.style.value = parsers.expression.parse(vStyleDir[0].expression);
                            }
                        }
                    }

                    if (name === 'v-attr') {
                        var vAttrDir = parseDirective(attribs['v-attr']);
                        if (vAttrDir) {
                            element.dirs.attr = {
                                value: vAttrDir
                            };
                        }
                    }

                    if (name === 'v-show') {
                        var vShowDir = parseDirective(attribs['v-show']);
                        if (vShowDir) {
                            element.dirs.show = {
                                value: vShowDir[0],
                                order: attribsCounter
                            };
                        }
                    }

                    if (name === 'v-ref') {
                        element.dirs.ref = {
                            value: attribs['v-ref']
                        };
                    }

                    if (name === 'v-el') {
                        element.dirs.el = {
                            value: attribs['v-el']
                        };
                    }

                    // Directive options to be excluded
                    var dirOptions = directiveOptions[name];
                    if (dirOptions) {
                        attribsForExclude = attribsForExclude.concat(dirOptions);
                    }

                    attribsCounter++;
                });

                utils.each(attribs, function (value, name) {
                    // Removing Vue-directives from tree except v-clock
                    if (
                        (!name.match(/^v-/) || name.match(/^v-cloak$/)) &&
                        !name.match(/^:(.+)/) &&
                        !name.match(onRE) &&
                        attribsForExclude.indexOf(name) === -1
                    ) {
                        element.attribs[name] = getMetaValue(value);
                    }
                });

                // v-attr
                if (element.dirs.attr) {
                    (function () {
                        var item;
                        for (var i = 0; i < element.dirs.attr.value.length; i++) {
                            item = element.dirs.attr.value[i];
                            element.attribs[item.arg] = {
                                value: item.get
                            };
                        }
                    })();
                }

                // If a <template> has no directives it means it should be rendered as real tag
                if (element.name === 'template' && !utils.size(element.dirs)) {
                    element.isMaterial = true;
                }

                current.inner.push(element);

                current = element;
                // COMMON TAG - end
            }

        },

        ontext: function (text) {
            var caret;

            // If element is inside v-pre directive
            if (preIsActive) {
                current.text += text;

            } else {
                makeTxtNode(current, text.substring(caret, text.length));
            }

        },

        onclosetag: function (name) {
            var now;

            // If element is inside v-pre directive
            if (preIsActive) {
                // At each closing tag, we climb up the tree
                // We have reached an initial element if prIsActiveDepth becomes 0
                preIsActiveDepth--;

                if (noCloseTags[name]) {
                    current.text += '</' + name + '>';
                }
            }

            if (!preIsActive || !preIsActiveDepth) {
                preIsActive = false;

                now = current;
                current = current.parent;

                delete now.parent;
            }
        },

        // Doctype
        onprocessinginstruction: function (name, data) {
            // If element is inside v-pre directive
            if (preIsActive) {
                current.text += '<' + data + '>';

            } else {
                current.inner.push({
                    'type': 'text',
                    'text': '<' + data + '>'
                });
            }
        },

        // Conditional comments
        oncomment: function (data) {
            if (preIsActive) {
                current.text += '<!-- ' + data + ' -->';
            } else {
                if (data.match(/^\[CDATA\[/) && data.match(/\]\]$/)) {
                    current.inner.push({
                        'type': 'text',
                        'text': '<!' + data + '>'
                    });
                } else {
                    current.inner.push({
                        'type': 'text',
                        'text': '<!-- ' + data + ' -->'
                    });
                }
            }
        },

        onerror: function (error) {
            logger.warn(error);
        }
    },
    {
        // xmlMode: true
        lowerCaseTags: false
    });
    parser.write(template.trim());
    parser.end();

    for (var i = repeatItems.length - 1; i >= 0; i--) {
        var clone = new Function('return ' + strFnObj(repeatItems[i]));
        repeatItems[i].clone = clone;
    }

    return new Function('return ' + strFnObj(mass.inner));
};

module.exports = Compile;
