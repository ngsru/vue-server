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
        '</div>',
        '<div id="complex1"> ',
            '<i v-if="false">if-first</i> <template v-else>',
                ' <i v-if="false">if-second</i> <i v-else>else-second</i> ',
            '</template>',
        ' </div>',

        '<div id="show-abutting-true">',
            '<i v-show="booleanTrue">if</i><else v-else>else</else>',
        '</div>',
        '<div id="show-abutting-false">',
            '<i v-show="booleanFalse">if</i><else v-else>else</else>',
        '</div>',
        '<div id="show-text-split-true">',
            '<i v-show="booleanTrue">if</i> text <else v-else>else</else>',
        '</div>',
        '<div id="show-text-split-false">',
            '<i v-show="booleanFalse">if</i> text <else v-else>else</else>',
        '</div>',
        '<div id="show-non-abutting-true">',
            '<i v-show="booleanTrue">if</i><i>f</i><else v-else>else</else>',
        '</div>',
        '<div id="show-non-abutting-false">',
            '<i v-show="booleanFalse">if</i><i>f</i><else v-else>else</else>',
        '</div>',

        '<div id="both">',
            '<i v-if="false" v-show="true">if</i><else v-else>else</else>',
        '</div>',
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

describe('v-else with v-if', function () {
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

    it('should render complex1', function () {
        expect($('#complex1 i').text()).toEqual('else-second');
    });
});

describe('v-else with v-show', function () {
    describe('with stright connection with "v-show" tag', function () {
        it('should hide tag if v-show is "true"', function () {
            expect($('#show-abutting-true else').css('display')).toEqual('none');
        });
        it('should show tag if v-show is "false"', function () {
            expect($('#show-abutting-false else').css('display')).toEqual(undefined);
        });
    });

    describe('with cross-text connection with "v-show" tag', function () {
        it('should hide tag if v-show is "true"', function () {
            expect($('#show-text-split-true else').css('display')).toEqual('none');
        });
        it('should show tag if v-show is "false"', function () {
            expect($('#show-text-split-false else').css('display')).toEqual(undefined);
        });
    });

    describe('not connected to "v-show" tag', function () {
        it('should show tag if v-show is "true"', function () {
            expect($('#show-non-abutting-true else').css('display')).toEqual(undefined);
        });
        it('should show tag if v-show is "false"', function () {
            expect($('#show-non-abutting-false else').css('display')).toEqual(undefined);
        });
    });
});

describe('v-else with both v-if and v-show', function () {
    it('should prefer v-if over v-show', function () {
        expect($('#both i').length).toEqual(0);
        expect($('#both else').length).toEqual(1);
        expect($('#both else').css('display')).toEqual(undefined);
    });
});
