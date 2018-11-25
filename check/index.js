const {
  buildCheckFunction,
  check,
  body,
  cookie,
  header,
  param,
  query
} = require('./validation-chain-builders');

module.exports = {
  buildCheckFunction,
  check,
  body,
  cookie,
  header,
  param,
  query,
  checkIf: require('./check-if'),
  checkSchema: require('./schema'),
  oneOf: require('./one-of'),
  validationResult: require('./validation-result')
};