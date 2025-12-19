import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { competenceColorName } from "@/lib/functions.js";
import { Animation } from "@/lib/animation.js";

class HistoryView {
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
    Animation.historyPopupTypewriter(this.root, 0.3);
  }

  close() {
    if (!this.root) return;
    this.root.classList.remove("is-open");
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  }

  getCloseButton() {
    return this.root.querySelector("[data-history-close]");
  }

  renderHistory(items, pn) {
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

        let compColor = pn.getCompetenceColor(item.competenceId);
        compColor = competenceColorName(compColor);
        li.style.color = `var(--color-${compColor}-100)`;
        li.style.borderLeftColor = `var(--color-${compColor}-100)`;

        const text =
          `${item.competenceId}: ${item.acCode} : ` +
          `${item.value}% (à ${new Date(item.date).toLocaleTimeString()})`;

        li.textContent = text;
        li.dataset.originalText = text;

        container.appendChild(li);
      }
    }
  }
}
export { HistoryView };
