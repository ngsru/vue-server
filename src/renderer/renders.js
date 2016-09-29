var utils = require('./../utils.js');
var common = require('./common');
var cssParser = require('../css');

var renders = {
    render: function (vm) {
        return renders.renderTemplate(vm.$el.inner);
    },

    renderTemplate: function (elements) {
        var html = '',
            element;

        for (var i = 0, l = elements.length; i < l; i++) {
            element = elements[i];

            if (element.type === 'tag') {
                if (
                    (element.name === 'template' && !element.isMaterial) ||
                    element.name === 'partial' ||
                    element.name === 'slot'
                ) {
                    html += renders.renderTemplate(element.inner);
                } else if (element.name === '$merge') {
                    html += renders.renderMergedTags(element);
                } else {
                    html += renders.renderTag(element);
                }
            }

            if (element.type === 'text') {
                html += renders.renderText(element);
            }
        }

        return html;
    },

    // Render node text
    renderText: function (element) {
        return element.text;
    },

    renderTag: function (element) {
        var tag = '<' + element.name;

        renders.iterateAttribs(element, function (attrName, attrVal) {
            var attrValType = typeof attrVal;

            if (attrValType === 'object') {
                if (attrName === 'class') {
                    attrVal = common.filterClassNames(attrVal.own.concat(attrVal.dir)).join(' ');
                }

                if (attrName === 'style') {
                    attrVal = cssParser.stringify(cssParser.merge(attrVal.own, attrVal.dir));
                }
            }

            tag += ' ' + attrName + '="' + renders.escapeQuotes(attrVal) + '"';
        });

        tag += '>';

        if (element.inner) {
            tag += renders.renderTemplate(element.inner);
        }

        // If tag has closing tag
        if (element.close) {
            tag += '</' + element.name + '>';
        }

        return tag;
    },

    renderMergedTags: function (element) {
        var elementChild = element.inner[0];

        // v-if + v-for case
        if (!elementChild) {
            return '';
        }

        // Component's outside inner contents
        // if (elementChild.type === '$content') {
        //     elementChild = element.inner[1];
        // }

        // Pass through non-visible elements
        if (
            elementChild.name === '$merge' ||
            elementChild.name === 'template' ||
            elementChild.name === 'partial' ||
            elementChild.name === 'slot'
        ) {
            return renders.renderTemplate(element.inner);
        }

        if (elementChild.type === 'text') {
            return renders.renderText(elementChild);
        }

        element.inner = elementChild.inner;
        element.name = elementChild.name;

        renders.iterateAttribs(elementChild, function (attrName) {
            if (attrName === 'class') {
                renders.mergeClassAttribute(element, elementChild, attrName);
            } else if (attrName === 'style') {
                renders.mergeStyleAttribute(element, elementChild, attrName);
            } else {
                element.attribs[attrName] = elementChild.attribs[attrName];
            }
        });

        return renders.renderTag(element);
    },

    mergeClassAttribute: function (element, elementChild, name) {
        var parent = element.attribs[name];
        var child = elementChild.attribs[name];
        if (parent && child) {
            (function () {
                var classList = [];
                var parentType = typeof element.attribs[name];
                var childType = typeof elementChild.attribs[name];

                if (childType === 'object') {
                    classList = classList.concat(child.own);
                } else {
                    classList = classList.concat(child.split(' '));
                }

                if (parentType === 'object') {
                    classList = classList.concat(parent.own);
                } else {
                    classList = classList.concat(parent.split(' '));
                }

                if (childType === 'object') {
                    classList = classList.concat(child.dir);
                } else {
                    classList = classList.concat(child.split(' '));
                }

                if (parentType === 'object') {
                    classList = classList.concat(parent.dir);
                } else {
                    classList = classList.concat(parent.split(' '));
                }

                element.attribs[name] = common.filterClassNames(classList).join(' ');
            })();
        }

        if (!parent && child) {
            element.attribs[name] = child;
        }
    },

    mergeStyleAttribute: function (element, elementChild, name) {
        var parent = element.attribs[name];
        var child = elementChild.attribs[name];
        if (parent && child) {
            (function () {
                var list = [];
                var parentOwn;
                var parentDyn;
                var childOwn;
                var childDyn;
                var parentType = typeof element.attribs[name];
                var childType = typeof elementChild.attribs[name];

                if (parentType === 'object') {
                    parentOwn = parent.own;
                } else {
                    parentOwn = cssParser.parse(parent);
                }

                if (childType === 'object') {
                    childOwn = child.own;
                } else {
                    childOwn = cssParser.parse(child);
                }

                if (parentType === 'object') {
                    parentDyn = parent.dir;
                }

                if (childType === 'object') {
                    childDyn = child.dir;
                }

                if (childOwn) {
                    list.push(childOwn);
                } else if (parentOwn) {
                    list.push(parentOwn);
                }

                if (parentDyn) {
                    list.push(parentDyn);
                }
                if (childDyn) {
                    list.push(childDyn);
                }

                // list - is an Array of style-objects
                element.attribs[name] = cssParser.stringify(cssParser.merge.apply(cssParser, list));
            })();
        }

        if (!parent && child) {
            element.attribs[name] = child;
        }
    },

    iterateAttribs: function (element, callback) {
        var attrName;
        var attrVal;

        // Walk through tag attributes, collectig Vue directives
        var attribNames = Object.keys(element.attribs);
        for (var i = 0; i < attribNames.length; i++) {
            attrName = attribNames[i];
            attrVal = element.attribs[attrName];
            if (
                attrVal === undefined ||
                attrVal === false ||
                attrVal === null
            ) {
                continue;
            }

            callback(attrName, attrVal);
        }
    },

    escapeQuotes: function (str) {
        if (typeof str === 'string') {
            return str.replace(/"/g, '&quot;');
        }

        return str;
    }
};

module.exports = renders;
