module.exports.CallStackFrame = class CallStackFrame {
  constructor(parentFrame, symbolTable) {
    this.parentFrame = parentFrame;
    this.symbolValues = new Map();
    this.symbolTable = symbolTable;
  }

  define(name) {
    const insensitiveName = name.toUpperCase();
    this.symbolValues.set(insensitiveName, undefined);
  }

  set(name, val) {
    let insensitiveName = name.toUpperCase();
    if (this.symbolValues.has(insensitiveName)) {
      this.symbolValues.set(insensitiveName, val);
      return true;
    } else if (this.parentFrame) {
      return this.parentFrame.set(name, val);
    } else {
      return false;
    }
  }

  lookup(name) {
    let insensitiveName = name.toUpperCase();
    let val = this.symbolValues.get(insensitiveName);
    if (val !== undefined) {
      return val;
    } else if (this.parentFrame) {
      return this.parentFrame.lookup(insensitiveName);
    } else {
      return undefined;
    }
  }

  asReturnObject() {
    let obj = {};
    for (let entry of this.symbolValues.entries()) {
      obj[entry[0]] = entry[1];
    }

    return obj;
  }
}
