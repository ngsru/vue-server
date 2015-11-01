# VueServer.js
Vue.js server side version

## Disclaimer
This is not an offical Vue.js version and it has no stright relation to it and its author.

The module is developed for specific needs of its authors and has some restrictions compared to Vue.js.

## Getting started

```
var vueServer = require('vue-server');
var Vue = new vueServer.renderer();

// For $root instance you should pass 'template' option instead of 'el'.
var vm = new Vue({
    template: '<common-module></common-module>',
    components: {
        commonModule: {
            template: '<div>Hello world!</div>'
        }
    }
});

vm.$on('vueServer.htmlReady', function(html) {
    console.log(html); // '<div>Hello world!</div>'
});
```

## Compability table
| VueServer.js  | Vue.js        |
| :------------ |:------------- |
| ^0.4.0        | 1.0.0-alpha.8 |

## Restrictions
VueServer.js is desined for static html rendering. It has no real reactivity.
It means you cannot use some of Vue.js functionality.

#### Hooks
VueServer.js does not share hooks with Vue.js. It has its own ones, partially equal to Vue.js
| VueServer.js  | Vue.js        |
| :------------ |:------------- |
| createdBe     | created       |
| --            | beforeCompile |
| compiledBe    | compiled      |
| readyBe       | ready         |
| --            | attached      |
| --            | detached      |
| --            | beforeDestroy |
| --            | destroyed     |
| activateBe    | activate      |

#### Methods are not supported:
* vm.$watch
* vm.$delete
* vm.$eval
* vm.$interpolate
* vm.$log
* vm.$appendTo
* vm.$before
* vm.$after
* vm.$remove
* vm.$mount
* vm.$destroy
* vm.$addChild

#### Directives are not supported:
* v-on
* v-el

Because of using extra light DOM version it is not possible to use custom directives too.

#### What else
* <content>/<slot> API (will be supported soon)

## What is supported
Well, actually, everything else is (maybe I forgot something).

It means you can use v-if, filters, partials, async components, wait-for (or activate hook), events and etc.

Overall, it is possible to use complex component building system you love so much using Vue.js


## Templates precompilation
It is recommended to precompile templates for faster rendering

```
var vueServer = require('vue-server');
var VueCompile = new vueServer.compiler();

var serverTemplate = VueCompile('<div>Hello world!</div>');
```


## Config
```
var vueServer = require('vue-server');
var Vue = new vueServer.renderer();

// Original Vue.js options. Can be used with VueServer.js too:
Vue.config.replace = false;
Vue.config.debug = true;
Vue.config.silent = false;
Vue.config.strict = false;

// VueServer.js options.
// On warnings and errors you can pass additional information about your VM;
Vue.config.onLogMessage = function (vm) {
    if (vm.name) {
        return vm.name;
    } else {
        return '';
    }
};
```