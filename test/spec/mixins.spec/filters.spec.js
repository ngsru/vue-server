var wrapComponent = require('./../wrapComponent.js');
var $;
var contentComponent = {
    data: function () {
        return {value: ''};
    },
    template: [
        '<div id="plain">{{value | go}}, {{value | run}}, {{value | slide}}, {{value | walk}}</div>',
        '<div id="v-for"><i v-for="n in 1" :title="value | walk"></i></div>',
    ].join(''),
    filters: {
        go: function () {
            return 'original';
        }
    },
    mixins: [
        {
            filters: {
                go: function () {;
                    return 'mixed1';
                },
                run: function () {
                    return 'mixed1';
                },
                slide: function () {
                    return 'mixed1';
                }
            }
        },
        {
            filters: {
                run: function () {
                    return 'mixed2';
                },
                walk: function () {
                    return 'mixed2';
                }
            }
        }
    ]
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('filters from mixins', function () {
    it('should work', function () {
        expect($('#plain').html()).toEqual('original, mixed2, mixed1, mixed2');
    });

    it('should work inside v-for', function () {
        expect($('#v-for i').attr('title')).toEqual('mixed2');
    });
});
