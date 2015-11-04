var CSSParser = {
    parse: function (string) {
        var temp = string.split(';'),
            obj = {};

        temp.forEach(function (item, i) {
            if (item) {
                var prop = item.split(':');

                if (!prop[1]) {
                    throw 'CSS format is invalid: "' + item + '"';
                }

                obj[prop[0].trim()] = prop[1].trim();
            }
        });

        return obj;
    },

    stringify: function (object) {
        var string = '';

        for (var prop in object) {
            if (object[prop] === undefined || object[prop] === null || object[prop] === '') {
                continue;
            }
            string += prop.replace(/[A-Z]/g, function (a) { return '-' + a.toLowerCase(); }) + ': ' + object[prop] + '; ';
            // string += prop + ': ' + object[prop] + '; ';
        }

        return string.trim();
    }
};

module.exports = CSSParser;
