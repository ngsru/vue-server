var wrapComponent2 = require('./../wrapComponent2.js');
var $;
var contentComponent = {
    template: '<item></item>',
    data: {
        view: false
    },
    components: {
        item: {
            template: [
                '<div id="inner-recompile"><inner v-if="view" :value="false"></inner></div>',
                '<div id="prop-state-saving"><inner :value="false"></inner></div>'
            ].join(''),
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
        expect($('#inner-recompile').html()).toEqual('<div><span>fine</span></div>');
    });

    it('and a component inside should not override pulled prop if parent\'s value didn\'t change', function () {
        expect($('#prop-state-saving').html()).toEqual('<div><span>fine</span></div>');
    });
});
