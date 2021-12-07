const OpenAPIParser = require('../../..');
const helper = require('../../utils/helper');
const path = require('../../utils/path');
const parsedAPI = require('./parsed');
const dereferencedAPI = require('./dereferenced');
const bundledAPI = require('./bundled');
const validatedAPI = require('./validated');

// @fixme temporarily skipped due to problems with the upgrade to @apidevtools/json-schema-ref-parser
describe.skip('API with circular (recursive) $refs', () => {
  it('should parse successfully', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.parse(path.rel('specs/circular/circular.yaml'));
    expect(api).toStrictEqual(parser.api);
    expect(api).toStrictEqual(parsedAPI.api);
    expect(parser.$refs.paths()).toStrictEqual([path.abs('specs/circular/circular.yaml')]);
  });

  // eslint-disable-next-line jest/expect-expect
  it(
    'should resolve successfully',
    helper.testResolve(
      'specs/circular/circular.yaml',
      parsedAPI.api,
      'specs/circular/definitions/pet.yaml',
      parsedAPI.pet,
      'specs/circular/definitions/child.yaml',
      parsedAPI.child,
      'specs/circular/definitions/parent.yaml',
      parsedAPI.parent,
      'specs/circular/definitions/person.yaml',
      parsedAPI.person
    )
  );

  it('should dereference successfully', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.dereference(path.rel('specs/circular/circular.yaml'));
    expect(api).toStrictEqual(parser.api);
    expect(api).toStrictEqual(dereferencedAPI);

    // Reference equality
    expect(api.definitions.person.properties.spouse).toStrictEqual(api.definitions.person);
    expect(api.definitions.parent.properties.children.items).toStrictEqual(api.definitions.child);
    expect(api.definitions.child.properties.parents.items).toStrictEqual(api.definitions.parent);
  });

  it('should validate successfully', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.validate(path.rel('specs/circular/circular.yaml'));
    expect(api).toStrictEqual(parser.api);
    expect(api).toStrictEqual(validatedAPI.fullyDereferenced);

    // Reference equality
    expect(api.definitions.person.properties.spouse).toStrictEqual(api.definitions.person);
    expect(api.definitions.parent.properties.children.items).toStrictEqual(api.definitions.child);
    expect(api.definitions.child.properties.parents.items).toStrictEqual(api.definitions.parent);
  });

  it('should not dereference circular $refs if "options.dereference.circular" is "ignore"', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.validate(path.rel('specs/circular/circular.yaml'), {
      dereference: { circular: 'ignore' },
    });
    expect(api).toStrictEqual(parser.api);
    expect(api).toStrictEqual(validatedAPI.ignoreCircular$Refs);

    // Reference equality
    expect(api.paths['/pet'].get.responses['200'].schema).toStrictEqual(api.definitions.pet);
  });

  it('should fail validation if "options.dereference.circular" is false', () => {
    const parser = new OpenAPIParser();

    return expect(
      parser.validate(path.rel('specs/circular/circular.yaml'), { dereference: { circular: false } })
    ).rejects.toThrow(new ReferenceError('The API contains circular references'));
  });

  it('should bundle successfully', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.bundle(path.rel('specs/circular/circular.yaml'));
    expect(api).toStrictEqual(parser.api);
    expect(api).toStrictEqual(bundledAPI);
  });
});
