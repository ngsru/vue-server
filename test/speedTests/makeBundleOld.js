var browserify = require('browserify');
var fs = require('fs');

var path = require('path');
// Делаем Бандл
var bro = browserify();

bro
    .add( path.join(__dirname, 'pointOld.js') )
    .bundle(function(err, script) {
        if (err) {
            throw(err);
        } else {
            fs.writeFile('./vue-repeat1-server-bundle.js', script, function(err) {
                console.log('bundle ready')
            });
        }
    });

