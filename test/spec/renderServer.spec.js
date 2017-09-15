var wrapComponent = require('./wrapComponent.js');
var $;

var contentComponent = {
    template: '<div></div>',
    renderServer: function () {
        return [
            {
                id: '398580609596548',
                type: 'tag',
                name: 'i',
                attribs: {},
                inner: [ ],
                dirs: { },
                close: true,
                pre: false
            }
        ];
	}
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    });
});

describe('renderServer option', function () {
    it('should be used as compiled template', function () {
        expect($('div').html()).toEqual('<i></i>');
    });
});
