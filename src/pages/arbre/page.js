import { ArbreView } from "@/ui/arbre";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { Animation } from "@/lib/animation";
import { PopUpView } from "@/ui/pop-up";
import { HistoryView } from "@/ui/historique";
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

  if (finalValue === 100) {
    const levelEl = V.rootPage.querySelector(
      `g[data-competence="${V.currentCompetence}"][data-niveau="${V.currentLevel}"]`,
    );

    if (levelEl) {
      const scaleTextGroup = levelEl.querySelector("#scale__text");
      if (scaleTextGroup) {
        Animation.sparkleEffect(scaleTextGroup, couleur);
      }
    }
  }
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
  btnExport.addEventListener("click", () => {
    V.exportJSON();
  });

  const btnImport = V.rootPage.querySelector("[data-import-json]");
  btnImport.addEventListener("click", () => {
    V.openImportPicker();
  });

  const btnHistory = V.rootPage.querySelector("[data-history]");
  btnHistory.addEventListener("click", () => {
    V.openHistory();
  });

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

  const mmiText = V.rootPage.querySelector("#mmi");
  if (mmiText) {
    Animation.typewriterText(mmiText, 2);
  }

  const animatedTexts = V.rootPage.querySelectorAll(".text__animation");
  if (animatedTexts && animatedTexts.length > 0) {
    animatedTexts.forEach((textEl, index) => {
      setTimeout(() => {
        Animation.typewriterText(textEl, 1.5);
      }, index * 500);
    });
  }

  const pattern = V.rootPage.querySelector("#pattern");
  if (pattern) {
    Animation.pixelatePatternWave(pattern, 1.5);
  }
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

V.applyStateToUI = function () {
  const progress = M.user.progress;

  for (let compId in progress) {
    for (let niveauId in progress[compId]) {
      applyProgress(M, V, compId, niveauId, progress[compId][niveauId]);
    }
  }

  applyLocksForAllCompetences(M, V);
};

V.showPopUp = function (levelEl) {
  const competenceEl = V.arbre.getCompetence(levelEl);
  if (!competenceEl) return;

  V.currentCompetence = competenceEl.getAttribute("data-competence");
  V.currentLevel = +levelEl.getAttribute("data-niveau");
  const compName = M.pn.getCompetenceName(V.currentCompetence);
  const acs = M.pn.getAcs(V.currentCompetence, V.currentLevel);

  if (!V.popupView) {
    V.popupView = new PopUpView();

    const closeBtn = V.popupView.getCloseButton();
    closeBtn.addEventListener("click", () => V.closePopUp());
  }

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

    const proof = M.user.getAcProof(
      V.currentCompetence,
      V.currentLevel,
      acCode,
    );
    V.popupView.renderProof(acEl, proof);
  }

  const currentProgress = M.user.getProgress(
    V.currentCompetence,
    V.currentLevel,
  );
  V.popupView.setCompetenceEvaluation(currentProgress);

  const validateButtons = V.popupView.getValidateButtons();
  const justifyButtons = V.popupView.getJustButtons();

  for (const btn of validateButtons) {
    btn.addEventListener("click", (ev) => {
      const acEl = ev.target.closest(".ac");
      if (acEl) {
        V.handler_sliderChange(acEl);
      }
    });
  }
  for (const btn of justifyButtons) {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const acEl = ev.target.closest(".ac");
      if (!acEl) return;

      const input = acEl.querySelector("[data-proof-input]");
      if (input) input.click();
    });
  }
  V.popupView.root.addEventListener("click", (ev) => {
    const removeBtn = ev.target.closest("[data-proof-remove]");
    if (!removeBtn) return;

    ev.preventDefault();
    const acEl = removeBtn.closest(".ac");
    V.handler_proofRemove(acEl);
  });

  V.popupView.root.addEventListener("change", (ev) => {
    const input = ev.target.closest("[data-proof-input]");
    if (!input) return;

    const acEl = input.closest(".ac");
    if (!acEl) return;

    const file = input.files && input.files[0];
    if (file) {
      V.handler_proofSelected(acEl, file);
    }

    input.value = "";
  });
  V.popupView.pop(V.rootPage);
};

V.closePopUp = function () {
  if (!V.popupView) return;
  V.popupView.close();
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

V.handler_proofSelected = async function (acEl, file) {
  if (!file) {
    alert("Aucun fichier sélectionné.");
    return;
  }

  const isPdf =
    file.type === "application/pdf" ||
    (file.name && file.name.toLowerCase().endsWith(".pdf"));

  if (!isPdf) {
    alert("Veuillez sélectionner un fichier PDF.");
    return;
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const acCode = V.popupView.getAcCode(acEl);

  M.user.setAcProof(V.currentCompetence, V.currentLevel, acCode, {
    name: file.name,
    type: "application/pdf",
    size: file.size,
    dataUrl,
    date: new Date().toISOString(),
  });

  M.user.save();

  V.popupView.renderProof(
    acEl,
    M.user.getAcProof(V.currentCompetence, V.currentLevel, acCode),
  );
};

V.handler_proofRemove = function (acEl) {
  const acCode = V.popupView.getAcCode(acEl);

  M.user.removeAcProof(V.currentCompetence, V.currentLevel, acCode);
  M.user.save();

  V.popupView.renderProof(acEl, null);
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

  if (V.popupView) {
    V.popupView.close();
  }

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

V.openHistory = function () {
  if (!V.historyView) {
    V.historyView = new HistoryView();

    const closeBtn = V.historyView.getCloseButton();
    closeBtn.addEventListener("click", () => V.closeHistory());
  }

  const allHistory = [...M.user.history].reverse();

  V.historyView.renderHistory(allHistory, M.pn);

  V.historyView.pop(V.rootPage);
};

V.closeHistory = function () {
  if (!V.historyView) return;
  V.historyView.close();
};

export function ArbrePage() {
  return C.init();
}
