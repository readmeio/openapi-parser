const { assert, expect } = require('chai');
const OpenAPIParser = require('../../..');
const path = require('../../utils/path');

describe.only('Better errors', () => {
  const tests = [
    {
      name: '[OpenAPI 3.0] invalid `x-` extension at the root level',
      file: '3.0/invalid-x-extension-root.yaml',
      error: 'invalid-x-extension is not expected to be here!',
    },
    {
      name: '[OpenAPI 3.1] invalid `x-` extension at the root level',
      file: '3.1/invalid-x-extension-root.yaml',
      error: 'invalid-x-extension is not expected to be here!',
    },
    {
      name: '[OpenAPI 3.0] invalid `x-` extension at a path level',
      file: '3.0/invalid-x-extension-path.yaml',
      error: 'invalid-x-extension is not expected to be here!',
    },
    {
      name: '[OpenAPI 3.1] invalid `x-` extension at a path level',
      file: '3.1/invalid-x-extension-path.yaml',
      error: 'invalid-x-extension is not expected to be here!',
    },

    // @todo add a test for a component that's missing
  ];

  it('should pass validation if "options.validate.schema" is false', async () => {
    const invalid = tests[0];
    const api = await OpenAPIParser.validate(path.rel(`specs/better-errors/${invalid.file}`), {
      validate: { schema: false },
    });

    expect(api).to.be.an('object');
  });

  for (const test of tests) {
    it(test.name, async () => {
      try {
        await OpenAPIParser.validate(path.rel(`specs/better-errors/${test.file}`));
        assert.fail('Validation should have failed, but it succeeded!');
      } catch (err) {
        // console.log(err.message);
        expect(err).to.be.an.instanceOf(SyntaxError);
        expect(err.message).to.match(new RegExp(test.error));
      }
    });
  }
});
