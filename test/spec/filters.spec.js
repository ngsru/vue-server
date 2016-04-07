var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();

var entity = '&ndash;&&';
var encodedEntity = entities.encode(entity); // escaped
var decodedEntity = entities.decode(entity); // converted into real symbols

var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: '<div><ndash>{{arr | join \'' + entity + '\'}}</ndash></div>',
    data: function () {
        return {
            arr: [10, 20, 30]
        };
    },
    filters: {
        join: function (value, symbol) {
            return value.join(symbol);
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('filters', function () {
    // To implement this look: src/parsers/directive.js:57
    it('should be able to use web symbols as arguments', function () {
        expect(
            entities.decode($('ndash').text())
        ).toEqual([10, 20, 30].join(decodedEntity));
    });
});
