var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div id="style-top"><comp-nothing style="margin-top: 10px"></comp-nothing></div>',
        '<div id="style-both"><comp-stl style="margin-top: 10px"></comp-stl></div>',
        '<div id="style-both-dyn-top">',
            '<comp-stl style="margin-top: 10px" :style="{\'padding-top\': \'10px\'}"></comp-stl>',
        '</div>',
        '<div id="style-both-dyn-both">',
            '<comp-stl-both style="margin-top: 10px" :style="{\'padding-top\': \'10px\'}"></comp-stl-both>',
        '</div>',

        '<div id="class-top"><comp-nothing class="top"></comp-nothing></div>',
        '<div id="class-both"><comp-class class="top"></comp-class></div>',
        '<div id="class-both-dyn-top"><comp-class class="top" :class="\'top-dyn\'"></comp-class></div>',
        '<div id="class-both-dyn-both"><comp-class-both class="top" :class="\'top-dyn\'"></comp-class-both></div>',

        '<div id="class-both-dyn-top-obj">',
            '<comp-class class="top" :class="{\'top-dyn\': true}">',
        '</comp-class></div>',
        '<div id="class-both-dyn-both-obj">',
            '<comp-class-both-obj class="top" :class="{\'top-dyn\': true}">',
        '</comp-class-both-obj></div>',

        '<div id="class-both-dyn-top-arr">',
            '<comp-class class="top" :class="[\'top-dyn\']">',
        '</comp-class></div>',
        '<div id="class-both-dyn-both-arr">',
            '<comp-class-both-arr class="top" :class="[\'top-dyn\']">',
        '</comp-class-both-arr></div>',

        '<div id="overlapping">',
            '<comp></comp>',
        '<div>'
    ].join(''),
    data: function () {
        return {

        };
    },

    components: {
        compNothing: {template: '<div></div>'},
        compStl: {template: '<div style="margin-bottom: 10px"></div>'},
        compStlBoth: {template: '<div style="margin-bottom: 10px" :style="{paddingBottom: \'10px\'}"></div>'},

        compClass: {template: '<div class="bottom"></div>'},
        compClassBoth: {template: '<div class="bottom" :class="\'bottom-dyn\'"></div>'},
        compClassBothObj: {template: '<div class="bottom" :class="{\'bottom-dyn\': true}"></div>'},
        compClassBothArr: {template: '<div class="bottom" :class="[\'bottom-dyn\']"></div>'},

        comp: {
            data: function () {
                return {
                    state: true
                };
            },
            template: [
                '<div :disabled="state"></div>'
            ].join('')
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('elements merging:', function () {
    // Style tests
    it('style case 1 passed', function () {
        expect($('#style-top > *').attr('style')).toEqual('margin-top: 10px');
    });

    it('style case 2 passed', function () {
        expect($('#style-both > *').attr('style')).toEqual('margin-bottom: 10px;');
    });

    it('style case 3 passed', function () {
        expect($('#style-both-dyn-top > *').attr('style')).toEqual('margin-bottom: 10px; padding-top: 10px;');
    });

    it('style case 4 passed', function () {
        expect($('#style-both-dyn-both > *').attr('style')).toEqual(
            'margin-bottom: 10px; padding-top: 10px; padding-bottom: 10px;'
        );
    });

    // Class Tests
    it('class case 1 passed', function () {
        expect($('#class-top > *').attr('class')).toEqual('top');
    });

    it('class case 2 passed', function () {
        expect($('#class-both > *').attr('class')).toEqual('bottom top');
    });

    it('class case 3 passed', function () {
        var value = 'bottom top top-dyn';
        expect($('#class-both-dyn-top > *').attr('class')).toEqual(value);
        expect($('#class-both-dyn-top-obj > *').attr('class')).toEqual(value);
        expect($('#class-both-dyn-top-arr > *').attr('class')).toEqual(value);
    });

    it('class case 4 passed', function () {
        var value = 'bottom top bottom-dyn top-dyn';
        expect($('#class-both-dyn-both > *').attr('class')).toEqual(value);
        expect($('#class-both-dyn-both-obj > *').attr('class')).toEqual(value);
        expect($('#class-both-dyn-both-arr > *').attr('class')).toEqual(value);
    });

    // etc
    it('should keep inner dynamic attributes', function () {
        expect($('#overlapping > *').attr('disabled')).toEqual('disabled');
    });
});
