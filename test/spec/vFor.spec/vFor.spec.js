var wrapComponent = require('./../wrapComponent.js');
var tools = require('./../tools.js');
var $;
var contentComponent = {

    template: tools.getTpl(__dirname + '/vFor.spec.html', true),
    data: function () {
        return {
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
            name: 'comp'
        };
    },

    components: {
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

        insert();
    },

    filters: {
        reduce: function (value) {
            return [value[0], value[2]];
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
    it('on simple array to work fine', function () {
        expect($('#simple').html()).toEqual('<i>1</i><i>3</i><i>5</i>');
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

    
});

// v-repeat - begin
describe('v-for', function () {

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

    it("should be able to use multiple filters", function() {
        expect( $('#v-repeat .array-filter-by-multiple').find('li').eq(0).find('.age').text() ).toEqual('25');
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

    it("should be able to use separated datas (parent & repeat-item) in methods", function() {
        expect( $('#v-repeat .syntetic .active').length ).toEqual( 2 );
    });

    it("should be able to use component's filters inside component's v-repeat", function() {
        expect( $('#v-repeat .syntetic .in-repeat-nested-filter').eq(1).text() ).toEqual( 'ok!?!?!?!' );
    });

    it('should be able to use component\'s filters inside v-repeat', function () {
        expect($('#v-repeat .filter-repeated.evil-filter').eq(1).text()).toEqual('evil boy boy evil');
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
