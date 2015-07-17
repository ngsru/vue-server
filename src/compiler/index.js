var htmlparser = require('htmlparser2');
var _ = require('underscore');
var utils = require('../utils');
var strFnObj = require('../serializer');

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
    'v-component': ['wait-for', 'keep-alive', 'transition-mode', 'inline-template']
};


var tools = {
    exp: require('./exp-parser.js'),
    text: require('./text-parser.js'),
    directive: require('./directive.js')
};



var parsers = {
    directive: require('./parsers/directive'),
    expression: require('./parsers/expression'),
    path: require('./parsers/path'),
    text: require('./parsers/text')
};



var compileExpr = function(text) {
    text = text.replace(/\n|\r|\t/g, ' ');
    var expr = tools.text.parseAttr(text);
    var fn;

    if (expr) {
        fn = tools.exp.parse(expr);
    }

    if (!fn) {
        fn = new Function('return "' + text + '";');
    }

    return fn;
};


var tokensToFn = function(tokens) {
    var expr = parsers.text.tokensToExp(tokens);
    return parsers.expression.parse(expr).get;
};


var textToFn = function(text) {
    var tokens = parsers.text.parse(text);
    var expr = parsers.text.tokensToExp(tokens);
    return parsers.expression.parse(expr).get;
};


var parseDirective = function(value) {
    var result = parsers.directive.parse(value);

    result.forEach(function(item) {
        item.get = parsers.expression.parse(item.expression).get
        delete item.raw;
    });

    return result;
}


var getMetaValue = function(value) {
    var result = [];
    var tokens = parsers.text.parse(value);

    if (tokens) {
        tokens.forEach(function(token) {
            if (token.tag) {
                var parsedToken = parsers.directive.parse(token.value)[0];
                var exp = parsers.expression.parse(parsedToken.expression);
                var item = {
                    value: {
                        get: exp.get
                    },
                    isEscape: token.html ? false : true,
                    isClean: true
                }

                if (parsedToken.filters) {
                    item.value.filters = parsedToken.filters;
                }
                result.push(item);
            } else {
                result.push({
                    value: {
                        get: token.value
                    },
                    isEscape: false,
                    isClean: false
                });
            }
        });
    } else {
        return value;
    }

    return result;
}

var makeTxtNode = function(current, value) {
    if (value) {
        current.inner.push({
            'type': 'text',
            'text': getMetaValue(value)
        });
    }
};






// Конвертируем голый HTML в специальное дерево массивов-объектов
var Compile = function(template) {
    if (template === undefined || template === null) {
        template = '';
    }

    if (typeof template !== 'string') {
        console.log('vue-html-compile: template is not fit for compiling');
        return template;
    }
    
    var mass = {'inner': []},
        current = mass,
        preIsActive = false,

        // Индикатор углубление в dom tree относительно директивы v-pre
        // нужно, чтобы знать, когда снять флаг preIsActive
        preIsActiveDepth = 0;


    var repeatItems = [];





    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs) {
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

                _.each(attribs, function(attrVal, attr) {
                    // Удаляем из дерева vue-директивы
                    if ( attr.match(/^v-/) ) {
                        delete attribs[attr];
                    }
                });
            }


            // Если элемент находится внутри директивы v-pre
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
                    'type': 'tag',
                    'name': name,
                    'attribs': {},
                    'inner': [],
                    'dirs': {},
                    'parent': current,
                    'close': true,
                    'pre': false
                }


                // Теги, которые не должны иметь закрывающего тега
                if ( noCloseTags[element.name] ) {
                    element.close = false;
                }


                var attribsForExclude = {};
                var attribsCounter = 0;

                _.each(attribs, function(value, name) {
                    if (name === 'v-text') {
                        element.dirs.text = {
                            value: parseDirective(attribs['v-text'])[0]
                        };
                    }

                    if (name === 'v-html') {
                        element.dirs.html = {
                            value: parseDirective(attribs['v-html'])[0]
                        };
                    }

                    if (name === 'v-if') {
                        element.dirs.if = {
                            value: parseDirective(attribs['v-if'])[0]
                        };
                    }

                    if (name === 'v-model') {
                        element.dirs.model = {
                            value: parseDirective(attribs['v-model'])[0],
                            options: {}
                        };

                        if (attribs['options']) {
                            element.dirs.model.options.options = parseDirective(attribs['options'])[0];
                        }
                    }

                    if (name === 'v-component') {
                        (function() {
                            element.dirs.component = {
                                options: {}
                            };

                            var tokens = parsers.text.parse(attribs['v-component']);

                            if (!tokens) {
                                element.dirs.component.value = attribs['v-component'].trim();
                            } else {
                                element.dirs.component.value = tokensToFn(tokens);
                            }

                            if (attribs['wait-for']) {
                                element.dirs.component.options.waitFor = attribs['wait-for'];
                            }
                        })();
                    }

                    if (name === 'v-partial') {
                        (function() {
                            element.dirs.partial = {};

                            var tokens = parsers.text.parse(attribs['v-partial']);

                            if (!tokens) {
                                element.dirs.partial.value = attribs['v-partial'].trim();
                            } else {
                                element.dirs.partial.value = tokensToFn(tokens);
                            }
                        })();
                    }

                    if (name === 'v-repeat') {
                        element.dirs.repeat = {
                            value: parseDirective(attribs['v-repeat'])[0]
                        };

                        repeatItems.push(element);
                    }

                    if (name === 'v-with') {
                        element.dirs.with = {
                            value: parseDirective(attribs['v-with'])
                        };
                    }

                    if (name === 'v-class') {
                        var vClassDir = parseDirective(attribs['v-class'])

                        element.dirs.class = {
                            value: null
                        };

                        // Когда классы в самой директивы
                        if (vClassDir[0].arg) {
                            element.dirs.class.value = vClassDir;

                        // Когда в директиву передаём объект
                        } else {
                            element.dirs.class.value = parsers.expression.parse(vClassDir[0].expression);
                        }
                    }

                    if (name === 'v-attr') {
                        element.dirs.attr = {
                            value: tools.directive.parse(attribs['v-attr'])
                        };
                    }

                    if (name === 'v-show') {
                        element.dirs.show = {
                            value: parseDirective(attribs['v-show'])[0],
                            order: attribsCounter
                        };
                    }

                    if (name === 'v-style') {
                        var vStyleDir = parseDirective(attribs['v-style'])

                        element.dirs.class = {
                            value: null
                        };

                        // Когда классы в самой директивы
                        if (vStyleDir[0].arg) {
                            element.dirs.class.value = vStyleDir;

                        // Когда в директиву передаём объект
                        } else {
                            element.dirs.class.value = parsers.expression.parse(vStyleDir[0].expression);
                        }

                        element.dirs.style = {
                            value: vStyleDir,
                            order: attribsCounter
                        };
                    }

                    if (name === 'v-ref') {
                        element.dirs.ref = {
                            value: attribs['v-ref']
                        };
                    }


                    // Аттрибуты-опции директив, которые нужны будет исключить из списка атрибутов
                    if (directiveOptions[name]) {
                        directiveOptions[name].forEach(function(item) {
                            attribsForExclude[item] = true;
                        });
                    }

                    attribsCounter++;
                });



                _.each(attribs, function(value, name) {
                    // Удаляем из дерева vue-директивы кроме v-clock (нефиг их рендерить)
                    if ( 
                        ( !name.match(/^v-/) || name.match(/^v-cloak$/) ) &&
                        !attribsForExclude[name]
                    ) {
                        element.attribs[name] = getMetaValue(value);
                    }
                })


                // Кишки от директивы v-attr
                if (element.dirs.attr) {
                    element.dirs.attr.value.forEach(function(item) {
                        element.attribs[item.arg] = getMetaValue('{{{' + item.key + '}}}');
                    });
                }

                // Убираем пустой объект dirs из тега
                if (!_.size(element.dirs)) {
                    delete element.dirs;
                }


                current.inner.push(element);

                current = element;
                // COMMON TAG - end
            }

        },

        ontext: function(text) {
            var caret;

            // Если элемент находится внутри директивы v-pre
            if (preIsActive) {
                current.text += text;

            } else {
                // Координата символа, на котором было последнее отрезание текст-ноды
                caret = 0;

                // Костылик для реализации вывода JSON через выражение {{* variable}}
                // text = text.replace(/\{\{\s*\*\s*(.+?)\s*\}\}/g, '{{__JSON__$1}}');

                // Ищем партиалы, создаём для них специальные ноды, разбивая один кусок текста на несколько нод
                text.replace(/\{\{\s*>\s*(.+?)\s*\}\}/g, function(match, name, pos) {
                    var txtNode = text.substring(caret, pos);
                    makeTxtNode(current, txtNode);

                    current.inner.push({
                        'type': 'tag',
                        'name': 'template',
                        'attribs': {},
                        'inner': [],
                        'dirs': {
                            'partial': {
                                'value': name
                            }
                        },
                        'close': true,
                        'pre': false
                    });

                    caret = pos + match.length;
                });

                makeTxtNode( current, text.substring(caret, text.length) );
            }

        },

        onclosetag: function(name) {
            var now;

            // Если элемент находится внутри директивы v-pre
            if (preIsActive) {
                // На каждом закрывающем теге мы поднимаемся вверх по дереву
                // Как только preIsActiveDepth станет пустым, это будет означать, что мы достигли элемента
                // на котором началась директива v-pre
                preIsActiveDepth--;

                if ( noCloseTags[name] ) {
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

        // тут идёт доктайп
        onprocessinginstruction: function(name, data) {
            // Если элемент находится внутри директивы v-pre
            if (preIsActive) {
                current.text += '<' + data + '>';

            } else {
                current.inner.push({
                    'type': 'text',
                    'text': '<' + data + '>'
                });
            }
        },

        // Сюда так же идут conditional comments
        // Нужно ли здесь вводить обработку выражений? а хз
        oncomment: function(data) {
            if (preIsActive) {
                current.text += '<!-- ' + data + ' -->';
            } else {
                if ( data.match(/^\[CDATA\[/) && data.match(/\]\]$/) ) {
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

        onerror: function(error) {
            utils.warn(error);
        }
    },
    {
        // xmlMode: true
        lowerCaseTags: false
    });
    parser.write(template);
    parser.end();


    for (var i = repeatItems.length - 1; i >= 0; i--) {
        var clone = new Function( 'return ' + strFnObj( repeatItems[i] ) );
        repeatItems[i].clone = clone;
    };
    

    return new Function( 'return ' + strFnObj(mass.inner) );
}




module.exports = Compile;