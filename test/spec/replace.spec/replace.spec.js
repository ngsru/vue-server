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
        },

        item: {
            props: {
                kk: null
            },
            data: function () {
                return {val: 123};
            },
            template: '<div>{{val}}:{{kk}}</div><i>{{val}}:{{kk}}</i>'
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
    it('a component should properly mount on element via is attribute', function () {
        expect($('#two').html()).toEqual('<i>content</i>');
    });

    it('a component should properly mount on <template> via is attribute', function () {
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

    it('a component should properly mount via width multiple top level elements inside its template', function () {
        expect($('#key-els-multiple').html()).toEqual('<div>123:out</div><i>123:out</i>');
    });
});
