var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {
    template: '<div id="filter"><child></child></div>',

    filters: {
        parentFilter: function (value) {
            return value + '&filteredValue';
        }
    },

    components: {
        child: {
            data: function () {
                return {
                    prop: 'original'
                };
            },
            template: '<i>{{prop | parentFilter}}</i>'
        },
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true, strict: true});
});

describe('while using strict: true', function () {
    it('child component should not inherit parent\'s filters', function () {
        expect($('#filter').html()).toEqual('<i>original</i>');
    });
});
