This repo contains code related to [Ruslan Spivak's "Let's Build a Simple Interpreter"
series](https://ruslanspivak.com/lsbasi-part1/).

# BNF
```
program : variable SEMI block DOT

block : declarations compound_statement

declarations : (VAR (variable_declaration SEMI)+)* (procedure_declaration | function_declaration)*
             | empty

procedure_declaration : PROCEDURE ID (LPAREN formal_parameter_declaration (SEMI formal_parameter_declaration)* RPAREN)? SEMI block SEMI

function_declaration : FUNCTION ID (LPAREN formal_parameter_declaration (SEMI formal_parameter_declaration)* RPAREN)? COLON type_spec SEMI block SEMI

formal_parameter_declaration : variable_declaration

variable_declaration : ID (COMMA ID)* COLON type_spec

type_spec : INTEGER | REAL | BOOLEAN

compound_statement : BEGIN statement_list END

statement_list : statement
               | statement SEMI statement_list

statement : compound_statement
          | assignment_statement
          | procedure_call
          | conditional_statement
          | while_statement
          | repeat_statement
          | empty

assignment_statement : variable ASSIGN expr

procedure_call : procedure (LPAREN expr (COMMA expr)* RPAREN)?

function_call : function LPAREN ((expr (COMMA expr)*)? | empty) RPAREN

conditional_statement : IF boolean_expr THEN statement (ELSE statement)?

while_statement : WHILE boolean_expr DO statement

repeat_statement : REPEAT statement UNTIL boolean_expr

variable : ID

procedure : ID

function : ID

boolean_expr : expr ((LT | GT | LEQ | GEQ | EQ | NEQ) expr)?

expr : term ((ADD | SUB | OR) term)*

term : factor ((MUL | INTEGER_DIV | FLOAT_DIV | AND) factor)*

factor : PLUS factor
       | MINUS factor
       | NOT factor
       | INTEGER_CONST
       | REAL_CONST
       | BOOLEAN_CONST
       | LPAREN boolean_expr RPAREN
       | function_call
       | variable
```
