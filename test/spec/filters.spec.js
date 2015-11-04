var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: '<div><ndash>{{arr | join \'&ndash;\'}}</ndash></div>',
    data: function () {
        return {
            arr: [1,2,3]
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
        expect($('ndash').text()).toEqual('1–2–3');
    });
});
