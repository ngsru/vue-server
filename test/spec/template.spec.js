var wrapComponent = require('./wrapComponent.js');
var $;

var contentComponent = {
    data: function () {
        return {
            yes: true,
            not: false,
            arr: [1, 2, 3]
        };
    },
    template: [
        '<div>',
            '<div id="one"><template>content</template></div>',
            '<div id="two"><template v-if="yes">content</template></div>',
            '<div id="three"><template v-if="not">content</template></div>',
            '<div id="four"><template v-component="comp"></template></div>',
            '<div id="five"><template v-if="yes">cat<template v-if="yes">dog</template></template></div>',
            '<div id="six"><template v-repeat="arr">{{$value}}</template></div>',
        '</div>'
    ].join(''),

    components: {
        'comp': {
            template: '<article>123</article>'
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    });
});

describe('<template>', function () {
    it('should be stay if there are no directives', function () {
        expect($('#one > template').length).toEqual(1);
    });

    it('should be removed while retaining its content if v-if stated true', function () {
        expect($('#two').html()).toEqual('content');
    });

    it('should be removed width removing its content if v-if stated false', function () {
        expect($('#three').html()).toEqual('');
    });

    it('should be able to use v-component', function () {
        expect($('#four > article').length).toEqual(1);
    });

    it('should hangle another <template> inside', function () {
        expect($('#five').html()).toEqual('catdog');
    });

    it('should be able to use v-repeat', function () {
        expect($('#six').html()).toEqual('123');
    });
});
