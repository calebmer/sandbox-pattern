var assert  = require('assert');
var sandbox = require('../lib/sandbox');

describe('sandbox', function () {
  var obj = { some: 'obj' };

  var func = function () {
    return null;
  };

  beforeEach(function () {
    sandbox.reset();
  });

  it('loads in standard order', function (done) {
    sandbox('module1', function () { return { hello: 'world' }; });

    sandbox(['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      done();
    });
  });

  it('loads in unstandard order', function (done) {
    sandbox(['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      done();
    });

    sandbox('module1', function () { return { hello: 'world' }; });
  });

  it('can extend modules', function (done) {
    sandbox('module1', function () { return { hello: 'world' }; });
    sandbox('module1', function () { return { world: 'hello' }; });

    sandbox(['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      assert.equal(box.module1.world, 'hello');
      done();
    });
  });

  it('can extend modules in wierd orders', function (done) {
    sandbox('module1', function () { return { world: 'hello' }; });

    sandbox(['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      assert.equal(box.module1.world, 'hello');
      done();
    });

    sandbox('module1', function () { return { hello: 'world' }; });
  });

  it('enables simoultaneous import/export', function (done) {
    sandbox('module1', function () { return { hello: 'world' }; });

    sandbox('module2', ['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      return { world: 'hello' };
    });

    sandbox(['module1', 'module2'], function (box) {
      assert.equal(box.module1.hello, 'world');
      assert.equal(box.module2.world, 'hello');
      done();
    });
  });

  it('enables simoultaneous import/export in werd orders', function (done) {
    sandbox(['module1', 'module2'], function (box) {
      assert.equal(box.module1.hello, 'world');
      assert.equal(box.module2.world, 'hello');
      done();
    });

    sandbox('module1', function () { return { hello: 'world' }; });

    sandbox('module2', ['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      return { world: 'hello' };
    });
  });

  it('can have one module with many dependents', function (done) {
    sandbox('module1', function () { return { hello: 'world' }; });

    sandbox(['module1', 'module2'], function (box) {
      assert.equal(box.module1.hello, 'world');
      assert.equal(box.module1.hello, 'world');
      done();
    });

    sandbox('module2', ['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      return { world: 'hello' };
    });
  });

  it('boxes that handle errors without errors is not broken', function (done) {
    sandbox('module1', function () { return { hello: 'world' }; });

    sandbox(['module1'], function (err, box) {
      assert.ifError(err);
      assert.equal(box.module1.hello, 'world');
      done();
    });
  });

  it('detects when modules don\'t exist', function (done) {
    sandbox(['module1'], function (err, box) {
      assert.throws(assert.ifError.bind({}, err));
      assert.equal(box, undefined);
      done();
    });
  });

  it('supports child modules', function (done) {
    sandbox('module1', function () { return { hello: 'world' }; });
    sandbox('module1', function () { return { world: 'hello' }; });
    sandbox('module1.func', function () { return func; });
    sandbox('module1.obj', function () { return obj; });

    sandbox(['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      assert.equal(box.module1.world, 'hello');
      assert.equal(box.module1.func, func);
      assert.equal(box.module1.obj, obj);
      done();
    });
  });

  it('allows the parent module to not need a definition', function (done) {
    sandbox('module1.func', function () { return func; });
    sandbox('module1.obj', function () { return obj; });

    sandbox(['module1'], function (box) {
      assert.equal(box.module1.func, func);
      assert.equal(box.module1.obj, obj);
      done();
    });
  });

  it('allows for manual startup execution', function () {
    var success = false;

    sandbox.configure({ startupWait: true });

    sandbox('module1', function () { return { hello: 'world' }; });

    sandbox(['module1'], function (box) {
      assert.equal(box.module1.hello, 'world');
      success = true;
    });

    sandbox.startup();

    assert(success, 'Sandboxes were not executed');
  });

  it('won\'t allow circular dependencies - lv1', function () {
    sandbox('module1', ['module1'], function () { assert(false); });
  });

  it('won\'t allow circular dependencies - lv2', function () {
    sandbox('module1', ['module2'], function () { assert(false); });
    sandbox('module2', ['module1'], function () { assert(false); });
  });

  it('won\'t allow circular dependencies - lv3', function () {
    sandbox('module1', ['module3'], function () { assert(false); });
    sandbox('module2', ['module1'], function () { assert(false); });
    sandbox('module3', ['module2'], function () { assert(false); });
  });
});
