module.exports.BinOpNode = class BinOpNode {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

module.exports.IntegerNode = class IntegerNode {
  constructor(val) {
    this.val = val;
  }
}
