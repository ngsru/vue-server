var wrapComponent = require('./../wrapComponent.js');
var tools = require('./../tools.js');
var $;
var contentComponent = {

    template: tools.getTpl(__dirname + '/component.spec.html', true),
    data: function () {
        return {
            varCompName: 'compName',
            arr: [1,2,3],
            childValue: 'content',
            parto: 'compParted',
            name: 'comp',

            overlapping: {
                show: true,
                attr: 'example'
            }
        };
    },

    components: {
        compName: {
            template: '<i>rakushka</i>'
        },
        MyComponent: {
            template: '<i>rakushka2</i>'
        },
        compNameRep: {
            data: function () {
                return {
                    attr: 'myself',
                    clr: 'red'
                };
            },
            template: '<i :title="attr" :style="{color: clr}">rakushka</i>'
        },
        compNameNoRep: {
            replace: false,
            data: function () {
                return {
                    attr: 'myself',
                    clr: 'red'
                };
            },
            template: '<i :title="attr" :style="{color: clr}">rakushka</i>'
        }
    },

    compiledBe: function () {
        this.parto = 'comp';
        this.$emit('loaded');
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('component', function () {
    it('should mount via <component> tag', function () {
        expect($('#component').html()).toEqual('<i>rakushka</i>');
    });

    it('should mount via <component> tag with dynamic "is"', function () {
        expect($('#component-dyn').html()).toEqual('<i>rakushka</i>');
    });

    it('should mount via <component> tag with dynamic "is" in new style', function () {
        expect($('#component-dyn-new').html()).toEqual('<i>rakushka</i>');
    });

    it('should mount via v-component directive', function () {
        expect($('#directive').html()).toEqual('<i>rakushka</i>');
    });

    it('should mount via custom tag in dashed-case', function () {
        expect($('#dash').html()).toEqual('<i>rakushka</i>');
    });

    it('should mount via custom tag in dashed-case even if first charaсter is upper-case', function () {
        expect($('#dash-first-upper').html()).toEqual('<i>rakushka2</i>');
    });

    it('should mount via custom tag in dashed-case with v-repeat', function () {
        expect($('#repeat-tag').html()).toEqual('<i>rakushka</i><i>rakushka</i><i>rakushka</i>');
    });

    it('should properly overlap vms when replace: true', function () {
        var $el = $('#overlappingn-rep > *');
        var checklist = [];
        checklist.push($el.attr('attr'));
        checklist.push($el.html());
        checklist.push($el.attr('style'));
        checklist.push($el.attr('title'));
        expect(checklist.join(',')).toEqual('example,rakushka,color: red;,myself');
    });

    it('should properly overlap vms when replace: false', function () {
        var $el1 = $('#overlappingn-no-rep > *');
        var $el2 = $('#overlappingn-no-rep i');
        var checklist = [];
        checklist.push($el1.attr('attr'));
        checklist.push(Boolean($el1.attr('style')));
        checklist.push($el2.html());
        checklist.push($el2.attr('style'));
        checklist.push($el2.attr('title'));
        expect(checklist.join(',')).toEqual('example,false,rakushka,color: red;,myself');
    });

});
