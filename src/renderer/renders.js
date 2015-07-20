var renders = {
    render: function(vm) {
        return renders.renderTemplate(vm.$el.inner);
    },


    renderTemplate: function(elements) {
        var html = '',
            element;

        for (var i = 0, l = elements.length; i < l; i++) {
            element = elements[i];

            if (element.type === 'tag') {
                if (element.name === 'template' || element.name === 'partial') {
                    html += renders.renderTemplate(element.inner);
                } else {
                    html += renders.renderTag(element);
                }
            }

            if (element.type === 'text') {
                html += renders.renderText(element);
            }

            // if (element.type === 'partial') {
            //     html += renders.renderTemplate(element.inner);
            // }
        };

        return html;
    },


    // Отрсиовываем тег-ноды
    renderText: function(element) {
        return element.text;
    },

    renderTag: function(element) {
        var tag = '<' + element.name;

        // Проходим по аттибутам тега, собираем директивы vue
        for (var key in element.attribs) {
            if (element.attribs[key] === undefined) {
                continue;
            }
            tag += ' ' + key + '="' + element.attribs[key] + '"';
        }

        tag += '>';

        if (element.inner) {
            tag += renders.renderTemplate(element.inner);
        }

        // Если тег должен иметь закрывающей тег
        if (element.close) {
            tag += '</' + element.name + '>';
        }

        return tag;
    }

}



module.exports = renders;