const runner = require('./runner');
const { oneOfRunner } = require('./one-of');

module.exports = (conditions, validators) => {
  conditions = Array.isArray(conditions) ? conditions : [conditions];
  validators = Array.isArray(validators) ? validators : [validators];

  return (req, res, next) => {
    return conditions
      .filter(condition => condition)
      .reduce((promise, condition) => {
        return promise.then(() => {
          if (condition._context) {
            return runner(req, condition._context);
          } else if (condition._oneOfContexts) {
            return oneOfRunner(req, condition._oneOfContexts).then(results => {
              return results.length && results.every(result => result.length)
                ? results
                : [];
            });
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