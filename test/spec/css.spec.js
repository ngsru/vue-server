var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {
    template: [
        '<div ',
            'id="merge" ',
            ':style="{ \'backgroundImage\': \'url(\' + page.banner_image + \')\' }" ',
            'style="background-image: url(http://placehold.it/300x200)"',
        '></div>'
    ].join(''),
    data: {
        page: {
            banner_image: 'path/to/file.jpg'
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('css styles', function () {
    it('if provided with same property in different spelling types should merge into single one', function () {
        expect($('#merge').attr('style')).toEqual('background-image: url(path/to/file.jpg);');
    });
});
