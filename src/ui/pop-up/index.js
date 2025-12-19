import { htmlToDOM } from "@/lib/utils.js";
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

  pop(parentEl) {
    if (!this.root.isConnected) parentEl.appendChild(this.root);
    this.root.classList.add("is-open");
  }

  close() {
    if (!this.root) return;
    this.root.classList.remove("is-open");
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
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

  getAcSliderValue(acEl) {
    const slider = acEl.querySelector("[data-popup-slider]");
    const n = +slider.value;
    return n;
  }

  getAllSliderValues() {
    const sliders = this.root.querySelectorAll("[data-popup-slider]");
    const values = [];

    for (let i = 0; i < sliders.length; i++) {
      values.push(+sliders[i].value);
    }
    return values;
  }

  setAcSliderValue(acEl, value) {
    const slider = acEl.querySelector("[data-popup-slider]");
    const n = +value;
    slider.value = n;
  }

  setCompetenceEvaluation(value) {
    const el = this.root.querySelector("[data-competence-evaluation]");
    if (el) {
      el.textContent = String(value);
    }
  }

  setCompetenceTitle(title) {
    this.root.querySelector(".popup__title").textContent = title;
  }

  setNiveauLabel(label) {
    this.root.querySelector(".niveau").textContent = label;
  }

  getAcCode(acEl) {
    const el = acEl.querySelector(".ac__code");
    if (el) {
      return el.textContent.trim();
    } else return "";
  }

  getCloseButton() {
    return this.root.querySelector(".popup__close");
  }

  getValidateButtons() {
    return this.root.querySelectorAll("[data-button-validate]");
  }
  getJustButtons() {
    return this.root.querySelectorAll("[data-button-add-proof]");
  }

  renderProof(acEl, proof) {
    const meta = acEl.querySelector("[data-proof-meta]");
    const nameEl = acEl.querySelector("[data-proof-name]");
    const openEl = acEl.querySelector("[data-proof-open]");

    if (!meta || !nameEl || !openEl) return;

    if (!proof) {
      meta.style.display = "none";
      nameEl.textContent = "";
      openEl.href = "#";
      return;
    }

    meta.style.display = "flex";
    nameEl.textContent = proof.name;
    openEl.href = proof.dataUrl;
  }
}
export { PopUpView };
