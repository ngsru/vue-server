var vueServer = require('./../../index');
var Vue = new vueServer.renderer();

var vm = new Vue({
    template: '<common-module></common-module>',
    components: {
        commonModule: {
            template: '<div>Hello world!</div>'
        }
    }
});

vm.$on('vueServer.htmlReady', function (html) {
    console.log(html);
});
