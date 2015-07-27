var cssParser = require('../css');
var common = require('./common.js');
var _ = require('underscore');


var compilers = {
    compile: function(vm) {
        compilers.compileViewModels(vm);
        return vm;
    },


    compileViewModels: function(vm) {
        var childVm;

        compilers.compileElements(vm, [vm.$el]);

        if (!vm._children) return;

        for (var i = 0, l = vm._children.length; i < l; i++) {
            childVm = vm._children[i];
            compilers.compileViewModels(childVm);
        }
    },


    compileElements: function(vm, elements) {
        var element;

        for (var i = 0, l = elements.length; i < l; i++) {
            element = common.setElement(elements[i]);
            compilers.compileElement(vm, element); 
        };
    },


    compileElement: function(vm, element) {
        var foreignKeyElement = false;

        // В зависимости от того, является ли этот элемент ключевым для контекста v-repeat-а или нет
        // нужно по-разному его компилировать
        // если это элемент v-repeat-а, то и он сам и его кишки компилируются в контексте repeat-а
        // если же это элемент ТОЛЬКО компонента, то его собственные аттрибуты компилируются
        // в контексте родительского vm-а, а кишки - в собственном контексте
        if (element._isKeyElement && vm.$el != element) {
            foreignKeyElement = true;
        }

        // _compileSelfInParentVm присвоено элементам НЕ из v-repeat
        if (foreignKeyElement) {
            if (element._compileSelfInParentVm) {
                compilers._compileTag(vm, element);
            }

            return;
        }

        compilers._compileTag(vm, element);

        // Текстовая нода
        if (element.type === 'text') {
            element.text = common.getCleanedValue(vm, element.text);
        }


        // Дочерние элементы тега
        if (element.inner) {
            compilers.compileElements(vm, element.inner);
        } 
    },


    _compileTag: function(vm, element) {
        if (element.compiled) {
            return;
        }
        
        if (element.type === 'tag') {
            // v-model
            if (element.dirs.model) {
                compilers._compileDirectiveModel(vm, element);
            }
            

            // v-text
            if (element.dirs.text) {
                compilers._setInnerText(vm, element, element.dirs.text.value);
            }


            // v-html
            if (element.dirs.html) {
                compilers._setInnerText(vm, element, element.dirs.html.value);
            }


            // Компилируем аттрибуты тега
            for (var key in element.attribs) {
                element.attribs[key] = common.getValue( vm, element.attribs[key] );
            }

            compilers._compileAttributeDirectives(vm, element);

            element.compiled = true;
        }
    },


    _setInnerText: function(vm, element, text) {
        element.inner = [{
            'type': 'text',
            'text': common.getCleanedValue(vm, text)
        }];
    },


    _compileAttributeDirectives: function(vm, element) {
        // v-class
        if (element.dirs.class) {
            var classList;
            var vClassVm = element.dirs.class.vm ? element.dirs.class.vm : vm;

            if (element.attribs.class) {
                classList = element.attribs.class.split(' ');
                classList = classList.filter(function (item) {
                    return item;
                });
            } else {
                classList = [];
            }

            element.dirs.class.value.forEach(function (item) {
                if ( common.getValue(vClassVm, item.key) ) {
                    classList.push(item.arg);
                }
            });

            element.attribs.class = _.uniq(classList).join(' ');
        }
        
        // v-style && v-show
        var styles = {};
        if (element.dirs.style && element.dirs.show) {
            // Правильность применения стилей от данных директив
            // должна зависеть от порядка их объявления в теге
            if (element.dirs.style.order < element.dirs.show.order) {
                _.extend(
                    styles,
                    compilers._compileDirectiveStyle(vm, element),
                    compilers._compileDirectiveShow(vm, element)
                );
                
            } else {
                _.extend(
                    styles,
                    compilers._compileDirectiveShow(vm, element),
                    compilers._compileDirectiveStyle(vm, element)
                );
            }

        // v-style
        } else if (element.dirs.style) {
            styles = compilers._compileDirectiveStyle(vm, element);

        // v-show
        } else if (element.dirs.show) {
            styles = compilers._compileDirectiveShow(vm, element);
        }


        if ( _.size(styles) ) {
            element.attribs.style = cssParser.stringify(styles);
        }
    },


    // v-model
    _compileDirectiveModel: function(vm, element) {
        var selectOptions;
        var vModelValue;
        var attrValue;
        var selectValueMap;


        attrValue = common.getValue(vm, element.attribs.value);

        // Если у тега был задан value, то он пересиливает значение из v-model
        // поэтому прерываем выполнение кода выставляющего value через v-model
        if (attrValue && element.attribs.type == 'text') {
            return;
        }

        vModelValue = common.getValue(vm, element.dirs.model.value);

        if (element.name === 'input') {

            if (element.attribs.type === 'text' || !element.attribs.type) {
                element.attribs.value = common.cleanValue(vModelValue);
            }

            if (element.attribs.type === 'checkbox' && vModelValue) {
                element.attribs.checked = 'checked';
            }

            if (element.attribs.type === 'radio') {
                if (attrValue == vModelValue) {
                    element.attribs.checked = 'checked';
                } else {
                   delete element.attribs.checked;
                }
            }
        }

        if (element.name === 'select') {
            selectValueMap = {};

            if (element.dirs.model.options.options) {
                selectOptions = common.getValue(vm, element.dirs.model.options.options);

                // Перетираем любое внутренее содержимое тега <select>
                element.inner = [];

                if (selectOptions) {
                    // Пока ничего няшней не придумал. Хреначим прям тут теги (<option>)
                    for (var i = 0, l = selectOptions.length; i < l; i++) {
                        var optionItem = {
                            'type': 'tag',
                            'name': 'option',
                            'attribs': {
                                'value': selectOptions[i].value
                            }
                        }

                        compilers._setInnerText(vm, optionItem, selectOptions[i].text);
                        element.inner.push(optionItem);
                    }
                }
            }


            // Значения select multiple приходят в виде массива
            // Создаём карту значений, чтобы не бегать по массиву 100500 раз
            if (element.attribs.multiple != undefined) {
                if (vModelValue) {
                    for (var i = 0, l = vModelValue.length; i < l; i++) {
                        selectValueMap[vModelValue[i]] = true;
                    }
                }

            // Селект с единственным выбранным значение (не multiple)
            } else {
                selectValueMap[vModelValue] = true;
            }

            for (var i = 0, l = element.inner.length; i < l; i++) {
                var item = element.inner[i];

                if (item.name === 'option') {
                    if (selectValueMap[common.getValue(vm, item.attribs.value)]) {
                        item.attribs.selected = "selected";
                    } else {
                        // На всякий случай, чтобы удалить нежелательные selected,
                        // которые могли быть в разметке
                        delete item.attribs.selected;
                    }
                }
            }
        }

        if (element.name === 'textarea') {
            compilers._setInnerText(vm, element, vModelValue);
        }
    },


    // v-style
    _compileDirectiveStyle: function(vm, element) {
        var vStyleVm = element.dirs.style.vm ? element.dirs.style.vm : vm;
        var styleObject = {};

        if ( Array.isArray(element.dirs.style.value) ) {
            element.dirs.style.value.forEach(function (item) {
                styleObject[item.arg] = common.getValue(vStyleVm, item.key);
            });
        } else {
            styleObject = common.getValue(vStyleVm, element.dirs.style.value);
        }

        return styleObject;
    },


    // v-show
    _compileDirectiveShow: function(vm, element) {
        var vShowVm = element.dirs.show.vm ? element.dirs.show.vm : vm;
        var elStyles = {};

        if (element.attribs.style) {
            elStyles = cssParser.parse(element.attribs.style);
        }
        
        var isToShow = common.getValue(vShowVm, element.dirs.show.value);
        if (isToShow && elStyles.display === 'none') {    
            elStyles.display = '';
        }

        if (!isToShow) {    
            elStyles.display = 'none';
        }

        return elStyles;
    }
}


module.exports = compilers;