const { expect } = require('chai');
const OpenAPIParser = require('../../..');
const path = require('../../utils/path');

function assertInvalid(file, error) {
  return OpenAPIParser.validate(path.rel(`specs/better-errors/${file}`))
    .then(() => {
      throw new Error('Validation should have failed, but it succeeded!');
    })
    .catch(err => {
      // console.log(err.message);
      expect(err).to.be.an.instanceOf(SyntaxError);
      expect(err.message).to.match(new RegExp(error));
    });
}

describe('Better errors', () => {
  it('should pass validation if "options.validate.schema" is false', async () => {
    const api = await OpenAPIParser.validate(path.rel(`specs/better-errors/3.0/invalid-x-extension-root.yaml`), {
      validate: { schema: false },
    });

    expect(api).to.be.an('object');
  });

  describe('invalid `x-` extension at the root level', () => {
    it('OpenAPI 3.0', () =>
      assertInvalid('3.0/invalid-x-extension-root.yaml', 'invalid-x-extension is not expected to be here!'));

    it('OpenAPI 3.1', () =>
      assertInvalid('3.1/invalid-x-extension-root.yaml', 'invalid-x-extension is not expected to be here!'));
  });

  describe('invalid `x-` extension at a path level', () => {
    it('OpenAPI 3.0', () =>
      assertInvalid('3.0/invalid-x-extension-path.yaml', 'invalid-x-extension is not expected to be here!'));

    it('OpenAPI 3.1', () =>
      assertInvalid('3.1/invalid-x-extension-path.yaml', 'invalid-x-extension is not expected to be here!'));
  });

  // Due to the JSON Schema changes in OpenAPI 3.1 this case is currently only applicable with Swagger 2.0 and
  // OpenAPI 3.0.
  describe('misplaced `additionalProperty`', () => {
    it('Swagger 2.0', () =>
      assertInvalid('2.0/misplaced-additionalProperty.yaml', 'originalRef is not expected to be here'));

    it('OpenAPI 3.0', () =>
      assertInvalid('3.0/misplaced-additionalProperty.yaml', 'originalRef is not expected to be here'));
  });

  describe('missing component', () => {
    it.skip('OpenAPI 3.0');
    it.skip('OpenAPI 3.1');
  });
});
