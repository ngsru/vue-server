var common = require('./common');

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
                    (element.name === 'template' && common.size(element.dirs)) ||
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

        // Walk through tag attributes, collectig Vue directives
        for (var key in element.attribs) {
            if (
                element.attribs[key] === undefined ||
                element.attribs[key] === false ||
                element.attribs[key] === null
            ) {
                continue;
            }
            tag += ' ' + key + '="' + element.attribs[key] + '"';
        }

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

        // If there are many nested $merge
        if (elementChild.name === '$merge' || elementChild.name === 'template') {
            return renders.renderTemplate(element.inner);
        }

        element.inner = elementChild.inner;
        element.name = elementChild.name;

        for (var key in elementChild.attribs) {
            if (
                elementChild.attribs[key] === undefined ||
                elementChild.attribs[key] === false ||
                elementChild.attribs[key] === null
            ) {
                continue;
            }

            if (key === 'class' || key === 'style') {
                renders.mergeAttribute(element, elementChild, key);
                continue;
            }

            element.attribs[key] = elementChild.attribs[key];
        }


        return renders.renderTag(element);
    },

    mergeAttribute: function (element, elementChild, name) {
        if (element.attribs[name] && elementChild.attribs[name]) {
            element.attribs[name] = element.attribs[name] + ' ' + elementChild.attribs[name];
        }

        if (!element.attribs[name] && elementChild.attribs[name]) {
            element.attribs[name] = elementChild.attribs[name];
        }
    }

};

module.exports = renders;
