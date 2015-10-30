var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div id="select">',
            '<select v-model="value">',
                '<option v-for="option in options" :value="option.value">{{option.label}}</option>',
            '</select>',
        '</div>',
        '<div id="select-multiple">',
            '<select v-model="valueMultiple" multiple>',
                '<option v-for="option in options" :value="option.value">{{option.label}}</option>',
            '</select>',
        '</div>',
        '<div id="select-multiple-complex">',
            '<select v-model="valueMultiple2" multiple>',
                '<option value="mazda">Mazda</option>',
                '<option v-for="option in options" :value="option.value">{{option.label}}</option>',
            '</select>',
        '</div>',


        '<div id="checkbox">',
            '<input type="checkbox" v-model="checkbox" />',
        '</div>',
        '<div id="checkbox-multiple">',
            '<input type="checkbox" value="Jack" v-model="checkboxMultiple" />',
            '<input type="checkbox" value="Daniels" v-model="checkboxMultiple" />',
        '</div>'
    ].join(''),
    data: function() {
        return {
            options: [
                {value: 'one', label: '1111'},
                {value: 222, label: '2222'},
                {value: '333', label: '3333'}
            ],

            valueSingle: '222',
            valueMultiple: ['one', 333],
            valueMultiple2: ['mazda', 333],


            checkbox: true,
            checkboxMultiple: ['Daniels']
        };
    }
};


beforeAll(function(done) {
    wrapComponent(contentComponent, function(response) {
        $ = response;
        done();
    }, {replace: true});
});


describe('v-model', function() {
    describe('on <select> and v-for\'ed <option> items', function() {
        it('should set single value', function() {
            expect( $('#select option').eq(1).attr('selected') ).toEqual('selected');
        });

        it('should set multiple value', function() {
            var isSelected = [];
            $('#select-multiple option').each(function() {
                isSelected.push(Boolean($(this).attr('selected')));
            });
            expect( isSelected.join(',') ).toEqual('true,false,true');
        });

        it('and a static <option> should set multiple value', function() {
            var isSelected = [];
            $('#select-multiple-complex option').each(function() {
                isSelected.push(Boolean($(this).attr('selected')));
            });
            expect( isSelected.join(',') ).toEqual('true,false,false,true');
        });
    });

    describe('on <input type="checkbox" />', function() {
        it('should set "checked" if value is Boolean "true"', function() {
            expect( $('#checkbox input').attr('checked') ).toEqual('checked');
        });

        it('should set "checked" properly if value is an Array', function() {
            var isSelected = [];
            $('#checkbox-multiple input').each(function() {
                isSelected.push(Boolean($(this).attr('checked')));
            });
            expect( isSelected.join(',') ).toEqual('false,true');
        });
    });
});