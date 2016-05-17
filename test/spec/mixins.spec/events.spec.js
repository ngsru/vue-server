var wrapComponent = require('./../wrapComponent.js');
var $;
var contentComponent = {
    data: function () {
        return {value: ''};
    },
    template: [
        '<div id="plain">{{go}}, {{run}}, {{slide}}, {{walk}}</div>'
    ].join(''),
    events: {
        go: function () {
            this.go = 'original';
        }
    },
    createdBe: function () {
        this.$emit('go');
        this.$emit('run');
        this.$emit('slide');
        this.$emit('walk');
    },
    mixins: [
        {
            events: {
                go: function () {;
                    this.go = 'mixed1';
                },
                run: function () {
                    this.run = 'mixed1';
                },
                slide: function () {
                    this.slide = 'mixed1';
                }
            }
        },
        {
            events: {
                run: function () {
                    this.run = 'mixed2';
                },
                walk: function () {
                    this.walk = 'mixed2';
                }
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

describe('events from mixins', function () {
    it('should work', function () {
        expect($('#plain').html()).toEqual('original, mixed2, mixed1, mixed2');
    });
});
