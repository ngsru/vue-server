var express = require('express');
var app = express();
var _ = require('underscore');

var VueServer = require('../index.js');
var VueCompile = VueServer.compiler;
var VueRender = VueServer.renderer;

var util = require('util');
var fs = require('fs');



app.use(express.static('./public'));


var contentComponent = require('./component');



(function() {
    contentComponent.template = VueCompile( fs.readFileSync(__dirname + '/component/templates/index.html', 'utf8') );


    var prepareComponents = function(components) {
        _.each(components, function(component) {
            if (component.template) {
               component.template = VueCompile(component.template); 
            }
            preparePartials(component.partials);

            prepareComponents(component.components);
        });
    }


    var preparePartials = function(partials) {
        _.each(partials, function(partial, name) {
            partials[name] = VueCompile(partial);
        });
    }

    prepareComponents(contentComponent.components);
    preparePartials(contentComponent.partials);
})();


// console.log(contentComponent)



var Vue = new VueRender();




// Обрабатываем запрос
app.get('/', function(req, res) {
    var vm = new Vue({
        data: {
            dynamic: 'content'
        },
        template: VueCompile('<div v-component="{{dynamic}}" wait-for="loaded"></div>'),

        components: {
            content: contentComponent
        }
    });

    vm.$on('vueServer.htmlReady', function(html) {
        res.send( html );
    });
}); 


app.get('/static/*', function(req, res) {

    var options = {
        root: __dirname + '/public/',
        dotfiles: 'deny',
        headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
        }
    };

    var fileName = req.url.replace('/static/', '');
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });

}); 


app.listen(4000);



console.log('Application Launched on port 4000')