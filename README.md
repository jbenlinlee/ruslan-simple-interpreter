# BNF
```
program : variable SEMI block DOT

block : declarations compound_statement

declarations : VAR (variable_declaration SEMI)+ (procedure_declaration)*
             | (procedure_declaration)*
             | empty

procedure_declaration : PROCEDURE ID SEMI block SEMI

variable_declaration : ID (COMMA ID)* COLON type_spec

type_spec : INTEGER | REAL

compound_statement : BEGIN statement_list END

statement_list : statement
               | statement SEMI statement_list

statement : compound_statement
          | assignment_statement
          | empty

assignment_statement : variable ASSIGN expr

variable : ID

expr : term ((ADD | SUB) term)*

term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*

factor : PLUS factor
       | MINUS factor
       | INTEGER_CONST
       | REAL_CONST
       | LPAREN expr RPAREN
       | variable
```
