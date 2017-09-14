import { ValidationError } from '@validations/core';
import { validators } from '@validations/dsl';
import { Option, unknown } from 'ts-std';
import { buildAndRun as run } from '../support';

QUnit.module('Validators (object)');

function success(): ValidationError[] {
  return [];
}

function failure(path: Option<string>, type: string, args: unknown): ValidationError {
  return {
    path: path ? path.split('.') : [],
    message: {
      key: type,
      args
    }
  };
}

QUnit.test('object should fail if passed non-objects', async assert => {
  assert.deepEqual(await run(validators.object({}), null), [failure(null, 'type', 'object')]);
  assert.deepEqual(await run(validators.object({}), 'string-is-not-arr'), [failure(null, 'type', 'object')]);
});

[validators.fields, validators.object].forEach(builder => {
  let name = builder.name;

  QUnit.test(`simple ${name}`, async assert => {
    const geo = builder({
      lat: validators.isNumber(),
      long: validators.isNumber()
    });

    assert.deepEqual(await run(geo, { lat: 0, long: 0 }), success());
    assert.deepEqual(await run(geo, { lat: 0, long: null }), [failure('long', 'type', 'number')]);
    assert.deepEqual(await run(geo, { lat: 0, long: [0] }), [failure('long', 'type', 'number')]);

    assert.deepEqual(await run(geo, { lat: null, long: null }), [
      failure('lat', 'type', 'number'),
      failure('long', 'type', 'number')
    ]);
  });

  QUnit.test(`nested ${name}`, async assert => {
    const feature = builder({
      article: builder({
        contact: builder({
          geo: builder({
            lat: validators.isNumber(),
            long: validators.isNumber()
          })
        })
      })
    });

    function wrap(inner: any) {
      return { article: { contact: { geo: inner } } };
    }

    assert.deepEqual(await run(feature, wrap({ lat: 0, long: 0 })), success());
    assert.deepEqual(await run(feature, wrap({ lat: 0, long: null })), [failure('article.contact.geo.long', 'type', 'number')]);
    assert.deepEqual(await run(feature, wrap({ lat: 0, long: [0] })), [failure('article.contact.geo.long', 'type', 'number')]);

    assert.deepEqual(await run(feature, wrap({ lat: null, long: null })), [
      failure('article.contact.geo.lat', 'type', 'number'),
      failure('article.contact.geo.long', 'type', 'number')
    ]);
  });

});
