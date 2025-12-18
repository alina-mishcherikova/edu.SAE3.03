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

  bind(onClose, onValidateClick) {
    if (this._isBound) return;
    this._isBound = true;

    const btn = this.root.querySelector(".popup__close");
    if (btn && onClose) {
      btn.addEventListener("click", onClose);
    }

    const toggle = this.root.querySelector("[data-history-toggle]");
    if (toggle) {
      toggle.addEventListener("click", () => this.toggleHistory());
    }

    this.root.addEventListener("click", (ev) => {
      const validateBtn = ev.target.closest("[data-button-validate]");
      if (!validateBtn) return;

      const acEl = validateBtn.closest(".ac");
      if (!acEl) return;

      if (onValidateClick) {
        onValidateClick(acEl, ev);
      }
    });
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

  renderHistory(items) {
    const container = this.root.querySelector(".history__list");
    const empty = this.root.querySelector("[data-history-empty]");
    if (!container || !empty) return;

    container.innerHTML = "";

    if (!items || items.length === 0) {
      empty.textContent = "Jusqu’à présent, l’histoire n’a pas été préservée.";
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
      for (const item of items) {
        const li = document.createElement("li");
        li.className = "history__item";
        li.textContent =
          `${item.competenceName || item.competenceId} — ${item.acCode} : ` +
          `${item.value}% (à ${new Date(item.date).toLocaleTimeString()})`;

        container.appendChild(li);
      }
    }
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
