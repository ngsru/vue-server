var wrapComponent = require('./../wrapComponent2.js');
var $;
var contentComponent = {

    template: [
        '<div id="plain"><go></go>, <run></run>, <slide></slide>, <walk></walk></div>',
    ].join(''),
    components: {
        go: {
            template: '<i>original</i>'
        }
    },

    mixins: [
        {
            components: {
                go: {
                    template: '<i>mixed1</i>'
                },
                run: {
                    template: '<i>mixed1</i>'
                },
                slide: {
                    template: '<i>mixed1</i>'
                }
            }
        },
        {
            components: {
                run: {
                    template: '<i>mixed2</i>'
                },
                walk: {
                    template: '<i>mixed2</i>'
                }
            }
        }
    ]
};

beforeAll(function (done) {
    wrapComponent(
        contentComponent,
        function (response) {
            $ = response;
            done();
        },
        function (Vue) {
            Vue.component('walk', {
                template: '<i>global</i>'
            });
        }
    );
});

describe('components from mixins', function () {
    it('should work', function () {
        expect($('#plain').html()).toEqual('<i>original</i>, <i>mixed2</i>, <i>mixed1</i>, <i>mixed2</i>');
    });
});
