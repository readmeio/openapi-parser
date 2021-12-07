const OpenAPIParser = require('../../..');
const path = require('../../utils/path');
const parsedAPI = require('./parsed');
const dereferencedAPI = require('./dereferenced');
const bundledAPI = require('./bundled');

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

describe('Object sources (instead of file paths)', () => {
  it('should dereference an object that references external files', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.dereference(cloneDeep(parsedAPI.api));
    expect(api).toStrictEqual(parser.api);

    expect(api).toStrictEqual(dereferencedAPI);

    // The API path should be the current directory, and all other paths should be absolute
    const expectedPaths = [
      path.cwd(),
      path.abs('specs/object-source/definitions/definitions.json'),
      path.abs('specs/object-source/definitions/name.yaml'),
      path.abs('specs/object-source/definitions/required-string.yaml'),
    ];
    expect(parser.$refs.paths()).toStrictEqual(expect.arrayContaining(expectedPaths));
    expect(Object.keys(parser.$refs.values())).toStrictEqual(expect.arrayContaining(expectedPaths));

    // Reference equality
    expect(api.paths['/people/{name}'].get.responses['200'].schema).toStrictEqual(api.definitions.name);
    expect(api.definitions.requiredString).toStrictEqual(api.definitions.name.properties.first);
    expect(api.definitions.requiredString).toStrictEqual(api.definitions.name.properties.last);
    expect(api.definitions.requiredString).toStrictEqual(
      api.paths['/people/{name}'].get.responses['200'].schema.properties.first
    );
    expect(api.definitions.requiredString).toStrictEqual(
      api.paths['/people/{name}'].get.responses['200'].schema.properties.last
    );
  });

  it('should bundle an object that references external files', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.bundle(cloneDeep(parsedAPI.api));
    expect(api).toStrictEqual(parser.api);
    expect(api).toStrictEqual(bundledAPI);

    // The API path should be the current directory, and all other paths should be absolute
    const expectedPaths = [
      path.cwd(),
      path.abs('specs/object-source/definitions/definitions.json'),
      path.abs('specs/object-source/definitions/name.yaml'),
      path.abs('specs/object-source/definitions/required-string.yaml'),
    ];
    expect(parser.$refs.paths()).toStrictEqual(expect.arrayContaining(expectedPaths));
    expect(Object.keys(parser.$refs.values())).toStrictEqual(expect.arrayContaining(expectedPaths));
  });

  it('should validate an object that references external files', async () => {
    const parser = new OpenAPIParser();
    const api = await parser.dereference(cloneDeep(parsedAPI.api));
    expect(api).toStrictEqual(parser.api);
    expect(api).toStrictEqual(dereferencedAPI);

    // The API path should be the current directory, and all other paths should be absolute
    const expectedPaths = [
      path.cwd(),
      path.abs('specs/object-source/definitions/definitions.json'),
      path.abs('specs/object-source/definitions/name.yaml'),
      path.abs('specs/object-source/definitions/required-string.yaml'),
    ];
    expect(parser.$refs.paths()).toStrictEqual(expect.arrayContaining(expectedPaths));
    expect(Object.keys(parser.$refs.values())).toStrictEqual(expect.arrayContaining(expectedPaths));

    // Reference equality
    expect(api.paths['/people/{name}'].get.responses['200'].schema).toStrictEqual(api.definitions.name);
    expect(api.definitions.requiredString).toStrictEqual(api.definitions.name.properties.first);
    expect(api.definitions.requiredString).toStrictEqual(api.definitions.name.properties.last);
    expect(api.definitions.requiredString).toStrictEqual(
      api.paths['/people/{name}'].get.responses['200'].schema.properties.first
    );
    expect(api.definitions.requiredString).toStrictEqual(
      api.paths['/people/{name}'].get.responses['200'].schema.properties.last
    );
  });
});
