var cheerio = require('cheerio');
var VueServer = require('../../index.js');
var VueCompile = VueServer.compiler;
var VueRender = VueServer.renderer;

module.exports = function (content, callback) {
    var Vue = new VueRender();

    Vue.config.silent = true;

    var vm = new Vue(content);

    var timeout = setTimeout(function () {
        $ = cheerio.load('<div>vueServer.htmlReady didnt fire</div>');
        callback($);
    }, 1000);

    vm.$on('vueServer.htmlReady', function (html) {
        clearTimeout(timeout);
        $ = cheerio.load(html, {
            decodeEntities: false
        });
        callback($);
    });

};
