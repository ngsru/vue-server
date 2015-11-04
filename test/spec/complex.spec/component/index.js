module.exports = {
    template: {path: __dirname + '/templates/index.html'},

    data: function () {
        return {
            content: true
        };
    },

    computed: {
        // get only, just need a function
        aDouble: function () {
            return this.computed.tobeDoubled * 2;
        },

        // both get and set
        aPlus: {
            get: function () {
                return this.computed.tobePlused + 5000;
            }
        },

        getUndefined: function () {
            return;
        }
    },

    partials: {
        'part1': '<section class="partial-wrap"><div class="value">{{partial.valueForPartial}}</div></section>'
    },

    methods: {
        forVText: function () {
            return this.vText.value;
        },

        forVAttr: function () {
            return this.vAttr.boxWidth;
        },

        forVShowHide: function () {
            return this.vShow.hide;
        },

        forVShowShow: function () {
            return this.vShow.show;
        },

        forVStyle: function () {
            return this.vStyle.display;
        },

        forVClass: function () {
            return this.vClass.class1;
        },

        forVIfShow: function () {
            return this.vIf.show;
        },

        forVIfHide: function () {
            return this.vIf.hide;
        },

        getFnUndefined: function () {
            return;
        }
    },
    compiledBe: function () {
        this.plain = {
            value: 'Plain value',
            attr: 'text',
            attrMixed: 'xt',

            number: 3,

            html: '<span>WATWG<sup>2</sup></span>',

            data: {
                value: '<span>WATWG<sup>2</sup></span>'
            }
        };

        this.partial = {
            valueForPartial: 'Should result some value',
            partialName: 'part1',

            emptyName: ''
        };

        this.vText = {
            value: 'Value from v-text data'
        };

        this.vComponent = {
            parentData: 'Parent Data present',
            toBeWithed: 'Data to be included by v-with',
            forPlainWith: {
                withed: 'It\'s data from plain with'
            },

            componentName: 'compon2',
            emptyName: ''
        };

        this.vRepeat = {
            parentValue: 'i\'m parent\'s value',
            simpleArray: [
                {value: 'simple array value 1', dontInherit: 'me'},
                {value: 'simple array value 2'},
                {value: 'simple array value 3'}
            ],

            hollowArray: [],

            arrayForFilter: [
                {name: 'Andrey', age: 25},
                {name: 'Vasiliy', age: 54},
                {name: 'Eugeniy', age: 24},
                {name: 'Andrey', age: 32}
            ],

            searchText: 'Andrey',

            forWith: 'This value should be inherited with v-with',
            forWith2: {
                compon1Val: 'Data there should be, omn.'
            },

            object: {
                item1: {
                    value: 111
                },
                item2: {
                    value: 222
                },
                item3: {
                    value: 333
                }
            },

            nameNesting: [
                {
                    value: 'simple array value 1',
                    array: [
                        {newValue: 111},
                        {newValue: 111222}
                    ]
                },
                {
                    value: 'simple array value 2',
                    array: [
                        {newValue: 222},
                        {newValue: 222222}
                    ]
                },
                {
                    value: 'simple array value 3',
                    array: [
                        {newValue: 333},
                        {newValue: 333333}
                    ]
                }
            ]
        };

        this.vModel = {
            input: 'some value there',
            none: null,
            select: 2,
            selectMulti: [2, 3],
            selectOptions: [
                {text: 'Option 1', value: 1},
                {text: 'Option 2', value: 2},
                {text: 'Option 3', value: 3}
            ],

            textarea1: 'New text came from data',

            checkbox: true,

            radio: 'two',

            vFilter: {
                plain: 10,
                read: 10,
                write: 10,
                void: 10,

                text: 'Some kind Of Text',
                number: 3
            },

            props: {
                value: 'sell',
                list: [
                    {text: 'Sell', value: 'sell'}
                ]
            },
        };

        this.vAttr = {
            boxWidth: 100,
            boxHeight: 60,

            attrWithModel: 'Value from v-attr',
            modelWithAttr: 'Nah value from v-model'
        };

        this.vShow = {
            show: true,
            hide: false
        };

        this.vStyle = {
            display: 'inline-block',
            position: 'relative',
            hide: false,
            object: {
                color: 'red',
                display: 'inline-block'
            }
        };

        this.vClass = {
            class1: true,
            class2: true
        };

        this.vPre = {
            one: 'Some value',
            forRepeat: [
                {value: 'Repeat value'},
                {value: 'Repeat value'}
            ]
        };

        this.vIf = {
            show: true,
            hide: false
        };

        this.computed = {
            tobeDoubled: 50,
            tobePlused: 15000
        };

        setTimeout(function () {
            this.$emit('loaded');
        }.bind(this), 0);
    },

    components: {
        'filterRepeated': {
            'template': [
                '<span class="evil-filter">{{boy | evilFilter}}</span>'
            ].join(''),
            data: function () {
                return {
                    boy: ' boy boy '
                };
            },

            filters: {
                evilFilter: function (value) {
                    return 'evil' + value + 'evil';
                }
            }
        },
        'syntetic': {
            'template': [
                '<button v-repeat="buttons" v-on="click: setRoom(this)" v-class="active: setRoomActive(this)">',
                    '<span>{{label}}</span>',
                    '<span class="in-repeat-nested-filter">{{checkFilter | nestedFilter}}</span>',
                '</button>',
                '<span class="nested-filter">{{checkFilter | nestedFilter}}</span>'
            ].join(''),
            data: function () {
                return {
                    buttons: [
                        {value: 1, label: 'one'},
                        {value: 2, label: 'two'},
                        {value: 3, label: 'three'},
                        {value: 4, label: 'four'}
                    ],

                    form: {
                        rooms: [2, 3]
                    },

                    checkFilter: 'ok'
                };
            },

            filters: {
                nestedFilter: function (value) {
                    return value + '!?!?!?!';
                }
            },

            methods: {
                setRoom: function (vm) {
                    var index = this.form.rooms.indexOf(vm.value);

                    if (index == -1) {
                        this.form.rooms.push(vm.value);
                    } else {
                        this.form.rooms.splice(index, 1);
                    }
                },

                setRoomActive: function (vm) {
                    var result = false;
                    this.form.rooms.forEach(function (item) {
                        if (item == vm.value) {
                            result = true;
                        }
                    });

                    return result;
                }
            }
        },

        'compon1': {
            template: '' +
                '<section class="compon1">' +
                    '<div class="comp-repeat-value">{{value}}</div>' +
                    '<div class="comp-own-value">{{compon1Val}}</div>' +
                    '<div class="comp-parent-value">{{vRepeat.parentValue}}</div>' +
                    '<div class="comp-with-value">{{withedValue}}</div>' +
                '</section>',
            data: function () {
                return {
                    compon1Val: 'Component\'s 1 own value'
                };
            }
        },

        'compon1Inherit': {
            inherit: true,
            template: '' +
                '<section>' +
                    '<div class="comp-repeat-value">{{value}}</div>' +
                    '<div class="comp-own-value">{{compon1Val}}</div>' +
                    '<div class="comp-parent-value">{{vRepeat.parentValue}}</div>' +
                    '<div class="comp-with-value">{{withedValue}}</div>' +
                '</section>',
            data: function () {
                return {
                    compon1Val: 'Component\'s 1 own value'
                };
            }
        },

        'compon2': {
            template: '' +
                '<section>' +
                    '<div class="comp-own-value">{{componVal}}</div>' +
                    '<div class="comp-parent-value">{{vComponent.parentData}}</div>' +
                    '<div class="comp-with-value">{{withed}}</div>' +
                '</section>',
            data: function () {
                return {
                    componVal: 'Component\'s 2 own value'
                };
            }
        },

        'compon3': {
            inherit: true,
            template: '' +
                '<section>' +
                    '<div class="comp-own-value">{{componVal}}</div>' +
                    '<div class="comp-parent-value">{{vComponent.parentData}}</div>' +
                    '<div class="comp-with-value">{{withed}}</div>' +
                '</section>',
            data: function () {
                return {
                    componVal: 'Component\'s 3 own value'
                };
            }
        },

        'inheritor': {
            template: '' +
                '<h1>Inheritor</h1>' +
                '<div v-component="compon1"></div>' +
                '<partial name="part1"></partial>' +
                '<span class="filter">{{vComponent.componentName | inheritIndicator}}</span>'
        },

        'inheritorWrap': {
            template: '<div v-component="inheritor"></div>'
        },

        'noTemplate': {
            data: function () {
                return {
                    value: 'This is no-template value'
                };
            }
        },

        'compound': {
            template: '<ul><li v-repeat="item:some" v-component="compoundChild"></li></ul>',

            data: function () {
                return {
                    some: [
                        {value: 'value from v-repeat', test: 'this should not work'}
                    ]
                };
            },

            components: {
                'compoundChild': {
                    template: '<span class="nested">{{item.value}}</span> <span class="own">{{value}}</span>',
                    data: function () {
                        return {
                            value: 'Component\'s own value'
                        };
                    }
                }
            }
        }

    },

    filters: {
        inheritIndicator: function () {
            return 'Filter inheritance works';
        },

        argumentsTesting: function (value, arg1, arg2) {
            return value + ' ' + arg1 + ' ' + arg2;
        },

        'plain': function (v) {
            return v * 2;
        },

        'read': {
            read: function (v) {
                return v * 2;
            }
        },

        'write': {
            write: function (v) {
                return v * 2;
            }
        },

        'void': {

        },

        'nothing': function (value) {
            return value;
        }
    }

};
