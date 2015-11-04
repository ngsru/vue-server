var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div id="abutting-true">',
            '<i v-if="booleanTrue">if</i><else v-else>else</else>',
        '</div>',
        '<div id="abutting-false">',
            '<i v-if="booleanFalse">if</i><else v-else>else</else>',
        '</div>',
        '<div id="text-split-true">',
            '<i v-if="booleanTrue">if</i> text <else v-else>else</else>',
        '</div>',
        '<div id="text-split-false">',
            '<i v-if="booleanFalse">if</i> text <else v-else>else</else>',
        '</div>',
        '<div id="non-abutting-true">',
            '<i v-if="booleanTrue">if</i><i>f</i><else v-else>else</else>',
        '</div>',
        '<div id="non-abutting-false">',
            '<i v-if="booleanFalse">if</i><i>f</i><else v-else>else</else>',
        '</div>'
    ].join(''),
    data: function () {
        return {
            booleanTrue: true,
            booleanFalse: false
        };
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('v-else', function () {
    describe('with stright connection with "v-if" tag', function () {
        it('should hide tag if v-if is "true"', function () {
            expect($('#abutting-true else').length).toEqual(0);
        });
        it('should show tag if v-if is "false"', function () {
            expect($('#abutting-false else').length).toEqual(1);
        });
    });

    describe('with cross-text connection with "v-if" tag', function () {
        it('should hide tag if v-if is "true"', function () {
            expect($('#text-split-true else').length).toEqual(0);
        });
        it('should show tag if v-if is "false"', function () {
            expect($('#text-split-false else').length).toEqual(1);
        });
    });

    describe('not connected to "v-if" tag', function () {
        it('should show tag if v-if is "true"', function () {
            expect($('#non-abutting-true else').length).toEqual(1);
        });
        it('should show tag if v-if is "false"', function () {
            expect($('#non-abutting-false else').length).toEqual(1);
        });
    });
});
