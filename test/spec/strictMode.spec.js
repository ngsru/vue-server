var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {
    template: [
        ''
    ].join(''),

    filters: {
        parentFilter: function (value) {
            return value + '&filteredValue';
        }
    },

    components: {
        child: {
            data: function () {
                return {
                    prop: 'original'
                };
            },
            template: '<i>{{prop | parentFilter}}</i>'
        },
        itself: {
            props: {
                include: {
                    default: false
                }
            },
            template: '<i>content<itself v-if="include"></itself></i>'
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true, strict: true});
});

describe('while using strict: true', function () {
    // it('child component should not inherit parent\'s filters', function () {
    //     expect($('#filter').html()).toEqual('<i>original</i>');
    // });
    //
    // it('a component should be able to invoke itself', function () {
    //     expect($('#itself').html()).toEqual('<i>content<i>content</i></i>');
    //     expect($('#itself-v-for').html()).toEqual('<i>content<i>content</i></i>');
    // });
});
