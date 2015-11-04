var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: '<div><span id="multiple" v-bind="{ prop: someProp, \'other-attr\': otherProp }"></span></div>',
    data: function () {
        return {
            someProp: 312312,
            otherProp: 'yes-of-course'
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
});
