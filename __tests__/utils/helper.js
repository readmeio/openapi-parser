const OpenAPIParser = require('../..');
const { host } = require('@jsdevtools/host-environment');
const path = require('./path');

const helper = {
  /**
   * Tests the {@link OpenAPIParser.resolve} method,
   * and asserts that the given file paths resolve to the given values.
   *
   * @param {string} filePath - The file path that should be resolved
   * @param {*} resolvedValue - The resolved value of the file
   * @param {...*} [params] - Additional file paths and resolved values
   * @returns {Function}
   */
  // eslint-disable-next-line no-unused-vars
  testResolve(filePath, resolvedValue, params) {
    const schemaFile = path.rel(arguments[0]);
    const parsedAPI = arguments[1];
    const expectedFiles = [];
    const expectedValues = [];
    for (let i = 0; i < arguments.length; i++) {
      expectedFiles.push(path.abs(arguments[i]));
      expectedValues.push(arguments[++i]);
    }

    return async () => {
      const parser = new OpenAPIParser();
      const $refs = await parser.resolve(schemaFile);

      expect(parser.api).toStrictEqual(parsedAPI);
      expect(parser.$refs).toStrictEqual($refs);

      // Resolved file paths
      expect($refs.paths()).toStrictEqual(expectedFiles);
      if (host.node) {
        expect($refs.paths(['file'])).toStrictEqual(expectedFiles);
        expect($refs.paths('http')).toHaveLength(0);
      } else {
        expect($refs.paths(['http', 'https'])).toStrictEqual(expectedFiles);
        expect($refs.paths('fs')).toHaveLength(0);
      }

      // Resolved values
      const values = $refs.values();
      expect(Object.keys(values)).toStrictEqual(expectedFiles);
      for (const [i, file] of expectedFiles.entries()) {
        const actual = helper.convertNodeBuffersToPOJOs(values[file]);
        const expected = expectedValues[i];

        // `toStrictEqual()` has trouble with `Buffer.toJSON()` comparisons so we need to switch up which assertions
        // we're using for these different cases.
        if (expected === undefined) {
          expect(actual).toBeUndefined();
        } else if (typeof expected === 'string') {
          expect(actual).toBe(expected);
        } else {
          expect(actual).toMatchObject(expected);
        }
      }
    };
  },

  /**
   * Converts Buffer objects to POJOs, so they can be compared using Chai
   */
  convertNodeBuffersToPOJOs(value) {
    if (value && (value._isBuffer || (value.constructor && value.constructor.name === 'Buffer'))) {
      // Convert Buffers to POJOs for comparison
      // eslint-disable-next-line no-param-reassign
      value = value.toJSON();

      // if (host.node && host.node.version < 4) {
      //   // Node v0.10 serializes buffers differently
      //   // eslint-disable-next-line no-param-reassign
      //   value = { type: 'Buffer', data: value };
      // }
    }

    return value;
  },
};

module.exports = helper;
