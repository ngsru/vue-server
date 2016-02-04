var wrapComponent2 = require('./../wrapComponent2.js');
var $;
var contentComponent = {
    template: '<item></item>',
    data: {
        view: false
    },
    components: {
        item: {
            template: '<div id="content"><inner v-if="view" :value="false"></inner></div>',
            activateBe: function (done) {
                this.view = true;
                done();
            },
            components: {
                inner: {
                    props: {
                        value: null
                    },
                    template: '<div><span v-if="value">fine</span></div>',
                    compiledBe: function () {
                        this.value = true;
                    }
                }
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
    it('should let compiledBe inside child component launch recompile', function () {
        expect($('#content').html()).toEqual('<div><span>fine</span></div>');
    });

});
