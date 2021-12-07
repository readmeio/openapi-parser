const OpenAPIParser = require('../../..');
const path = require('../../utils/path');

describe("Invalid APIs (can't be parsed)", () => {
  it('not a Swagger API', () => {
    return expect(OpenAPIParser.parse(path.rel('specs/invalid/not-swagger.yaml'))).rejects.toThrow(
      'not-swagger.yaml is not a valid OpenAPI definition'
    );
  });

  it('not a valid OpenAPI 3.1 definition', () => {
    return expect(OpenAPIParser.parse(path.rel('specs/invalid/no-paths-or-webhooks.yaml'))).rejects.toThrow(
      'no-paths-or-webhooks.yaml is not a valid OpenAPI definition'
    );
  });

  it('invalid Swagger version (1.2)', () => {
    return expect(OpenAPIParser.dereference(path.rel('specs/invalid/old-version.yaml'))).rejects.toThrow(
      'Unrecognized Swagger version: 1.2. Expected 2.0'
    );
  });

  it('invalid Swagger version (3.0)', () => {
    return expect(OpenAPIParser.bundle(path.rel('specs/invalid/newer-version.yaml'))).rejects.toThrow(
      'Unrecognized Swagger version: 3.0. Expected 2.0'
    );
  });

  it('numeric Swagger version (instead of a string)', () => {
    return expect(OpenAPIParser.validate(path.rel('specs/invalid/numeric-version.yaml'))).rejects.toThrow(
      'Swagger version number must be a string (e.g. "2.0") not a number.'
    );
  });

  it('numeric API version (instead of a string)', () => {
    return expect(OpenAPIParser.validate(path.rel('specs/invalid/numeric-info-version.yaml'))).rejects.toThrow(
      'API version number must be a string (e.g. "1.0.0") not a number.'
    );
  });
});
