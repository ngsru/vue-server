var wrapComponent2 = require('./../wrapComponent2.js');
var $;
var contentComponent = {
    data: {
        value: false,
        text: ''
    },
    template: '<item></item><div id="content"><head :value="value"></head></div><div id="text">{{text}}</div>',
    readyBe: function () {
        this.text += ' ready';
    },
    components: {
        head: {
            props: ['value'],
            template: '<i>head<b v-if="value">bold</b></i>'
        },
        item: {
            template: '<div>item</div>',
            activateBe: function (done) {
                this.$root.value = true;
                this.$root.text = 'component';
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

describe('global pseudo reactivity', function () {
    it('should enable rebuilding VMs ou of scope of content component', function () {
        expect($('#content').html()).toEqual('<i>head<b>bold</b></i>');
    });

    it('and readyBe should work properly', function () {
        expect($('#text').html()).toEqual('component ready');
    });
});
