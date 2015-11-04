var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {
    template: '<div id="complex"><comp></comp>{{param}}</div>',
    data: function() {
        return {
            items: [
                {name: 111, visible: false},
                {name: 222, visible: true}
            ]
        }
    },

    createdBe: function() {
        this.$on('child', function() {
            this.param = 554545;
        });
    },

    activateBe: function(insert) {
        this.$broadcast('gotcha');
        insert();
    },

    components: {
        comp: {
            template: '<i>11111111 <comp2></comp2></i>'
        },

        comp2: {
            template: '<i>22222222_{{param}}</i>',
            createdBe: function() {
                this.$on('gotcha', function() {
                    this.param = 21313;
                });

                this.$dispatch('child');
            }
        }
    }
};


beforeAll(function(done) {
    wrapComponent(contentComponent, function(response) {
        $ = response;
        done();
    }, {replace: true});
});


describe('events', function() {
    it('should work', function() {
        expect( $('#complex').html() ).toEqual('<i>11111111<i>22222222_21313</i></i>554545');
    });
});