const { expect } = require('chai');
const OpenAPIParser = require('../..');

describe('Exports', function () {
  it('should export the OpenAPIParser class', function () {
    expect(OpenAPIParser).to.be.a('function');
  });

  it('should export all the static methods of OpenAPIParser', function () {
    expect(OpenAPIParser.parse).to.be.a('function');
    expect(OpenAPIParser.resolve).to.be.a('function');
    expect(OpenAPIParser.bundle).to.be.a('function');
    expect(OpenAPIParser.dereference).to.be.a('function');
  });

  it('should export the validate method', function () {
    expect(OpenAPIParser.validate).to.be.a('function');
  });
});
