var browserify = require('browserify');
var fs = require('fs');

var path = require('path');
// Делаем Бандл
var bro = browserify();

bro
    .add( path.join(__dirname, 'pointNew.js') )
    .bundle(function(err, script) {
        if (err) {
            throw(err);
        } else {
            fs.writeFile('./vue-server-bundle.js', script, function(err) {
                console.log('bundle ready')
            });
        }
    });

