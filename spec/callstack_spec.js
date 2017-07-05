const assert = require('assert');
const CallStack = require('../lib/callstack.js');

describe('CallStackFrame', () => {
  it('should store a value for a defined key', () => {
    const stack = new CallStack.CallStackFrame();
    const key = 'KEY';
    const val = 123;
    stack.define(key);
    const retval = stack.set(key, 123);

    assert.equal(retval, true);
    assert.equal(stack.lookup(key), val);
  });

  it('should fail to store a value for an undefined key', () => {
    const stack = new CallStack.CallStackFrame();
    const retval = stack.set('KEY', 123);
    assert.equal(retval, false);
  });

  it('should store a value defined in a parent frame', () => {
    const parentFrame = new CallStack.CallStackFrame();
    const childFrame = new CallStack.CallStackFrame(parentFrame);
    const key = 'KEY';
    const val = 123;

    parentFrame.define(key);
    const retval = childFrame.set(key, val);

    assert.equal(retval, true);
    assert.equal(parentFrame.lookup(key), val);
  });

  it('should fail to store a value for an undefined key anywhere in the chain', () => {
    const parentFrame = new CallStack.CallStackFrame();
    const childFrame = new CallStack.CallStackFrame(parentFrame);
    const key = 'KEY';
    const val = 123;

    const retval = childFrame.set(key, val);
    assert.equal(retval, false);
  });

  it('should be able to return contents as an object', () => {
    const stack = new CallStack.CallStackFrame();

    stack.define('key1');
    stack.set('key1', 'val1')
    stack.define('key2');
    stack.set('key2', 'val2');
    assert.deepEqual(stack.asReturnObject(), {'KEY1':'val1', 'KEY2':'val2'});
  });
})
