"use strict";

const { expect } = require("chai");
const SwaggerParser = require("../../..");
const helper = require("../../utils/helper");
const path = require("../../utils/path");
const { host } = require("@jsdevtools/host-environment");

describe("`validate.colorizeErrors` option", () => {
  it("should not colorize errors by default", async () => {
    let parser = new SwaggerParser();

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
    // @fixme Temporarily skipping this because `chalk` usage of `supports-color` is getting unset to level 0 in CI.
    if (!host.ci) {
      this.skip();
    }

    let parser = new SwaggerParser();

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
