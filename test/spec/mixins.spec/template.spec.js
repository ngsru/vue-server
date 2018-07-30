var wrapComponent = require('./../wrapComponent2.js');
var $;
var contentComponent = {
    template: [
        '<div id="owntpl">',
        '<owntpl></owntpl>',
        '</div>',
        '<div id="onlymixintpl">',
        '<onlymixintpl></onlymixintpl>',
        '</div>'
    ].join(','),

    components: {
        owntpl: {
            template: '<div>1111111</div>',
            mixins: [
                {
                    template: '<div>2222222</div>'
                },
                {
                    template: '<div>3333333</div>'
                }
            ]
        },

        onlymixintpl: {
            mixins: [
                {
                    template: '<div>2222222</div>'
                },
                {
                    template: '<div>3333333</div>'
                },
                {}
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
        }
    );
});

describe('template from mixins', function () {
    it('own template', function () {
        expect($('#owntpl div').html()).toEqual('1111111');
    });

    it('template from last mixin', function () {
        expect($('#onlymixintpl div').html()).toEqual('3333333');
    });
});
