var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {
    template: [
        '<div id="complex">',
            '<comp></comp>{{param}}</div><div id="via-option">{{prop}}',
        '</div>',
        '<div id="cross-vm-1">',
            '<cross-vm :value="childValue[1]" number="1" set="changed" v-on:go-wild="setChildValue"></cross-vm>',
        '</div>',
        '<div id="cross-vm-2">',
            '<cross-vm :value="childValue[2]" number="2" set="changed" @go-wild="setChildValue"></cross-vm>',
        '</div>',
        '<div id="cross-vm-3">',
            '<cross-vm :value="childValue[3]" @go-wild="setChildValue(3, \'changed\')"></cross-vm>',
        '</div>',
        '<div id="cross-vm-4">',
            '<cross-vm :value="childValue[4]" v-on:go-wild="setChildValue(meta.number, meta.set)"></cross-vm>',
        '</div>',
    ].join(''),
    data: function () {
        return {
            prop: 'default',
            items: [
                {name: 111, visible: false},
                {name: 222, visible: true}
            ],
            childValue: {
                1: {label: 'no change'},
                2: {label: 'no change'},
                3: {label: 'no change'},
                4: {label: 'no change'}
            },
            meta: {
                number: 4,
                set: 'changed'
            }
        };
    },

    events: {
        test: function() {
            this.prop = 'changed';
        }
    },

    createdBe: function () {
        this.$emit('test');
        this.$on('child', function () {
            this.param = 554545;
        });
    },

    activateBe: function (insert) {
        this.$broadcast('gotcha');
        insert();
    },

    components: {
        comp: {
            template: '<i>11111111 <comp2></comp2></i>'
        },

        comp2: {
            template: '<i>22222222_{{param}}</i>',
            createdBe: function () {
                this.$on('gotcha', function () {
                    this.param = 21313;
                });

                this.$dispatch('child');
            }
        },

        crossVm: {
            props: ['value', 'number', 'set'],
            template: '<i>{{value.label}}</i>',
            createdBe: function () {
                this.$emit('go-wild', this.number, this.set);
            }
        }
    },

    methods: {
        setChildValue: function (number, set) {
            try {
                this.childValue[number].label = set;
            } catch (e) {

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

describe('events', function () {
    it('should work', function () {
        expect($('#complex').html()).toEqual('<i>11111111<i>22222222_21313</i></i>554545');
    });

    it('should work via component option', function () {
        expect($('#via-option').html()).toEqual('changed');
    });

    describe('binded on components', function () {
        it('should work in syntax 1', function () {
            expect($('#cross-vm-1').html()).toEqual('<i>changed</i>');
        });

        it('should work in syntax 2', function () {
            expect($('#cross-vm-2').html()).toEqual('<i>changed</i>');
        });

        it('should work in syntax 3', function () {
            expect($('#cross-vm-3').html()).toEqual('<i>changed</i>');
        });

        it('should work in syntax 4', function () {
            expect($('#cross-vm-4').html()).toEqual('<i>changed</i>');
        });
    });

});
