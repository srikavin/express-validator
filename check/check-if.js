const runner = require('./runner');

module.exports = (conditions, validators) => {
  conditions = Array.isArray(conditions) ? conditions : [conditions];
  validators = Array.isArray(validators) ? validators : [validators];

  return (req, res, next) => {
    return conditions
      .reduce((promise, condition) => {
        return promise.then(() => {
          if (condition && condition._context) {
            return runner(req, condition._context);
          }

          return [];
        }).then(errors => {
          if (errors.length) {
            throw errors;
          }
        });
      }, Promise.resolve())
      .then(() => {
        return validators
          .filter(validator => typeof validator === 'function')
          .reduce((promise, validator) => {
            return promise.then(() => new Promise((resolve, reject) => {
              validator(req, res, err => err ? reject(err) : resolve());
            }));
          }, Promise.resolve());
      }).then(
        () => next(),
        () => next()
      );
  };
};