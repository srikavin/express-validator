const { expect } = require('chai');
const { check, checkIf, oneOf, validationResult } = require('./index');

const customResult = validationResult.withDefaults({
  formatter: ({ msg }) => msg
});

describe('check: checkIf middleware', () => {
  it('runs validations if there are no conditions', () => {
    const req = {
      body: { foo: 'foo', bar: 'notbar' }
    };

    const validations = [
      check('foo').equals('foo'),
      check('bar').equals('bar')
    ];

    return checkIf([], validations)(req, {}, () => {}).then(() => {
      expect(validationResult(req).array()).to.have.lengthOf(1);
    });
  });

  it('runs validations if the provided conditions are not validators', () => {
    const req = {
      body: { foo: 'foo', bar: 'notbar' }
    };

    const conditions = [
      'foo',
      () => true,
      123,
      null
    ];

    const validations = [
      check('foo').equals('foo'),
      check('bar').equals('bar')
    ];

    return checkIf(conditions, validations)(req, {}, () => {}).then(() => {
      expect(validationResult(req).array()).to.have.lengthOf(1);
    });
  });

  it('runs validations if all provided conditions pass', () => {
    const req = {
      body: { foo: 'foo', bar: 'notbar' }
    };

    const conditions = [check('foo').equals('foo')];
    const validations = [
      check('foo').equals('notfoo').withMessage('notfoo'),
      check('bar').equals('bar').withMessage('bar')
    ];

    return checkIf(conditions, validations)(req, {}, () => {}).then(() => {
      expect(customResult(req).mapped()).to.eql({
        foo: 'notfoo',
        bar: 'bar'
      });
    });
  });

  it('runs conditions that are built using oneOf()', () => {
    const req = {
      query: { foo: 'foo', bar: 'notbar' }
    };

    const condition = oneOf([
      check('bar').equals('bar'),
      check('foo').equals('foo')
    ]);
    const validations = [
      check('foo').equals('notfoo').withMessage('notfoo'),
      check('bar').equals('bar').withMessage('bar')
    ];

    return checkIf(condition, validations)(req, {}, () => {}).then(() => {
      expect(customResult(req).mapped()).to.eql({
        foo: 'notfoo',
        bar: 'bar'
      });
    });
  });

  it('does not run validations if any condition fails', () => {
    const req = {
      body: { foo: 'foo', bar: 'notbar' }
    };

    const conditions = [check('foo').equals('foo'), check('bar').equals('bar')];
    const validations = [
      check('foo').equals('notfoo').withMessage('notfoo'),
      check('bar').equals('notbar').withMessage('bar')
    ];

    return checkIf(conditions, validations)(req, {}, () => {}).then(() => {
      expect(validationResult(req).isEmpty()).to.be.true;
    });
  });

  it('runs any random middleware as validation', () => {
    const req = {
      body: { foo: 'foo' }
    };

    const validation = (req, res, next) => {
      req.foo = 'bar';
      next();
    };

    return checkIf([], validation)(req, {}, () => {}).then(() => {
      expect(req).to.have.property('foo', 'bar');
    });
  });

  it('stops running further validations if any of them throws an error', () => {
    const req = {
      query: { foo: 'foo' }
    };

    const validations = [
      (req, res, next) => next(new Error()),
      check('foo').equals('bar')
    ];
    return checkIf([], validations)(req, {}, () => {}).then(() => {
      expect(validationResult(req).isEmpty()).to.be.true;
    });
  });
});