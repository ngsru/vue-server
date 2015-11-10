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
        expect($('#plain .html-stripped').text()).toEqual('<span>WATWG<sup>2</sup></span>');
    });

    it('should be able to escape and not to escape html in one row', function () {
        expect($('#plain .html-mixed').text()).toEqual('WATWG2 <span>WATWG<sup>2</sup></span>');
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

    // Collisions with v-component, v-repeat, v-partial... ?
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

// v-component - begin
describe('v-component', function () {

    it('should include', function () {
        var text = $('#v-component .simple').text();
        expect(text).not.toBe('Empty holder');
        expect(text).not.toBe('');
    });

    it('should include by a dynamic name', function () {
        var text = $('#v-component .dynamic').text();
        expect(text).not.toBe('Empty holder');
        expect(text).not.toBe('');
    });

    it('should display nothing if component is undefined', function () {
        expect($('#v-component .undefined').text()).toEqual('');
    });

    it('should display nothing if data value is undefined', function () {
        expect($('#v-component .dynamic-undefined').text()).toEqual('');
    });

    it('should display nothing if data value is empty', function () {
        expect($('#v-component .dynamic-empty').text()).toEqual('');
    });

    it('should be able use its own filters', function () {
        expect($('#v-component .syntetic .nested-filter').text()).toEqual('ok!?!?!?!');
    });

    describe('with no template', function () {
        it('should use default html and display values', function () {
            expect($('#v-component .no-template .value').text()).toEqual('This is no-template value');
        });
    });

    describe('inside another v-component', function () {
        it('should inherit components', function () {
            expect($('#v-component .inherit .compon1').length).toEqual(1);
        });

        it('should inherit partials', function () {
            expect($('#v-component .inherit .partial-wrap').length).toEqual(1);
        });

        it('should inherit filters', function () {
            expect($('#v-component .inherit .filter').text()).toEqual('Filter inheritance works');
        });

        describe('inside one more v-component', function () {
            it('should inherit components', function () {
                expect($('#v-component .inherit-wrap .compon1').length).toEqual(1);
            });

            it('should inherit partials', function () {
                expect($('#v-component .inherit-wrap .partial-wrap').length).toEqual(1);
            });

            it('should inherit filters', function () {
                expect($('#v-component .inherit-wrap .filter').text()).toEqual('Filter inheritance works');
            });
        });
    });

    describe('with \'inherit: false\' and v-with in key-value format', function () {

        it('should display own values', function () {
            expect($('#v-component .no-inherit-good-with .comp-own-value').text()).toEqual('Component\'s 2 own value');
        });

        it('should not display parent\'s values', function () {
            expect($('#v-component .no-inherit-good-with .comp-parent-value').text()).not.toBe('Parent Data present');
        });

        it('should display values included by v-with', function () {
            expect($('#v-component .no-inherit-good-with .comp-with-value').text())
                .toEqual('Data to be included by v-with');
        });

    });

    describe('with \'inherit: false\' and v-with in plain format', function () {

        it('should not display own values', function () {
            expect($('#v-component .no-inherit-bad-with .comp-own-value').text()).not.toBe('Component\'s 2 own value');
        });

        it('should not display parent\'s values', function () {
            expect($('#v-component .no-inherit-bad-with .comp-parent-value').text()).not.toBe('Parent Data present');
        });

        it('should display values included by v-with', function () {
            expect($('#v-component .no-inherit-bad-with .comp-with-value').text())
                .toEqual('It\'s data from plain with');
        });

    });

    describe('with \'inherit: true\' and v-with in key-value format', function () {

        it('should display own values', function () {
            expect($('#v-component .inherit-good-with .comp-own-value').text()).toEqual('Component\'s 3 own value');
        });

        // it("should display parent's values", function() {
        //     expect( $('#v-component .inherit-good-with .comp-parent-value').text() ).toEqual( 'Parent Data present' );
        // });

        it('should display values included by v-with', function () {
            expect($('#v-component .inherit-good-with .comp-with-value').text())
                .toEqual('Data to be included by v-with');
        });

    });

    describe('with \'inherit: true\' and v-with in plain format', function () {

        it('should not display own values', function () {
            expect($('#v-component .inherit-bad-with .comp-own-value').text()).not.toBe('Component\'s 2 own value');
        });

        // it("should display parent's values", function() {
        //     expect( $('#v-component .inherit-bad-with .comp-parent-value').text() ).toEqual( 'Parent Data present' );
        // });

        it('should display values included by v-with', function () {
            expect($('#v-component .inherit-bad-with .comp-with-value').text()).toEqual('It\'s data from plain with');
        });

    });

});

// v-repeat - begin
describe('v-repeat', function () {

    it('should be able to render arrays', function () {
        expect($('#v-repeat .simple-array').find('li').length).toEqual(3);
    });

    it('should not display any items if value in undefined', function () {
        expect($('#v-repeat .undefined').find('li').length).toEqual(0);
    });

    it('should not display any items if array in empty', function () {
        expect($('#v-repeat .hollow').find('li').length).toEqual(0);
    });

    it('should be able to use a filter', function () {
        expect($('#v-repeat .array-filter-by').find('li').length).toEqual(2);
        expect($('#v-repeat .array-filter-by').find('li').eq(1).find('.age').text()).toEqual('32');
    });

    it('should be able to use multiple filters', function () {
        expect($('#v-repeat .array-filter-by-multiple').find('li').length).toEqual(1);
        expect($('#v-repeat .array-filter-by-multiple').find('li').eq(0).find('.age').text()).toEqual('25');
    });

    it('should be able to render objects', function () {
        expect($('#v-repeat .object').find('li').length).toEqual(3);
    });

    it('should be able to display array items\' values', function () {
        var $items = $('#v-repeat .simple-array').find('li .value');
        expect($items.eq(2).text()).toEqual('simple array value 3');
    });

    it('array items\' should not inherit prev item\'s values', function () {
        var $items = $('#v-repeat .simple-array').find('li .dont-inherit');
        expect($items.eq(0).text()).toEqual('me');
        expect($items.eq(1).text()).toEqual('');
    });

    it('in array items\' parent\'s values should be available', function () {
        var $items = $('#v-repeat .simple-array').find('li .parent-value');
        expect($items.eq(2).text()).toEqual('i\'m parent\'s value');
    });

    it('should be able to use separated datas (parent & repeat-item) in methods', function () {
        expect($('#v-repeat .syntetic .active').length).toEqual(2);
    });

    it('should be able to use component\'s filters inside component\'s v-repeat', function () {
        expect($('#v-repeat .syntetic .in-repeat-nested-filter').eq(1).text()).toEqual('ok!?!?!?!');
    });

    it('should be able to use component\'s filters inside v-repeat', function () {
        expect($('#v-repeat .filter-repeated .evil-filter').eq(1).text()).toEqual('evil boy boy evil');
    });

    describe('with v-component', function () {
        it('should be able to render component\'s items', function () {
            expect($('#v-repeat .repeat-component').find('li').length).toEqual(3);
        });

        it('should not leave default content inside', function () {
            expect($('#v-repeat .repeat-component').find('.should-not-be-there').length).toEqual(0);
        });

        it('should display data from repeating items', function () {
            var $items = $('#v-repeat .repeat-component').find('li .comp-repeat-value');
            expect($items.eq(2).text()).toEqual('simple array value 3');
        });

        it('should display component\'s data values', function () {
            var $items = $('#v-repeat .repeat-component').find('li .comp-own-value');
            expect($items.eq(2).text()).toEqual('Component\'s 1 own value');
        });

        it('should display parent component\'s data values', function () {
            var $items = $('#v-repeat .repeat-component').find('li .comp-parent-value');
            expect($items.eq(2).text()).not.toBe('i\'m parent\'s value');
        });

        describe('with items namespace', function () {
            it('should display values with namespace', function () {
                expect($('#v-repeat .compound-nesting .nested').text()).toEqual('value from v-repeat');
            });

            it('should display component\'s values', function () {
                expect($('#v-repeat .compound-nesting .own').text()).toEqual('Component\'s own value');
            });
        });

        describe('with \'inherit: true\'', function () {
            it('should display parent component\'s data values', function () {
                var $items = $('#v-repeat .repeat-component-inherit').find('li .comp-parent-value');
                expect($items.eq(2).text()).toEqual('i\'m parent\'s value');
            });
        });

        describe('with v-with in key-value type (v-with=\'withedValue: vRepeat.forWith\')', function () {

            it('should display data from repeating items', function () {
                var $items = $('#v-repeat .repeat-component-with').find('li .comp-repeat-value');
                expect($items.eq(2).text()).toEqual('simple array value 3');
            });

            it('should display component\'s data values', function () {
                var $items = $('#v-repeat .repeat-component-with').find('li .comp-own-value');
                expect($items.eq(2).text()).toEqual('Component\'s 1 own value');
            });

            it('should display parent component\'s data values', function () {
                var $items = $('#v-repeat .repeat-component-with').find('li .comp-parent-value');
                expect($items.eq(2).text()).not.toBe('i\'m parent\'s value');
            });

            it('should display inherited with v-with data', function () {
                var $items = $('#v-repeat .repeat-component-with').find('li .comp-with-value');
                expect($items.eq(2).text()).toEqual('This value should be inherited with v-with');
            });

            describe('with \'inherit: true\'', function () {
                it('should display parent component\'s data values', function () {
                    var $items = $('#v-repeat .repeat-component-with-inherit').find('li .comp-parent-value');
                    expect($items.eq(2).text()).toEqual('i\'m parent\'s value');
                });
            });

        });

        describe('with v-with in plain type (v-with=\'withedValue\')', function () {

            // it("should display data from repeating items", function() {
            //     var $items = $('#v-repeat .repeat-component-with2').find('li .comp-repeat-value');
            //     expect( $items.eq(2).text() ).toEqual( 'simple array value 3' );
            // });

            it('should not display component\'s data values', function () {
                var $items = $('#v-repeat .repeat-component-with2').find('li .comp-own-value');
                expect($items.eq(2).text()).not.toBe('Component\'s 1 own value');
            });
            it('should display parent component\'s data values', function () {
                var $items = $('#v-repeat .repeat-component-with2').find('li .comp-parent-value');
                expect($items.eq(2).text()).not.toBe('i\'m parent\'s value');
            });

            it('should display inherited with v-with data', function () {
                var $items = $('#v-repeat .repeat-component-with2').find('li .comp-own-value');
                expect($items.eq(2).text()).toEqual('Data there should be, omn.');
            });

        });

    });

    describe('with setting namespace for children', function () {

        it('should render items', function () {
            expect($('#v-repeat .name-seting').length).toEqual(3);
        });

        it('should properly display items\' values', function () {
            expect($('#v-repeat .name-seting').eq(1).find('.item-value').text()).toEqual('simple array value 2');
        });

        describe('in 2nd level repeat without setting namespace', function () {
            it('should render items', function () {
                expect($('#v-repeat .name-seting').eq(2).find('.item-array .item-array-unit').length).toEqual(2);
            });

            it('should properly display items\' values', function () {
                expect($('#v-repeat .name-seting').eq(1).find('.item-array .item-array-unit').eq(1).text())
                    .toEqual('222222');
            });
        });

        describe('in 2nd level repeat with setting namespace', function () {
            it('should render items', function () {
                expect($('#v-repeat .name-seting').eq(2).find('.item-array-nesting .item-array-nesting-unit').length)
                    .toEqual(2);
            });

            it('should properly display items\' values', function () {
                expect($('#v-repeat .name-seting').eq(1).find('.item-array-nesting .item-array-nesting-unit')
                    .eq(1).text()).toEqual('222222');
            });
        });
    });


    it('should ignore v-if', function () {
        expect($('#v-repeat .with-v-if').length).toEqual(3);
    });

    it('should ignore v-if with v-component', function () {
        expect($('#v-repeat .with-v-if-comoonent').length).toEqual(3);
    });


    it('should use items\'s scope for v-show', function () {
        var report = [];
        $('#v-repeat .with-v-show').each(function() {
            report.push($(this).attr('style'));
        });
        expect(report.join('')).toEqual('');
    });

    it('with v-component should use parent\'s scope for v-show', function () {
        var report = [];
        $('#v-repeat .with-v-show-component').each(function() {
            report.push($(this).attr('style'));
        });
        expect(report.join('')).toEqual('');
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

    describe('in v-repeat with dynamic input[radio] value', function () {
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

// v-attr - begin
describe('v-attr', function () {
    it('should set attributes', function () {
        var $img = $('#v-attr .simple');
        expect($img.attr('width')).toEqual('100');
        expect($img.attr('height')).toEqual('60');
    });

    it('should set attributes when a param provided by a method', function () {
        var $img = $('#v-attr .method');
        expect($img.attr('width')).toEqual('100');
        expect($img.attr('height')).toEqual('60');
    });

    it('should replace v-model value', function () {
        expect($('#v-attr .with-v-model').val()).toEqual('Value from v-attr');
    });
});

// v-show - begin
describe('v-show', function () {
    it('should be able to set display: none', function () {
        expect($('#v-show .hide').css('display')).toEqual('none');
    });

    it('should be able to set display: none when value provided by a method', function () {
        expect($('#v-show .hide-by-method').css('display')).toEqual('none');
    });

    it('should remove display: none if it were set', function () {
        expect($('#v-show .show-hidden').css('display')).not.toBe('none');
    });

    it('should remove display: none if it were set when value provided by a method', function () {
        expect($('#v-show .show-hidden-by-method').css('display')).not.toBe('none');
    });

    it('should hide element even if other display value were set', function () {
        expect($('#v-show .hide-shown').css('display')).toEqual('none');
    });

    // 1!! There should be more complex behaviour
    it('should replace v-attr\'s style value', function () {
        expect($('#v-show .replace-v-attr').css('display')).not.toBe('none');
    });

});

// v-style - begin
describe('v-style', function () {
    it('should set styles', function () {
        var $el = $('#v-style .simple');
        expect($el.css('display')).toEqual('inline-block');
        expect($el.css('position')).toEqual('relative');
    });

    it('should set styles when a param provided by a method', function () {
        var $el = $('#v-style .method');
        expect($el.css('display')).toEqual('inline-block');
        expect($el.css('position')).toEqual('relative');
    });

    it('should replace styles from v-attr', function () {
        expect($('#v-style .replace-v-attr').css('display')).toEqual('inline-block');
    });

    it('should handle style object', function () {
        expect($('#v-style .object').css('color')).toEqual('red');
    });
});

// v-class - begin
describe('v-class', function () {
    it('should set class', function () {
        var $el = $('#v-class-no-class');
        expect($el.hasClass('class1')).toEqual(true);
    });

    it('should not add unnecessary whitespace in begining of class attribute', function () {
        expect($('#v-class-no-class').attr('class')).not.toMatch(/^ /);
    });

    it('should set new classes keeping default class', function () {
        var $el = $('#v-class-simple');
        expect($el.hasClass('simple')).toEqual(true);
        expect($el.hasClass('class1')).toEqual(true);
        expect($el.hasClass('class2')).toEqual(true);
    });

    it('should set new classes when a class provided by a method', function () {
        var $el = $('#v-class-method');
        expect($el.hasClass('class1')).toEqual(true);
        expect($el.hasClass('class2')).toEqual(true);
    });

    describe('with class via v-attr', function () {
        it('should not keep default class', function () {
            var $el = $('#v-class-v-attr');
            expect($el.hasClass('simple')).not.toBe(true);
        });

        it('should set v-attr class', function () {
            var $el = $('#v-class-v-attr');
            expect($el.hasClass('v-attr-class')).toEqual(true);
        });

        it('should set v-class classes', function () {
            var $el = $('#v-class-v-attr');
            expect($el.hasClass('class1')).toEqual(true);
            expect($el.hasClass('class2')).toEqual(true);
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

// v-if - begin
describe('v-if', function () {
    it('should enable rendering element', function () {
        expect($('#v-if .show').length).toEqual(1);
    });

    it('should disable rendering element', function () {
        expect($('#v-if .hide').length).toEqual(0);
    });

    it('should enable rendering element when value provided by a method', function () {
        expect($('#v-if .show-method').length).toEqual(1);
    });

    it('should disable rendering element when value provided by a method', function () {
        expect($('#v-if .hide-method').length).toEqual(0);
    });
});

