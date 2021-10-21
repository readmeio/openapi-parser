"use strict";

const { expect } = require("chai");
const { host } = require("@jsdevtools/host-environment");
const OpenAPIParser = require("../../..");
const helper = require("../../utils/helper");
const path = require("../../utils/path");

describe("`validate.colorizeErrors` option", () => {
  it("should not colorize errors by default", async () => {
    let parser = new OpenAPIParser();

    try {
      await parser.validate(path.rel("specs/colorize-errors-option/invalid.json"));
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(SyntaxError);
      expect(err.message).to.match(/> 19 |             "type": "array",/);
    }
  });

  it("should colorize errors when set", async function () {
    // Colors aren't supported in the browser so we can skip this test.
    if (!host.browser) {
      this.skip();
      return;
    }

    let parser = new OpenAPIParser();

    try {
      await parser.validate(path.rel("specs/colorize-errors-option/invalid.json"), {
        validate: {
          colorizeErrors: true,
        },
      });

      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(SyntaxError);
      expect(err.message).to.contain("\u001b");
    }
  });
});
