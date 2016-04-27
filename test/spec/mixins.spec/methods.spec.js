var wrapComponent = require('./../wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div id="plain">{{go()}}, {{run()}}, {{slide()}}, {{walk()}}</div>',
        '<div id="v-for"><i v-for="n in 1" :title="walk()"></i></div>',
    ].join(''),
    data: function () {
        return {
            flag1: '0',
            data: [],
        };
    },
    methods: {
        go: function () {
            return 'original';
        }
    },

    mixins: [
        {
            methods: {
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
            methods: {
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

describe('methods from mixins', function () {
    it('should work', function () {
        expect($('#plain').html()).toEqual('original, mixed2, mixed1, mixed2');
    });

    it('should work inside v-for', function () {
        expect($('#v-for i').attr('title')).toEqual('mixed2');
    });
});
