var Jasmine = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

var jrunner = new Jasmine();
jrunner.env.clearReporters();           // remove default reporter logs
jrunner.addReporter(new SpecReporter({  // add jasmine-spec-reporter
  spec: {
    displayPending: true
  }
}));
jrunner.loadConfigFile();               // load jasmine.json configuration
jrunner.execute();
