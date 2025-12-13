import { ArbreView } from "@/ui/arbre";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "../../lib/animation";
import { PopUpView } from "@/ui/pop-up";

let C = {};

C.init = function () {
  return V.init();
};

C.handler_clickCompetence = function (ev) {
  let level = ev.target.closest("[data-niveau]");
  if (!level) return;
  V.showPopUp(level, ev);
  Animation.selectLevel(level);
};

C.handler_hoverCompetence = function (ev) {
  const branch = ev.target.closest("[data-competence]:not([data-niveau])");
  if (!branch) return;
  Animation.lowerOpacityBranches(V.rootPage, branch);
};

C.handler_leaveCompetence = function () {
  Animation.resetBranchesOpacity(V.rootPage);
};

let V = {
  rootPage: null,
  popUp: null,
  competenceRating: null,
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.arbre = new ArbreView();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.arbre.dom());

  V.replaceSliderValues();
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
V.replaceSliderValues = function () {};
V.showPopUp = function (level, ev) {
  const competenceEl = level.closest("[data-competence]");
  const competenceName = competenceEl.getAttribute("data-competence");
  const levelNumber = level.getAttribute("data-niveau");

  if (!V.popupView) {
    V.popupView = new PopUpView();
    V.currentPopup = V.popupView.dom();

    const closeButton = V.currentPopup.querySelector(".popup__close");
    closeButton.addEventListener("click", V.closePopUp);
  }
  V.rootPage.appendChild(V.currentPopup);

  const compLabel = V.currentPopup.querySelector("[data-popup-comp]");
  const levelLabel = V.currentPopup.querySelector("[data-popup-niveau]");

  if (compLabel) compLabel.textContent = competenceName;
  if (levelLabel) levelLabel.textContent = levelNumber;

  V.currentPopup.classList.add("is-open");

  if (ev && typeof ev.clientX === "number") {
    const margin = 8;
    let left = ev.clientX + 20;
    let top = ev.clientY + 20;
    if (left + window.width > window.innerWidth - margin)
      left = window.innerWidth - window.width - margin;
    if (top + window.height > window.innerHeight - margin)
      top = window.innerHeight - window.height - margin;
    V.currentPopup.style.left = left + "px";
    V.currentPopup.style.top = top + "px";
  }
};

V.closePopUp = function () {
  if (!V.currentPopup) return;
  V.currentPopup.classList.remove("is-open");
  V.rootPage.removeChild(V.currentPopup);
};

export function ArbrePage() {
  return C.init();
}
