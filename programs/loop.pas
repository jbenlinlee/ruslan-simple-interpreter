PROGRAM loopTest;
VAR
  a : REAL;
  ctr : INTEGER;
BEGIN
  a := 0.0;
  ctr := 0;
  REPEAT
    BEGIN
      a := a + 0.25;
      ctr := ctr + 1;
    END
  UNTIL a >= 2.5
END.
