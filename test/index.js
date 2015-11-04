var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfigFile('test/jasmine.json');

jasmine.execute();
