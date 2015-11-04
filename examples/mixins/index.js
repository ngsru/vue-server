var vueServer = require('./../../index');
var Vue = new vueServer.renderer();

var vm = new Vue({
    template: '<div>{{prop1}} {{prop2}} {{prop3}}</div>',
    data: function () {
        return {
            prop1: 'Let\'s',
        };
    },
    mixins: [
        {
            data: function () {
                return {
                    prop2: 'Try'
                };
            },
            createdBe: function () {
                this.prop3 = 'Something else';
            }
        }
    ],
});

vm.$on('vueServer.htmlReady', function (html) {
    console.log(html);
});
