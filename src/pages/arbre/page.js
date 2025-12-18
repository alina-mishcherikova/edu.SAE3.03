import { ArbreView } from "@/ui/arbre";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { Animation } from "@/lib/animation";
import { PopUpView } from "@/ui/pop-up";
import {
  competenceColorName,
  applyProgress,
  isLevel3Locked,
  averagePercent,
  roundToStep,
  applyLocksForAllCompetences,
} from "@/lib/functions.js";
import { User } from "@/data/user.js";
import { pn } from "@/data/pn.js";

let M = {};
M.pn = pn;
M.user = new User();
M.user.load();

let C = {};

C.init = function () {
  return V.init();
};

//Ouvre le pop-up quand l'utilisateur clique sur un niveau dans le SVG
C.handler_clickCompetence = function (ev) {
  const level = V.arbre.getLevel(ev.target);
  if (!level) return;

  const competenceEl = V.arbre.getCompetence(level);
  if (!competenceEl) return;

  const compId = competenceEl.getAttribute("data-competence");
  const levelNumber = level.getAttribute("data-niveau");

  //niveau 3 a locked
  if (levelNumber == 3 && isLevel3Locked(M, compId) === true) {
    V.showLockMessage(
      ev,
      "Le niveau 3 est débloqué à partir de 50 % du total des niveaux 1 et 2",
    );
    return;
  }

  V.showPopUp(level, ev);
  Animation.selectLevel(level);
};

//Diminue l'opacité des autres branches au survol (effet focus)
C.handler_hoverCompetence = function (ev) {
  let branch = V.arbre.getCompetence(ev.target);
  if (!branch) return;
  if (branch.hasAttribute("data-niveau")) {
    branch = branch.closest("[data-competence]:not([data-niveau])");
    if (!branch || !V.arbre.dom().contains(branch)) return;
  }
  Animation.lowerOpacityBranches(V.rootPage, branch);
};

//Réinitialise l'opacité quand la souris quitte la branche
C.handler_leaveCompetence = function () {
  Animation.resetBranchesOpacity(V.rootPage);
};

let V = {
  rootPage: null,
  popUp: null,
  currentCompetence: null,
  currentLevel: null,
};

//Met à jour progress
V.handler_sliderChange = function (acEl) {
  const values = V.popupView.getAllSliderValues();
  const avg = averagePercent(values);
  const finalValue = roundToStep(avg, 10);

  //rajouter progress
  M.user.setProgress(V.currentCompetence, V.currentLevel, finalValue);
  applyProgress(M, V, V.currentCompetence, V.currentLevel, finalValue);

  V.popupView.setCompetenceEvaluation(finalValue);

  const couleur = M.pn.getCompetenceColor(V.currentCompetence);
  const colorName = competenceColorName(couleur);

  let finalFill = "var(--color-gray)";
  if (finalValue > 0) {
    finalFill = `var(--color-${colorName}-${finalValue})`;
  }

  V.arbre.setIconFill(V.currentCompetence, V.currentLevel, finalFill);

  const lock = isLevel3Locked(M, V.currentCompetence);
  V.arbre.setLocked(V.currentCompetence, 3, lock);

  const acCode = V.popupView.getAcCode(acEl);
  const acValue = V.popupView.getAcSliderValue(acEl);

  M.user.setAcProgress(V.currentCompetence, V.currentLevel, acCode, acValue);
  M.user.addHistory(V.currentCompetence, V.currentLevel, acCode, acValue);

  M.user.save();

  const historyItems = M.user.history.filter(
    (h) =>
      h.competenceId === V.currentCompetence && h.niveauId === V.currentLevel,
  );
  const lastFive = historyItems.slice(-5).reverse();
  V.popupView.renderHistory(lastFive);
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.arbre = new ArbreView();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.arbre.dom());

  V.applyStateToUI();

  V.attachEvents();
  V.animations();
  return V.rootPage;
};

V.attachEvents = function () {
  V.rootPage.addEventListener("click", C.handler_clickCompetence);
  V.rootPage.addEventListener("pointerover", C.handler_hoverCompetence);
  V.rootPage.addEventListener("pointerout", C.handler_leaveCompetence);

  const btnExport = V.rootPage.querySelector("[data-export-json]");
  if (btnExport !== null) {
    btnExport.addEventListener("click", () => {
      V.exportJSON();
    });
  }

  const btnImport = V.rootPage.querySelector("[data-import-json]");
  if (btnImport !== null) {
    btnImport.addEventListener("click", () => {
      V.openImportPicker();
    });
  }

  const input = V.rootPage.querySelector("[data-import-input]");
  if (input !== null) {
    input.addEventListener("change", async (ev) => {
      const target = ev.target;
      if (target === null) return;

      const files = target.files;
      if (files === null) return;
      if (files.length === 0) return;

      await V.handleImportFile(files[0]);
    });
  }
  const btnReset = V.rootPage.querySelector("[data-reset]");
  btnReset.addEventListener("click", () => {
    V.resetAll();
  });
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

V.resetAllProgressUI = function () {
  for (let i = 0; i < M.pn.length; i++) {
    const c = M.pn[i];
    const compId = c.nom_court.toLowerCase();

    for (let j = 0; j < c.niveaux.length; j++) {
      const niveauOrdre = c.niveaux[j].ordre;
      applyProgress(M, V, compId, niveauOrdre, 0);
    }
  }
};

//Applique l'état (progress) de l'utilisateur au SVG et met à jour les locks
V.applyStateToUI = function () {
  const progress = M.user.progress;

  for (let compId in progress) {
    for (let niveauId in progress[compId]) {
      applyProgress(M, V, compId, niveauId, progress[compId][niveauId]);
    }
  }

  applyLocksForAllCompetences(M, V);
};

// V.refreshPopupIfOpen = function () {
//   if (!V.popupView) return;

//   if (V.popupView.root === null) return;
//   if (V.popupView.root.isConnected !== true) return;

//   if (V.currentCompetence === null || V.currentLevel === null) return;

//   const existingValue = M.user.getProgress(V.currentCompetence, V.currentLevel);
//   V.popupView.setSliderValue(existingValue);

//   const items = [];
//   for (let i = 0; i < M.user.history.length; i++) {
//     const h = M.user.history[i];
//     if (
//       h.competenceId === V.currentCompetence &&
//       h.niveauId === V.currentLevel
//     ) {
//       items.push(h);
//     }
//   }

//   const last = items.slice(-5);
//   last.reverse();

//   V.popupView.renderHistory(last);
// };

V.showPopUp = function (levelEl) {
  const competenceEl = V.arbre.getCompetence(levelEl);
  if (!competenceEl) return;

  V.currentCompetence = competenceEl.getAttribute("data-competence");
  V.currentLevel = +levelEl.getAttribute("data-niveau");

  if (!V.popupView) {
    V.popupView = new PopUpView();
    V.popupView.bind(() => V.closePopUp(), V.handler_sliderChange);
  }

  const compName = M.pn.getCompetenceName(V.currentCompetence);
  const acs = M.pn.getAcs(V.currentCompetence, V.currentLevel);

  V.popupView.setCompetenceTitle(compName);
  V.popupView.setNiveauLabel(`Niveau ${V.currentLevel}`);
  V.popupView.renderACs(acs);

  const acEls = V.popupView.root.querySelectorAll(".ac");
  for (const acEl of acEls) {
    const acCode = V.popupView.getAcCode(acEl);
    const saved = M.user.getAcProgress(
      V.currentCompetence,
      V.currentLevel,
      acCode,
    );

    V.popupView.setAcSliderValue(acEl, saved);
  }

  const currentProgress = M.user.getProgress(
    V.currentCompetence,
    V.currentLevel,
  );
  V.popupView.setCompetenceEvaluation(currentProgress);

  const historyItems = M.user.history.filter(
    (h) =>
      h.competenceId === V.currentCompetence && h.niveauId === V.currentLevel,
  );
  const lastFive = historyItems.slice(-5).reverse();
  V.popupView.renderHistory(lastFive);

  V.popupView.pop(V.rootPage);
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

//Exporte progress + historique en fichier JSON
V.exportJSON = function () {
  // Données exportées = état utilisateur (progress + historique)
  const payload = M.user.exportPayload();

  // Conversion en texte JSON
  const text = JSON.stringify(payload, null, 2);

  // Fichier temporaire côté navigateur
  const file = new Blob([text], { type: "application/json" });

  // Lien pour déclencher le téléchargement
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "arbre-progress.json";

  // Démarre le téléchargement
  link.click();

  // Libère l'URL (propre)
  URL.revokeObjectURL(link.href);
};

//Ouvre le sélecteur de fichier pour importer un JSON
V.openImportPicker = function () {
  const input = V.rootPage.querySelector("[data-import-input]");
  if (input === null) {
    V.showToast("Import: input file introuvable.");
    return;
  }

  input.value = "";
  //file picker
  input.click();
};

//Lit le fichier JSON, valide, importe dans User, puis refresh le UI
V.handleImportFile = async function (file) {
  //Existe le fichier?
  if (file === null || file === undefined) {
    alert("Import annulé.");
    return;
  }
  //lire le fichier comme text
  let text;
  try {
    text = await file.text();
  } catch (e) {
    alert("Import: impossible de lire le fichier.");
    return;
  }

  //text -> js object
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    alert("Import: JSON invalide.");
    return;
  }
  //json = objet
  if (parsed === null || typeof parsed !== "object") {
    alert("Import: format invalide.");
    return;
  }

  const ok = M.user.importPayload(parsed);
  if (ok === false) {
    alert("Import: format invalide.");
    return;
  }

  V.resetAllProgressUI();
  V.applyStateToUI();
  alert("Import réussi");
};

//Supprime l'état utilisateur (progress + historique) et remet le UI à zéro
V.resetAll = function () {
  // supprimer tout
  M.user.reset();

  //reset UI
  V.resetAllProgressUI();
  applyLocksForAllCompetences(M, V);

  //close pop-up
  if (V.popupView) V.popupView.close();
  alert("Réinitialisation terminée ✅");
};

export function ArbrePage() {
  return C.init();
}
