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
    return this.root.querySelector(".custom__slider");
  }
}

export { PopUpView };
