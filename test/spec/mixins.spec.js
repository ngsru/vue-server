var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: '<div><order>{{data}}</order> <props>{{flag1}},{{flag2}},{{flag3}},{{flag4}}</props></div>',
    data: function () {
        return {
            flag1: '0',
            data: [],
        };
    },

    createdBe: function () {
        this.data.push('own createdBe');
        // console.log('own createdBe');
    },

    compiledBe: function () {
        this.data.push('own compiledBe');
        this.$emit('loaded');
        // console.log('own compiledBe');
    },
    mixins: [
        {
            data: function () {
                // console.log('mixin 1 data')
                return {
                    flag1: '1',
                    flag2: '1',
                    flag3: '1',
                    flag4: '1'
                };
            },

            createdBe: function () {
                this.data.push('mixin 1 createdBe');
                // console.log('mixin 1 createdBe');
            },

            compiledBe: function () {
                this.data.push('mixin 1 compiledBe');
                // console.log('mixin 1 compiledBe');
            }
        },

        {
            data: function () {
                // console.log('mixin 2 data')
                return {
                    flag1: '2',
                    flag2: '2',
                    flag3: '2'
                };
            },

            createdBe: function () {
                this.data.push('mixin 2 createdBe');
                // console.log('mixin 2 createdBe');
            },

            compiledBe: function () {
                this.data.push('mixin 2 compiledBe');
                // console.log('mixin 2 compiledBe');
            }
        },

        {
            data: function () {
                // console.log('mixin 3 data')
                return {
                    flag1: '3',
                    flag2: '3'
                };
            },

            createdBe: function () {
                this.data.push('mixin 3 createdBe');
                // console.log('mixin 3 createdBe');
            },

            compiledBe: function () {
                this.data.push('mixin 3 compiledBe');
                // console.log('mixin 3 compiledBe');
            }
        }
    ]
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('mixins', function () {
    it('should be used in certain order', function () {
        expect($('order').text())
            .toEqual('mixin 1 createdBe,mixin 2 createdBe,mixin 3 createdBe,own createdBe,' +
                'mixin 1 compiledBe,mixin 2 compiledBe,mixin 3 compiledBe,own compiledBe');
    });
    it('should apply data in special way', function () {
        expect($('props').text()).toEqual('0,3,2,1');
    });
});
