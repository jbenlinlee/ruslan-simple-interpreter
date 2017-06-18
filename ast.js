module.exports.BinOpNode = class BinOpNode {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = 'BinOp';
  }
}

module.exports.IntegerNode = class IntegerNode {
  constructor(val, op) {
    this.val = val;
    this.op = op;
  }
}
