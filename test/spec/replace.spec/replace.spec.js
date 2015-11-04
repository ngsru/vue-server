var wrapComponent = require('./../wrapComponent.js');
var $;
var contentComponent = {

    template: {path: __dirname + '/replace.spec.html'},
    data: function () {
        return {
            arr: [1,2,3],
            childValue: 'content',
            parto: 'compParted',
            name: 'comp'
        };
    },

    components: {
        comp: {
            props: ['value'],
            template: '<i>{{$value}}{{value}}</i>'
        },

        compParted: {
            props: ['value'],
            template: '<i>{{value}}</i><b>{{value}}</b>'
        }
    },

    compiledBe: function () {
        this.parto = 'comp';
        this.$emit('loaded');
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('while using replace: true', function () {
    it('v-repeat should not render its element while repeating component', function () {
        expect($('#one').html()).toEqual('<i>1</i><i>2</i><i>3</i>');
    });

    it('a component should properly mount on element via v-component', function () {
        expect($('#two').html()).toEqual('<i>content</i>');
    });

    it('a component should properly mount on <template> via v-component', function () {
        expect($('#three').html()).toEqual('<i>content</i>');
    });

    it('a component should properly mount via custom tag', function () {
        expect($('#four').html()).toEqual('<i>content</i>');
    });

    it('a component with several top level elements should properly mount', function () {
        expect($('#five > b').html()).toEqual('content');
    });

    it('a component with several top level elements should be properly replaced by normal component' +
        'while changed in wait-for', function () {
        expect($('#six').html()).toEqual('<i>content</i>');
    });

    it('a component should properly mount via <component> with static "is"', function () {
        expect($('#seven').html()).toEqual('<i>content</i>');
    });

    it('a component should properly mount via <component> with dynamic "is"', function () {
        expect($('#eight').html()).toEqual('<i>content</i>');
    });
});
