var wrapComponent = require('./../wrapComponent.js');
var tools = require('./../tools.js');
var $;
var contentComponent = {

    template: tools.getTpl(__dirname + '/slotAPI.spec.html', true),
    data: function () {
        return {

        };
    },

    components: {
        itemOne: {
            template: tools.getTpl(__dirname + '/item-one.html', true)
        },
        itemTwo: {
            template: tools.getTpl(__dirname + '/item-two.html', true)
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('<slot> API', function () {
    it('should render example 1', function () {
        expect($('#one').html()).toEqual('<div><h1>This is my component!</h1>' +
            '<p>This is some more original content</p><p>This is some original content</p></div>');
    });

    it('should render example 2', function () {
        expect($('#two').html()).toEqual('<div><p slot="one">One</p><p>Default A</p><p slot="two">Two</p></div>');
    });
});
