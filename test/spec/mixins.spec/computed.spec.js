var wrapComponent = require('./../wrapComponent.js');
var $;
var contentComponent = {
    data: function () {
        return {value: ''};
    },
    template: [
        '<div id="plain">{{go}}, {{run}}, {{slide}}, {{walk}}</div>',
        '<div id="v-for"><i v-for="n in 1" :title="walk"></i></div>',
    ].join(''),
    computed: {
        go: function () {
            return 'original';
        }
    },
    mixins: [
        {
            computed: {
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
            computed: {
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

describe('computed from mixins', function () {
    it('should work', function () {
        expect($('#plain').html()).toEqual('original, mixed2, mixed1, mixed2');
    });

    it('should work inside v-for', function () {
        expect($('#v-for i').attr('title')).toEqual('mixed2');
    });
});
