-- Compatibility view for backend versions that still query established_meteor_showers.
-- The canonical shower catalog is meteor_showers.
DROP VIEW IF EXISTS established_meteor_showers;

CREATE VIEW established_meteor_showers AS
SELECT
  LP,
  IAUNo,
  AdNo,
  Code,
  Status,
  SubDate,
  ShowerNameDesignation,
  Activity,
  LoSb,
  LoSe,
  LoS,
  Ra,
  De,
  dRa,
  dDe,
  Vg,
  LoR,
  S_LoR,
  LaR,
  Theta,
  Phi,
  Flags,
  A,
  Q,
  E,
  Peri,
  Node,
  Incl,
  N,
  GroupIAU,
  CG,
  Origin,
  Remarks,
  OTe,
  LookupTable,
  ReferencesInfo
FROM meteor_showers;
