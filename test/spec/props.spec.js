var wrapComponent = require('./wrapComponent.js');
var $;

var contentComponent = {
    data: function () {
        return {
            transmit: 'value present',
            bool: false
        };
    },
    template: [
        '<div>',
            '<as-array value="{{transmit}}"></as-array>',
            '<as-object id="plain" value="{{transmit}}"></as-object>',
            '<as-object id="v-bind" v-bind:value="transmit"></as-object>',
            '<type value="{{transmit}}"></type>',
            '<type-boolean value="{{bool}}"></type-boolean>',
            '<type-default value="{{transmit}}"></type-default>',
            '<default-straight></default-straight>',
            '<default-function></default-function>',
            '<validator value="{{transmit}}"></validator>',
            '<validator-default value="{{transmit}}"></validator-default>',
            '<default-false></<default-false>',
        '</div>'
    ].join(''),

    components: {
        'as-array': {
            props: ['value'],
            template: '<div>{{value}}</div>'
        },

        'as-object': {
            props: {
                value: null
            },
            template: '<div>{{value}}</div>'
        },

        'type': {
            props: {
                value: {
                    type: Number
                }
            },
            template: '<div>{{value}}</div>'
        },
        'type-boolean': {
            props: {
                value: {
                    type: Boolean
                }
            },
            template: '<div>{{value === false}}</div>'
        },
        'type-default': {
            props: {
                value: {
                    type: Number,
                    default: 100
                }
            },
            template: '<div>{{value}}</div>'
        },

        'default-straight': {
            props: {
                value: {
                    default: 100
                }
            },
            template: '<div>{{value}}</div>'
        },

        'default-function': {
            props: {
                value: {
                    default: function () {
                        return 123;
                    }
                }
            },
            template: '<div>{{value}}</div>'
        },

        'validator': {
            props: {
                value: {
                    validator: function (value) {
                        return false;
                    }
                }
            },
            template: '<div>{{value}}</div>'
        },

        'validator-default': {
            props: {
                value: {
                    validator: function (value) {
                        return false;
                    },
                    default: 100
                }
            },
            template: '<div>{{value}}</div>'
        },

        'default-false': {
            props: {
                value: {
                    default: false
                }
            },
            template: '<div>{{typeof value}}</div>'
        },
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    });
});

describe('props should be able', function () {
    it('to work in array format', function () {
        expect($('as-array > div').text()).toEqual('value present');
    });

    it('to work in object format', function () {
        expect($('as-object#plain > div').text()).toEqual('value present');
    });

    it('to work in object format binded via v-bind', function () {
        expect($('as-object#v-bind > div').text()).toEqual('value present');
    });

    it('to use type option', function () {
        expect($('type > div').text()).toEqual('');
    });

    it('to use type Boolean option correctly', function () {
        expect($('type-boolean > div').text()).toEqual('true');
    });

    it('to use type option with default option correctly', function () {
        expect($('type-default > div').text()).toEqual('');
    });

    it('to use type option with default option correctly', function () {
        expect($('type-default > div').text()).toEqual('');
    });

    it('to use default option as straight value', function () {
        expect($('default-straight > div').text()).toEqual('100');
    });

    it('to use default option as function', function () {
        expect($('default-function > div').text()).toEqual('123');
    });

    it('to use validator option', function () {
        expect($('validator > div').text()).toEqual('');
    });

    it('to use validator option with default correctly', function () {
        expect($('validator > div').text()).toEqual('');
    });

    it('to set default Boolean(false) as it is', function () {
        expect($('default-false > div').text()).toEqual('boolean');
    });

});
