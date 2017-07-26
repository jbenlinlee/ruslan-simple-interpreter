PROGRAM testBoolean;
VAR
  a : BOOLEAN;
  b : BOOLEAN;
BEGIN
  a := false;
  IF (6 < 7) AND a THEN
    b := false
  ELSE
    b := true;
END.
