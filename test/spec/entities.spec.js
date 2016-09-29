var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();

var entity = '&thinsp;&ndash;&thinsp;';
var entityTag = '&nbsp;<div></div>';
var encodedEntity = entities.encode(entity); // escaped
var decodedEntity = entities.decode(entity); // converted into real symbols

var wrapComponent = require('./wrapComponent2.js');
var $;
var contentComponent = {
    template: [
        '<div id="inline-two">{{\'' + entity + '\'}}</div>',
        '<div id="inline-three">{{{\'' + entity + '\'}}}</div>',
        '<div id="data-two">{{value}}</div>',
        '<div id="data-three">{{{value}}}</div>',
        '<div id="join-filter-two">{{arr | join \'' + entity + '\'}}</div>',
        '<div id="join-filter-three">{{{arr | join \'' + entity + '\'}}}</div>',

        '<div id="escape-bind" :title="value2"></div>',
        '<div id="escape-mustache" title="{{value2}}"></div>',
        '<div id="escape-mustache-tripple" title="{{{value2}}}"></div>',

        '<div id="join-filter-attr" :title="arr | join \'' + entity + '\'"></div>',
        '<div id="comp-prop"><item value="' + entity + '"></item></div>',
        '<div id="comp-prop-dyn"><item :value="value"></item></div>',
        '<div id="comp-prop-dyn-filter"><item :value="arr | join \'' + entity + '\'"></item></div>',

        '<div id="tag-attrib-two" title="{{tag}}"></div>',
        '<div id="tag-attrib-three" title="{{{tag}}}"></div>',
        '<div id="tag-attrib-dyn" :title="tag"></div>',
        '<div id="tag-attrib-in-style" :style="{backgroundImage: bgImgVal}"></div>',

        // A compiler test for incorrect attribute with quotes
        '<div id="incorrect-attribute-1" on:"test"></div>'
    ].join(''),
    data: function () {
        return {
            arr: [10, 20],
            value: entity,
            value2: entityTag,
            tag: '<img src="1.jpg"/>',
            bgImgVal: 'url("1.jpg")'
        };
    },

    components: {
        item: {
            props: ['value'],
            template: '<i>{{value}}</i>'
        }
    },

    filters: {
        join: function (value, symbol) {
            return value.join(symbol);
        }
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    });
});

describe('entities', function () {
    it('should not be escaped when described inside template', function () {
        expect($('#inline-two').html()).toEqual(decodedEntity);
        expect($('#inline-two').html()).toEqual(decodedEntity);
    });

    describe('when described inside data', function () {
        it('and called with {{}} should be escaped ', function () {
            expect($('#data-two').html()).toEqual(encodedEntity);
        });

        it('and called with {{{}}} should not be escaped', function () {
            expect(
                entities.decode(
                    $('#data-three').html()
                )
            ).toEqual(decodedEntity);
        });
    });

    it('should not be escaped when passed through a filter from template', function () {
        expect($('#join-filter-two').html()).toEqual('10' + decodedEntity + '20');
        expect($('#join-filter-two').html()).toEqual('10' + decodedEntity + '20');
    });

    describe('inside attributes', function () {
        it('should not be escaped', function () {
            expect($('#escape-bind').attr('title')).toEqual(entityTag);
            expect($('#escape-mustache').attr('title')).toEqual(entityTag);
            expect($('#escape-mustache-tripple').attr('title')).toEqual(entityTag);
        });

        it('should not be escaped when passed through a filter inside an attribute', function () {
            expect(
                entities.decode(
                    $('#join-filter-attr').attr('title')
                )
            ).toEqual('10' + decodedEntity + '20');
        });

        it('should not be escaped when passed as prop into a component from static attribute', function () {
            expect(
                entities.decode(
                    $('#comp-prop i').html()
                )
            ).toEqual(decodedEntity);
        });

        it('should be escaped when passed as prop into a component from dynamic attribute', function () {
            expect(
                entities.decode(
                    $('#comp-prop-dyn i').html()
                )
            ).toEqual(entity);
        });

        it('should not be escaped when passed as prop into a component from dynamic with filter', function () {
            expect(
                entities.decode(
                    $('#comp-prop-dyn-filter i').html()
                )
            ).toEqual('10' + decodedEntity + '20');
        });

        it('should escape quotes', function () {
            var result = '<img src=&quot;1.jpg&quot;/>';
            expect($('#tag-attrib-two').attr('title')).toEqual(result);
            expect($('#tag-attrib-three').attr('title')).toEqual(result);
            expect($('#tag-attrib-dyn').attr('title')).toEqual(result);

            expect($('#tag-attrib-in-style').attr('style')).toEqual(
                'background-image: url(&quot;1.jpg&quot;);'
            );
        });
    });

    it('Compiler should be able to compile attrbutes with quotes', function () {
        expect($('#incorrect-attribute-1').attr('on:"test"')).toEqual('');
    });

});
