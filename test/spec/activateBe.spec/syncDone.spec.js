var wrapComponent2 = require('./../wrapComponent2.js');
var $;
var contentComponent = {
    template: '<div id="doc"><item></item><head></head></div>',
    components: {
        head: {
            template: '<div>head<ggg></ggg></div>',
            components: {
                ggg: {
                    template: '<i>ttt</i>'
                }
            }
        },
        item: {
            template: '<div>item</div>',
            activateBe: function (done) {
                done();
            }
        }
    }
};

beforeAll(function (done) {
    wrapComponent2(contentComponent, function (response) {
        $ = response;
        done();
    });
});

describe('hook:activeBe', function () {
    it('should work if done callback called sync', function () {
        expect($('#doc').html()).toEqual('<div>item</div><div>head<i>ttt</i></div>');
    });

});
