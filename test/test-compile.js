var vueServer = require('../index');
var Server = new vueServer.renderer();

var VueCompile = vueServer.compiler;
var tpl = VueCompile([
    '<common-module object="{{go}}" gfdgd="{{gfdgd}}"></common-module>',
    '<as-template object="{{go}}"></as-template>'
].join(''));

var vm = new Server({
    template: tpl,
    data: {
        gfdgd: 'gfdgdfgd<div></div>',
        go: {
            display: 'inline',
            position: 'absolute'
        }
    },

    components: {
        'common-module': {
            paramAttributes: ['object', 'gfdgd'],
            template: VueCompile('<pre>{{{gfdgd}}}||{{object | json}}</pre>'),
        },
        'as-template': {
            replace: true,
            paramAttributes: ['object'],
            template: VueCompile('<div>Now we can use inherited values: <pre>{{object | json}}</pre></div>'),
        }
    }
})

vm.$on('vueServer.htmlReady', function(html) {
    console.log(html);
});