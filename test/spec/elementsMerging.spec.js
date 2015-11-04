var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div id="simple"><comp class="outer" style="width: 36px;"></comp><div>',
        '<div id="overlapping">',
            '<comp class="outer" style="width: 36px;" v-bind:class="{\'outer-dyn\': true}"' +
                'v-bind:style="{\'border-width\': \'36px\'}"></comp>',
        '<div>'
    ].join(''),
    data: function () {
        return {

        };
    },

    components: {
        comp: {
            data: function () {
                return {
                    state: true
                };
            },
            template: '<div v-bind:class="{\'inner\': true}" v-bind:style="{\'height\': \'36px\'}" :disabled="state">' +
                '</div>'
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
    it('attribute class should merge properly', function () {
        expect($('#simple > *').attr('class')).toEqual('outer inner');
    });

    it('attribute style should merge properly', function () {
        expect($('#simple > *').attr('style')).toEqual('width: 36px; height: 36px;');
    });

    it('attribute class should merge properly', function () {
        expect($('#overlapping > *').attr('class')).toEqual('outer outer-dyn inner');
    });

    it('attribute style should merge properly', function () {
        expect($('#overlapping > *').attr('style')).toEqual('width: 36px; border-width: 36px; height: 36px;');
    });

    it('should keep inner dynamic attributes', function () {
        expect($('#simple > *').attr('disabled')).toEqual('disabled');
    });
});
