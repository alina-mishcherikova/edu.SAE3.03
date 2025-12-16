import { ArbreView } from "@/ui/arbre";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "../../lib/animation";
import { PopUpView } from "@/ui/pop-up";

import { saveProgress, loadProgress } from "@/lib/storage.js";
import { loadHistory, saveHistory } from "@/lib/storage.js";

import {
  competenceColorName,
  applyProgress,
  canEvaluateLevel,
  isLevel3Locked,
  applyLocksForAllCompetences,
} from "@/lib/functions.js";

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
M.history = {};

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

M.addHistory = function (competenceId, niveauId, value) {
  M.history.push({
    date: new Date().toISOString(),
    competenceId,
    niveauId,
    value,
  });
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

  const cssVar = `var(--color-${colorName}-${value})`;
  let finalFill;
  if (value === 0) {
    finalFill = "var(--color-gray)";
  } else finalFill = cssVar;

  V.arbre.setIconFill(V.currentCompetence, V.currentLevel, finalFill);

  const lock = isLevel3Locked(M, V.currentCompetence);
  V.arbre.setLocked(V.currentCompetence, 3, lock);

  saveProgress(M.state);

  M.addHistory(V.currentCompetence, V.currentLevel, value);

  saveHistory(M.history);
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.arbre = new ArbreView();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.arbre.dom());

  M.state = loadProgress();
  M.history = loadHistory();

  for (let compId in M.state) {
    for (let niveauId in M.state[compId]) {
      applyProgress(M, V, compId, niveauId, M.state[compId][niveauId]);
    }
  }

  applyLocksForAllCompetences(M, V);

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

  if (!canEvaluateLevel(M, V.currentCompetence, V.currentLevel)) {
    V.showLockMessage(
      ev,
      "Accès au Niveau 3 : Pour déverrouiller l'évaluation du Niveau 3, vous devez obtenir un score cumulé d'au moins 50 % sur l'ensemble des Niveaux 1 et 2. Finalisez les évaluations précédentes. Le Niveau 3 sera alors automatiquement accessible.",
    );
    return;
  }

  if (!V.popupView) {
    V.popupView = new PopUpView();
    V.popupView.bind(V.closePopUp, V.handler_sliderChange);
  }

  const existingValue = M.getProgress(V.currentCompetence, V.currentLevel);
  V.popupView.setSliderValue(existingValue);

  const acs = M.getAcs(V.currentCompetence, V.currentLevel);
  const competenceName = M.getCompetenceName(V.currentCompetence);
  const niveauLabel = M.getNiveauLabel(V.currentCompetence, V.currentLevel);

  V.popupView.renderACs(acs);
  const historyForLevel = M.history
    .filter(
      (h) =>
        h.competenceId === V.currentCompetence && h.niveauId === V.currentLevel,
    )
    .slice(-10)
    .reverse();

  V.popupView.renderHistory(historyForLevel);

  V.popupView.setCompetenceTitle(competenceName);
  V.popupView.setNiveauLabel(niveauLabel);

  V.popupView.pop(V.rootPage);
  V.popupView.placeNearCursor(ev);
};

V.closePopUp = function () {
  if (V.popupView) V.popupView.close();
};

V.showLockMessage = function (ev, text) {
  const msg = document.createElement("div");
  msg.className = "lock-message";
  msg.textContent = text;

  V.rootPage.appendChild(msg);

  let x = 20;
  let y = 20;

  if (ev && ev.clientX !== undefined) {
    x = ev.clientX;
  }

  if (ev && ev.clientY !== undefined) {
    y = ev.clientY;
  }

  msg.style.left = x + 16 + "px";
  msg.style.top = y + 16 + "px";

  setTimeout(() => {
    if (msg.parentNode) msg.parentNode.removeChild(msg);
  }, 2000);
};

export function ArbrePage() {
  return C.init();
}
