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
  competenceRating: null,
  currentCompetence: null,
  currentLevel: null,
};

V.handler_sliderChange = function (ev) {
  const value = Math.ceil(ev.target.value / 5) * 5;
  V.arbre.setScaleValue(V.currentCompetence, V.currentLevel, value);
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.arbre = new ArbreView();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.arbre.dom());

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
    V.currentPopup = V.popupView.dom();
    V.currentPopup
      .querySelector(".popup__close")
      .addEventListener("click", V.closePopUp);

    const slider = V.popupView.getSliderElement();
    if (slider) {
      slider.addEventListener("input", V.handler_sliderChange);
    }
  }

  const existingValue = V.arbre.getScaleValue(
    V.currentCompetence,
    V.currentLevel,
  );

  V.popupView.setSliderValue(existingValue);

  V.rootPage.appendChild(V.currentPopup);

  V.currentPopup.querySelector("[data-popup-comp]").textContent =
    V.currentCompetence;
  V.currentPopup.querySelector("[data-popup-niveau]").textContent =
    V.currentLevel;

  V.currentPopup.classList.add("is-open");

  if (ev?.clientX != null && ev?.clientY != null) {
    const margin = 8;
    const rect = V.currentPopup.getBoundingClientRect();

    const left = Math.min(
      ev.clientX + 20,
      window.innerWidth - rect.width - margin,
    );
    const top = Math.min(
      ev.clientY + 20,
      window.innerHeight - rect.height - margin,
    );

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
