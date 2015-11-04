var fs = require('fs');

var vueServer = require('./../../index');
var Vue = new vueServer.renderer();

// Its is recommended to precompile template files for better perfomance.
// Actually, we've got a gulp plugin for that purpose. Soon it will be published too.
var compile = vueServer.compiler;
var serialize = vueServer.serializer;
var tpl = serialize(compile('<pre>{{data | json}}</pre>'));
fs.writeFileSync(__dirname + '/template.js', 'module.exports = ' + tpl, 'utf8');

var vm = new Vue({
    template: require('./template.js'),
    data: function () {
        return {
            data: {
                name: 'John',
                secondname: 'Smith'
            }
        };
    }
});

vm.$on('vueServer.htmlReady', function (html) {
    console.log(html);
});

// Let's remove temp file
fs.unlinkSync(__dirname + '/template.js');
