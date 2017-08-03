import dsl, { extend, replace, append, validates, ValidationDescriptors } from '@validations/dsl';

QUnit.module('extensions');

QUnit.test('introducing new fields', assert => {
  let parent = dsl({
    name: validates('presence'),
    email: [
      validates('presence'),
      validates('email', { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }),
    ]
  });

  let child = extend(parent, {
    password: [
      validates('presence'),
      validates('password', { lowerCase: true, upperCase: true, numbers: true, symbols: true })
    ],
    passwordConfirmation: validates('confirmation').keys('password')
  });

  let expected: ValidationDescriptors = {
    name: [
      {
        field: 'name',
        validator: { name: 'presence', args: [] },
        keys: [],
        contexts: []
      }
    ],
    email: [
      {
        field: 'email',
        validator: { name: 'presence', args: [] },
        keys: [],
        contexts: []
      }, {
        field: 'email',
        validator: {
          name: 'email',
          args: [
            { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }
          ]
        },
        keys: [],
        contexts: []
      }
    ],
    password: [
      {
        field: 'password',
        validator: { name: 'presence', args: [] },
        keys: [],
        contexts: []
      }, {
        field: 'password',
        validator: {
          name: 'password',
          args: [
            { lowerCase: true, upperCase: true, numbers: true, symbols: true }
          ]
        },
        keys: [],
        contexts: []
      }
    ],
    passwordConfirmation: [
      {
        field: 'passwordConfirmation',
        validator: { name: 'confirmation', args: [] },
        keys: ['password'],
        contexts: []
      }
    ]
  };

  assert.deepEqual(child, expected);
});

QUnit.test('must use append/replace to modify existing validations', assert => {
  let parent = dsl({
    name: validates('presence')
  });

  assert.throws(() => {
    extend(parent, {
      name: validates('length', 6)
    });
  }, /`name` already has existing validations; use `append\(\)` or `replace\(\)` to add or completely replace validations/);
});

QUnit.test('append new validations', assert => {
  let parent = dsl({
    name: validates('presence'),
    email: [
      validates('presence'),
      validates('email', { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }),
    ],
    emailConfirmation: validates('confirmation').keys('email')
  });

  assert.throws(() => {
    extend(parent, {
      password: append(validates('password'))
    });
  }, /cannot use `append\(\)` when there are no existing validations defined for `password`/);

  let child = extend(parent, {
    name: append([
      validates('length', 6),
      validates('uniqueness').on('create')
    ]),
    email: append(validates('length', 6))
  });

  let expected: ValidationDescriptors = {
    name: [
      {
        field: 'name',
        validator: { name: 'presence', args: [] },
        keys: [],
        contexts: []
      },
      {
        field: 'name',
        validator: { name: 'length', args: [6] },
        keys: [],
        contexts: []
      },
      {
        field: 'name',
        validator: { name: 'uniqueness', args: [] },
        keys: [],
        contexts: ['create']
      }
    ],
    email: [
      {
        field: 'email',
        validator: { name: 'presence', args: [] },
        keys: [],
        contexts: []
      }, {
        field: 'email',
        validator: { name: 'email', args: [{ tlds: ['.com', '.net', '.org', '.edu', '.gov'] }] },
        keys: [],
        contexts: []
      },
      {
        field: 'email',
        validator: { name: 'length', args: [6] },
        keys: [],
        contexts: []
      }
    ],
    emailConfirmation: [
      {
        field: 'emailConfirmation',
        validator: { name: 'confirmation', args: [] },
        keys: ['email'],
        contexts: []
      }
    ],
    password: []
  };

  assert.deepEqual(child, expected);
});

QUnit.test('replacing existing validations', assert => {
  let parent = dsl({
    name: validates('presence'),
    email: [
      validates('presence'),
      validates('email', { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }),
    ],
    emailConfirmation: validates('confirmation').keys('email')
  });

  assert.throws(() => {
    extend(parent, {
      password: append(validates('password'))
    });
  }, /cannot use `replace\(\)` when there are no existing validations defined for `password`/);

  let child = extend(parent, {
    email: replace([
      validates('presence'),
      validates('email', { tlds: ['.com'] }),
    ]),
    emailConfirmation: replace([])
  });

  let expected: ValidationDescriptors = {
    name: [
      {
        field: 'name',
        validator: { name: 'presence', args: [] },
        keys: [],
        contexts: []
      }
    ],
    email: [
      {
        field: 'email',
        validator: { name: 'presence', args: [] },
        keys: [],
        contexts: []
      }, {
        field: 'email',
        validator: { name: 'email', args: [{ tlds: ['.com'] }] },
        keys: [],
        contexts: []
      }
    ],
    emailConfirmation: [],
    password: []
  };

  assert.deepEqual(child, expected);
});
