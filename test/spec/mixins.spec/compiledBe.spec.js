var wrapComponent = require('./../wrapComponent.js');
var $;
var contentComponent = {
    template: '<div><content></content></div>',
    components: {
        content: {
            template: [
            '<div id="content">',
                '{{created}}|{{compiled}}|{{ready}}|{{createdHooked}}|{{compiledHooked}}|{{readyHooked}}',
            '</div>'].join(''),
            data: function () {
                return {
                    created: 1111,
                    createdHooked: 1111,
                    compiled: 1111,
                    compiledHooked: 1111,
                    ready: 1111,
                    readyHooked: 1111
                };
            },

            createdBe: function () {
                this.created = 3333;
            },

            compiledBe: function () {
                this.compiled = 3333;

            },
            readyBe: function () {
                this.ready = 3333;
            },
            mixins: [
                {
                    createdBe: function () {
                        this.created = 2222;
                        this.createdHooked = 2222;
                    },

                    compiledBe: function () {
                        this.compiled = 2222;
                        this.compiledHooked = 2222;
                    },

                    readyBe: function () {
                        this.ready = 2222;
                        this.readyHooked = 2222;
                    },
                }
            ]
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('compiledBe inside mixins', function () {
    it('should be work', function () {
        expect($('#content').html()).toEqual('3333|3333|3333|2222|2222|2222');
    });
});
