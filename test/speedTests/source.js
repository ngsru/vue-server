var data = {

    template: [
        '<!DOCTYPE html>',
        '<html lang="ru">',
            '<head>',
                '<title>Vue-server приложение</title>',
                '<meta charset="utf-8">',
            '</head>',
            '<body>',
                '<div style="display: none;">',




                    '<!-- v-repeat -->',
                    '<section id="v-repeat">',
                        '<ul class="simple-array">',
                            '<li v-repeat="vRepeat.simpleArray">',
                                '<span class="value">{{value}}</span>',
                                '<span class="dont-inherit">{{dontInherit}}</span>',
                                '<span class="parent-value">{{vRepeat.parentValue}}</span>',
                            '</li>',
                        '</ul>',

                        '<ul class="undefined">',
                            '<li v-repeat="vRepeat.undefined">Ok</li>',
                        '</ul>',

                        '<ul class="hollow">',
                            '<li v-repeat="vRepeat.hollowArray">Ok</li>',
                        '</ul>',


                        '<ul class="array-filter-by">',
                            '<li v-repeat="vRepeat.arrayForFilter | filterBy vRepeat.searchText in name">',
                                '<span class="age">{{age}}</span>',
                            '</li>',
                        '</ul>',


                        '<ul class="array-filter-by-multiple">',
                            '<li v-repeat="vRepeat.arrayForFilter | filterBy vRepeat.searchText in name | filterBy \'25\' in \'age\'">',
                                '<span class="age">{{age}}</span>',
                            '</li>',
                        '</ul>',


                        '<ul class="object">',
                            '<li class="value" v-repeat="vRepeat.object">{{value}}</li>',
                        '</ul>',

                        '<ul class="repeat-component">',
                            '<li v-repeat="vRepeat.simpleArray" v-component="compon1">',
                                '<span class="should-not-be-there"></span>',
                            '</li>',
                        '</ul>',

                        '<ul class="repeat-component-inherit">',
                            '<li v-repeat="vRepeat.simpleArray" v-component="compon1Inherit">',
                                '<span class="should-not-be-there"></span>',
                            '</li>',
                        '</ul>',


                        '<ul class="repeat-component-with">',
                            '<li v-repeat="vRepeat.simpleArray" v-with="withedValue: vRepeat.forWith" v-component="compon1">',
                                '<span class="should-not-be-there"></span>',
                            '</li>',
                        '</ul>',

                        '<ul class="repeat-component-with-inherit">',
                            '<li v-repeat="vRepeat.simpleArray" v-with="withedValue: vRepeat.forWith" v-component="compon1Inherit">',
                                '<span class="should-not-be-there"></span>',
                            '</li>',
                        '</ul>',

                        '<ul class="repeat-component-with2">',
                            '<li v-repeat="vRepeat.simpleArray" v-with="vRepeat.forWith2" v-component="compon1">',
                                '<span class="should-not-be-there"></span>',
                            '</li>',
                        '</ul>',


                        '<ul class="repeat-component-with2-inherit">',
                            '<li v-repeat="vRepeat.simpleArray" v-with="vRepeat.forWith2" v-component="compon1Inherit">',
                                '<span class="should-not-be-there"></span>',
                            '</li>',
                        '</ul>',
                        

                        '<div class="name-seting" v-repeat="item:vRepeat.nameNesting">',
                            '<span class="item-value">{{item.value}}</span>',
                            '<ul class="item-array">',
                                '<li class="item-array-unit" v-repeat="item.array">{{newValue}}</li>',
                            '</ul>',

                            '<ul class="item-array-nesting">',
                                '<li class="item-array-nesting-unit" v-repeat="unit:item.array">{{unit.newValue}}</li>',
                            '</ul>',
                        '</div>',


                        '<div class="syntetic" v-component="syntetic"></div>',
                    '</section>',

                '</div>',
            '</body>',
        '</html>'
    ].join(''),

    data: function() {
        return {
            plain: {
                value: 'Plain value',
                attr: 'text',
                attrMixed: 'xt',

                number: 3,

                html: '<span>WATWG<sup>2</sup></span>'
            },


            partial: {
                valueForPartial: 'Should result some value',
                partialName: 'part1',

                emptyName: ''
            },


            vText: {
                value: 'Value from v-text data'
            },


            vComponent: {
                parentData: 'Parent Data present',
                toBeWithed: 'Data to be included by v-with',
                forPlainWith: {
                    withed: 'It\'s data from plain with'
                },

                componentName: 'compon2',
                emptyName: ''
            },

            vRepeat: {
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
            },

            vModel: {
                input: 'some value there',
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
                }
            },

            vAttr: {
                boxWidth: 100,
                boxHeight: 60,

                attrWithModel: 'Value from v-attr',
                modelWithAttr: 'Nah value from v-model'
            },

            vShow: {
                show: true,
                hide: false
            },

            vStyle: {
                display: 'inline-block',
                position: 'relative',
                hide: false
            },

            vClass: {
                class1: true,
                class2: true
            },

            vPre: {
                one: 'Some value',
                forRepeat: [
                    {value: 'Repeat value'},
                    {value: 'Repeat value'}
                ]
            },

            vIf: {
                show: true,
                hide: false
            }

        }
    },

    compiledBe: function() {
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
        this.$on('check', function() {})
    },

    compiledBe: function() {
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
        this.$broadcast('43242')  
    },

    partials: {
        'part1': '<section class="partial-wrap"><div class="value">{{partial.valueForPartial}}</div></section>',
        'part2': '<div>gdfgdf</div><div>gdfgdf</div><div>gdfgdf</div><div>gdfgdf</div><div>gdfgdf</div><div>gdfgdf</div><div>gdfgdf</div>'
    },

    methods: {
        forVText: function() {
            return this.vText.value;
        },

        forVAttr: function() {
            return this.vAttr.boxWidth;
        },

        forVShowHide: function() {
            return this.vShow.hide;
        },

        forVShowShow: function() {
            return this.vShow.show;
        },

        forVStyle: function() {
            return this.vStyle.display;
        },

        forVClass: function() {
            return this.vClass.class1;
        },

        forVIfShow: function() {
            return this.vIf.show;
        },

        forVIfHide: function() {
            return this.vIf.hide;
        },
    },

    components: {
        'syntetic': {
            'template': '<button v-repeat="buttons" v-on="click: setRoom(this)" v-class="active: setRoomActive(this)">{{label}}</button>',
            data: function() {
                return {
                    buttons: [
                        {value: 1, label: 'одна'},
                        {value: 2, label: 'две'},
                        {value: 3, label: 'три'},
                        {value: 4, label: 'четыре'}
                    ],
                    
                    form: {
                        rooms: [2, 3]
                    }
                }
            },

            compiledBe: function() {
                this.$dispatch('check')
                this.$root.$emit('check')
            },
            
            methods: {
                setRoom: function(vm) {
                    var index = this.form.rooms.indexOf(vm.value);
                    
                    if (index == -1) {
                        this.form.rooms.push(vm.value);
                    } else {
                        this.form.rooms.splice(index, 1);
                    }
                },
                
                setRoomActive: function(vm) {
                    var result = false;
                    this.form.rooms.forEach(function(item) {
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
            data: function() {
                return {
                    compon1Val: 'Component\'s 1 own value'
                }
            },
            compiledBe: function() {
                this.$dispatch('check')
                this.$root.$emit('check')
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
            data: function() {
                return {
                    compon1Val: 'Component\'s 1 own value'
                }
            },
            compiledBe: function() {
                this.$dispatch('check')
                this.$root.$emit('check')
            }
        },


        'compon2': {
            template: '' +
                '<section>' +
                    '<div class="comp-own-value">{{componVal}}</div>' +
                    '<div class="comp-parent-value">{{vComponent.parentData}}</div>' +
                    '<div class="comp-with-value">{{withed}}</div>' +
                '</section>',
            data: function() {
                return {
                    componVal: 'Component\'s 2 own value'
                }
            },
            compiledBe: function() {
                this.$dispatch('check')
                this.$root.$emit('check')
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
            data: function() {
                return {
                    componVal: 'Component\'s 3 own value'
                }
            },
            compiledBe: function() {
                this.$dispatch('check')
                this.$root.$emit('check')
            }
        },


        'inheritor': {
            template: '' +
                '<h1>Inheritor</h1>' +
                '<div v-component="compon1"></div>' +
                '<span class="filter">{{vComponent.componentName | inheritIndicator}}</span>'
        },


        'inheritorWrap': {
            template: '<div v-component="inheritor"></div>'
        },

        'noTemplate': {
            data: function() {
                return {
                    value: 'This is no-template value'
                }
            }
        }
    },


    filters: {
        inheritIndicator: function() {
            return 'Filter inheritance works';
        },

        argumentsTesting: function(value, arg1, arg2) {
            return value + ' ' + arg1 + ' ' + arg2;
        },

        'plain': function(v) {
            return v * 2;
        },

        'read': {
            read: function(v) {
                return v * 2;
            }
        },

        'write': {
            write: function(v) {
                return v * 2;
            }
        },

        'void': {

        }
    }

}