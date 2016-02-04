var wrapComponent = require('./../wrapComponent.js');
var tools = require('./../tools.js');
var $;
var contentComponent = {

    template: tools.getTpl(__dirname + '/slotAPI.spec.html', true),
    data: function () {
        return {
            value: 'dynval',
            yes: true,
            no: false
        };
    },

    components: {
        itemOne: {
            template: tools.getTpl(__dirname + '/item-one.html', true)
        },
        itemTwo: {
            template: tools.getTpl(__dirname + '/item-two.html', true)
        },

        item: {
            template: '<i>{{value}}|{{own}}</i>',
            props: ['value'],
            data: function () {
                return {
                    own: 123
                };
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

describe('<slot> API', function () {
    it('should render example 1', function () {
        expect($('#one').html()).toEqual(
            '<div><h1>original</h1><p>content1</p><p>content2</p></div>'
        );
    });

    it('should render example 2', function () {
        expect($('#two').html()).toEqual(
            '<div><p slot="one">One</p><p>Default A</p><p slot="two">Two</p></div>'
        );
    });

    it('should render content\'s expressions from parent\'s VM', function () {
        expect($('#express').html()).toEqual(
            '<div><h1>original</h1><p>dynval</p></div>'
        );
    });

    it('should render content\'s props from parent\'s VM', function () {
        expect($('#props').html()).toEqual(
            '<div><h1>original</h1><p title="dynval"></p></div>'
        );
    });

    // it('should not render default slot content if provided content didnt appear bacause of v-if', function () {
    //     expect($('#v-if-empty').html()).toEqual(
    //         '<div><h1>original</h1></div>'
    //     );
    // });

    it('should render properly with elements with v-if', function () {
        expect($('#v-if-hybrid').html()).toEqual(
            '<div><h1>original</h1><p>content1</p></div>'
        );
    });

    it('should render another component inside', function () {
        expect($('#with-component').html()).toEqual(
            '<div><h1>original</h1><i>dynval|123</i></div>'
        );
    });
});
