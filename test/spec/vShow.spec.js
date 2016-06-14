var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {
    template: [
        '<section id="v-show" v-if="vShow">',
            '<div class="hide" v-show="vShow.hide"></div>',
            '<div class="hide-by-method" v-show="forVShowHide()"></div>',
            '<div class="show-hidden" style="display: none" v-show="vShow.show"></div>',
            '<div class="show-hidden-by-method" style="display: none" v-show="forVShowShow()"></div>',
            '<div class="hide-shown" style="display: block" v-show="vShow.hide"></div>',
            '<div class="replace-v-bind" :style="{display: \'none\'}" v-show="vShow.show"></div>',
            '<div class="replace-v-bind-reverse" v-show="vShow.show" :style="{display: \'none\'}"></div>',
        '</section>'
    ].join(''),
    data: function () {
        return {
            vShow: null
        };
    },

    activateBe: function (done) {
        this.vShow = {
            show: true,
            hide: false
        };

        done();
    },

    methods: {
        forVShowHide: function () {
            return this.vShow.hide;
        },

        forVShowShow: function () {
            return this.vShow.show;
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('v-show', function () {
    it('should be able to set display: none', function () {
        expect($('#v-show .hide').css('display')).toEqual('none');
    });

    it('should be able to set display: none when value provided by a method', function () {
        expect($('#v-show .hide-by-method').css('display')).toEqual('none');
    });

    it('should remove display: none if it were set', function () {
        expect($('#v-show .show-hidden').css('display')).not.toBe('none');
    });

    it('should remove display: none if it were set when value provided by a method', function () {
        expect($('#v-show .show-hidden-by-method').css('display')).not.toBe('none');
    });

    it('should hide element even if other display value were set', function () {
        expect($('#v-show .hide-shown').css('display')).toEqual('none');
    });

    it('should dominate if v-show is after :style', function () {
        expect($('#v-show .replace-v-bind').css('display')).not.toBe('none');
    });

    it('should give in if v-show is before :style', function () {
        expect($('#v-show .replace-v-bind').css('display')).toEqual('none');
    });
});
