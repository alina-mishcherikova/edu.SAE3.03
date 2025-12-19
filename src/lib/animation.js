import { gsap } from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import TextPlugin from "gsap/TextPlugin";
gsap.registerPlugin(DrawSVGPlugin, TextPlugin);

let Animation = {};

Animation.rotateElement = function (element, duration = 1) {
  gsap.to(element, {
    rotation: "+=360",
    transformOrigin: "50% 50%",
    repeat: -1,
    ease: "linear",
    duration: duration,
  });
};

Animation.colorTransition = function (
  element,
  fromColor,
  toColor,
  duration = 1,
) {
  gsap.fromTo(
    element,
    { fill: fromColor },
    {
      fill: toColor,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "linear",
    },
  );
};

Animation.stretchElement = function (
  element,
  direction = "x",
  scale = 2,
  duration = 1,
) {
  const props = direction === "x" ? { scaleX: scale } : { scaleY: scale };
  gsap.to(element, {
    ...props,
    duration: duration,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
    transformOrigin: "50% 50%",
  });
};

Animation.drawLine = function (paths, fills, duration = 1) {
  gsap
    .timeline()
    .from(paths, {
      drawSVG: 0,
      duration: duration,
      ease: "power1.inOut",
      stagger: 0.1,
    })
    .from(
      fills,
      {
        opacity: 0,
        scale: 1.5,
        transformOrigin: "center center",
        duration: 0.8,
        ease: "elastic.out(2, 0.3)",
      },
      "-=1",
    );
};

Animation.bounce = function (element, duration = 1, height = 100) {
  gsap.to(element, {
    y: -height,
    duration: duration / 2,
    ease: "power1.out",
    yoyo: true,
    repeat: 1,
    transformOrigin: "50% 100%",
  });
};

Animation.lowerOpacityBranches = function (rootPage, activeBranch) {
  const branches = rootPage.querySelectorAll(
    "g[data-competence]:not([data-niveau])",
  );

  branches.forEach((branch) => {
    gsap.to(branch, {
      opacity: branch === activeBranch ? 1 : 0.25,
      duration: 0.25,
      ease: "power1.out",
    });
  });
};

Animation.resetBranchesOpacity = function (svgRoot) {
  const branches = svgRoot.querySelectorAll(
    "g[data-competence]:not([data-niveau])",
  );

  gsap.to(branches, {
    opacity: 1,
    duration: 0.25,
    ease: "power1.out",
  });
};

Animation.selectLevel = function (levelEl) {
  if (!levelEl) return;
  const svgRoot = levelEl.closest("svg");
  if (!svgRoot) return;

  const levelSelected = svgRoot.querySelectorAll("[data-niveau].is-selected");
  levelSelected.forEach((level) => {
    level.classList.remove("is-selected");
    const strokeGroup = level.querySelector("#circle__stroke");
    if (strokeGroup) {
      gsap.to(strokeGroup.querySelectorAll("path"), {
        fill: "#f2ede7",
        duration: 0.2,
        ease: "power1.out",
      });
    }
  });

  levelEl.classList.add("is-selected");
  const strokeGroup = levelEl.querySelector("#circle__stroke");
  if (strokeGroup) {
    gsap.to(strokeGroup.querySelectorAll("path"), {
      fill: "#ff4d4d",
      duration: 0.2,
      ease: "power1.out",
    });
  }
};

Animation.buildPrimaryLine = function (lineEl) {
  if (!lineEl) return;

  gsap.fromTo(
    lineEl,
    {
      scaleY: 0,
      transformOrigin: "50% 100%",
      opacity: 0,
    },
    {
      scaleY: 1,
      opacity: 1,
      duration: 1,
      ease: "steps(15)",
    },
  );
};
Animation.buildSecondaryLine = function (lineEl) {
  if (!lineEl) return;

  gsap.fromTo(
    lineEl,
    {
      scaleY: 0,
      transformOrigin: "50% 100%",
      opacity: 0,
    },
    {
      scaleY: 1,
      opacity: 1,
      duration: 0.2,
      ease: "steps(25)",
      delay: 1,
    },
  );
};
Animation.buildTertiaryLine = function (lineEl) {
  if (!lineEl) return;

  gsap.fromTo(
    lineEl,
    {
      scaleY: 0,
      transformOrigin: "50% 100%",
      opacity: 0,
    },
    {
      scaleY: 1,
      opacity: 1,
      duration: 0.2,
      ease: "steps(25)",
      delay: 1.2,
    },
  );
};

Animation.buildCurvedLine = function (groupEl, baseDelay = 0) {
  if (groupEl instanceof NodeList || Array.isArray(groupEl)) {
    groupEl.forEach((el, index) => {
      Animation.buildCurvedLine(el, baseDelay + index * 0.2);
    });
    return;
  }

  const vertical = groupEl.querySelector("#vertical");
  const horizontal = groupEl.querySelector("#horizontal");
  const corners = groupEl.querySelectorAll("#corner__1, #corner__2");

  gsap.set(vertical, {
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
  });

  gsap.set(horizontal, {
    transformBox: "fill-box",
    transformOrigin: "0% 50%",
  });

  gsap.set(corners, {
    transformBox: "fill-box",
    transformOrigin: "50% 50%",
  });

  const tl = gsap.timeline({ delay: baseDelay });

  tl.fromTo(
    vertical,
    {
      scaleY: 0,
      opacity: 0,
    },
    {
      scaleY: 1,
      opacity: 1,
      duration: 0.8,
      ease: "steps(15)",
    },
  );

  tl.fromTo(
    horizontal,
    {
      scaleX: 0,
      opacity: 0,
    },
    {
      scaleX: 1,
      opacity: 1,
      duration: 0.8,
      ease: "steps(15)",
    },
    "-=0.4",
  );

  tl.from(
    corners,
    {
      opacity: 0,
      scale: 0.7,
      duration: 0.25,
      ease: "power1.out",
      stagger: 0.05,
    },
    "-=0.2",
  );
};

Animation.typewriterText = function (textElement, duration = 2) {
  if (!textElement) return;

  const tl = gsap.timeline();

  const originalText = textElement.textContent;

  textElement.textContent = "";

  const svg = textElement.ownerSVGElement;
  if (!svg) return tl;

  const bbox = textElement.getBBox();
  const cursor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  cursor.setAttribute("id", "typewriter-cursor");
  cursor.setAttribute("x", bbox.x + bbox.width + 5);
  cursor.setAttribute("y", bbox.y);
  cursor.setAttribute("width", "3");
  cursor.setAttribute("height", bbox.height);
  cursor.setAttribute("fill", "var(--color-fg)");

  textElement.parentNode.insertBefore(cursor, textElement.nextSibling);

  gsap.fromTo(
    cursor,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.5,
      repeat: -1,
      ease: "steps(1)",
      yoyo: true,
    },
  );

  tl.to(textElement, {
    text: { value: originalText },
    duration: duration,
    ease: "none",
    onUpdate: function () {
      const currentBbox = textElement.getBBox();
      cursor.setAttribute("x", currentBbox.x + currentBbox.width + 5);
    },
    onComplete: function () {
      gsap.to(cursor, {
        opacity: 0,
        duration: 0.3,
        delay: 1,
        onComplete: () => cursor.remove(),
      });
    },
  });

  return tl;
};

Animation.historyPopupTypewriter = function (popupElement, duration = 0.5) {
  if (!popupElement) return;

  const tl = gsap.timeline();

  gsap.set(popupElement, {
    opacity: 0,
    scale: 0.8,
    transformOrigin: "center center",
  });

  tl.to(popupElement, {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    ease: "back.out(1.7)",
  });

  const historyItems = popupElement.querySelectorAll(".history__item");

  if (historyItems && historyItems.length > 0) {
    historyItems.forEach((item) => {
      const originalText = item.textContent;
      item.textContent = "";
      gsap.set(item, { opacity: 0 });
    });
    historyItems.forEach((item, index) => {
      const originalText = item.dataset.originalText || item.textContent;

      if (!item.dataset.originalText) {
        item.dataset.originalText = item.textContent;
      }

      tl.to(
        item,
        {
          opacity: 1,
          duration: 0.2,
        },
        `+=${index === 0 ? 0.2 : 0.05}`,
      );

      tl.to(
        item,
        {
          text: { value: originalText },
          duration: duration,
          ease: "none",
        },
        "<",
      );
    });
  }

  return tl;
};

Animation.historyItemsAppear = function (historyItems, stagger = 0.1) {
  if (!historyItems || historyItems.length === 0) return;

  gsap.set(historyItems, {
    opacity: 0,
    y: 20,
  });

  gsap.to(historyItems, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: stagger,
    ease: "power2.out",
  });
};

Animation.pixelatePattern = function (patternElement, duration = 3) {
  if (!patternElement) return;

  const pixels = patternElement.querySelectorAll("rect");

  if (!pixels || pixels.length === 0) return;

  pixels.forEach((pixel) => {
    gsap.to(pixel, {
      opacity: 0.2,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: Math.random() * duration,
    });
  });
};

Animation.pixelatePatternWave = function (patternElement, duration = 2) {
  if (!patternElement) return;

  const pixels = patternElement.querySelectorAll("rect");

  if (!pixels || pixels.length === 0) return;

  gsap.to(pixels, {
    opacity: 0.1,
    duration: duration,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: {
      each: 0.01,
      from: "random",
      repeat: -1,
      yoyo: true,
    },
  });
};

Animation.sparkleEffect = function (element, color = "#FFD700") {
  if (!element) return;

  const tl = gsap.timeline();

  tl.to(element, {
    scale: 1.1,
    transformOrigin: "center center",
    duration: 1,
    ease: "back.out(1.5)",
  });

  tl.to(element, {
    scale: 1,
    duration: 0.4,
    ease: "elastic.out(1, 0.3)",
  });

  const textElements = element.querySelectorAll("text");
  if (textElements.length > 0) {
    tl.to(
      textElements,
      {
        fill: color,
        duration: 0.3,
        yoyo: true,
        repeat: 3,
        ease: "sine.inOut",
      },
      0,
    );
  }

  return tl;
};

export { Animation };
