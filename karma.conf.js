// // Karma config
// // https://karma-runner.github.io/0.12/config/configuration-file.html
// // https://jstools.dev/karma-config/

// "use strict";

// const { karmaConfig } = require("@jsdevtools/karma-config");
// const { host } = require("@jsdevtools/host-environment");

// module.exports = karmaConfig({
//   sourceDir: "lib",
//   fixtures: "test/fixtures/**/*.js",
//   browsers: {
//     chrome: true,
//     firefox: true,
//     safari: host.os.mac,
//     edge: false,
//     ie: false,
//   },
//   config: {
//     exclude: [
//       // Exclude these tests because some of the APIs are HUGE and cause timeouts.
//       // We still test them in Node though.
//       "test/specs/real-world/*",
//     ]
//   },
// });

module.exports = function (config) {
  config.set({
    plugins: [
      // 'karma-webpack',
      'karma-jasmine',
    ],

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    // Here I'm including all of the the Jest tests which are all under the __tests__ directory.
    // You may need to tweak this patter to find your test files/
    files: [
      './karma-setup.js',
      // 'test/fixtures/**/*.js',
      '__tests__/specs/*.js',
      '__tests__/specs/**/*.js',
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // preprocessors: {
    //   // Use webpack to bundle our tests files
    //   'packages/*/__tests__/**/*.ts': ['webpack'],
    // },
  });
};
