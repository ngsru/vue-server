function stringify(obj) {
    var result = '';

    var cycle = function (source) {

        if (typeof source !== 'object') {
            // Function & Boolean & Number
            if (typeof source === 'function' || typeof source === 'boolean' || typeof source === 'number') {
                result += source;

            } else if (source === undefined) {
                result += 'undefined';
            // String
            } else {
                result += '"' + source.replace(/"/g, '\\"') + '"';
            }
        } else {
            // Array
            if (source instanceof Array) {
                result += '[';

                source.forEach(function (item, index) {
                    cycle(item);

                    if (index != source.length - 1) {
                        result += ',';
                    }
                });

                result += ']';

            // Object
            } else if (source instanceof Object) {
                var notEmpty = false;

                result += '{';

                for (var item in source) {
                    notEmpty = true;

                    result += '"' + item + '":';
                    cycle(source[item]);
                    result += ',';
                }

                if (notEmpty) {
                    result = result.substr(0, result.length - 1);
                }

                result += '}';

            // null
            } else if (source === null) {
                result += 'null';
            }
        }
    };

    cycle(obj);

    return result.replace(/\n|\r|\t/g, ' ');

}

module.exports = stringify;
