var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div>',
            '<div id="simple"><i v-for="a in arr">{{a + $index}}</i></div>',
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


describe('v-for', function() {
    it('array rendering to work fine', function() {
        expect( $('#simple').html() ).toEqual('<i>1</i><i>2</i><i>3</i>');
    });

    // it('array rendering to work fine', function() {
    //     expect( $('#simple').html() ).toEqual('<i>1</i><i>2</i><i>3</i>');
    // });
});