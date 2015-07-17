var directive = require('./parsers/directive');
var expression = require('./parsers/expression');
var path = require('./parsers/path');
var text = require('./parsers/text');



// var tokens = text.parse('{{fdsfs + 1}}')


// var expr = text.tokensToExp(tokens);

// console.log(text.tokensToExp(text.parse('{{fdsfsdf + 1 | fdsfs}}')))

var value = 'gfdg {{{vvcxcvx + 1 | GDF}}}';
var getMetaValue = function(value) {
    var result = [];
    var tokens = text.parse(value);

    if (tokens) {
        tokens.forEach(function(token) {
            if (token.tag) {
                var parsedToken = directive.parse(token.value)[0];
                var exp = expression.parse(parsedToken.expression);

                result.push({
                    value: {
                        get: exp.get,
                        filters: parsedToken.filters
                    },
                    isEscape: token.html ? false : true,
                    isClean: true
                });
            } else {
                result.push({
                    value: {
                        get: token.value
                    },
                    isEscape: false,
                    isClean: false
                });
            }
        })
        // if (!tokens.html) {
        //     metaValue.isEscape = true;
        // }
        // metaValue.get = expression.parse(parsers.text.tokensToExp(tokens)).get;
    } else {
        result.push({
            value: {
                get: value
            },
            isEscape: false,
            isClean: false
        });
    }

    return result;
}

var go = getMetaValue(value)

console.log(go)
