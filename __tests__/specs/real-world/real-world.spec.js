/* eslint-disable no-console */
// const { host } = require('@jsdevtools/host-environment');
const OpenAPIParser = require('../../..');
const knownErrors = require('./known-errors');
let realWorldAPIs = require('../../__fixtures__/real-world-apis.json');

// How many APIs to test in "quick mode" and normal mode
const MAX_APIS_TO_TEST = 10; // host.node && process.argv.includes('--quick-test') ? 10 : 1500;
const MAX_DOWNLOAD_RETRIES = 3;

realWorldAPIs = Object.keys(realWorldAPIs)
  .map(name => [name, realWorldAPIs[name]])
  .slice(0, MAX_APIS_TO_TEST);

describe('Real-world APIs', () => {
  // eslint-disable-next-line jest/expect-expect
  it.concurrent.each(realWorldAPIs)(
    '%s',
    async (_, api) => {
      await validateApi(api);
    },
    10000
  );

  /**
   * Downloads an API definition and validates it.  Automatically retries if the download fails.
   */
  async function validateApi(api, attemptNumber = 1) {
    try {
      await OpenAPIParser.validate(api.url);
    } catch (error) {
      // Validation failed.  But is this a known error?
      const knownError = knownErrors.find(api, error);

      if (knownError) {
        if (knownError.whatToDo === 'ignore') {
          // Ignore the error.  It's a known problem with this API
          return null;
        } else if (knownError.whatToDo === 'retry') {
          if (attemptNumber >= MAX_DOWNLOAD_RETRIES) {
            console.error(`        failed to download ${api.url}.  giving up.`);
            return null;
          }

          // Wait a few seconds, then try the download again
          await new Promise(resolve => {
            console.error(`        failed to download ${api.url}.  trying again...`);
            setTimeout(resolve, 2000);
          });

          await validateApi(api, attemptNumber + 1);
        }
      } else {
        // This is not a known error
        console.error('\n\nERROR IN THIS API:', JSON.stringify(api, null, 2));
        throw error;
      }
    }

    return null;
  }
});
