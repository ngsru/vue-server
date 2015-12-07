var cheerio = require('cheerio');
var VueServer = require('../../index.js');
var VueRender = VueServer.renderer;
var $;

beforeAll(function (done) {
    var Vue = new VueRender();

    Vue.config.silent = true;
    Vue.config.replace = false;

    Vue.component('comp', {
        template: '<i>present</i>'
    });

    Vue.filter('filtr', function(value) {
        return value + ' filtered';
    });

    Vue.partial('part', '<i>partial content</i>');

    Vue.mixin = [{
        data: function() {
            return {
                globalMixinValue: 'global mixin data value'
            }
        }
    }];

    Vue.prototype.$myMethod = function() {
        return '$myMethod returns value';
    };

    var vm = new Vue({
        template: [
            '<div id="component" is="comp"></div>',
            '<div id="filter">{{value | filtr}}</div>',
            '<div id="partial"><partial name="part"></partial></div>',
            '<div id="mixin">{{globalMixinValue}}</div>',
            '<div id="prototype">{{globalPrototypeValue}}</div>',
        ].join(''),
        data: {
            value: 'value'
        },

        compiledBe: function() {
            this.globalPrototypeValue = this.$myMethod();
        }
    });

    vm.$on('vueServer.htmlReady', function (html) {
        $ = cheerio.load(html);
        done();
    });
});

describe('global', function () {
    it('component registration should work', function () {
        expect($('#component').html()).toEqual('<i>present</i>');
    });

    it('filter registration should work', function () {
        expect($('#filter').html()).toEqual('value filtered');
    });

    it('partial registration should work', function () {
        expect($('#partial').html()).toEqual('<i>partial content</i>');
    });

    it('mixin should work', function () {
        expect($('#mixin').html()).toEqual('global mixin data value');
    });

    it('prototype extends instances', function () {
        expect($('#prototype').html()).toEqual('$myMethod returns value');
    });
});
