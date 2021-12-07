/* eslint-disable jest/no-conditional-expect */
const OpenAPIParser = require('../../..');
const path = require('../../utils/path');

describe('Invalid APIs (Swagger 2.0 schema validation)', () => {
  const tests = [
    {
      name: 'invalid response code',
      valid: false,
      file: 'invalid-response-code.yaml',
    },
    {
      name: 'optional path param',
      valid: false,
      file: 'optional-path-param.yaml',
    },
    {
      name: 'non-required path param',
      valid: false,
      file: 'non-required-path-param.yaml',
    },
    {
      name: 'invalid schema type',
      valid: false,
      file: 'invalid-schema-type.yaml',
    },
    {
      name: 'invalid param type',
      valid: false,
      file: 'invalid-param-type.yaml',
    },
    {
      name: 'non-primitive param type',
      valid: false,
      file: 'non-primitive-param-type.yaml',
    },
    {
      name: 'invalid parameter location',
      valid: false,
      file: 'invalid-param-location.yaml',
    },
    {
      name: '"file" type used for non-formData param',
      valid: false,
      file: 'file-header-param.yaml',
    },
    {
      name: '"file" type used for body param',
      valid: false,
      file: 'file-body-param.yaml',
      error:
        'Validation failed. /paths/users/{username}/profile/image/post/parameters/image has an invalid type (file)',
    },
    {
      name: '"multi" header param',
      valid: false,
      file: 'multi-header-param.yaml',
    },
    {
      name: '"multi" path param',
      valid: false,
      file: 'multi-path-param.yaml',
    },
    {
      name: 'invalid response header type',
      valid: false,
      file: 'invalid-response-header-type.yaml',
    },
    {
      name: 'non-primitive response header type',
      valid: false,
      file: 'non-primitive-response-header-type.yaml',
    },
    {
      name: 'invalid response schema type',
      valid: false,
      file: 'invalid-response-type.yaml',
    },
    {
      name: 'unknown JSON Schema format',
      valid: true,
      file: 'unknown-format.yaml',
    },
    {
      name: '$ref to invalid Path object',
      valid: false,
      file: 'ref-to-invalid-path.yaml',
    },
    {
      name: 'Schema with "allOf"',
      valid: true,
      file: 'allof.yaml',
    },
    {
      name: 'Schema with "anyOf"',
      valid: false,
      file: 'anyof.yaml',
    },
    {
      name: 'Schema with "oneOf"',
      valid: false,
      file: 'oneof.yaml',
    },
    {
      name: 'invalid security sceheme for OpenAPI 3.0',
      valid: false,
      file: 'invalid-security-scheme.yaml',
      openapi: true,
    },
  ];

  it('should pass validation if "options.validate.schema" is false', async () => {
    const invalid = tests[0];
    expect(invalid.valid).toBe(false);

    const api = await OpenAPIParser.validate(path.rel(`specs/validate-schema/invalid/${invalid.file}`), {
      validate: { schema: false },
    });
    expect(typeof api).toBe('object');
  });

  for (const test of tests) {
    if (test.valid) {
      it(`${test.name}`, async () => {
        try {
          const api = await OpenAPIParser.validate(path.rel(`specs/validate-schema/valid/${test.file}`));
          expect(typeof api).toBe('object');
        } catch (err) {
          throw new Error(`Validation should have succeeded, but it failed!\n${err.stack}`);
        }
      });
    } else {
      it(`${test.name}`, async () => {
        try {
          await OpenAPIParser.validate(path.rel(`specs/validate-schema/invalid/${test.file}`));
          throw new Error('Validation should have failed, but it succeeded!');
        } catch (err) {
          expect(err).toBeInstanceOf(SyntaxError);
          if (test.openapi) {
            // eslint-disable-next-line unicorn/no-unsafe-regex
            expect(err.message).toMatch(/^OpenAPI schema validation failed.\n(.*)+/);
          } else {
            // eslint-disable-next-line unicorn/no-unsafe-regex
            expect(err.message).toMatch(/^Swagger schema validation failed.\n(.*)+/);
          }

          expect(err.details.length).toBeGreaterThan(0);

          // Make sure the Ajv error details object is valid
          const details = err.details[0];
          expect(details.instancePath).toMatch(/[a-zA-Z/~01]+/); // /paths/~1users/get/responses
          expect(details.schemaPath).toMatch(/^#\/[a-zA-Z\\/]+/); // #/properties/parameters/items/oneOf
          expect(details.keyword).toMatch(/\w+/); // oneOf
          expect(typeof details.params).toBe('object'); // { passingSchemas: null }
          expect(typeof details.message).toBe('string'); // must match exactly one schema in oneOf
        }
      });
    }
  }
});
