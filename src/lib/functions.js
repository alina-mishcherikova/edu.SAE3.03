export function competenceColorName(couleur) {
  if (couleur === "c1") return "comprendre";
  if (couleur === "c2") return "concevoir";
  if (couleur === "c3") return "exprimer";
  if (couleur === "c4") return "développer";
  if (couleur === "c5") return "entreprendre";
}

export function getFill(M, compId, value) {
  if (value === 0) return "var(--color-gray)";

  const couleur = M.pn.getCompetenceColor(compId);
  const colorName = competenceColorName(couleur);

  return `var(--color-${colorName}-${value})`;
}

export function applyProgress(M, V, compId, niveauId, value) {
  V.arbre.setScaleValue(compId, niveauId, value);
  V.arbre.setIconFill(compId, niveauId, getFill(M, compId, value));
}

export function isLevel3Locked(M, compId) {
  const n1 = M.user.getProgress(compId, 1);
  const n2 = M.user.getProgress(compId, 2);
  return n1 + n2 < 50;
}

export function applyLocksForAllCompetences(M, V) {
  const data = M.pn;

  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    const compId = c.nom_court.toLowerCase();
    const locked = isLevel3Locked(M, compId);

    V.arbre.setLocked(compId, 3, locked);
  }
}

export function roundToStep(value, step = 10) {
  const n = +value;
  if (n !== n) return 0;

  const rounded = Math.round(n / step) * step;
  if (rounded > 100) {
    return 100;
  } else return rounded;
}

export function averagePercent(values) {
  if (!values || values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += +values[i];
  }
  return sum / values.length;
}
