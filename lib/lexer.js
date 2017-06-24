const Token = require('./token.js')

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MULTIPLY = 'MULTIPLY';
const DIVIDE = 'DIV';
const SUBEXPR_START = '(';
const SUBEXPR_END = ')';
const EOF = 'EOF';
const BEGIN = 'BEGIN';
const END = 'END';
const DOT = '.';
const ASSIGN = ':=';
const SEMI = ';';
const ID = 'ID';

const OperatorCharacterMap = new Map();
OperatorCharacterMap.set('+', PLUS);
OperatorCharacterMap.set('-', MINUS);
OperatorCharacterMap.set('*', MULTIPLY);

const SubExprCharacterMap = new Map();
SubExprCharacterMap.set('(', SUBEXPR_START);
SubExprCharacterMap.set(')', SUBEXPR_END);

const ReservedWords = new Set([BEGIN, END, DIVIDE]);

module.exports.INTEGER = INTEGER;
module.exports.PLUS = PLUS;
module.exports.MINUS = MINUS;
module.exports.MULTIPLY = MULTIPLY;
module.exports.DIVIDE = DIVIDE;
module.exports.SUBEXPR_START = SUBEXPR_START;
module.exports.SUBEXPR_END = SUBEXPR_END;
module.exports.EOF = EOF;
module.exports.BEGIN = BEGIN;
module.exports.END = END;
module.exports.DOT = DOT;
module.exports.ASSIGN = ASSIGN;
module.exports.SEMI = SEMI;
module.exports.ID = ID;

module.exports.OperatorCharacterMap = OperatorCharacterMap;

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

  // Return the next character without consuming the current character
  peek() {
    const peekPos = this.pos + 1;
    if (peekPos < this.expr.length) {
      return this.expr.charAt(peekPos);
    } else {
      return undefined;
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

  static isAlphaNumeric(char) {
    const code = char.charCodeAt(0);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha
        !(code > 96 && code < 123) && // lower alphanumeric
        !(code == 95)) { // underscore
          return false;
    }

    return true;
  }

  // Scan an alphanumeric string
  scanAlphaNumeric() {
    let chars = [];

    while (this.currentCharacter && Lexer.isAlphaNumeric(this.currentCharacter)) {
      chars.push(this.currentCharacter);
      this.advance();
    }

    return chars.join('');
  }

  idToken() {
    let id = this.scanAlphaNumeric();
    let insensitiveId = id.toUpperCase();

    if (ReservedWords.has(insensitiveId)) {
      if (insensitiveId == DIVIDE) {
        return new Token(DIVIDE, id);
      }
      return new Token(id, id);
    } else {
      return new Token(ID, id);
    }
  }

  getNextToken() {
    if (this.pos < this.expr.length) {
      // Skip any whitespace to get to the next non-whitespace char
      this.skipWhitespace();

      if (!Number.isNaN(Number.parseInt(this.currentCharacter))) {
        // Handle integers
        return new Token(INTEGER, this.scanInteger());
      } else if (OperatorCharacterMap.has(this.currentCharacter)) {
        // Handle single character operators
        let tok = new Token(OperatorCharacterMap.get(this.currentCharacter), this.currentCharacter);
        this.advance();
        return tok;
      } else if (this.currentCharacter === ':' && this.peek() === '=') {
        this.advance();
        this.advance();
        return new Token(ASSIGN, ':=');
      } else if (this.currentCharacter === ';') {
        this.advance();
        return new Token(SEMI, ';');
      } else if (this.currentCharacter === '.') {
        this.advance();
        return new Token(DOT, '.');
      } else if (SubExprCharacterMap.has(this.currentCharacter)) {
        // Handle lparen / rparen
        let tok = new Token(SubExprCharacterMap.get(this.currentCharacter), this.currentCharacter);
        this.advance();
        return tok;
      } else if (Lexer.isAlphaNumeric(this.currentCharacter)) {
        // Handle reserved words and identifiers
        return this.idToken();
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
