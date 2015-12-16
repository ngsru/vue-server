var cssParser = require('../css');
var common = require('./common.js');

var compilers = {
    compile: function (vm) {
        compilers.compileViewModels(vm);
        return vm;
    },

    compileViewModels: function (vm) {
        var childVm;

        compilers.compileElements(vm, [vm.$el]);

        if (!vm.__states.children) {
            return;
        }

        for (var i = 0, l = vm.__states.children.length; i < l; i++) {
            childVm = vm.__states.children[i];
            compilers.compileViewModels(childVm);
        }
    },

    compileElements: function (vm, elements) {
        var element;

        for (var i = 0, l = elements.length; i < l; i++) {
            element = common.setElement(elements[i]);
            compilers.compileElement(vm, element);
        }
    },

    compileElement: function (vm, element) {
        var foreignKeyElement = false;

        // Depending on whether the element is a key to the v-repeat context or no, need to differently to compile it.
        // If it is v-repeat element then we need to compile it inside repeat context
        // If no, ONLY its own attributes compiled inside repeat context
        if (element._isKeyElement && vm.$el != element) {
            foreignKeyElement = true;
        }

        // _compileSelfInParentVm for no repeated elements
        if (foreignKeyElement) {
            if (element._compileSelfInParentVm) {
                compilers.compileTag(vm, element);
            }

            return;
        }

        compilers.compileTag(vm, element);

        // Text node
        if (element.type === 'text') {
            element.text = common.execute(vm, element.text);
        }

        // Node childs
        if (element.inner) {
            compilers.compileElements(vm, element.inner);
        }
    },

    compileTag: function (vm, element) {
        if (element.compiled) {
            return;
        }

        if (element.type === 'tag') {
            // v-model
            if (element.dirs.model) {
                compilers.compileDirectiveModel(vm, element);
            }

            // v-text
            if (element.dirs.text) {
                compilers.setInnerText(
                    element,
                    common.execute(vm, {
                        value: element.dirs.text.value.get,
                        filters: element.dirs.text.value.filters,
                        isEscape: true,
                        isClean: true
                    })
                );
            }

            // v-html
            if (element.dirs.html) {
                compilers.setInnerText(
                    element,
                    common.execute(vm, {
                        value: element.dirs.html.value.get,
                        filters: element.dirs.html.value.filters,
                        isEscape: false,
                        isClean: true
                    })
                );
            }

            // v-el
            if (element.dirs.el) {
                // Not done yet
            }

            // Compile node attributes
            for (var key in element.attribs) {
                element.attribs[key] = common.execute(vm, element.attribs[key]);
            }

            compilers.compileAttributeDirectives(vm, element);

            // NEW SYNTAX
            // v-bind:
            if (element.dirs.bind) {
                for (var name in element.dirs.bind) {
                    (function () {
                        if (element.dirs.bind[name].isCompiled) {
                            return;
                        }

                        var value = common.execute(vm, {
                            value: element.dirs.bind[name].value.get,
                            filters: element.dirs.bind[name].value.filters,
                        });

                        if (name === 'style') {
                            // Need to consider element's own styles
                            var originalStyle = element.attribs.style;
                            if (originalStyle) {
                                originalStyle = cssParser.parse(originalStyle);
                            } else {
                                originalStyle = {};
                            }

                            // Drop value if class is Array
                            if (typeof value === 'string') {
                                value = cssParser.parse(value);
                            } else if (Array.isArray(value)) {
                                value = common.extend.apply(common, value);
                            }
                            element.attribs[name] = cssParser.stringify(common.extend(originalStyle, value));

                            return;
                        }

                        if (name === 'class') {
                            (function () {
                                var classList = [];

                                if (element.attribs.class) {
                                    classList = element.attribs.class.split(' ');
                                }

                                if (typeof value === 'string') {
                                    classList = classList.concat(value.split(' '));
                                } else if (Array.isArray(value)) {
                                    classList = classList.concat(value);
                                } else {
                                    for (var name in value) {
                                        if (value[name]) {
                                            classList.push(name);
                                        }
                                    }
                                }

                                element.attribs.class = common.filterClassNames(classList).join(' ');
                            })();

                            return;
                        }

                        element.attribs[name] = value;
                    })();
                }
            }

            // v-bind="{...}"
            if (element.dirs.bindMany) {
                (function () {
                    var value = common.execute(vm, {
                        value: element.dirs.bindMany.value.get,
                        filters: element.dirs.bindMany.value.filters,
                    });

                    common.extend(element.attribs, value);
                })();
            }

            // setSelected (hack for v-for <select> options)
            if (element.dirs.setSelected) {
                if (
                    element.dirs.setSelected.value.map[element.attribs.value] ||
                    (element.attribs.value === element.dirs.setSelected.value.original)
                ) {
                    element.attribs.selected = 'selected';
                }
            }

            element.compiled = true;
        }
    },

    setInnerText: function (element, text) {
        element.inner = [{
            'type': 'text',
            'text': text
        }];
    },

    compileAttributeDirectives: function (vm, element) {
        // v-class
        if (element.dirs.class) {
            var classList;

            if (element.attribs.class) {
                classList = element.attribs.class.split(' ');
            } else {
                classList = [];
            }

            // When directive value contains classes
            if (Array.isArray(element.dirs.class.value)) {
                for (var i = 0; i < element.dirs.class.value.length; i++) {
                    vClassItem = element.dirs.class.value[i];

                    if (common.execute(vm, {value: vClassItem.get})) {
                        classList.push(vClassItem.arg);
                    }
                }

            // When directive value is Object
            } else {
                vClassItem = common.execute(vm, {value: element.dirs.class.value.get});

                for (var name in vClassItem) {
                    if (vClassItem[name]) {
                        classList.push(vClassItem[name]);
                    }
                }
            }

            element.attribs.class = common.filterClassNames(classList).join(' ');
        }

        // v-style && v-show
        var styles = {};
        var originalStyle = element.attribs.style;
        if (originalStyle) {
            originalStyle = cssParser.parse(originalStyle);
        }

        if (element.dirs.style && element.dirs.show) {
            // The correct application of styles from these directives
            // will depend on the order they are declared in the tag
            if (element.dirs.style.order < element.dirs.show.order) {
                common.extend(
                    styles,
                    compilers.compileDirectiveStyle(vm, element),
                    compilers.compileDirectiveShow(vm, element, originalStyle)
                );

            } else {
                common.extend(
                    styles,
                    compilers.compileDirectiveShow(vm, element, originalStyle),
                    compilers.compileDirectiveStyle(vm, element)
                );
            }

        // v-style
        } else if (element.dirs.style) {
            styles = compilers.compileDirectiveStyle(vm, element);

        // v-show
        } else if (element.dirs.show) {
            styles = compilers.compileDirectiveShow(vm, element, originalStyle);
        }

        if (common.size(styles)) {
            if (originalStyle) {
                element.attribs.style = cssParser.stringify(common.extend(originalStyle, styles));
            } else {
                element.attribs.style = cssParser.stringify(styles);
            }
        }
    },

    // v-model
    compileDirectiveModel: function (vm, element) {
        var selectOptions;
        var vModelValue;
        var selectValueMap;
        var selectStaticOption;

        var attrValue = common.getAttribute(vm, element, 'value');
        var attrType = common.getAttribute(vm, element, 'type');

        // If tag has "value" property then it should override v-model value
        if (attrValue && attrType == 'text') {
            return;
        }

        vModelValue = common.execute(vm, {
            value: element.dirs.model.value.get,
            filters: element.dirs.model.value.filters,
            isEscape: false,
            isClean: false
        });

        if (element.name === 'input') {
            if (!attrType || attrType === 'text') {
                element.attribs.value = common.cleanValue(vModelValue);
            }

            if (attrType === 'checkbox' && vModelValue) {
                if (Array.isArray(vModelValue)) {
                    if (vModelValue.indexOf(attrValue) !== -1) {
                        element.attribs.checked = 'checked';
                    }
                } else {
                    element.attribs.checked = 'checked';
                }
            }

            if (attrType === 'radio') {
                if (attrValue && attrValue == vModelValue) {
                    element.attribs.checked = 'checked';
                } else {
                    element.attribs.checked = undefined;
                }
            }
        }

        if (element.name === 'select') {
            selectValueMap = {};

            if (element.dirs.model.options.options) {
                selectOptions = common.execute(vm, {
                    value: element.dirs.model.options.options.get,
                    filters: element.dirs.model.options.options.filters,
                    isEscape: false,
                    isClean: false
                });

                // Store first static element if exists
                if (element.inner[0] && element.inner[0].name === 'option') {
                    selectStaticOption = element.inner[0];
                }

                // Clear <select> tag content
                element.inner = [];

                // Insert first static element
                if (selectStaticOption) {
                    element.inner.push(selectStaticOption);
                }

                if (selectOptions) {
                    for (var i = 0, l = selectOptions.length; i < l; i++) {
                        var optionItem = {
                            type: 'tag',
                            name: 'option',
                            dirs: {},
                            attribs: {
                                'value': selectOptions[i].value
                            }
                        };

                        compilers.setInnerText(optionItem, selectOptions[i].text);
                        element.inner.push(optionItem);
                    }
                }
            }

            // If select value is Array
            // Making value map avoiding multiple array busting
            if (element.attribs.multiple !== undefined) {
                if (vModelValue) {
                    for (var j = 0, n = vModelValue.length; j < n; j++) {
                        selectValueMap[vModelValue[j]] = true;
                    }
                }

            // Single choice <select>
            } else {
                selectValueMap[vModelValue] = true;
            }

            for (var k = 0, o = element.inner.length; k < o; k++) {
                var item = element.inner[k];
                compilers.prepareSelectOption(vm, item, vModelValue, selectValueMap);
            }
        }

        if (element.name === 'textarea') {
            compilers.setInnerText(element, vModelValue);
        }
    },

    prepareSelectOption: function (vm, item, vModelValue, selectValueMap) {
        if (item.name === '$merge') {
            compilers.prepareSelectOption(vm, item.inner[0], vModelValue, selectValueMap);
            return;
        }

        if (item.name === 'option') {
            item.dirs.setSelected = {
                value: {
                    original: vModelValue,
                    map: selectValueMap
                }
            };
            if (selectValueMap[common.getValue(vm, item.attribs.value)]) {
                item.attribs.selected = 'selected';
            } else {
                item.attribs.selected = undefined;
            }
        }
    },

    // v-style
    compileDirectiveStyle: function (vm, element) {
        var styleObject = {};

        if (Array.isArray(element.dirs.style.value)) {
            element.dirs.style.value.forEach(function (item) {
                styleObject[item.arg] = common.getValue(vm, item.get);
            });
        } else {
            styleObject = common.getValue(vm, element.dirs.style.value.get);
        }

        return styleObject;
    },

    // v-show
    compileDirectiveShow: function (vm, element, originalStyle) {
        var elStyles = {};
        var vmToUse = vm;
        if (element.dirs.repeat && element.dirs.component) {
            vmToUse = vm.$parent;
        }
        var isToShow = common.getValue(vmToUse, element.dirs.show.value.get);
        if (isToShow && originalStyle && originalStyle.display === 'none') {
            elStyles.display = '';
        }

        if (!isToShow) {
            elStyles.display = 'none';
        }

        return elStyles;
    }
};

module.exports = compilers;
