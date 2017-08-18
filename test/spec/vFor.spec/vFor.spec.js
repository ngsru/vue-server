var wrapComponent = require('./../wrapComponent.js');
var tools = require('./../tools.js');
var $;
var contentComponent = {

    template: tools.getTpl(__dirname + '/vFor.spec.html', true),
    data: function () {
        return {
            number: 3,
            nan: NaN,
            vRepeat: {
                parentValue: '',
                simpleArray: [],

                hollowArray: [1],

                arrayForFilter: [],

                searchText: '',

                forWith: '',
                forWith2: {
                    compon1Val: ''
                },

                object: {
                    item1: {
                        value: 0
                    }
                },

                nameNesting: [
                    {
                        value: '',
                        array: [
                            {newValue: 0}
                        ]
                    }
                ]
            },

            arr: [3,2,1],
            arr2: {
                niff: 3,
                nuff: 2,
                naff: 1
            },
            childValue: 'content',
            parto: 'compParted',
            name: 'comp',
            cycle: ['X', 'Y', 'X'],
            undefinedInside: [1, undefined, null, Infinity, NaN, 2]
        };
    },

    components: {
        simpleX: {
            template: '<i>X</i>'
        },
        simpleY: {
            template: '<i>Y</i>'
        },
        compName: {
            props: {
                item: null,
                index: null
            },
            template: '<i>{{a}}{{index}}|{{item}}</i>'
        },

        compNameCompound: {
            props: {
                item: null,
                index: null,
                extra: null
            },
            template: '<i>{{a}}{{index}}|{{item}}|{{extra}}</i>'
        },

        filterRepeated: {
            'template': [
                '<span class="evil-filter">{{boy | evilFilter}}</span>'
            ].join(''),
            data: function () {
                return {
                    boy: ' boy boy '
                };
            },

            filters: {
                'evilFilter': function (value) {
                    return 'evil' + value + 'evil';
                }
            }
        },

        compound: {
            template: '<ul><li v-for="item in some" :item="item" is="compoundChild"></li></ul>',

            replace: false,

            data: function () {
                return {
                    some: [
                        {value: 'value from v-repeat', test: 'this should not work'}
                    ]
                };
            },

            components: {
                'compoundChild': {
                    replace: false,
                    props: {
                        item: null
                    },
                    template: '<span class="nested">{{item.value}}</span> <span class="own">{{value}}</span>',
                    data: function () {
                        return {
                            value: 'Component\'s own value'
                        };
                    }
                }
            }
        },

        syntetic: {
            replace: false,
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

        bIf: {
            template: '<i><b v-if="item.name">111</b></i>'
        },

        item: {
            template: '<i>111</i><i>222</i>'
        },

        testCompiled: {
            data: function () {
                return {
                    value: null
                };
            },
            template: '<i><b v-if="value">111</b></i>',
            compiledBe: function () {
                this.value = true;
            }
        },

        deepIterate: {
            template: [
                '<div>',
                    '<div v-for="item in [1]">',
                        '<div v-for="am in [1]">',
                            '<i v-for="it in [am]">{{getSome()}}</i>',
                        '</div>',
                    '</div>',
                '</div>',
            ].join(''),

            methods: {
                getSome: function () {
                    return this._getSome();
                },

                _getSome: function () {
                    return 123;
                },
            }
        }
    },

    // Redefine compiledBe hook
    compiledBe: function () {

    },

    activateBe: function (insert) {
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

        this.arr = [1,2,3];
        this.arr2 = {
            niff: 1,
            nuff: 2,
            naff: 3
        };

        this.tree = [
            {
                name: 'example',
                array: [1,2,3]
            }
        ];

        this.cycle = ['Y', 'X', 'nothing'];
        this.items = [{name: 123}];

        insert();
    },

    filters: {
        reduce: function (value) {
            var keys = Object.keys(value);
            return [value[keys[0]], value[keys[2]]];
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('v-for', function () {
    it('on number to work fine', function () {
        expect($('#number').html()).toEqual('<i>0</i><i>1</i>');
    });

    it('on number from variable to work fine', function () {
        expect($('#number-from-var').html()).toEqual('<i>0</i><i>1</i><i>2</i>');
    });

    it('on simple array with explict index param definition to work fine', function () {
        expect($('#simple-explict').html()).toEqual('<i>1</i><i>3</i><i>5</i>');
    });

    it('on simple array + filter to work fine', function () {
        expect($('#simple-filter').html()).toEqual('<i>1</i><i>4</i>');
    });

    it('on object to work fine', function () {
        expect($('#object').html()).toEqual('<i>1</i><i>3</i><i>5</i>');
    });

    it('on object + filter to work fine', function () {
        expect($('#object-filter').html()).toEqual('<i>1</i><i>4</i>');
    });

    it('on component via custom tag to work fine', function () {
        expect($('#component').html()).toEqual('<i>0|1</i><i>1|2</i><i>2|3</i>');
    });

    it('on component via custom tag + filter to work fine', function () {
        expect($('#component-filter').html()).toEqual('<i>0|1</i><i>1|3</i>');
    });

    it('on component via custom tag + filter with explict index param definition to work fine', function () {
        expect($('#component-filter-explict').html()).toEqual('<i>0|1</i><i>1|3</i>');
    });

    it('on component via custom tag and object to work fine', function () {
        expect($('#component-object').html()).toEqual('<i>0|1</i><i>1|2</i><i>2|3</i>');
    });

    it('on component via custom tag and object + filter to work fine', function () {
        expect($('#component-object-filter').html()).toEqual('<i>0|1</i><i>1|3</i>');
    });

    it('on component via custom tag to work fine', function () {
        expect($('#component-compound').html()).toEqual(
            '<i>0|1|compParted</i><i>1|2|compParted</i><i>2|3|compParted</i>'
        );
    });

    it('on component via <component> to work fine', function () {
        expect($('#component2').html()).toEqual('<i>0|1</i><i>1|2</i><i>2|3</i>');
    });

    it('should work with v-if', function () {
        expect($('#v-if').html()).toEqual('<i>1</i><i>3</i>');
    });

    it('should work with v-if', function () {
        expect($('#v-if-tree').html()).toEqual('<span><i>0|example</i><i>1</i><i>3</i></span>');
    });

    it('should work with v-if and component', function () {
        expect($('#v-if-component').html()).toEqual('<i>0|1</i><i>2|3</i>');
    });

    it('should work with plain number iterating', function () {
        expect($('#plain-number').html()).toEqual('<i>0</i><i>1</i><i>2</i>');
    });

    it('should work render components width two top-level elements', function () {
        expect($('#replace-two-top').html()).toEqual('<i>111</i><i>222</i><i>111</i><i>222</i>');
    });

    it('should be okay with NaN as data', function () {
        expect($('#nan').html()).toEqual('');
    });

    it('should be okay with undefined/null/etc inside array', function () {
        expect($('#undefined-inside').html()).toEqual('<i>1</i><i></i><i></i><i>Infinity</i><i>NaN</i><i>2</i>');
    });

    it('should render "cycle"', function () {
        expect($('#cycle').html()).toEqual('<i>Y</i><i>X</i><div></div>');
        expect($('#cycle-template').html()).toEqual('<i>Y</i><i>X</i>');
        expect($('#cycle-template-nested').html()).toEqual('<i>Y</i><i>X</i><div></div>');
    });

    it('should rebuild instances if data is changed inside compiledBe hook', function () {
        expect($('#compiled-be-rebuild').html()).toEqual('<i><b>111</b></i>');
    });

    it('inside deep itertations private methods from parent component should be available', function () {
        expect($('#deep-iterate i').text()).toEqual('123');
    });
});

// v-repeat - begin
describe('v-repeat', function () {

    it('should be able to render arrays', function () {
        expect($('#v-repeat .simple-array').find('li').length).toEqual(3);
    });

    it('should not display any items if value in undefined', function () {
        expect($('#v-repeat .undefined').find('li').length).toEqual(0);
    });

    it('should not display any items if array in empty', function () {
        expect($('#v-repeat .hollow').find('li').length).toEqual(0);
    });

    it('should be able to use a filter', function () {
        expect($('#v-repeat .array-filter-by').find('li').length).toEqual(2);
        expect($('#v-repeat .array-filter-by').find('li').eq(1).find('.age').text()).toEqual('32');
    });

    it('should be able to use multiple filters', function () {
        expect($('#v-repeat .array-filter-by-multiple').find('li').eq(0).find('.age').text()).toEqual('25');
    });

    it('should be able to render objects', function () {
        expect($('#v-repeat .object').find('li').length).toEqual(3);
    });

    it('should be able to display array items\' values', function () {
        var $items = $('#v-repeat .simple-array').find('li .value');
        expect($items.eq(2).text()).toEqual('simple array value 3');
    });

    it('array items\' should not inherit prev item\'s values', function () {
        var $items = $('#v-repeat .simple-array').find('li .dont-inherit');
        expect($items.eq(0).text()).toEqual('me');
        expect($items.eq(1).text()).toEqual('');
    });

    it('in array items\' parent\'s values should be available', function () {
        var $items = $('#v-repeat .simple-array').find('li .parent-value');
        expect($items.eq(2).text()).toEqual('i\'m parent\'s value');
    });

    it('should be able to use separated datas (parent & repeat-item) in methods', function () {
        expect($('#v-repeat .syntetic .active').length).toEqual(2);
    });

    it('should be able to use component\'s filters inside component\'s v-repeat', function () {
        expect($('#v-repeat .syntetic .in-repeat-nested-filter').eq(1).text()).toEqual('ok!?!?!?!');
    });

    it('should be able to use component\'s filters inside v-repeat', function () {
        expect($('#v-repeat .filter-repeated.evil-filter').eq(1).text()).toEqual('evil boy boy evil');
    });

    it('should be able to use v-if inside component inside v-repeat', function () {
        expect($('#v-repeat .b-if').html()).toEqual('<i><b>111</b></i>');
    });

    describe('with a component', function () {
        it('should be able to render component\'s items', function () {
            expect($('#v-repeat .repeat-component').find('i').length).toEqual(3);
        });

        it('should not leave default content inside', function () {
            expect($('#v-repeat .repeat-component').find('.should-not-be-there').length).toEqual(0);
        });

        it('should display parent component\'s data values', function () {
            var $items = $('#v-repeat .repeat-component').find('li .comp-parent-value');
            expect($items.eq(2).text()).not.toBe('i\'m parent\'s value');
        });

        describe('with items namespace', function () {
            it('should display values with namespace', function () {
                expect($('#v-repeat .compound-nesting .nested').text()).toEqual('value from v-repeat');
            });

            it('should display component\'s values', function () {
                expect($('#v-repeat .compound-nesting .own').text()).toEqual('Component\'s own value');
            });
        });

    });

    describe('with setting namespace for children', function () {

        it('should render items', function () {
            expect($('#v-repeat .name-seting').length).toEqual(3);
        });

        it('should properly display items\' values', function () {
            expect($('#v-repeat .name-seting').eq(1).find('.item-value').text()).toEqual('simple array value 2');
        });

        describe('in 2nd level repeat without setting namespace', function () {
            it('should render items', function () {
                expect($('#v-repeat .name-seting').eq(2).find('.item-array .item-array-unit').length).toEqual(2);
            });

            it('should properly display items\' values', function () {
                expect($('#v-repeat .name-seting').eq(1).find('.item-array .item-array-unit')
                    .eq(1).text()).toEqual('222222');
            });
        });

        describe('in 2nd level repeat with setting namespace', function () {
            it('should render items', function () {
                expect($('#v-repeat .name-seting')
                    .eq(2).find('.item-array-nesting .item-array-nesting-unit').length).toEqual(2);
            });

            it('should properly display items\' values', function () {
                expect($('#v-repeat .name-seting').eq(1).find('.item-array-nesting .item-array-nesting-unit')
                    .eq(1).text()).toEqual('222222');
            });
        });
    });

});
