<p align="center">
    <img width="100" src="http://devlprs.net/vue-server.png">
</p>

<p align="center">
    <a href="https://travis-ci.org/ngsru/vue-server">
        <img src="https://travis-ci.org/ngsru/vue-server.svg?branch=master">
    </a>
    <a href="https://www.bithound.io/github/ngsru/vue-server">
        <img src="https://www.bithound.io/github/ngsru/vue-server/badges/score.svg" alt="bitHound Score">
    </a>
    <br>
    <a href="https://gitter.im/ngsru/vue-server">
       <img src="https://badges.gitter.im/Join%20Chat.svg">
    </a>
    <br>
    <a href="https://nodei.co/npm/vue-server/">
      <img src="https://nodei.co/npm/vue-server.png">
    </a>
</p>

VueServer.js
========

Vue.js server-side version


Disclaimer
---

This is not an offical Vue.js version and it has no straight relation to it and its author.

The module is developed for specific needs of its authors and has some restrictions compared to Vue.js.

Getting started
---

```js
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

Compatibility table
---

| VueServer.js  | Vue.js        |
| :------------ |:------------- |
| ^0.4.0        | 1.0.0-alpha.8 |


Restrictions
---

**VueServer.js** is designed for static HTML rendering. It has no real reactivity.

Also, the module is not running original Vue.js on server. It has its own implementation.

It means **VueServer.js** is just trying to perfectly reproduce the same result as Vue.js does.

Because of the reasons listed above some of Vue.js functionality is not available.


#### Hooks difference
**VueServer.js** does not share hooks with Vue.js. It has its own ones, partially equal to Vue.js'

**Note:** `readyBe` is a bit experimental and its behaviour may be not correct.

| VueServer.js  | Vue.js        |
| :------------ |:------------- |
| `createdBe`     | `created`       |
| --            | `beforeCompile` |
| `compiledBe`    | `compiled`      |
| `activateBe`    | `activate`      |
| `readyBe`       | `ready`         |
| --            | `attached`      |
| --            | `detached`      |
| --            | `beforeDestroy` |
| --            | `destroyed`     |



#### List of unsupported methods:
* `vm.$watch`
* `vm.$delete`
* `vm.$eval`
* `vm.$interpolate`
* `vm.$appendTo`
* `vm.$before`
* `vm.$after`
* `vm.$remove`
* `vm.$mount`
* `vm.$destroy`
* `vm.$addChild`


#### List of unsupported directives:
* `v-on`
* `v-el`

Because of using an extra light DOM version it's not possible to use custom directives too.

## What is supported, then?
Well, *actually*, everything else is (maybe I forgot something).

It means you can use `v-if`, `filters`, `partials`, `async components`, `wait-for` (or activate hook), `events` etc.

Overall, it is possible to use the beloved **complex component building system** like in orignal Vue.js


Templates precompilation
---

It is recommended to precompile templates for faster rendering

```js
var vueServer = require('vue-server');
var VueCompile = new vueServer.compiler();

var serverTemplate = VueCompile('<div>Hello world!</div>');
```

We've got a **gulp.js** plugin for that purpose. Soon it will be published too.


Configuration
---

```js
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
