import { gsap } from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
gsap.registerPlugin(DrawSVGPlugin);

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

export { Animation };
