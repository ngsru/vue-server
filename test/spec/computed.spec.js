var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div>',
            '<div id="own">',
                '<b>{{comp}}</b>',
                '<p>{{dep}}</p>',
                '<a>{{crecomp}}</a>',
                '<i v-for="n in 1">{{comp}}</i>',
                '<h1 v-for="n in 1">{{comp * n}}</h1>',
                '<particle v-for="n in 1" :value="value"></particle>',
            '</div>',
            '<first></first>',
            '<second :value="value"></second>',
        '</div>'
    ].join(''),
    data: function () {
        return {
            value: 1000,
            cre: 99
        };
    },
    computed: {
        comp: function () {
            return this.value + 100;
        },
        dep: function () {
            return this.comp + 100;
        },
        crecomp: function () {
            return this.cre + 12;
        }
    },
    components: {
        first: {
            template: '<div id="first">{{value}}<b>{{cre1}}</b><i>{{comp2}}</i></div>',
            data: function () {
                return {
                    value: 100,
                    cre1: null
                };
            },
            computed: {
                comp1: function () {
                    return this.value + 100;
                },
                comp2: function () {
                    return this.cre1 + 100;
                }
            },
            createdBe: function () {
                this.cre1 = this.comp1;
            }
        },

        second: {
            template: '<div id="second"><b>{{comp}}</b><p>{{comp2}}</p><i v-for="n in 1">{{comp}}</i></div>',
            props: {
                value: {
                    default: 10
                }
            },
            data: function () {
                return {
                    original: 50
                }
            },
            computed: {
                comp: function () {
                    return this.value + 100;
                },
                comp2: function () {
                    return this.original + this.value;
                }
            },

            createdBe: function () {
                this.original = 500;
            }
        },

        particle: {
            template: '<div class="particle">{{comp}}</div>',
            props: {
                value: {
                    default: 10
                }
            },
            computed: {
                comp: function () {
                    return this.value + 100;
                }
            }
        }
    },

    createdBe: function () {
        this.cre = 88;
    },

    activateBe: function (done) {
        this.value = 100;
        done();
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('computed', function () {
    it('should consider new values from activateBe hook', function () {
        expect($('#own b').html()).toEqual('200');
    });

    it('should consider new values from activateBe hook when depending on another computed', function () {
        expect($('#own p').html()).toEqual('300');
    });

    it('should consider new values from createdBe hook', function () {
        expect($('#own a').html()).toEqual('100');
    });

    it('should consider new values from activateBe hook inside v-for', function () {
        expect($('#own i').html()).toEqual('200');
    });

    it('should consider new values from activateBe hook inside v-for inside text expressions', function () {
        expect($('#own h1').html()).toEqual('0');
    });

    it('should consider new values from activateBe hook inside v-for-ed component', function () {
        expect($('#own .particle').html()).toEqual('200');
    });

    it('should be builded before createdBe hook is fired', function () {
        expect($('#first b').html()).toEqual('200');
    });

    it('should be rebuilded after createdBe hook is fired considering modified data', function () {
        expect($('#first i').html()).toEqual('300');
    });

    it('should consider new values from parents\' activateBe hook', function () {
        expect($('#second b').html()).toEqual('200');
    });

    it('should consider new values from parents\' activateBe hook width createdBe present', function () {
        expect($('#second p').html()).toEqual('600');
    });

    it('should consider new values from parents\' activateBe hook inside v-for', function () {
        expect($('#second i').html()).toEqual('200');
    });
});
