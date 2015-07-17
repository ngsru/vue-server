var directive = require('./parsers/directive');
var expression = require('./parsers/expression');
var path = require('./parsers/path');
var text = require('./parsers/text');



// var tokens = text.parse('{{fdsfs + 1}}')


// var expr = text.tokensToExp(tokens);

console.log(directive.parse('dsfsdfs | fdsfsd | fgdfds 4234')[0].filters)