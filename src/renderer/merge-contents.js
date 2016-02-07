module.exports = {
    merge: function (vm, element, elementContent) {
        var slots = {
            unnamed: null,
            named: null
        };

        elementContent.compiled = true;

        // Pasting content into a component with empty template
        if (
            element &&
            element.inner &&
            !element.inner.length &&
            element.dirs.component.status !== 'unresolved'
        ) {
            element.inner = elementContent.inner;
            return;
        }

        if (!element.inner[0] || !element.inner[0].inner) {
            return;
        }

        // Slots merging
        var inner = element.inner[0].inner;
        var content = elementContent.inner;

        for (var i = inner.length - 1; i >= 0; i--) {
            if (inner[i].name === 'slot') {
                if (inner[i].attribs.name) {
                    slots.named = slots.named || {};
                    slots.named[inner[i].attribs.name] = inner[i];
                } else {
                    if (!slots.unnamed) {
                        slots.unnamed = inner[i];
                    } else {
                        vm.__states.$logger.warn('Duplicate unnamed <slot>', common.onLogMessage(vm));
                    }
                }
            }
        }

        // If provided content didn't render
        // if (slots.unnamed && !slots.named && !elementContent.inner.length) {
        //     slots.unnamed.inner = [];
        // }

        if (slots.unnamed || slots.named) {
            for (var j = 0; j < content.length; j++) {
                (function () {
                    var element = content[j];
                    if (
                        element.attribs &&
                        element.attribs.slot &&
                        slots.named &&
                        slots.named[element.attribs.slot]
                    ) {
                        this.fillSlot(
                            slots.named[element.attribs.slot],
                            element
                        );
                    } else if (slots.unnamed) {
                        // Do not count spaces and line brakes as slot content
                        if (
                            !(element.type === 'text' && element.text.trim() === '')
                        ) {
                            this.fillSlot(
                                slots.unnamed,
                                element
                            );
                        }
                    }
                }).call(this);
            }
        }
    },

    fillSlot: function (element, item) {
        if (!element.filled) {
            element.inner = [];
            element.filled = true;
        }

        element.inner.push(item);
    }
};
