PROGRAM testFunc;
VAR
  a : BOOLEAN;
FUNCTION myfunc(a : INTEGER) : BOOLEAN;
BEGIN
  if (a < 10) then myfunc := true else myfunc := false;
END;
BEGIN
 a := myfunc(10);
END.
