var wrapComponent = require('./../wrapComponent2.js');
var $;
var contentComponent = {

    template: [
        '<div id="plain">',
            '<partial name="go"></partial>, ',
            '<partial name="run"></partial>, ',
            '<partial name="slide"></partial>, ',
            '<partial name="walk"></partial>',
        '</div>',
    ].join(''),
    partials: {
        go: '<i>original</i>'
    },

    mixins: [
        {
            partials: {
                go: '<i>mixed1</i>',
                run: '<i>mixed1</i>',
                slide: '<i>mixed1</i>'
            }
        },
        {
            partials: {
                run: '<i>mixed2</i>',
                walk: '<i>mixed2</i>'
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
            Vue.partial('walk', '<i>global</i>');
        }
    );
});

describe('partials from mixins', function () {
    it('should work', function () {
        expect($('#plain').html()).toEqual('<i>original</i>, <i>mixed2</i>, <i>mixed1</i>, <i>mixed2</i>');
    });
});
