var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: '<div id="first"><first></first></div>',
    components: {
        first: {
            template: '<div><b>{{cre1}}</b><i>{{comp2}}</i></div>',
            data: function () {
                return {
                    value: 100,
                    cre1: null
                };
            },
            computed: {
                comp1: function () {
                    return this.value + 100;
                },
                comp2: function () {
                    return this.cre1 + 100;
                }
            },
            createdBe: function () {
                this.cre1 = this.comp1;
            }
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('computed', function () {
    it('should be builded before createdBe hook is fired', function () {
        expect($('#first b').html()).toEqual('200');
    });

    it('should be rebuilded after createdBe hook is fired considering modified data', function () {
        expect($('#first i').html()).toEqual('300');
    });
});
