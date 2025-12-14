import { htmlToDOM } from "../../lib/utils.js";
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
    let result;
    if (scaleText) {
      result = scaleText.textContent;
    } else {
      result = null;
    }
  }
}

export { PopUpView };
