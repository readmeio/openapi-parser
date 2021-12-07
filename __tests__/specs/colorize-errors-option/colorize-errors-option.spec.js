const { host } = require('@jsdevtools/host-environment');
const OpenAPIParser = require('../../..');
const path = require('../../utils/path');

describe('`validate.colorizeErrors` option', () => {
  it('should not colorize errors by default', () => {
    const parser = new OpenAPIParser();

    return expect(parser.validate(path.rel('specs/colorize-errors-option/invalid.json'))).rejects.toThrow(
      // eslint-disable-next-line no-regex-spaces
      /> 19 |             "type": "array",/
    );
  });

  it('should colorize errors when set', function () {
    // Colors aren't supported in the browser so we can skip this test.
    // eslint-disable-next-line jest/no-if
    if (host.browser) {
      return;
    }

    const parser = new OpenAPIParser();

    // eslint-disable-next-line consistent-return
    return expect(
      parser.validate(path.rel('specs/colorize-errors-option/invalid.json'), {
        validate: {
          colorizeErrors: true,
        },
      })
    ).rejects.toThrow('\u001b');
  });
});
