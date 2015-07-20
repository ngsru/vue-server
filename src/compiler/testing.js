var directive = require('./../parsers/directive');
var expression = require('./../parsers/expression');
var path = require('./../parsers/path');
var text = require('./../parsers/text');



// var tokens = text.parse('{{fdsfs + 1}}')


// var expr = text.tokensToExp(tokens);

// console.log(text.tokensToExp(text.parse('{{fdsfsdf + 1 | fdsfs}}')))

var value = '{{gdfgdfgd | filterBy in jopa}}';


var expr = text.parse(value);

// var go = directive.parse(value);
// console.log(text.parse(go))



console.log(directive.parse('vRepeat.arrayForFilter | filterBy vRepeat.searchText in name')[0].filters[0])






var getMetaValue = function(value) {
    var result = [];
    var tokens = text.parse(value);

    var exp = text.tokensToExp([tokens[1]]);
    console.log(expression.parse(exp).get.toString());

    return

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

