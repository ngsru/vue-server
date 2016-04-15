var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div id="static"><partial name="test"></partial></div>',
        '<div id="dyn"><partial name="{{varName}}"></partial></div>',
        '<div id="dyn-new"><partial :name="varName"></partial></div>',
        '<div id="dyn-new-v-for"><partial v-for="name in arr" :name="name"></partial></div>'
    ].join(''),
    data: function () {
        return {
            varName: 'test',
            arr: [null, 'test']
        };
    },

    partials: {
        test: '<i>rakushka</i>',
        test2: '<i>rakushka2</i>'
    },

    activateBe: function (done) {
        this.arr = ['test', 'test2'];
        done();
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

    it('with v-for and a dynamic name', function () {
        expect($('#dyn-new').html()).toEqual('<i>rakushka</i>');
    });

    it('with dynamic name in new style1111', function () {
        expect($('#dyn-new-v-for').html()).toEqual('<i>rakushka</i><i>rakushka2</i>');
    });
});
