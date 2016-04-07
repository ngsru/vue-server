var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {
    template: [
        '<div class="show" v-if="vIf.show"></div>',
        '<div class="hide" v-if="vIf.hide"></div>',

        '<div class="show-method" v-if="forVIfShow()"></div>',
        '<div class="hide-method" v-if="forVIfHide()"></div>',

        '<div class="escaped-gts" v-if="2 &gt; 1"></div>',
        '<div class="escaped-lts" v-if="1 &lt; 2"></div>',
        '<div class="escaped-double-ampersand">',
            '<i v-if="1 &amp;&amp; 0"></i>',
            '<i v-if="1 &amp;&amp; 1"></i>',
        '</div>'
    ].join(''),
    data: function () {
        return {
            vIf: {}
        };
    },
    methods: {
        forVIfShow: function () {
            return this.vIf.show;
        },

        forVIfHide: function () {
            return this.vIf.hide;
        }
    },

    activateBe: function (done) {
        this.vIf = {
            show: true,
            hide: false
        };

        done();
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

// v-if - begin
describe('v-if', function () {
    it('should enable rendering element', function () {
        expect($('.show').length).toEqual(1);
    });

    it('should disable rendering element', function () {
        expect($('.hide').length).toEqual(0);
    });

    it('should enable rendering element when value provided by a method', function () {
        expect($('.show-method').length).toEqual(1);
    });

    it('should disable rendering element when value provided by a method', function () {
        expect($('.hide-method').length).toEqual(0);
    });

    it('should understand escaped ">" and "<" signs', function () {
        expect($('.escaped-gts').length).toEqual(1);
        expect($('.escaped-lts').length).toEqual(1);
    });

    it('should understand escaped double ampersand', function () {
        expect($('.escaped-double-ampersand i').length).toEqual(1);
    });
});
