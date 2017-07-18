const Token = require('./token.js')

const TokenTypes = {
  PROGRAM: 'PROGRAM',
  VAR: 'VAR',
  INTEGER_CONST: 'INTEGER_CONST',
  REAL_CONST: 'REAL_CONST',
  TYPE_INTEGER: 'INTEGER',
  TYPE_REAL: 'REAL',
  TYPE_BOOLEAN: 'BOOLEAN',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  NOT: 'NOT',
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',
  MULTIPLY: 'MULTIPLY',
  DIVIDE_INTEGER: 'DIV',
  DIVIDE_REAL: 'DIVIDE_REAL',
  BOOLEAN_CONST: 'BOOLEAN_CONST',
  TRUE_CONST: 'TRUE',
  FALSE_CONST: 'FALSE',
  GT: 'GT',
  LT: 'LT',
  EQ: 'EQ',
  GEQ: 'GEQ',
  LEQ: 'LEQ',
  NEQ: 'NEQ',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  PROCEDURE: 'PROCEDURE',
  EOF: 'EOF',
  BEGIN: 'BEGIN',
  END: 'END',
  IF: 'IF',
  THEN: 'THEN',
  ELSE: 'ELSE',
  WHILE: 'WHILE',
  DO: 'DO',
  REPEAT: 'REPEAT',
  UNTIL: 'UNTIL',
  DOT: 'DOT',
  ASSIGN: 'ASSIGN',
  SEMI: 'SEMI',
  COLON: 'COLON',
  COMMA: 'COMMA',
  ID: 'ID'
};

module.exports.TokenTypes = TokenTypes;

const LexemeTokenMap = new Map([
  ['(', TokenTypes.LPAREN],
  [')', TokenTypes.RPAREN],
  ['+', TokenTypes.PLUS],
  ['-', TokenTypes.MINUS],
  ['*', TokenTypes.MULTIPLY],
  ['/', TokenTypes.DIVIDE_REAL],
  ['DIV', TokenTypes.DIVIDE_INTEGER],
  [';', TokenTypes.SEMI],
  [':', TokenTypes.COLON],
  [',', TokenTypes.COMMA],
  ['.', TokenTypes.DOT],
  ['>', TokenTypes.GT],
  ['<', TokenTypes.LT],
  ['=', TokenTypes.EQ],
  ['>=', TokenTypes.GEQ],
  ['<=', TokenTypes.LEQ],
  ['<>', TokenTypes.NEQ],
  ['NOT', TokenTypes.NOT],
  ['AND', TokenTypes.AND],
  ['OR', TokenTypes.OR],
  ['XOR', TokenTypes.XOR]
]);

module.exports.LexemeTokenMap = LexemeTokenMap;

const SubExprCharacterMap = new Map();
SubExprCharacterMap.set('(', TokenTypes.LPAREN);
SubExprCharacterMap.set(')', TokenTypes.RPAREN);

const ReservedWords = new Set([
  TokenTypes.PROGRAM,
  TokenTypes.VAR,
  TokenTypes.BEGIN,
  TokenTypes.END,
  TokenTypes.IF,
  TokenTypes.THEN,
  TokenTypes.ELSE,
  TokenTypes.WHILE,
  TokenTypes.DO,
  TokenTypes.REPEAT,
  TokenTypes.UNTIL,
  TokenTypes.DIVIDE_INTEGER,
  TokenTypes.TYPE_INTEGER,
  TokenTypes.TYPE_REAL,
  TokenTypes.TYPE_BOOLEAN,
  TokenTypes.TRUE_CONST,
  TokenTypes.FALSE_CONST,
  TokenTypes.NOT,
  TokenTypes.AND,
  TokenTypes.OR,
  TokenTypes.XOR,
  TokenTypes.PROCEDURE
]);

module.exports.Lexer = class Lexer {
  constructor(expr) {
    this.expr = expr || "";
    this.pos = 0;
    this.currentCharacter = this.expr.charAt(this.pos);
    this.currentToken = undefined;
  }

  // Get next character
  advance(numChars) {
    const skipChars = numChars || 1;

    this.pos += skipChars;
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

  static isWhitespace(str) {
    const code = str.charCodeAt(0);
    if (!(code === 9) &&  // horizontal tab
        !(code === 10) && // line feed
        !(code === 11) && // vertical tab
        !(code === 12) && // form feed
        !(code === 13) && // carriage return
        !(code === 32)) { // space
      return false;
    }

    return true;
  }

  // Scan to next non-whitespace
  skipWhitespace() {
    while (this.currentCharacter && Lexer.isWhitespace(this.currentCharacter)) {
      this.advance();
    }
  }

  skipComments() {
    if (this.currentCharacter === '{') {
      this.advance();
      while (this.currentCharacter !== undefined && this.currentCharacter !== '}') {
        this.advance();
      }
      this.advance();
    }
  }

  static isDigit(str) {
    const code = str.charCodeAt(0);
    if (!(code > 47 && code < 58)) {
      return false;
    }

    return true;
  }

  // Scan in an entire integer
  scanNumber(acceptDecimal) {
    let finalInt = undefined;

    if (this.currentCharacter && Lexer.isDigit(this.currentCharacter)) {
      let finalNum = 0;
      let type = TokenTypes.INTEGER_CONST;

      while (this.currentCharacter && Lexer.isDigit(this.currentCharacter)) {
        let parsedInt = Number.parseInt(this.currentCharacter);
        finalNum = (finalNum * 10) + parsedInt;
        this.advance();
      }

      // Read the decimal part
      if (acceptDecimal && this.currentCharacter === '.') {
        type = TokenTypes.REAL_CONST;
        this.advance();
        const startPos = this.pos;
        let decimalPart = this.scanNumber(false).val;
        const digitsRead = this.pos - startPos;

        // 123.456 = 123 + (456 / 10^3)
        finalNum = finalNum + (decimalPart / Math.pow(10.0, digitsRead));
      }

      return new Token(type, finalNum);
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
      if (insensitiveId == TokenTypes.DIVIDE_INTEGER) {
        // 'DIV' is a special case of a reserved word
        return new Token(TokenTypes.DIVIDE_INTEGER, id);
      } else if (insensitiveId == TokenTypes.TRUE_CONST) {
        // 'TRUE' should result in a boolean_const token
        return new Token(TokenTypes.BOOLEAN_CONST, true);
      } else if (insensitiveId == TokenTypes.FALSE_CONST) {
        // 'TRUE' should result in a boolean_const token
        return new Token(TokenTypes.BOOLEAN_CONST, false);
      }

      return new Token(insensitiveId, id);
    } else {
      return new Token(TokenTypes.ID, id);
    }
  }

  getNextToken() {
    // Skip any whitespace and comments to get to the next non-whitespace char
    while (this.currentCharacter !== undefined &&
            (Lexer.isWhitespace(this.currentCharacter) ||
             this.currentCharacter === '{')) {
      this.skipWhitespace();
      this.skipComments();
    }

    if (this.currentCharacter === undefined) {
      // May have walked off the end of the input while processing whitespace and comments
      return new Token(TokenTypes.EOF, null);
    } else if (Lexer.isDigit(this.currentCharacter)) {
      // Handle numbers, on entry allow scanning reals
      return this.scanNumber(true);
    } else if (this.currentCharacter === ':' && this.peek() === '=') {
      // Handle assignments - this needs to happen here so that we don't
      // mistake the ':' as a COLON operator
      this.advance(2);
      return new Token(TokenTypes.ASSIGN, ':=');
    } else if (this.currentCharacter === '>' && this.peek() === '=') {
      this.advance(2);
      return new Token(TokenTypes.GEQ, '>=');
    } else if (this.currentCharacter === '<' && this.peek() === '=') {
      this.advance(2);
      return new Token(TokenTypes.LEQ, '<=');
    } else if (this.currentCharacter === '<' && this.peek() === '>') {
      this.advance(2);
      return new Token(TokenTypes.NEQ, '<>');
    } else if (Lexer.isAlphaNumeric(this.currentCharacter)) {
      // Handle reserved words and identifiers
      return this.idToken();
    } else if (LexemeTokenMap.has(this.currentCharacter)) {
      // Handle single character lexemes
      let tok = new Token(LexemeTokenMap.get(this.currentCharacter), this.currentCharacter);
      this.advance();
      return tok;
    } else {
      console.error(`Unexpected token at ${this.pos}: ${this.currentCharacter}`);
      return null;
    }
  }

  getCurrentCharacter() {
    return this.currentCharacter;
  }
}
