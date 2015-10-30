var wrapComponent = require('./wrapComponent.js');
var $;
var contentComponent = {

    template: [
        '<div>',
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
            valueMultiple2: ['mazda', 333]
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
    describe('with <select> and v-for\'ed <option> items', function() {
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
});