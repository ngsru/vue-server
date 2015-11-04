// Cases like v-component="{{filter[value].omg}}" with dynamically changed values and components in compiledBe at wait-for

// var wrapComponent = require('./wrapComponent.js');
// var $;
// var contentComponent = {

//     template: {path: __dirname + '/replace.spec.html'},
//     data: function() {
//         return {
//             arr: [1,2,3],
//             childValue: 'content',
//             parto: 'compParted',
//             name: 'comp'
//         };
//     },

//     components: {
//         comp: {
//             props: ['value'],
//             template: '<i>{{$value}}{{value}}</i>'
//         },

//         compParted: {
//             props: ['value'],
//             template: '<i>{{value}}</i><b>{{value}}</b>'
//         }
//     },

//     compiledBe: function() {
//         this.parto = 'comp';
//         this.$emit('loaded');
//     }
// };

// beforeAll(function(done) {
//     wrapComponent(contentComponent, function(response) {
//         $ = response;
//         done();
//     });
// });

// describe('while using replace: true', function() {
//     it('v-repeat should not render its element while repeating component', function() {
//         expect( $('#one').html() ).toEqual('<i>1</i><i>2</i><i>3</i>');
//     });
// });
