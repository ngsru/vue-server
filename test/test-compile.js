var VueRender = require('vue-html-render');
var server = new VueRender();

var VueCompile = require('vue-html-compile');
var tpl = VueCompile([
    '<commonmodule object="{{go}}"></commonmodule>',
    '<astemplate object="{{go}}"></astemplate>'
].join(''));




var vm = new server({
    template: tpl,
    data: {
        go: {
            display: 'inline',
            position: 'absolute'
        }
    },

    components: {
        'commonmodule': {
            props: ['object'],
            template: VueCompile('<pre>{{object | json}}</pre>'),
        },
        'astemplate': {
            replace: true,
            props: ['object'],
            template: VueCompile('<div>Now we can use inherited values: <pre>{{object | json}}</pre></div>'),
        }
    }
})

vm.$on('vueServer.htmlReady', function(html) {
    console.log('')
    console.log(html);
    console.log('')
});