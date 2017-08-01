import dsl, { on, validates, ValidationDescriptor } from '../src';

QUnit.module('DSL');

QUnit.test('basic DSL', assert => {
  let validations = dsl({
    name: validates('presence'),
    email: [
      validates('presence'),
      validates('email', { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }),
    ]
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'email', args: [
        { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }
      ] },
      keys: null,
      contexts: null
    }
  ];

  assert.deepEqual(validations, expected);
});

QUnit.test('dependent keys', assert => {
  assert.throws(
    () => validates('foo').keys(),
    /must provide at least one dependent key/
  );

  let validations = dsl({
    name: validates('presence').keys('firstName', 'lastName'),
    email: [
      validates('presence'),
      validates('email'),
    ],
    emailConfirmation: validates('confirmation').keys('email')
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: ['firstName', 'lastName'],
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'email', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'emailConfirmation',
      validator: { name: 'confirmation', args: [] },
      keys: ['email'],
      contexts: null
    }
  ];

  assert.deepEqual(validations, expected);
});

QUnit.test('validation contexts', assert => {
  assert.throws(
    () => validates('foo').on(),
    /must provide at least one validation context/
  );

  let validations = dsl({
    name: validates('presence').on('create', 'update'),
    email: on('create').do([
      validates('presence'),
      validates('email'),
    ]),
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: ['create', 'update']
    },
    {
      field: 'email',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: ['create']
    },
    {
      field: 'email',
      validator: { name: 'email', args: [] },
      keys: null,
      contexts: ['create']
    }
  ];

  assert.deepEqual(validations, expected);
});


QUnit.test('"keys" does not mutate previously defined builder', assert => {
  let presence = validates('presence');
  let presenceWithKeys = presence.keys('firstName', 'lastName');

  let validations = dsl({
    name: presence,
    nickname: presenceWithKeys
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'nickname',
      validator: { name: 'presence', args: [] },
      keys: ['firstName', 'lastName'],
      contexts: null
    }
  ];

  assert.deepEqual(validations, expected);
});


QUnit.test('"on" does not mutate previously defined builder', assert => {
  let presence = validates('presence');
  let presenceWithContext = presence.on('create');

  let validations = dsl({
    name: presence,
    email: presenceWithContext
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: ['create']
    }
  ];

  assert.deepEqual(validations, expected);
});
