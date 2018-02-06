var common = require('./common');

module.exports = {
    getContent: function (vm) {
        var content = null;

        if (vm.__states.notPublic) {
            content = vm.__states.parent.$el._innerContent;
        } else {
            content = vm.$el._innerContent;
        }

        return content;
    },

    insert: function (vm, slot, content) {
        var slotName = null;
        if (slot.attribs && slot.attribs.name) {
            slotName = slot.attribs.name;
        }

        for (var j = 0; j < content.length; j++) {
            (function () {
                var element = content[j];
                var elementSlotName = null;
                if (element.attribs && element.attribs.slot) {
                    elementSlotName = element.attribs.slot;
                }
                // Do not count spaces and line brakes as slot content
                if (
                    slotName === elementSlotName &&
                    !(element.type === 'text' && String(element.text).trim() === '')
                ) {
                    this.fillSlot(
                        slot,
                        element
                    );
                }
            }).call(this);
        }
    },

    fillSlot: function (slot, item) {
        if (!slot.filled) {
            slot.inner = [];
            slot.filled = true;
        }

        if (item.name === 'template') {
            item.inner.forEach(function (itemInnerItem) {
                slot.inner.push(itemInnerItem);
            });
        } else {
            slot.inner.push(item);
        }
    }
};
