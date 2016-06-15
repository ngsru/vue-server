var wrapComponent2 = require('./../wrapComponent2.js');
var $;
var Test = {
    data: function () {
        return {
            val: null
        };
    },
    template: '<div><child :value="val"></child></div>',
    activateBe: function (done) {
        this.val = 3123;
        done();
    },

    components: {
        child: {
            props: ['value'],
            template: '<b>{{number}}</b>',
            computed: {
                number: function () {
                    if (this.value) {
                        return 5;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
};

var contentComponent = {
    template: '<i><test></test></i>',
    data: {
        view: false
    },
    components: {
        test: Test
    }
};

beforeAll(function (done) {
    wrapComponent2(contentComponent, function (response) {
        $ = response;
        done();
    });
});

describe('hook:activeBe', function () {
    it('should launch computed props recompilation inside child vm', function () {
        expect($('b').html()).toEqual('5');
    });
});
