var express = require('express')
var app = express();
var vueServer = require('../../index.js');
var Vue = new vueServer.renderer();

// Adding a route
app.get('/', function(req, res) {
    var vm = new Vue({
        template: '<div>Hello world!</div>',
    });

    vm.$on('vueServer.htmlReady', function(html) {
        res.send(html)
    });
});

// Start server
var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
});
