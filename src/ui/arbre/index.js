import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class ArbreView {
  constructor() {
    this.root = htmlToDOM(template);
    this.selectedCompetence = null;
    this.comps = [];
    let competences = this.root.querySelectorAll("[data-competence]");
    for (let competence of competences) {
      this.comps.push(competence.getAttribute("data-competence"));
    }
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  has(comp) {
    if (!comp) return false;
    return this.comps.includes(comp.getAttribute("data-competence"));
  }

  getOneCompetence() {
    console.log(this.root);
    console.log(this.comps);
    console.log(this.competences);
  }
}
export { ArbreView };
