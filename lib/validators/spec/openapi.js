const util = require('../../util');
const { ono } = require('@jsdevtools/ono');
const swaggerMethods = require('@apidevtools/swagger-methods');

module.exports = validateSpec;

/**
 * Validates parts of the OpenAPI 3.0 and 3.1 that aren't covered by their JSON Schema definitions.
 *
 * @param {SwaggerObject} api
 * @link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md
 * @link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md
 */
function validateSpec(api) {
  const operationIds = [];
  Object.keys(api.paths || {}).forEach(pathName => {
    const path = api.paths[pathName];
    const pathId = `/paths${pathName}`;

    if (path && pathName.indexOf('/') === 0) {
      validatePath(api, path, pathId, operationIds);
    }
  });

  /**
   * @todo Add better detection of Schema Object entities that are inside of: responses, parameters, requestBodies,
   *  headers, links, callbacks, and pathItems.
   * @link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#componentsObject
   * @link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md
   */
  const componentSchemas = api.components && api.components.schemas ? api.components.schemas : {};
  Object.keys(componentSchemas || {}).forEach(componentName => {
    const component = api.components.schemas[componentName];
    const definitionId = `/components/schemas/${componentName}`;
    validateRequiredPropertiesExist(component, definitionId);
  });
}

/**
 * Validates the given path.
 *
 * @param {SwaggerObject} api           - The entire OpenAPI API definition
 * @param {object}        path          - A Path object, from the OpenAPI API definition
 * @param {string}        pathId        - A value that uniquely identifies the path
 * @param {string}        operationIds  - An array of collected operationIds found in other paths
 */
function validatePath(api, path, pathId, operationIds) {
  // `@apidevtools/swagger-methods` doesn't ship a `trace` method so we need to improvise.
  [...swaggerMethods, 'trace'].forEach(operationName => {
    const operation = path[operationName];
    const operationId = `${pathId}/${operationName}`;

    if (operation) {
      const declaredOperationId = operation.operationId;
      if (declaredOperationId) {
        if (operationIds.indexOf(declaredOperationId) === -1) {
          operationIds.push(declaredOperationId);
        } else {
          throw ono.syntax(`Validation failed. Duplicate operation id '${declaredOperationId}'`);
        }
      }

      validateParameters(api, path, pathId, operation, operationId);

      Object.keys(operation.responses || {}).forEach(responseCode => {
        const response = operation.responses[responseCode];
        const responseId = `${operationId}/responses/${responseCode}`;
        validateResponse(responseCode, response || {}, responseId);
      });
    }
  });
}

/**
 * Validates the parameters for the given operation.
 *
 * @param {SwaggerObject} api           - The entire Swagger API object
 * @param {object}        path          - A Path object, from the Swagger API
 * @param {string}        pathId        - A value that uniquely identifies the path
 * @param {object}        operation     - An Operation object, from the Swagger API
 * @param {string}        operationId   - A value that uniquely identifies the operation
 */
function validateParameters(api, path, pathId, operation, operationId) {
  const pathParams = path.parameters || [];
  const operationParams = operation.parameters || [];

  // Check for duplicate path parameters.
  try {
    checkForDuplicates(pathParams);
  } catch (e) {
    throw ono.syntax(e, `Validation failed. ${pathId} has duplicate parameters`);
  }

  // Check for duplicate operation parameters.
  try {
    checkForDuplicates(operationParams);
  } catch (e) {
    throw ono.syntax(e, `Validation failed. ${operationId} has duplicate parameters`);
  }

  // Combine the path and operation parameters, with the operation params taking precedence over the path params.
  const params = pathParams.reduce((combinedParams, value) => {
    const duplicate = combinedParams.some(param => {
      return param.in === value.in && param.name === value.name;
    });

    if (!duplicate) {
      combinedParams.push(value);
    }

    return combinedParams;
  }, operationParams.slice());

  validatePathParameters(params, pathId, operationId);
  validateParameterTypes(params, api, operation, operationId);
}

/**
 * Validates path parameters for the given path.
 *
 * @param   {object[]}  params        - An array of Parameter objects
 * @param   {string}    pathId        - A value that uniquely identifies the path
 * @param   {string}    operationId   - A value that uniquely identifies the operation
 */
function validatePathParameters(params, pathId, operationId) {
  // Find all `{placeholders}` in the path string.
  const placeholders = pathId.match(util.swaggerParamRegExp) || [];

  params
    .filter(param => param.in === 'path')
    .forEach(param => {
      if (param.required !== true) {
        throw ono.syntax(
          'Validation failed. Path parameters cannot be optional. ' +
            `Set required=true for the "${param.name}" parameter at ${operationId}`
        );
      }

      const match = placeholders.indexOf(`{${param.name}}`);
      if (match === -1) {
        throw ono.syntax(
          `Validation failed. ${operationId} has a path parameter named "${param.name}", ` +
            `but there is no corresponding {${param.name}} in the path string`
        );
      }

      placeholders.splice(match, 1);
    });

  if (placeholders.length > 0) {
    throw ono.syntax(`Validation failed. ${operationId} is missing path parameter(s) for ${placeholders}`);
  }
}

/**
 * Validates data types of parameters for the given operation.
 *
 * @param   {object[]}  params       -  An array of Parameter objects
 * @param   {object}    api          -  The entire Swagger API object
 * @param   {object}    operation    -  An Operation object, from the Swagger API
 * @param   {string}    operationId  -  A value that uniquely identifies the operation
 */
function validateParameterTypes(params, api, operation, operationId) {
  params.forEach(param => {
    const parameterId = `${operationId}/parameters/${param.name}`;

    validateSchema(param.schema, parameterId);
    validateRequiredPropertiesExist(param.schema, parameterId);
  });
}

/**
 * Checks the given parameter list for duplicates, and throws an error if found.
 *
 * @param   {object[]}  params  - An array of Parameter objects
 */
function checkForDuplicates(params) {
  for (let i = 0; i < params.length - 1; i++) {
    const outer = params[i];
    for (let j = i + 1; j < params.length; j++) {
      const inner = params[j];
      if (outer.name === inner.name && outer.in === inner.in) {
        throw ono.syntax(`Validation failed. Found multiple ${outer.in} parameters named "${outer.name}"`);
      }
    }
  }
}

/**
 * Validates the given response object.
 *
 * @param   {string}    code        -  The HTTP response code (or "default")
 * @param   {object}    response    -  A Response object, from the Swagger API
 * @param   {string}    responseId  -  A value that uniquely identifies the response
 */
function validateResponse(code, response, responseId) {
  Object.keys(response.headers || {}).forEach(headerName => {
    const header = response.headers[headerName];
    const headerId = `${responseId}/headers/${headerName}`;

    validateSchema(header.schema, headerId);
  });

  if (response.content) {
    Object.keys(response.content).forEach(mediaType => {
      if (response.content[mediaType].schema) {
        validateSchema(response.content[mediaType].schema || {}, `${responseId}/content/${mediaType}/schema`);
      }
    });
  }
}

/**
 * Validates the given Swagger schema object.
 *
 * @param {object}    schema      - A Schema object, from the Swagger API
 * @param {string}    schemaId    - A value that uniquely identifies the schema object
 */
function validateSchema(schema, schemaId) {
  if (schema.type === 'array' && !schema.items) {
    throw ono.syntax(`Validation failed. ${schemaId} is an array, so it must include an "items" schema`);
  }
}

/**
 * Validates that the declared properties of the given Swagger schema object actually exist.
 *
 * @param {object}    schema      - A Schema object, from the Swagger API
 * @param {string}    schemaId    - A value that uniquely identifies the schema object
 */
function validateRequiredPropertiesExist(schema, schemaId) {
  // Recursively collects all properties of the schema and its ancestors. They are added to the props object.
  function collectProperties(schemaObj, props) {
    if (schemaObj.properties) {
      Object.keys(schemaObj.properties).forEach(property => {
        // eslint-disable-next-line no-prototype-builtins
        if (schemaObj.properties.hasOwnProperty(property)) {
          // eslint-disable-next-line no-param-reassign
          props[property] = schemaObj.properties[property];
        }
      });
    }

    if (schemaObj.allOf) {
      schemaObj.allOf.forEach(parent => {
        collectProperties(parent, props);
      });
    }
  }

  if (schema.required && Array.isArray(schema.required)) {
    const props = {};
    collectProperties(schema, props);
    schema.required.forEach(requiredProperty => {
      if (!props[requiredProperty]) {
        throw ono.syntax(
          `Validation failed. Property '${requiredProperty}' listed as required but does not exist in '${schemaId}'`
        );
      }
    });
  }
}
