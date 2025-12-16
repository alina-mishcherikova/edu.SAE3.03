import { htmlToDOM } from "../../lib/utils.js";
import { AcsView } from "../ac/index.js";
import template from "./template.html?raw";

class PopUpView {
  constructor() {
    this.root = htmlToDOM(template);
    this.isHistoryOpen = false;
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

  placeNearCursor(ev) {
    if (!ev || ev.clientX == null || ev.clientY == null) return;

    const margin = 8;
    const rect = this.root.getBoundingClientRect();

    const left = Math.min(
      ev.clientX + 20,
      window.innerWidth - rect.width - margin,
    );
    const top = Math.min(
      ev.clientY + 20,
      window.innerHeight - rect.height - margin,
    );

    this.root.style.left = left + "px";
    this.root.style.top = top + "px";
  }

  bind(onClose, onSliderInput) {
    const btn = this.root.querySelector(".popup__close");
    if (btn) btn.addEventListener("click", onClose);

    const slider = this.getSliderElement();
    if (slider) slider.addEventListener("input", onSliderInput);

    const toggle = this.root.querySelector("[data-history-toggle]");
    if (toggle) toggle.addEventListener("click", () => this.toggleHistory());
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

  renderHistory(items) {
    const container = this.root.querySelector(".history__list");
    const empty = this.root.querySelector("[data-history-empty]");
    if (!container || !empty) return;

    container.innerHTML = "";

    if (!items || items.length === 0) {
      empty.textContent = "Jusqu’à présent, l’histoire n’a pas été préservée.";
    } else {
      for (const item of items) {
        const li = document.createElement("li");
        li.className = "history__item";
        li.textContent = `Auto-évaluation fixée à ${item.value}% à ${new Date(item.date).toLocaleTimeString()}`;
        container.appendChild(li);
      }
    }
    this.isHistoryOpen = false;
    this.updateHistoryVisibility();
  }

  toggleHistory() {
    this.isHistoryOpen = !this.isHistoryOpen;
    this.updateHistoryVisibility();
  }

  updateHistoryVisibility() {
    const list = this.root.querySelector(".history__list");
    const empty = this.root.querySelector("[data-history-empty]");
    const iconOpen = this.root.querySelector("[data-dropdown-open]");
    const iconClose = this.root.querySelector("[data-dropdown-close]");

    if (this.isHistoryOpen === true) {
      if (list !== null) {
        list.classList.remove("is-hidden");
      }

      if (empty !== null) {
        empty.classList.remove("is-hidden");
      }

      if (iconOpen !== null) {
        iconOpen.style.display = "none";
      }

      if (iconClose !== null) {
        iconClose.style.display = "block";
      }
    } else {
      if (list !== null) {
        list.classList.add("is-hidden");
      }

      if (empty !== null) {
        empty.classList.add("is-hidden");
      }

      if (iconOpen !== null) {
        iconOpen.style.display = "block";
      }

      if (iconClose !== null) {
        iconClose.style.display = "none";
      }
    }
  }
}

export { PopUpView };
