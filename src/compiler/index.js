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
    }


    var makeTxtNode = function(value) {
        if (value) {
            current.inner.push({
                'type': 'text',
                'text': value.match(/\{\{.+\}\}/g) ? compileExpr(value) : value
            });
        }
    }


    // Препаратор значения аттрибута style для интеграции в директивы
    var prepareStyleSource = function(styleValue) {
        var result;

        // Аттрибут может придти как в виде выражения (если в нём были "усы"),
        // так и в виде простой строки. нужно 2 разных поведения
        if (typeof styleValue == 'function') {
            result = '(' + styleValue.toString() + ').call(this)';

        // Если атрибут style пришёл в виде обычной строки
        } else {
            result = '"' + styleValue + '"';
        }

        return result;
    }


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
                            value: compileExpr('{{' + attribs['v-text'] + '}}')
                        };
                    }

                    if (name === 'v-html') {
                        element.dirs.html = {
                            value: compileExpr('{{{' + attribs['v-html'] + '}}}')
                        };
                    }

                    if (name === 'v-if') {
                        element.dirs.if = {
                            value: compileExpr('{{' + attribs['v-if'] + '}}')
                        };
                    }

                    if (name === 'v-model') {
                        element.dirs.model = {
                            value: compileExpr('{{' + attribs['v-model'] + '}}'),
                            options: {}
                        };

                        if (attribs['options']) {
                            element.dirs.model.options.options = compileExpr('{{' + attribs['options'] + '}}');
                        }
                    }

                    if (name === 'v-component') {
                        element.dirs.component = {
                            options: {}
                        };

                        if ( attribs['v-component'].match(/\{\{.+\}\}/g) ) {
                            element.dirs.component.value = compileExpr( attribs['v-component'] );
                        } else {
                            element.dirs.component.value = attribs['v-component'].trim();
                        }

                        if (attribs['wait-for']) {
                            element.dirs.component.options.waitFor = attribs['wait-for'];
                        }
                    }

                    if (name === 'v-partial') {
                        element.dirs.partial = {};
                        if ( attribs['v-partial'].match(/\{\{.+\}\}/g) ) {
                            element.dirs.partial.value = compileExpr( attribs['v-partial'] );
                        } else {
                            element.dirs.partial.value = attribs['v-partial'].trim();
                        }
                    }

                    if (name === 'v-repeat') {
                        element.dirs.repeat = {
                            value: tools.directive.parse(attribs['v-repeat'])[0]
                        };
                        repeatItems.push(element);
                    }

                    if (name === 'v-with') {
                        element.dirs.with = {
                            value: tools.directive.parse(attribs['v-with'])
                        };

                        element.dirs.with.value.forEach(function (item) {
                            delete item.expression;
                            item.key = compileExpr('{{' + item.key + '}}');
                        });
                    }

                    if (name === 'v-class') {
                        var vClassDir = tools.directive.parse(attribs['v-class']);
                         
                        if (vClassDir[0].arg) {
                            vClassDir.forEach(function(item) {
                                item.key = compileExpr('{{' + item.key + '}}');
                                delete item.expression;
                            });

                            element.dirs.class = {
                                value: vClassDir
                            };
                        } 
                    }

                    if (name === 'v-attr') {
                        element.dirs.attr = {
                            value: tools.directive.parse(attribs['v-attr'])
                        };
                    }

                    if (name === 'v-show') {
                        element.dirs.show = {
                            value: compileExpr('{{' + attribs['v-show'] + '}}'),
                            order: attribsCounter
                        };
                    }

                    if (name === 'v-style') {
                        var vStyleDir = tools.directive.parse(attribs['v-style']);

                        if (!vStyleDir[0].arg) {
                            vStyleDir = compileExpr('{{' + vStyleDir[0].key + '}}');
                        } else {
                            vStyleDir.forEach(function(item) {
                                item.key = compileExpr('{{' + item.key + '}}');
                                delete item.expression;
                            });
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
                        // Если в значениях аттрибутов были выражения - компилируем их в функции
                        if (value.match(/\{\{.+\}\}/g)) {
                            element.attribs[name] = compileExpr(value);

                        // Если нет, то записываем как обычную строку
                        } else {
                            element.attribs[name] = value;
                        }
                        
                    }
                })


                // Кишки от директивы v-attr
                if (element.dirs.attr) {
                    element.dirs.attr.value.forEach(function(item) {
                        element.attribs[item.arg] = compileExpr('{{' + item.key + '}}');
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
                    makeTxtNode(txtNode);

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

                makeTxtNode( text.substring(caret, text.length) );
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