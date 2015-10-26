var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div>',
            '<div id="dash-to-camel"><compName v-ref:ref-name></compName></div>',
        '</div>'
    ].join(''),
    data: function() {
        return {
            childValue: 'content',
            parto: 'compParted',
            name: 'comp'
        };
    },

    components: {
        compName: {
            data: function() {
                return {
                    prop: 123
                };
            },
            template: '<i>{{prop}}</i>'
        }
    },

    // Убеждаемся, что перетёрли этот хук
    compiledBe: function() {
        
    },

    activateBe: function(insert) {
        this.$refs.refName.prop = 'modified';
        insert();
    }
};


beforeAll(function(done) {
    wrapComponent(contentComponent, function(response) {
        $ = response;
        done();
    }, {replace: true});
});


describe('v-ref', function() {
    it('should work and autorename to camelCase', function() {
        expect( $('#dash-to-camel').html() ).toEqual('<i>modified</i>');
    });
});