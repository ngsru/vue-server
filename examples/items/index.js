var fs = require('fs');
var vueServer = require('./../../index');
var Vue = new vueServer.renderer();

// define the item component
Vue.component('item', {
    template: [
        '<li v-show="isVisible">',
            '<strong>{{header | fancyfy}}</strong>',
        '</li>'
    ].join(''),
    props: {
        model: Object
    },
    data: function () {
        return {
            isVisible: false
        };
    },
    computed: {
        header: function () {
            var postfix;
            if (this.model.first) {
                postfix = ' is FIRST';
            } else {
                postfix = ' is LAST';
            }
            return this.model.name + postfix;
        }
    },

    filters: {
        fancyfy: function (value) {
            return '--=' + value + '=--';
        }
    }
});

// boot up the demo
var demo = new Vue({
    template: [
        '<ul>',
            '<item v-for="item in model" :model="item"><item>',
        '</ul>'
    ].join(''),
    data: {
        model: [
            {
                first: true,
                name: 'White'
            },
            {
                first: false,
                name: 'Horse'
            }
        ]
    }
});

demo.$on('vueServer.htmlReady', function (html) {
    console.log(html);
});
