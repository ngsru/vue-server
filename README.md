# vue-server
Vue.js server side version


## vue-server@0.2.* matched vue@0.11.* functionality


## Code Example
```
var vueServer = require('vue-server');
var Vue = new vueServer.renderer();

var vm = new Vue({
    template: '<commonModule v-bind:object="scheme"></commonModule>',
    data: {
        scheme: {
            display: 'inline',
            position: 'absolute'
        }
    },

    components: {
        commonModule: {
            props: {
                object: null
            },
            template: '<pre>{{object | json}}</pre>',
        }
    }
});

vm.$on('vueServer.htmlReady', function(html) {
    console.log(html);
});
```