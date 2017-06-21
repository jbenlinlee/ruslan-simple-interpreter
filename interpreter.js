const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const AST = require('./ast.js');

module.exports = class Interpreter {
  static eval(stmt) {
    const parser = new Parser(stmt);
    const astree = parser.parse();

    // Use the AST to calculate the final result
    return AST.Visitor.eval(astree);
  }
}
