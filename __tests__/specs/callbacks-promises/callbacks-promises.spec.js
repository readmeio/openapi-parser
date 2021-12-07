/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
const OpenAPIParser = require('../../..');
// const helper = require('../../utils/helper');
const path = require('../../utils/path');
const parsedAPI = require('./parsed');
const dereferencedAPI = require('./dereferenced');
const bundledAPI = require('./bundled');

describe('Callback & Promise syntax', () => {
  for (const method of ['parse', 'resolve', 'dereference', 'bundle', 'validate']) {
    describe(`${method} method`, () => {
      it('should call the callback function upon success', done => {
        const parser = new OpenAPIParser();
        parser[method](path.rel('specs/callbacks-promises/callbacks-promises.yaml'), (err, result) => {
          try {
            expect(err).toBeNull();
            expect(typeof result).toBe('object');
            expect(parser.$refs.paths()).toStrictEqual([path.abs('specs/callbacks-promises/callbacks-promises.yaml')]);

            if (method === 'resolve') {
              expect(result).toStrictEqual(parser.$refs);
            } else {
              expect(result).toStrictEqual(parser.schema);

              // Make sure the API was parsed correctly
              const expected = getSchema(method);
              expect(result).toStrictEqual(expected);
            }
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should call the callback function upon failure', done => {
        OpenAPIParser[method](path.rel('specs/callbacks-promises/callbacks-promises-error.yaml'), (err, result) => {
          try {
            expect(err).toBeInstanceOf(SyntaxError);
            expect(result).toBeUndefined();
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should resolve the Promise upon success', done => {
        const parser = new OpenAPIParser();
        parser[method](path.rel('specs/callbacks-promises/callbacks-promises.yaml')).then(result => {
          expect(typeof result).toBe('object');
          expect(parser.$refs.paths()).toStrictEqual([path.abs('specs/callbacks-promises/callbacks-promises.yaml')]);

          if (method === 'resolve') {
            expect(result).toStrictEqual(parser.$refs);
          } else {
            expect(result).toStrictEqual(parser.schema);

            // Make sure the API was parsed correctly
            const expected = getSchema(method);
            expect(result).toStrictEqual(expected);
          }

          done();
        });
      });

      it('should reject the Promise upon failure', () => {
        return expect(
          OpenAPIParser[method](path.rel('specs/callbacks-promises/callbacks-promises-error.yaml'))
        ).rejects.toThrow(SyntaxError);
      });
    });
  }

  function getSchema(method) {
    switch (method) {
      case 'parse':
        return parsedAPI;
      case 'dereference':
      case 'validate':
        return dereferencedAPI;
      case 'bundle':
        return bundledAPI;
      default:
        throw new Error('Unrecognized schema method called.');
    }
  }
});
