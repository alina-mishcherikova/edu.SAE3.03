import { htmlToDOM } from "../../lib/utils.js";
import { AcsView } from "../ac/index.js";
import template from "./template.html?raw";

class PopUpView {
  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }
  getSliderValue() {
    const slider = this.root.querySelector(".custom__slider");
    return slider ? parseInt(slider.value, 10) : null;
  }

  getSliderElement() {
    return this.root.querySelector(".custom__slider");
  }

  setSliderValue(value) {
    const slider = this.root.querySelector(".custom__slider");
    if (slider) {
      slider.value = value;
    }
  }

  setScaleValue(competenceName, levelNumber, value) {
    const selector = `[data-competence="${competenceName}"][data-niveau="${levelNumber}"]`;
    const levelGroup = this.root.querySelector(selector);
    if (!levelGroup) return false;

    const scaleText = levelGroup.querySelector("#scale__from");
    if (scaleText) {
      scaleText.textContent = value;
      return true;
    }
    return false;
  }

  getScaleValue(competenceName, levelNumber) {
    const selector = `[data-competence="${competenceName}"][data-niveau="${levelNumber}"]`;
    const levelGroup = this.root.querySelector(selector);
    if (!levelGroup) return null;

    const scaleText = levelGroup.querySelector("#scale__from");
    return scaleText ? scaleText.textContent : null;
  }

  renderACs(acs) {
    const container = this.root.querySelector("[data-acs]");
    container.innerHTML = "";

    for (const ac of acs) {
      const view = new AcsView();
      view.setCode(ac.code);
      view.setLibelle(ac.libelle);
      container.append(view.dom());
    }
  }
  setCompetenceTitle(title) {
    this.root.querySelector(".popup__title").textContent = title;
  }

  setNiveauLabel(label) {
    this.root.querySelector(".niveau").textContent = label;
  }
}

export { PopUpView };
