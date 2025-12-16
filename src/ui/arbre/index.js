import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class ArbreView {
  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }
  getCompetence(el) {
    if (el) {
      const found = el.closest("[data-competence]");
      if (found && this.root.contains(found)) return found;
      return null;
    }
    return this.root.querySelector("[data-competence]");
  }

  getLevel(el) {
    if (el) {
      const found = el.closest("[data-niveau]");
      if (found && this.root.contains(found)) return found;
      return null;
    }
    return this.root.querySelector("[data-niveau]");
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
    if (!scaleText) {
      return null;
    }

    return scaleText.textContent;
  }

  setIconFill(competenceName, levelNumber, fillValue) {
    const selector = `[data-competence="${competenceName}"][data-niveau="${levelNumber}"]`;
    const levelGroup = this.root.querySelector(selector);
    const fillPath = levelGroup.querySelector("[data-icon-fill]");
    fillPath.setAttribute("fill", fillValue);
    return true;
  }

  setLocked(competenceName, levelNumber, locked) {
    const selector = `[data-competence="${competenceName}"][data-niveau="${levelNumber}"]`;
    const levelGroup = this.root.querySelector(selector);
    if (!levelGroup) return false;

    if (locked) {
      levelGroup.classList.add("is-locked");
    } else {
      levelGroup.classList.remove("is-locked");
    }

    return true;
  }
}
export { ArbreView };
