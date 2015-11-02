var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div>',
            '<div id="simple"><i v-for="a in arr">{{a + $index}}</i></div>',
            '<div id="simple-explict"><i v-for="(ind, a) in arr">{{a + ind}}</i></div>',
            '<div id="simple-filter"><i v-for="a in arr | reduce">{{a + $index}}</i></div>',
            '<div id="object"><i v-for="a in arr2">{{a + $index}}</i></div>',
            '<div id="object-filter"><i v-for="a in arr2 | reduce">{{a + $index}}</i></div>',
            '<div id="component"><compName v-for="a in arr" :item="a" :index="$index"></compName></div>',
            '<div id="component-filter"><compName v-for="a in arr | reduce" :item="a" :index="$index"></compName></div>',
            '<div id="component-filter-explict"><compName v-for="(ind, a) in arr | reduce" :item="a" :index="ind"></compName></div>',
            '<div id="component2"><component is="compName" v-for="a in arr" :item="a" :index="$index"></component></div>',
            '<div id="component-object"><compName v-for="a in arr2" :item="a" :index="$index"></compName></div>',
            '<div id="component-object-filter"><compName v-for="a in arr2 | reduce" :item="a" :index="$index"></compName></div>',
        '</div>'
    ].join(''),
    data: function() {
        return {
            arr: [3,2,1],
            arr2: {
                niff: 3,
                nuff: 2,
                naff: 1
            },
            childValue: 'content',
            parto: 'compParted',
            name: 'comp'
        };
    },

    components: {
        compName: {
            props: {
                item: null,
                index: null
            },
            template: '<i>{{a}}{{index}}|{{item}}</i>'
        }
    },

    // Убеждаемся, что перетёрли этот хук
    compiledBe: function() {
        
    },

    activateBe: function(insert) {
        this.arr = [1,2,3];
        this.arr2 = {
            niff: 1,
            nuff: 2,
            naff: 3
        };
        insert();
    },

    filters: {
        reduce: function(value) {
            return [value[0], value[2]];
        }
    }
};


beforeAll(function(done) {
    wrapComponent(contentComponent, function(response) {
        $ = response;
        done();
    }, {replace: true});
});


describe('v-for', function() {
    it('on simple array to work fine', function() {
        expect( $('#simple').html() ).toEqual('<i>1</i><i>3</i><i>5</i>');
    });

    it('on simple array with explict index param definition to work fine', function() {
        expect( $('#simple-explict').html() ).toEqual('<i>1</i><i>3</i><i>5</i>');
    });

    it('on simple array + filter to work fine', function() {
        expect( $('#simple-filter').html() ).toEqual('<i>1</i><i>4</i>');
    });

    it('on object to work fine', function() {
        expect( $('#object').html() ).toEqual('<i>1</i><i>3</i><i>5</i>');
    });

    it('on object + filter to work fine', function() {
        expect( $('#object-filter').html() ).toEqual('<i>1</i><i>4</i>');
    });

    it('on component via custom tag to work fine', function() {
        expect( $('#component').html() ).toEqual('<i>0|1</i><i>1|2</i><i>2|3</i>');
    });

    it('on component via custom tag + filter to work fine', function() {
        expect( $('#component-filter').html() ).toEqual('<i>0|1</i><i>1|3</i>');
    });

    it('on component via custom tag + filter with explict index param definition to work fine', function() {
        expect( $('#component-filter-explict').html() ).toEqual('<i>0|1</i><i>1|3</i>');
    });

    it('on component via custom tag and object to work fine', function() {
        expect( $('#component-object').html() ).toEqual('<i>0|1</i><i>1|2</i><i>2|3</i>');
    });

    it('on component via custom tag and object + filter to work fine', function() {
        expect( $('#component-object-filter').html() ).toEqual('<i>0|1</i><i>1|3</i>');
    });

    it('on component via <component> to work fine', function() {
        expect( $('#component2').html() ).toEqual('<i>0|1</i><i>1|2</i><i>2|3</i>');
    });
});