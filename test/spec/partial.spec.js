var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div id="static"><partial name="test"></partial></div>',
        '<div id="dyn"><partial name="{{varName}}"></partial></div>',
        '<div id="dyn-new"><partial :name="varName"></partial></div>',
    ].join(''),
    data: function () {
        return {
            varName: 'test'
        };
    },

    partials: {
        test: '<i>rakushka</i>'
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('partials should be rendered', function () {
    it('with static name', function () {
        expect($('#static').html()).toEqual('<i>rakushka</i>');
    });

    it('with dynamic name', function () {
        expect($('#dyn').html()).toEqual('<i>rakushka</i>');
    });

    it('with dynamic name in new style', function () {
        expect($('#dyn-new').html()).toEqual('<i>rakushka</i>');
    });
});
