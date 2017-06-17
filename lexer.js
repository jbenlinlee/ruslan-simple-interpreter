const Token = require('./token.js')

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MULTIPLY = 'MULTIPLY';
const DIVIDE = 'DIVIDE';
const SUBEXPR_START = '(';
const SUBEXPR_END = ')'
const EOF = 'EOF';

const OperatorCharacterMap = new Map();
OperatorCharacterMap.set('+', PLUS);
OperatorCharacterMap.set('-', MINUS);
OperatorCharacterMap.set('*', MULTIPLY);
OperatorCharacterMap.set('/', DIVIDE);

const SubExprCharacterMap = new Map();
SubExprCharacterMap.set('(', SUBEXPR_START);
SubExprCharacterMap.set(')', SUBEXPR_END);

module.exports.INTEGER = INTEGER;
module.exports.PLUS = PLUS;
module.exports.MINUS = MINUS;
module.exports.MULTIPLY = MULTIPLY;
module.exports.DIVIDE = DIVIDE;
module.exports.SUBEXPR_START = SUBEXPR_START;
module.exports.SUBEXPR_END = SUBEXPR_END;
module.exports.EOF = EOF;

module.exports.Lexer = class Lexer {
  constructor(expr) {
    this.expr = expr || "";
    this.pos = 0;
    this.currentCharacter = this.expr.charAt(this.pos);
    this.currentToken = undefined;
  }

  // Get next character
  advance() {
    this.pos++;
    if (this.pos < this.expr.length) {
      this.currentCharacter = this.expr.charAt(this.pos);
    } else {
      this.currentCharacter = undefined;
    }
  }

  // Scan to next non-whitespace
  skipWhitespace() {
    while (this.currentCharacter === ' ') {
      this.advance();
    }
  }

  // Scan in an entire integer
  scanInteger() {
    let finalInt = undefined;

    if (this.currentCharacter) {
      let parsedInt = Number.parseInt(this.currentCharacter);
      finalInt = 0;
      while (!Number.isNaN(parsedInt)) {
        finalInt = (finalInt * 10) + parsedInt;
        this.advance();
        parsedInt = Number.parseInt(this.currentCharacter);
      }
    }

    return finalInt;
  }

  getNextToken() {
    if (this.pos < this.expr.length) {
      // Skip any whitespace to get to the next non-whitespace char
      this.skipWhitespace();

      if (!Number.isNaN(Number.parseInt(this.currentCharacter))) {
        return new Token(INTEGER, this.scanInteger());
      } else if (OperatorCharacterMap.has(this.currentCharacter)) {
        let tok = new Token(OperatorCharacterMap.get(this.currentCharacter), this.currentCharacter);
        this.advance();
        return tok;
      } else if (SubExprCharacterMap.has(this.currentCharacter)) {
        let tok = new Token(SubExprCharacterMap.get(this.currentCharacter), this.currentCharacter);
        this.advance();
        return tok;
      } else {
        console.error(`Unexpected token at ${this.pos}: ${this.currentCharacter}`);
        return null;
      }
    } else {
      return new Token(EOF, null);
    }
  }

  getCurrentCharacter() {
    return this.currentCharacter;
  }
}
