const { expect } = require('chai');
const OpenAPIParser = require('../../..');
const path = require('../../utils/path');

describe('Invalid APIs (specification validation)', () => {
  const tests = [
    {
      name: '[swagger 2.0] invalid response code',
      valid: false,
      file: '2.0/invalid-response-code.yaml',
      error: 'Validation failed. /paths/users/get/responses/888 has an invalid response code (888)',
    },
    {
      name: '[swagger 2.0] duplicate header parameters',
      valid: false,
      file: '2.0/duplicate-header-params.yaml',
      error:
        'Validation failed. /paths/users/{username} has duplicate parameters \nValidation failed. Found multiple header parameters named "foo"',
    },
    {
      name: '[openapi 3.x] duplicate header parameters',
      valid: false,
      file: '3.x/duplicate-header-params.yaml',
      error:
        'Validation failed. /paths/users/{username} has duplicate parameters \nValidation failed. Found multiple header parameters named "foo"',
    },
    {
      name: '[swagger 2.0] duplicate operation parameters',
      valid: false,
      file: '2.0/duplicate-operation-params.yaml',
      error:
        'Validation failed. /paths/users/{username}/get has duplicate parameters \nValidation failed. Found multiple path parameters named "username"',
    },
    {
      name: '[openapi 3.x] duplicate operation parameters',
      valid: false,
      file: '3.x/duplicate-operation-params.yaml',
      error:
        'Validation failed. /paths/users/{username}/get has duplicate parameters \nValidation failed. Found multiple path parameters named "username"',
    },
    {
      name: '[swagger 2.0] multiple body parameters in path',
      valid: false,
      file: '2.0/multiple-path-body-params.yaml',
      error: 'Validation failed. /paths/users/{username}/get has 2 body parameters. Only one is allowed.',
    },
    {
      name: '[swagger 2.0] multiple body parameters in operation',
      valid: false,
      file: '2.0/multiple-operation-body-params.yaml',
      error: 'Validation failed. /paths/users/{username}/patch has 2 body parameters. Only one is allowed.',
    },
    {
      name: '[swagger 2.0] multiple body parameters in path & operation',
      valid: false,
      file: '2.0/multiple-body-params.yaml',
      error: 'Validation failed. /paths/users/{username}/post has 2 body parameters. Only one is allowed.',
    },
    {
      // Since OpenAPI uses `requestBody` instead of `in: body` this case isn't possible there.
      name: '[swagger 2.0] body and formData parameters',
      valid: false,
      file: '2.0/body-and-form-params.yaml',
      error:
        'Validation failed. /paths/users/{username}/post has body parameters and formData parameters. Only one or the other is allowed.',
    },
    {
      name: '[swagger 2.0] path param with no placeholder',
      valid: false,
      file: '2.0/path-param-no-placeholder.yaml',
      error:
        'Validation failed. /paths/users/{username}/post has a path parameter named "foo", but there is no corresponding {foo} in the path string',
    },
    {
      name: '[openapi 3.x] path param with no placeholder',
      valid: false,
      file: '3.x/path-param-no-placeholder.yaml',
      error:
        'Validation failed. /paths/users/{username}/post has a path parameter named "foo", but there is no corresponding {foo} in the path string',
    },
    {
      name: '[swagger 2.0] path placeholder with no param',
      valid: false,
      file: '2.0/path-placeholder-no-param.yaml',
      error: 'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {foo}',
    },
    {
      name: '[openapi 3.x] path placeholder with no param',
      valid: false,
      file: '3.x/path-placeholder-no-param.yaml',
      error: 'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {foo}',
    },
    {
      // Only an invalid case with Swagger 2.0 definitions.
      name: '[swagger 2.0] duplicate path placeholders',
      valid: false,
      file: '2.0/duplicate-path-placeholders.yaml',
      error:
        'Validation failed. /paths/users/{username}/profile/{username}/image/{img_id}/get has multiple path placeholders named {username}',
    },
    {
      name: '[swagger 2.0] no path parameters',
      valid: false,
      file: '2.0/no-path-params.yaml',
      error: 'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {username},{foo}',
    },
    {
      name: '[openapi 3.x] no path parameters',
      valid: false,
      file: '3.x/no-path-params.yaml',
      error: 'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {username},{foo}',
    },
    {
      name: '[swagger 2.0] array param without items',
      valid: false,
      file: '2.0/array-no-items.yaml',
      error: 'Validation failed. /paths/users/get/parameters/tags is an array, so it must include an "items" schema',
    },
    {
      name: '[openapi 3.x] array param without items',
      valid: false,
      file: '3.x/array-no-items.yaml',
      error: 'Validation failed. /paths/users/get/parameters/tags is an array, so it must include an "items" schema',
    },
    {
      name: '[swagger 2.0] array body param without items',
      valid: false,
      file: '2.0/array-body-no-items.yaml',
      error: 'Validation failed. /paths/users/post/parameters/people is an array, so it must include an "items" schema',
    },
    // { // @todo add a case for this
    //   name: '[openapi 3.x] array body param without items',
    //   valid: false,
    //   file: '3.x/array-body-no-items.yaml',
    //   error: 'Validation failed. /paths/users/post/parameters/people is an array, so it must include an "items" schema',
    // },
    {
      name: '[swagger 2.0] array response header without items',
      valid: false,
      file: '2.0/array-response-header-no-items.yaml',
      error:
        'Validation failed. /paths/users/get/responses/default/headers/Last-Modified is an array, so it must include an "items" schema',
    },
    {
      name: '[openapi 3.x] array response header without items',
      valid: false,
      file: '3.x/array-response-header-no-items.yaml',
      error:
        'Validation failed. /paths/users/get/responses/default/headers/Last-Modified is an array, so it must include an "items" schema',
    },
    {
      name: '[swagger 2.0] "file" param without "consumes"',
      valid: false,
      file: '2.0/file-no-consumes.yaml',
      error:
        'Validation failed. /paths/users/{username}/profile/image/post has a file parameter, so it must consume multipart/form-data or application/x-www-form-urlencoded',
    },
    {
      name: '[swagger 2.0] "file" param with invalid "consumes"',
      valid: false,
      file: '2.0/file-invalid-consumes.yaml',
      error:
        'Validation failed. /paths/users/{username}/profile/image/post has a file parameter, so it must consume multipart/form-data or application/x-www-form-urlencoded',
    },
    {
      name: '[swagger 2.0] "file" param with vendor specific form-data "consumes"',
      valid: true,
      file: '2.0/file-vendor-specific-consumes-formdata.yaml',
    },
    {
      name: '[swagger 2.0] "file" param with vendor specific urlencoded "consumes"',
      valid: true,
      file: '2.0/file-vendor-specific-consumes-urlencoded.yaml',
    },
    {
      name: '[swagger 2.0] required property in input does not exist',
      valid: false,
      file: '2.0/required-property-not-defined-input.yaml',
      error:
        "Validation failed. Property 'notExists' listed as required but does not exist in '/paths/pets/post/parameters/pet'",
    },
    // { // @todo add a case for requestBody having a required property that doesn't exist in its schema
    //   name: '[openapi 3.x] required property in input does not exist',
    //   valid: false,
    //   file: '3.x/required-property-not-defined-input.yaml',
    //   error:
    //     "Validation failed. Property 'notExists' listed as required but does not exist in '/paths/pets/post/parameters/pet'",
    // },
    {
      name: '[swagger 2.0] required property in definition does not exist',
      valid: false,
      file: '2.0/required-property-not-defined-definitions.yaml',
      error: "Validation failed. Property 'photoUrls' listed as required but does not exist in '/definitions/Pet'",
    },
    {
      name: '[openapi 3.x] required property in component does not exist',
      valid: false,
      file: '3.x/required-property-not-defined-components.yaml',
      error:
        "Validation failed. Property 'photoUrls' listed as required but does not exist in '/components/schemas/Pet'",
    },
    {
      name: '[swagger 2.0] schema declares required properties which are inherited (allOf)',
      valid: true,
      file: '2.0/inherited-required-properties.yaml',
    },
    // { // @todo add a case for this
    //   name: '[openapi 3.x] schema declares required properties which are inherited (allOf)',
    //   valid: true,
    //   file: '3.x/inherited-required-properties.yaml',
    // },
    {
      name: '[swagger 2.0] duplicate operation IDs',
      valid: false,
      file: '2.0/duplicate-operation-ids.yaml',
      error: "Validation failed. Duplicate operation id 'users'",
    },
    {
      name: '[openapi 3.x] duplicate operation IDs',
      valid: false,
      file: '3.x/duplicate-operation-ids.yaml',
      error: "Validation failed. Duplicate operation id 'users'",
    },
    {
      name: '[swagger 2.0] array response body without items',
      valid: false,
      file: '2.0/array-response-body-no-items.yaml',
      error:
        'Validation failed. /paths/users/get/responses/200/schema is an array, so it must include an "items" schema',
    },
    {
      name: '[openapi 3.x] array response body without items',
      valid: false,
      file: '3.x/array-response-body-no-items.yaml',
      error:
        'Validation failed. /paths/users/get/responses/200/content/application/json/schema is an array, so it must include an "items" schema',
    },
  ];

  it('should pass validation if "options.validate.spec" is false', async () => {
    const invalid = tests[0];
    expect(invalid.valid).to.equal(false);

    const api = await OpenAPIParser.validate(path.rel(`specs/validate-spec/invalid/${invalid.file}`), {
      validate: { spec: false },
    });
    expect(api).to.be.an('object');
  });

  for (const test of tests) {
    if (test.valid) {
      it(test.name, async () => {
        try {
          const api = await OpenAPIParser.validate(path.rel(`specs/validate-spec/valid/${test.file}`));
          expect(api).to.be.an('object');
        } catch (err) {
          throw new Error(`Validation should have succeeded, but it failed!\n${err.stack}`);
        }
      });
    } else {
      it(test.name, async () => {
        try {
          await OpenAPIParser.validate(path.rel(`specs/validate-spec/invalid/${test.file}`));
          throw new Error('Validation should have failed, but it succeeded!');
        } catch (err) {
          expect(err).to.be.an.instanceOf(SyntaxError);
          expect(err.message).to.equal(test.error);
          expect(err.message).to.match(/^Validation failed. \S+/);
        }
      });
    }
  }
});
