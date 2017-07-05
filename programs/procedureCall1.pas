PROGRAM procedure1;
VAR
  x : INTEGER;

PROCEDURE myproc(a : INTEGER);
BEGIN
  x := a * 3;
END;

BEGIN
  myproc(5 + 2 * 3);
END.
