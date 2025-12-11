import { ArbreView } from "@/ui/arbre";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "../../lib/animation";

let C = {};

C.init = function () {
  return V.init();
};

C.handler_clickCompetence = function (ev) {
  const niveauEl = ev.target.closest("[data-niveau]");
  if (niveauEl) {
    Animation.selectNiveau(niveauEl);
    return;
  }

  const compEl = ev.target.closest("[data-competence]:not([data-niveau])");
  if (!compEl) return;
};

C.handler_overCompetence = function (ev) {
  const branch = ev.target.closest("[data-competence]:not([data-niveau])");
  if (!branch) return;

  const svgRoot = branch.closest("svg");
  Animation.dimOtherBranches(svgRoot, branch);
};

C.handler_leaveCompetence = function (ev) {
  const svgRoot = ev.currentTarget.closest("svg") || ev.currentTarget;
  Animation.resetBranchesOpacity(svgRoot);
};
let V = {
  rootPage: null,
  arbre: null,
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.arbre = new ArbreView();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.arbre.dom());

  const svg = V.rootPage.querySelector("svg");
  if (svg) {
    const fistLine = svg.querySelectorAll("#line__direction");
    Animation.buildPrimaryLine(fistLine);
    const secondaryLine = svg.querySelectorAll("#line__direction-secondary");
    Animation.buildSecondaryLine(secondaryLine);
    const tertiaryLine = svg.querySelectorAll("#line__direction-tertiary");
    Animation.buildTertiaryLine(tertiaryLine);

    const curves = svg.querySelectorAll("#line__direction-curved");
    Animation.buildCurvedLine(curves);
  }

  V.attachEvents();
  V.arbre.getOneCompetence();
  return V.rootPage;
};

V.attachEvents = function () {
  V.rootPage.addEventListener("click", C.handler_clickCompetence);
  const svg = V.rootPage.querySelector("svg");
  if (svg) {
    svg.addEventListener("mouseover", C.handler_overCompetence);
    svg.addEventListener("mouseout", C.handler_leaveCompetence);
  }
};

export function ArbrePage() {
  return C.init();
}
