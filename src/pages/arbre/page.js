import { ArbreView } from "@/ui/arbre";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "../../lib/animation";
import { PopUpView } from "@/ui/pop-up";

const STORAGE_KEY = "progress_v1";

let M = {};

let response = await fetch("/src/data/data.json");

M.competenceData = await response.json();

M.getAcs = function (competenceId, niveauId) {
  for (let id in M.competenceData) {
    const competence = M.competenceData[id];
    if (competence.nom_court.toLowerCase() === competenceId) {
      for (let n of competence.niveaux) {
        if (n.ordre == niveauId) {
          return n.acs;
        }
      }
    }
  }
  return [];
};

M.getCompetenceName = function (competenceId) {
  for (let id in M.competenceData) {
    const competence = M.competenceData[id];
    if (competence.nom_court.toLowerCase() === competenceId) {
      return competence.nom_court;
    }
  }

  return competenceId;
};

M.getNiveauLabel = function (competenceId, niveauId) {
  for (let id in M.competenceData) {
    const competence = M.competenceData[id];

    if (competence.nom_court.toLowerCase() === competenceId) {
      return competence.niveaux[niveauId - 1].ordre;
    }
  }

  return niveauId;
};

M.getCompetenceColorCode = function (competenceId) {
  for (let id in M.competenceData) {
    const c = M.competenceData[id];
    if (c.nom_court.toLowerCase() === competenceId) {
      return c.couleur;
    }
  }
};

//pour ajouter tout les données
M.state = {};

M.setProgress = function (competenceId, niveauId, value) {
  if (M.state[competenceId] === undefined) {
    M.state[competenceId] = {};
  }
  M.state[competenceId][niveauId] = value;
};

M.getProgress = function (competenceId, niveauId) {
  if (M.state[competenceId] === undefined) return 0;
  const v = M.state[competenceId][niveauId];
  if (v === undefined || v === null) return 0;
  return v;
};

M.saveProgress = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(M.state));
};

M.loadProgress = function () {
  // Récupère les données sauvegardées dans le localStorage
  const data = localStorage.getItem(STORAGE_KEY);

  // S'il n'y a aucune donnée sauvegardée, on initialise un état vide
  if (data === null) {
    M.state = {};
    return;
  }
  try {
    // On transforme la chaîne JSON en objet JavaScript
    M.state = JSON.parse(data);
  } catch (e) {
    // Si le JSON est invalide ou corrompu,
    // on réinitialise l'état pour éviter une erreur bloquante
    M.state = {};
  }
};

let C = {};

C.init = function () {
  return V.init();
};

C.handler_clickCompetence = function (ev) {
  const level = V.arbre.getLevel(ev.target);
  if (!level) return;
  V.showPopUp(level, ev);
  Animation.selectLevel(level);
};

C.handler_hoverCompetence = function (ev) {
  let branch = V.arbre.getCompetence(ev.target);
  if (!branch) return;
  if (branch.hasAttribute("data-niveau")) {
    branch = branch.closest("[data-competence]:not([data-niveau])");
    if (!branch || !V.arbre.dom().contains(branch)) return;
  }
  Animation.lowerOpacityBranches(V.rootPage, branch);
};

C.handler_leaveCompetence = function () {
  Animation.resetBranchesOpacity(V.rootPage);
};

let V = {
  rootPage: null,
  popUp: null,
  currentCompetence: null,
  currentLevel: null,
};

V.handler_sliderChange = function (ev) {
  const value = Math.ceil(ev.target.value / 10) * 10;
  M.setProgress(V.currentCompetence, V.currentLevel, value);
  V.arbre.setScaleValue(V.currentCompetence, V.currentLevel, value);

  const couleur = M.getCompetenceColorCode(V.currentCompetence);
  const colorName = competenceColorName(couleur);

  const step = value;
  const cssVar = `var(--color-${colorName}-${step})`;

  let finalFill;
  if (value === 0) {
    finalFill = "var(--color-gray)";
  } else {
    finalFill = cssVar;
  }
  V.arbre.setIconFill(V.currentCompetence, V.currentLevel, finalFill);

  M.saveProgress();
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.arbre = new ArbreView();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.arbre.dom());

  M.loadProgress();

  for (let compId in M.state) {
    for (let niveauId in M.state[compId]) {
      applyProgress(compId, niveauId, M.state[compId][niveauId]);
    }
  }

  V.attachEvents();
  V.animations();
  return V.rootPage;
};

V.attachEvents = function () {
  V.rootPage.addEventListener("click", C.handler_clickCompetence);
  V.rootPage.addEventListener("pointerover", C.handler_hoverCompetence);
  V.rootPage.addEventListener("pointerout", C.handler_leaveCompetence);
};

V.animations = function () {
  const fistLine = V.rootPage.querySelectorAll("#line__direction");
  Animation.buildPrimaryLine(fistLine);
  const secondaryLine = V.rootPage.querySelectorAll(
    "#line__direction-secondary",
  );
  Animation.buildSecondaryLine(secondaryLine);
  const tertiaryLine = V.rootPage.querySelectorAll("#line__direction-tertiary");
  Animation.buildTertiaryLine(tertiaryLine);

  const curves = V.rootPage.querySelectorAll("#line__direction-curved");
  Animation.buildCurvedLine(curves);
};

V.showPopUp = function (level, ev) {
  const competenceEl = V.arbre.getCompetence(level);
  V.currentCompetence = competenceEl.getAttribute("data-competence");
  V.currentLevel = level.getAttribute("data-niveau");

  if (!V.popupView) {
    V.popupView = new PopUpView();
    V.popupView.bind(V.closePopUp, V.handler_sliderChange);
  }

  const existingValue = M.getProgress(V.currentCompetence, V.currentLevel);
  V.popupView.setSliderValue(existingValue);

  const acs = M.getAcs(V.currentCompetence, V.currentLevel);
  const competenceName = M.getCompetenceName(V.currentCompetence);
  const niveauLabel = M.getNiveauLabel(V.currentCompetence, V.currentLevel);

  V.popupView.setSliderValue(existingValue);
  V.popupView.renderACs(acs);
  V.popupView.setCompetenceTitle(competenceName);
  V.popupView.setNiveauLabel(niveauLabel);

  V.popupView.pop(V.rootPage);
  V.popupView.placeNearCursor(ev);
};

V.closePopUp = function () {
  if (V.popupView) V.popupView.close();
};

function competenceColorName(couleur) {
  if (couleur === "c1") return "comprendre";
  if (couleur === "c2") return "concevoir";
  if (couleur === "c3") return "exprimer";
  if (couleur === "c4") return "développer";
  if (couleur === "c5") return "entreprendre";
}

function getFill(compId, value) {
  if (value === 0) return "var(--color-gray)";

  const couleur = M.getCompetenceColorCode(compId);
  const colorName = competenceColorName(couleur);
  return `var(--color-${colorName}-${value})`;
}

function applyProgress(compId, niveauId, value) {
  V.arbre.setScaleValue(compId, niveauId, value);
  V.arbre.setIconFill(compId, niveauId, getFill(compId, value));
}

export function ArbrePage() {
  return C.init();
}
