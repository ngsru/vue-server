var vueServer = require('./../../index');
var Vue = new vueServer.renderer();

Vue.component('Content', {
    template: '<div>SubView: <sub-view v-ref:subview></sub-view><p>{{data}}</p><i>{{something}}</i></div>',
    computed: {
        something: function () {
            return this.data + ' ^_^';
        }
    },
    data: function () {
        return {
            data: null
        };
    },
    activateBe: function (done) {
        var self = this;
        this.$refs.subview.initData(function (data) {
            self.data = data;
            done();
        });
    },
});

// Child of Content
Vue.component('SubView', {
    template: '<div>{{view}}</div>',
    data: function () {
        return {
            view: null
        };
    },

    // Fetches its data with callback for parent to catch
    initData: function (callback) {
        setTimeout(function () {
            var data = 'Fetched data';
            this.view = data;

            callback(data);
        }.bind(this), 1000);
    }
});

var vm = new Vue({
    template: '<body><content></content></body>'
});

vm.$on('vueServer.htmlReady', function (html) {
    console.log(html);
    // <body><div>SubView: <div>Fetched data</div><p>Fetched data</p><i>Fetched data ^_^</i></div></body>
});
