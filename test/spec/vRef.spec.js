var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div>',
            '<div id="dash-to-camel"><comp-name v-ref:ref-name></comp-name></div>',
            '<div id="array">',
                '<comp-name v-for="item in array" v-ref:array :inh="parentVal"></comp-name>',
            '</div>',
            '<div id="single">',
                '<comp-name v-ref:single-el></comp-name>',
            '</div>',
        '</div>'
    ].join(''),
    data: function () {
        return {
            childValue: 'content',
            parto: 'compParted',
            name: 'comp',
            array: [1, 2],
            parentVal: 'first-'
        };
    },

    components: {
        compName: {
            props: {
                inh: null
            },
            data: function () {
                return {
                    prop: 123
                };
            },
            template: '<i>{{inh}}{{prop}}</i>'
        }
    },

    // Redefine compiledBe hook
    compiledBe: function () {

    },

    activateBe: function (done) {
        this.parentVal = 'second-';
        try {
            this.$refs.refName.prop = 'modified';
        } catch (e) {}

        try {
            this.$refs.array.forEach(function (vm) {
                // Not working in wait-for/activate component right now. We lose the changes on rebuilding
                vm.prop = 'modified';
            });
        } catch (e) {}

        try {
            this.$refs.singleEl.prop = 'modified';
        } catch (e) {}

        done();
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('v-ref', function () {
    it('should work and autorename to camelCase', function () {
        expect($('#dash-to-camel').html()).toEqual('<i>modified</i>');
    });

    it('should work with v-for as array', function () {
        expect($('#array').html()).toEqual('<i>second-123</i><i>second-123</i>');
    });

    it('in old format should add refs into $refs', function () {
        expect($('#single').html()).toEqual('<i>modified</i>');
    });
});
