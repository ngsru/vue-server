var fs = require('fs');
var minify = require('html-minifier').minify;

module.exports = {
    getTpl: function (path, min) {
        var tpl = fs.readFileSync(path, 'utf-8');
        if (min) {
            return minify(tpl, {
                collapseWhitespace: true
            });
        }
        return tpl;
    },
};
