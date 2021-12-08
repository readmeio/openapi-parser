const { expect } = require('chai');
const OpenAPIParser = require('../../..');
const path = require('../../utils/path');

function assertValid(file) {
  return OpenAPIParser.validate(path.rel(`specs/validate-spec/valid/${file}`)).then(api => {
    expect(api).to.be.an('object');
  });
}

function assertInvalid(file, error) {
  return OpenAPIParser.validate(path.rel(`specs/validate-spec/invalid/${file}`))
    .then(() => {
      throw new Error('Validation should have failed, but it succeeded!');
    })
    .catch(err => {
      expect(err).to.be.an.instanceOf(SyntaxError);
      expect(err.message).to.equal(error);
      expect(err.message).to.match(/^Validation failed. \S+/);
    });
}

describe('Invalid APIs (specification validation)', () => {
  it('should bypass validation if "options.validate.spec" is false', async () => {
    const api = await OpenAPIParser.validate(path.rel(`specs/validate-spec/invalid/2.0/invalid-response-code.yaml`), {
      validate: { spec: false },
    });
    expect(api).to.be.an('object');
  });

  describe('swagger 2.0-specific cases', () => {
    it('should catch invalid response codes', () => {
      return assertInvalid(
        '2.0/invalid-response-code.yaml',
        'Validation failed. /paths/users/get/responses/888 has an invalid response code (888)'
      );
    });

    it('should catch multiple body parameters in path', () => {
      return assertInvalid(
        '2.0/multiple-path-body-params.yaml',
        'Validation failed. /paths/users/{username}/get has 2 body parameters. Only one is allowed.'
      );
    });

    it('should catch multiple body parameters in operation', () => {
      return assertInvalid(
        '2.0/multiple-operation-body-params.yaml',
        'Validation failed. /paths/users/{username}/patch has 2 body parameters. Only one is allowed.'
      );
    });

    it('should catch multiple body parameters in path & operation', () => {
      return assertInvalid(
        '2.0/multiple-body-params.yaml',
        'Validation failed. /paths/users/{username}/post has 2 body parameters. Only one is allowed.'
      );
    });

    it('should catch if there are body and formData parameters', () => {
      return assertInvalid(
        '2.0/body-and-form-params.yaml',
        'Validation failed. /paths/users/{username}/post has body parameters and formData parameters. Only one or the other is allowed.'
      );
    });

    it('should catch duplicate path placeholders', () => {
      return assertInvalid(
        '2.0/duplicate-path-placeholders.yaml',
        'Validation failed. /paths/users/{username}/profile/{username}/image/{img_id}/get has multiple path placeholders named {username}'
      );
    });

    it('should catch `file` parameters without a `consumes` declaration', () => {
      return assertInvalid(
        '2.0/file-no-consumes.yaml',
        'Validation failed. /paths/users/{username}/profile/image/post has a file parameter, so it must consume multipart/form-data or application/x-www-form-urlencoded'
      );
    });

    it('should catch `file` parameters with an invalid `consumes` declaration', () => {
      return assertInvalid(
        '2.0/file-invalid-consumes.yaml',
        'Validation failed. /paths/users/{username}/profile/image/post has a file parameter, so it must consume multipart/form-data or application/x-www-form-urlencoded'
      );
    });

    it('should allow a `file` parameter with a vendor specific form-data `consumes` declaration', () => {
      return assertValid('2.0/file-vendor-specific-consumes-formdata.yaml');
    });

    it('should allow a `file` parameter with a vendor specific urlencoded `consumes` declaration', () => {
      return assertValid('2.0/file-vendor-specific-consumes-urlencoded.yaml');
    });
  });

  describe('should catch duplicate header parameters', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/duplicate-header-params.yaml',
        'Validation failed. /paths/users/{username} has duplicate parameters \nValidation failed. Found multiple header parameters named "foo"'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/duplicate-header-params.yaml',
        'Validation failed. /paths/users/{username} has duplicate parameters \nValidation failed. Found multiple header parameters named "foo"'
      );
    });
  });

  describe('should catch duplicate operation parameters', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/duplicate-operation-params.yaml',
        'Validation failed. /paths/users/{username}/get has duplicate parameters \nValidation failed. Found multiple path parameters named "username"'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/duplicate-operation-params.yaml',
        'Validation failed. /paths/users/{username}/get has duplicate parameters \nValidation failed. Found multiple path parameters named "username"'
      );
    });
  });

  describe('should catch path parameters with no placeholder', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/path-param-no-placeholder.yaml',
        'Validation failed. /paths/users/{username}/post has a path parameter named "foo", but there is no corresponding {foo} in the path string'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/path-param-no-placeholder.yaml',
        'Validation failed. /paths/users/{username}/post has a path parameter named "foo", but there is no corresponding {foo} in the path string'
      );
    });
  });

  describe('should catch path placeholders with no corresponding parameter', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/path-placeholder-no-param.yaml',
        'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {foo}'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/path-placeholder-no-param.yaml',
        'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {foo}'
      );
    });
  });

  describe('should catch if no path parameters are present, but placeholders are', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/no-path-params.yaml',
        'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {username},{foo}'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/no-path-params.yaml',
        'Validation failed. /paths/users/{username}/{foo}/get is missing path parameter(s) for {username},{foo}'
      );
    });
  });

  describe('should catch array parameters without a sibling `items`', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/array-no-items.yaml',
        'Validation failed. /paths/users/get/parameters/tags is an array, so it must include an "items" schema'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/array-no-items.yaml',
        'Validation failed. /paths/users/get/parameters/tags is an array, so it must include an "items" schema'
      );
    });
  });

  describe('should catch array body parameters without a sibling `items`', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/array-body-no-items.yaml',
        'Validation failed. /paths/users/post/parameters/people is an array, so it must include an "items" schema'
      );
    });

    // @todo add a case for this
    it.skip('openapi 3.x', () => {
      return assertInvalid(
        '3.x/array-body-no-items.yaml',
        'Validation failed. /paths/users/post/parameters/people is an array, so it must include an "items" schema'
      );
    });
  });

  describe('should catch array response headers without a sibling `items', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/array-response-header-no-items.yaml',
        'Validation failed. /paths/users/get/responses/default/headers/Last-Modified is an array, so it must include an "items" schema'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/array-response-header-no-items.yaml',
        'Validation failed. /paths/users/get/responses/default/headers/Last-Modified is an array, so it must include an "items" schema'
      );
    });
  });

  describe("should catch if a required property in an input doesn't exist", () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/required-property-not-defined-input.yaml',
        "Validation failed. Property 'notExists' listed as required but does not exist in '/paths/pets/post/parameters/pet'"
      );
    });

    // @todo add a case for requestBody having a required property that doesn't exist in its schema
    it.skip('openapi 3.x', () => {
      return assertInvalid(
        '3.x/required-property-not-defined-input.yaml',
        "Validation failed. Property 'notExists' listed as required but does not exist in '/paths/pets/post/parameters/pet'"
      );
    });
  });

  describe("should catch if a required property in a component doesn't exist", () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/required-property-not-defined-definitions.yaml',
        "Validation failed. Property 'photoUrls' listed as required but does not exist in '/definitions/Pet'"
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/required-property-not-defined-components.yaml',
        "Validation failed. Property 'photoUrls' listed as required but does not exist in '/components/schemas/Pet'"
      );
    });
  });

  describe('should allow schema-declared required properties to be inherited by an `allOf`', () => {
    it('swagger 2.0', () => {
      return assertValid('2.0/inherited-required-properties.yaml');
    });

    // @tood add a case for this
    it.skip('openapi 3.x', () => {
      return assertValid('3.x/inherited-required-properties.yaml');
    });
  });

  describe('should catch duplicate operation IDs', () => {
    it('swagger 2.0', () => {
      return assertInvalid('2.0/duplicate-operation-ids.yaml', "Validation failed. Duplicate operation id 'users'");
    });

    it('openapi 3.x', () => {
      return assertInvalid('3.x/duplicate-operation-ids.yaml', "Validation failed. Duplicate operation id 'users'");
    });
  });

  describe('should catch array response bodies without a sibling `items`', () => {
    it('swagger 2.0', () => {
      return assertInvalid(
        '2.0/array-response-body-no-items.yaml',
        'Validation failed. /paths/users/get/responses/200/schema is an array, so it must include an "items" schema'
      );
    });

    it('openapi 3.x', () => {
      return assertInvalid(
        '3.x/array-response-body-no-items.yaml',
        'Validation failed. /paths/users/get/responses/200/content/application/json/schema is an array, so it must include an "items" schema'
      );
    });
  });
});
