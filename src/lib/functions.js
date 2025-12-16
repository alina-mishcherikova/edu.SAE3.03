export function competenceColorName(couleur) {
  if (couleur === "c1") return "comprendre";
  if (couleur === "c2") return "concevoir";
  if (couleur === "c3") return "exprimer";
  if (couleur === "c4") return "développer";
  if (couleur === "c5") return "entreprendre";
}

export function getFill(M, compId, value) {
  if (value === 0) return "var(--color-gray)";
  const couleur = M.getCompetenceColorCode(compId);
  const colorName = competenceColorName(couleur);
  return `var(--color-${colorName}-${value})`;
}

export function applyProgress(M, V, compId, niveauId, value) {
  V.arbre.setScaleValue(compId, niveauId, value);
  V.arbre.setIconFill(compId, niveauId, getFill(M, compId, value));
}

export function canEvaluateLevel(M, compId, niveauId) {
  const levelNum = Number(niveauId);
  if (levelNum !== 3) return true;

  const n1 = M.getProgress(compId, 1);
  const n2 = M.getProgress(compId, 2);

  return n1 + n2 >= 50;
}

export function isLevel3Locked(M, compId) {
  const n1 = M.getProgress(compId, 1);
  const n2 = M.getProgress(compId, 2);
  return n1 + n2 < 50;
}

export function applyLocksForAllCompetences(M, V) {
  for (let id in M.competenceData) {
    const c = M.competenceData[id];
    const compId = c.nom_court.toLowerCase();
    const locked = isLevel3Locked(M, compId);
    V.arbre.setLocked(compId, 3, locked);
  }
}
