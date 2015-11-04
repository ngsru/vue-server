var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('underscore');
var VueServer = require('../../index.js');
var VueCompile = VueServer.compiler;
var VueRender = VueServer.renderer;

module.exports = function (content, callback, config) {
    (function () {
        if (typeof content.template === 'string') {
            // content.template = VueCompile(content.template);
        } else {
            content.template = VueCompile(fs.readFileSync(content.template.path, 'utf-8'));
        }

        // Not to bother about this hook
        if (!content.compiledBe) {
            content.compiledBe = function () {
                this.$emit('loaded');
            };
        }

        // var prepareComponents = function(components) {
        //     _.each(components, function(component) {
        //         if (component.template) {
        //            component.template = VueCompile(component.template);
        //         }
        //         preparePartials(component.partials);

        //         prepareComponents(component.components);
        //     });
        // };

        // var preparePartials = function(partials) {
        //     _.each(partials, function(partial, name) {
        //         partials[name] = VueCompile(partial);
        //     });
        // };

        // prepareComponents(content.components);
        // preparePartials(content.partials);
    })();

    var Vue = new VueRender();

    Vue.config.silent = true;
    Vue.config.replace = false;

    if (config) {
        _.extend(Vue.config, config);
    }

    var vm = new Vue({
        data: {
            dynamic: 'content'
        },
        template: VueCompile('<div v-component="{{dynamic}}" wait-for="loaded"></div>'),

        components: {
            content: content
        }
    });

    vm.$on('vueServer.htmlReady', function (html) {
        $ = cheerio.load(html);
        callback($);
    });
};
