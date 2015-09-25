var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div>',
            '<div id="component"><component is="compName"></div></div>',
            '<div id="directive"><div v-component="compName"></div></div>',
            '<div id="camel"><compName></compName></div>',
            '<div id="dash"><comp-name></comp-name></div>',
        '</div>'
    ].join(''),
    data: function() {
        return {
            arr: [1,2,3],
            childValue: 'content',
            parto: 'compParted',
            name: 'comp'
        };
    },

    components: {
        compName: {
            template: '<i>rakushka</i>'
        }
    },

    compiledBe: function() {
        this.parto = 'comp';
        this.$emit('loaded');
    }
};


beforeAll(function(done) {
    wrapComponent(contentComponent, function(response) {
        $ = response;
        done();
    }, {replace: true});
});


describe('component', function() {
    it('should mount via <component> tag', function() {
        expect( $('#component').html() ).toEqual('<i>rakushka</i>');
    });

    it('should mount via v-component directive', function() {
        expect( $('#directive').html() ).toEqual('<i>rakushka</i>');
    });

    it('should mount via custom tag in camelCase', function() {
        expect( $('#camel').html() ).toEqual('<i>rakushka</i>');
    });

    it('should mount via custom tag in dashed-case', function() {
        expect( $('#dash').html() ).toEqual('<i>rakushka</i>');
    });
});