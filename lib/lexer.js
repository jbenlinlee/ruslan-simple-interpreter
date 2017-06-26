const Token = require('./token.js')

const TokenTypes = {
  PROGRAM: 'PROGRAM',
  VAR: 'VAR',
  INTEGER_CONST: 'INTEGER_CONST',
  REAL_CONST: 'REAL_CONST',
  TYPE_INTEGER: 'INTEGER',
  TYPE_REAL: 'REAL',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE_INTEGER: 'DIV',
  DIVIDE_REAL: 'DIVIDE_REAL',
  SUBEXPR_START: 'SUBEXPR_START',
  SUBEXPR_END: 'SUBEXPR_END',
  EOF: 'EOF',
  BEGIN: 'BEGIN',
  END: 'END',
  DOT: 'DOT',
  ASSIGN: 'ASSIGN',
  SEMI: 'SEMI',
  COLON: 'COLON',
  COMMA: 'COMMA',
  ID: 'ID'
};

module.exports.TokenTypes = TokenTypes;

const OperatorCharacterMap = new Map();
OperatorCharacterMap.set('+', TokenTypes.PLUS);
OperatorCharacterMap.set('-', TokenTypes.MINUS);
OperatorCharacterMap.set('*', TokenTypes.MULTIPLY);
OperatorCharacterMap.set('/', TokenTypes.DIVIDE_REAL);

module.exports.OperatorCharacterMap = OperatorCharacterMap;

const SubExprCharacterMap = new Map();
SubExprCharacterMap.set('(', TokenTypes.SUBEXPR_START);
SubExprCharacterMap.set(')', TokenTypes.SUBEXPR_END);

const ReservedWords = new Set([
  TokenTypes.PROGRAM,
  TokenTypes.VAR,
  TokenTypes.BEGIN,
  TokenTypes.END,
  TokenTypes.DIVIDE_INTEGER,
  TokenTypes.TYPE_INTEGER,
  TokenTypes.TYPE_REAL
]);

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
  scanInteger() {
    let finalInt = undefined;

    if (this.currentCharacter && Lexer.isDigit(this.currentCharacter)) {
      finalInt = 0;

      while (this.currentCharacter && Lexer.isDigit(this.currentCharacter)) {
        let parsedInt = Number.parseInt(this.currentCharacter);
        finalInt = (finalInt * 10) + parsedInt;
        this.advance();
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
      if (insensitiveId == TokenTypes.DIVIDE_INTEGER) {
        // 'DIV' is a special case of a reserved word
        return new Token(TokenTypes.DIVIDE_INTEGER, id);
      }

      return new Token(insensitiveId, id);
    } else {
      return new Token(TokenTypes.ID, id);
    }
  }

  getNextToken() {
    // Skip any whitespace and comments to get to the next non-whitespace char
    this.skipWhitespace();
    this.skipComments();
    this.skipWhitespace();

    if (this.currentCharacter === undefined) {
      // May have walked off the end of the input while processing whitespace and comments
      return new Token(TokenTypes.EOF, null);
    } else if (!Number.isNaN(Number.parseInt(this.currentCharacter))) {
      // Handle integers
      return new Token(TokenTypes.INTEGER_CONST, this.scanInteger());
    } else if (OperatorCharacterMap.has(this.currentCharacter)) {
      // Handle single character operators
      let tok = new Token(OperatorCharacterMap.get(this.currentCharacter), this.currentCharacter);
      this.advance();
      return tok;
    } else if (this.currentCharacter === ':' && this.peek() === '=') {
      this.advance();
      this.advance();
      return new Token(TokenTypes.ASSIGN, ':=');
    } else if (this.currentCharacter === ';') {
      this.advance();
      return new Token(TokenTypes.SEMI, ';');
    } else if (this.currentCharacter === '.') {
      this.advance();
      return new Token(TokenTypes.DOT, '.');
    } else if (this.currentCharacter === ':') {
      this.advance();
      return new Token(TokenTypes.COLON, ':');
    } else if (this.currentCharacter === ',') {
      this.advance();
      return new Token(TokenTypes.COMMA, ',');
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
  }

  getCurrentCharacter() {
    return this.currentCharacter;
  }
}
