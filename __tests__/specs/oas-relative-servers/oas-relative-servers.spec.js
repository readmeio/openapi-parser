const OpenAPIParser = require('../../../lib');
const path = require('../../utils/path');
const $RefParser = require('@apidevtools/json-schema-ref-parser');
const sinon = require('sinon');

// Import of our fixed OpenAPI JSON files
const v3RelativeServerJson = require('./v3-relative-server.json');
const v3RelativeServerPathsOpsJson = require('./v3-relative-server-paths-ops.json');
const v3NonRelativeServerJson = require('./v3-non-relative-server.json');

// Petstore v3 json has relative path in "servers"
const RELATIVE_SERVERS_OAS3_URL_1 = 'https://petstore3.swagger.io/api/v3/openapi.json';

// This will have "servers" at paths & operations level
const RELATIVE_SERVERS_OAS3_URL_2 = 'https://foo.my.cloud/v1/petstore/relativeservers';

describe('Servers with relative paths in OpenAPI v3 files', () => {
  let mockParse;

  beforeEach(() => {
    // Mock the parse function
    mockParse = sinon.stub($RefParser.prototype, 'parse');
  });

  afterEach(() => {
    // Restore the parse function
    $RefParser.prototype.parse.restore();
  });

  it('should fix relative servers path in the file fetched from url', async () => {
    mockParse.callsFake(() => {
      // to prevent edit of the original JSON
      return JSON.parse(JSON.stringify(v3RelativeServerJson));
    });
    const apiJson = await OpenAPIParser.parse(RELATIVE_SERVERS_OAS3_URL_1);
    expect(apiJson.servers[0].url).toBe('https://petstore3.swagger.io/api/v3');
  });

  it('should fix relative servers at root, path and operations level in the file fetched from url', async () => {
    mockParse.callsFake(() => {
      // to prevent edit of the original JSON
      return JSON.parse(JSON.stringify(v3RelativeServerPathsOpsJson));
    });
    const apiJson = await OpenAPIParser.parse(RELATIVE_SERVERS_OAS3_URL_2);
    expect(apiJson.servers[0].url).toBe('https://foo.my.cloud/api/v3');
    expect(apiJson.paths['/pet'].servers[0].url).toBe('https://foo.my.cloud/api/v4');
    expect(apiJson.paths['/pet'].get.servers[0].url).toBe('https://foo.my.cloud/api/v5');
  });

  it('should parse but no change to relative servers path in local file import', async () => {
    mockParse.callsFake(() => {
      return JSON.parse(JSON.stringify(v3RelativeServerPathsOpsJson));
    });
    const apiJson = await OpenAPIParser.parse(path.rel('./v3-relative-server.json'));
    expect(apiJson.servers[0].url).toBe('/api/v3');
    expect(apiJson.paths['/pet'].servers[0].url).toBe('/api/v4');
    expect(apiJson.paths['/pet'].get.servers[0].url).toBe('/api/v5');
  });

  it('should parse but no change to non-relative servers path in local file import', async () => {
    mockParse.callsFake(() => {
      return JSON.parse(JSON.stringify(v3NonRelativeServerJson));
    });
    const apiJson = await OpenAPIParser.parse(path.rel('./v3-non-relative-server.json'));
    expect(apiJson.servers[0].url).toBe('https://petstore3.swagger.com/api/v3');
    expect(apiJson.paths['/pet'].servers[0].url).toBe('https://petstore3.swagger.com/api/v4');
    expect(apiJson.paths['/pet'].get.servers[0].url).toBe('https://petstore3.swagger.com/api/v5');
  });
});
