var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: ['<div>',
        '<span id="multiple" v-bind="{ prop: someProp, \'other-attr\': otherProp }"></span>',

        '<span id="class-plain" class="own" :class="otherProp"></span>',
        '<span id="class-object" class="own" :class="{test: true, test2: false, test3: someProp}"></span>',
        '<span id="class-array" class="own" :class="[otherProp, nothing, \'test\', false, 0]"></span>',

        '<span id="style-plain" style="overflow: hidden" :style="stylePlain"></span>',
        '<span id="style-object" style="overflow: hidden" :style="{fontSize: 32 + \'px\', \'padding-top\': \'10px\'}"></span>',
        '<span id="style-array" style="overflow: hidden" :style="[styleObjectOne, styleObjectTwo]"></span>',
    '</div>'].join(''),
    data: function () {
        return {
            someProp: 312312,
            otherProp: 'yes-of-course',
            nothing: null,

            stylePlain: 'color: red',

            styleObjectOne: {color: 'red', 'font-size': '30px'},
            styleObjectTwo: {margin: '10px', fontSize: '35px'}
        };
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('v-bind', function () {
    it('should be able to render multiple attributes in one directive', function () {
        var result = [
            $('#multiple').attr('prop'),
            $('#multiple').attr('other-attr')
        ];
        expect(result.join(',')).toEqual('312312,yes-of-course');
    });

    describe(':class should properly render the attribute', function () {
        it('in plain format ', function () {
            expect($('#class-plain').attr('class')).toEqual('own yes-of-course');
        });

        it('in object format', function () {
            expect($('#class-object').attr('class')).toEqual('own test test3');
        });

        it('in array format', function () {
            expect($('#class-array').attr('class')).toEqual('own yes-of-course test');
        });
    });

    describe(':style should properly render the attribute', function () {
        it('in plain format ', function () {
            expect($('#style-plain').css('overflow')).toEqual('hidden');
            expect($('#style-plain').css('color')).toEqual('red');
        });

        it('in object format', function () {
            expect($('#style-object').css('overflow')).toEqual('hidden');
            expect($('#style-object').css('font-size')).toEqual('32px');
            expect($('#style-object').css('padding-top')).toEqual('10px');
        });

        it('in array format', function () {
            expect($('#style-array').css('overflow')).toEqual('hidden');
            expect($('#style-array').css('color')).toEqual('red');
            expect($('#style-array').css('font-size')).toEqual('35px');
            expect($('#style-array').css('margin')).toEqual('10px');
        });
    });
});
