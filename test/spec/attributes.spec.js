var wrapComponent = require('./wrapComponent2.js');
var specialChars = '&nbsp;<div></div>';
var $;
var contentComponent = {
    template: [
        '<div id="escape-bind"><i :title="value"></i></div>',
        '<div id="escape-mustache"><i title="{{value}}"></i></div>',
        '<div id="escape-mustache-tripple"><i title="{{{value}}}"></i></div>'
    ].join(''),
    data: function () {
        return {
            value: specialChars
        };
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    });
});

describe('attributes', function () {
    it('values should not be escaped', function () {
        expect($('#escape-bind').html()).toEqual('<i title="' + specialChars + '"></i>');
        expect($('#escape-mustache').html()).toEqual('<i title="' + specialChars + '"></i>');
        expect($('#escape-mustache-tripple').html()).toEqual('<i title="' + specialChars + '"></i>');
    });
});
