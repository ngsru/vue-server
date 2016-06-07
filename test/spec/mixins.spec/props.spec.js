var wrapComponent = require('./../wrapComponent2.js');
var $;
var contentComponent = {
    template: '<child></child>',

    components: {
        child: {
            template: [
                '<div id="plain">{{go}}, {{run}}, {{slide}}, {{walk}}, {{globe}}</div>'
            ].join(''),
            props: ['go'],
            mixins: [
                {
                    props: {
                        go: {
                            default: 'mixed1'
                        },
                        run: {
                            default: 'mixed1'
                        },
                        slide: {
                            default: 'mixed1'
                        }
                    }
                },
                {
                    props: {
                        run: {
                            default: 'mixed2'
                        },
                        walk: {
                            default: 'mixed2'
                        }
                    }
                }
            ]
        }
    }
};

beforeAll(function (done) {
    wrapComponent(
        contentComponent,
        function (response) {
            $ = response;
            done();
        },
        function (Vue) {
            Vue.mixin({
                props: {
                    globe: {
                        default: 'sphere'
                    }
                }
            });
        }
    );
});

describe('props from mixins', function () {
    it('should work', function () {
        expect($('#plain').html()).toEqual(', mixed2, mixed1, mixed2, sphere');
    });
});
