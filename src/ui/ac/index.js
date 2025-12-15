import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class AcsView {
  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  setCode(code) {
    this.root.querySelector(".ac__code").textContent = code;
  }

  setLibelle(libelle) {
    this.root.querySelector(".ac__libelle").textContent = libelle;
  }
}
export { AcsView };
