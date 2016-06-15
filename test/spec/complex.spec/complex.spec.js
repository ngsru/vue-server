var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();
var wrapComponent = require('./../wrapComponent.js');
var contentComponent = require('./component');
var $;

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    });
});

// plain - begin
describe('In plain templating', function () {
    it('should display text value', function () {
        expect($('#plain .inner-text').text()).toEqual('Plain value');
    });

    it('should set an attribute value', function () {
        expect($('#plain .attr-value').attr('type')).toEqual('text');
    });

    it('should properly set mixed attribute value', function () {
        expect($('#plain .attr-value').attr('type')).toEqual('text');
    });

    it('should be able to use a filter', function () {
        expect($('#plain .text-filter').text()).toEqual('PLAIN VALUE');
    });

    it('should be able to use multiple filters', function () {
        expect($('#plain .text-filter-multiple').text()).toEqual('plain value');
    });

    it('should be able to use a filter with arguments', function () {
        expect($('#plain .text-filter-arguments').text()).toEqual('3 and 4');
    });

    it('should be able to print html', function () {
        expect($('#plain .html').html()).toEqual('<span>WATWG<sup>2</sup></span>');
    });

    it('should be able to escape html', function () {
        expect(
            entities.decode($('#plain .html-stripped').text())
        ).toEqual('<span>WATWG<sup>2</sup></span>');
    });

    it('should be able to escape and not to escape html in one row', function () {
        expect(
            entities.decode($('#plain .html-mixed').text())
        ).toEqual('WATWG2 <span>WATWG<sup>2</sup></span>');
    });

    describe('with a filter', function () {
        it('should be able to print html', function () {
            expect($('#plain .filter-html').html()).toEqual('<span>WATWG<sup>2</sup></span>');
        });

        it('should be able to escape html', function () {
            expect($('#plain .filter-html-stripped').html()).not.toEqual('<span>WATWG<sup>2</sup></span>');
        });

        it('should be able to escape html from json filter', function () {
            expect($('#plain .filter-json-stripped').html()).not.toMatch(/<span>WATWG<sup>2<\/sup><\/span>/);
        });
    });

    it('should display computed properties', function () {
        expect($('#plain .computed1').text()).toEqual('100');
        expect($('#plain .computed2').text()).toEqual('20000');
    });

    it('should display nothing if value is undefined', function () {
        expect($('#plain .undefined').text()).toEqual('');
    });

    it('should display nothing if computed value is undefined', function () {
        expect($('#plain .computed-undefined').text()).toEqual('');
    });

    it('should display nothing if function returned value is undefined', function () {
        expect($('#plain .fn-undefined').text()).toEqual('');
    });

    describe('as unescaped', function () {
        it('should display nothing if value is undefined', function () {
            expect($('#plain .html-undefined').text()).toEqual('');
        });

        it('should display nothing if computed value is undefined', function () {
            expect($('#plain .html-computed-undefined').text()).toEqual('');
        });

        it('should display nothing if function returned value is undefined', function () {
            expect($('#plain .html-fn-undefined').text()).toEqual('');
        });
    });

    describe('with a filter', function () {
        it('should display nothing if value is undefined', function () {
            expect($('#plain .filter-undefined').text()).toEqual('');
        });

        it('should display nothing if computed value is undefined', function () {
            expect($('#plain .filter-computed-undefined').text()).toEqual('');
        });

        it('should display nothing if function returned value is undefined', function () {
            expect($('#plain .filter-fn-undefined').text()).toEqual('');
        });

        describe('as unescaped', function () {
            it('should display nothing if value is undefined', function () {
                expect($('#plain .filter-html-undefined').text()).toEqual('');
            });

            it('should display nothing if computed value is undefined', function () {
                expect($('#plain .filter-html-computed-undefined').text()).toEqual('');
            });

            it('should display nothing if function returned value is undefined', function () {
                expect($('#plain .filter-html-fn-undefined').text()).toEqual('');
            });
        });
    });
});

// v-text - begin
describe('v-text', function () {
    it('should display text inside element', function () {
        expect($('#v-text .text').text()).toEqual('Value from v-text data');
    });

    it('should display text inside element when v-text param is a method', function () {
        expect($('#v-text .function').text()).toEqual('Value from v-text data');
    });

    it('should be able to use a filter', function () {
        expect($('#v-text .text-filter').text()).toEqual('VALUE FROM V-TEXT DATA');
    });

    it('should be able to use multiple filters', function () {
        expect($('#v-text .text-filter-multiple').text()).toEqual('value from v-text data');
    });

    it('should be able to use a filter with arguments', function () {
        expect($('#v-text .text-filter-arguments').text()).toEqual('Value from v-text data and 4');
    });

    it('should display nothing if value is undefined', function () {
        expect($('#v-text .undefined').text()).toEqual('');
    });
});

// partials - begin
describe('partials', function () {

    it('should include partial', function () {
        expect($('#partials .simple .partial-wrap').length).not.toBe(0);
    });

    it('should display context\'s data', function () {
        expect($('#partials .simple .value').text()).toEqual('Should result some value');
    });

    it('should display nothing if value is undefined', function () {
        expect($('#partials .undefined').text()).toEqual('');
    });

    it('should include by a dynamic name', function () {
        expect($('#partials .dynamic .value').text()).toEqual('Should result some value');
    });

    it('should display nothing if data value is undefined', function () {
        expect($('#partials .dynamic-undefined').text()).toEqual('');
    });

    it('should display nothing if data value is empty', function () {
        expect($('#partials .dynamic-empty').text()).toEqual('');
    });

});

// v-model - begin
describe('v-model', function () {

    it('should set input\'s value', function () {
        expect($('#v-model .input').val()).toEqual('some value there');
    });

    it('should leave empty input\'s value if null/undefined', function () {
        expect($('#v-model .input-none').val()).toEqual('');
    });

    // it("should pick up value from 'value' attribute if it's present", function() {
    //     expect( $('#v-model .pick-up-value').val() ).toEqual( 'value from attribute' );
    // });

    it('should set checkbox\'s checked', function () {
        expect($('#v-model .checkbox').is(':checked')).toEqual(true);
    });

    it('should set radio\'s checked', function () {
        expect($('#v-model .radio-form').serializeArray()[0].value).toEqual('two');
    });

    it('should set textarea\'s value', function () {
        expect($('#v-model .textarea').val()).toEqual('New text came from data');
    });

    describe('in <select> with static <option>s', function () {
        it('should set select\'s value', function () {
            expect($('#v-model .select').val()).toEqual('2');
        });

        it('should set select-multiple\'s value', function () {
            expect($('#v-model .select-multi').val()).toEqual(['2', '3']);
        });
    });

    describe('in <select> with dynamic <option>s (via \'options\' attribute)', function () {
        it('should remove static options', function () {
            expect($('#v-model .select-dyn option').eq(0).attr('value')).not.toBe('999');
        });

        it('should render options and set select\'s value', function () {
            expect($('#v-model .select-dyn').val()).toEqual('2');
        });

        it('should render options and set select-multiple\'s value', function () {
            expect($('#v-model .select-dyn-multi').val()).toEqual(['2', '3']);
        });

        describe('with undefined v-model data value', function () {
            it('should render options', function () {
                expect($('#v-model .select-dyn-empty-v-model option').length).not.toBe(0);
            });
        });
    });

    describe('in v-for with dynamic input[radio] value', function () {
        it('should properly set checked', function () {
            expect($('#v-model .radio-in-repeat-dyn input').is(':checked')).toEqual(true);
        });
    });

    describe('with v-filter', function () {

        it('in direct declaration form should properly modify input\'s value', function () {
            expect($('#v-model-v-filter .plain-input').val())
                .not.toBe($('#v-model-v-filter .plain-value').text());

            expect($('#v-model-v-filter .plain-input').val()).toEqual('20');
        });

        it('if it\'s \'read\' filter should properly modify input\'s value', function () {
            expect($('#v-model-v-filter .read-input').val())
                .not.toBe($('#v-model-v-filter .read-value').text());

            expect($('#v-model-v-filter .read-input').val()).toEqual('20');
        });

        it('if it\'s \'write\' filter input\'s value should not differ from data value', function () {
            expect($('#v-model-v-filter .write-input').val()).toEqual($('#v-model-v-filter .write-value').text());
        });

        it('if filter is void input\'s value should not differ from data value', function () {
            expect($('#v-model-v-filter .void-input').val()).toEqual($('#v-model-v-filter .void-value').text());
        });

        it('should be able to use multiple filters', function () {
            expect($('#v-model-v-filter .multiple').val()).toEqual('some kind of text');
        });

        it('should be able to use filter arguments', function () {
            expect($('#v-model-v-filter .arguments').val()).toEqual('3 and 4');
        });

    });

});

// v-pre - begin
describe('v-pre', function () {
    it('should disable rendering mustaches', function () {
        expect($('#v-pre .one').text()).not.toBe('Some value');
    });

    it('should disable rendering directives', function () {
        expect($('#v-pre .repeat').length).toEqual(1);
    });
});
