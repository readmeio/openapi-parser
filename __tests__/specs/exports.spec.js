const OpenAPIParser = require('../..');

describe('Exports', () => {
  it('should export the OpenAPIParser class', () => {
    expect(typeof OpenAPIParser).toBe('function');
  });

  it('should export all the static methods of OpenAPIParser', () => {
    expect(typeof OpenAPIParser.parse).toBe('function');
    expect(typeof OpenAPIParser.resolve).toBe('function');
    expect(typeof OpenAPIParser.bundle).toBe('function');
    expect(typeof OpenAPIParser.dereference).toBe('function');
  });

  it('should export the validate method', () => {
    expect(typeof OpenAPIParser.validate).toBe('function');
  });
});
