import gsap from "gsap";

// 🔥 XP ANIMATION SYSTEM
export const animateXP = (xpElement, newXP) => {
  gsap.to(xpElement, {
    width: `${newXP}%`,
    duration: 1.2,
    ease: "power3.out",
  });

  gsap.fromTo(
    xpElement,
    { filter: "brightness(1)" },
    { filter: "brightness(2)", duration: 0.2, yoyo: true, repeat: 1 }
  );
};

// ⚡ COMBO MULTIPLIER ANIMATION
export const animateCombo = (comboEl, value) => {
  gsap.fromTo(
    comboEl,
    { scale: 0.8, opacity: 0.5 },
    {
      scale: 1.3,
      opacity: 1,
      duration: 0.3,
      ease: "back.out(2)",
    }
  );

  comboEl.innerText = `x${value}`;

  gsap.to(comboEl, {
    scale: 1,
    duration: 0.2,
    delay: 0.3,
  });
};

// 🏆 LEVEL UP ANIMATION
export const animateLevelUp = (levelEl) => {
  const tl = gsap.timeline();

  tl.to(levelEl, {
    scale: 1.5,
    rotation: 5,
    duration: 0.3,
  })
    .to(levelEl, {
      scale: 1,
      rotation: 0,
      duration: 0.5,
      ease: "bounce.out",
    })
    .to(levelEl, {
      boxShadow: "0px 0px 30px #4f8cff",
      duration: 0.3,
    });
};

// 💥 XP BURST PARTICLES
export const xpBurst = (container) => {
  gsap.fromTo(
    container,
    { scale: 0.5, opacity: 0 },
    {
      scale: 1.2,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    }
  );

  gsap.to(container, {
    scale: 1,
    duration: 0.3,
    delay: 0.4,
  });
};

// ❌ WRONG INPUT SHAKE
export const shakeError = (charEl) => {
  gsap.fromTo(
    charEl,
    { x: -5 },
    {
      x: 5,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: "power1.inOut",
    }
  );

  gsap.to(charEl, {
    borderColor: "#ef4444",
    duration: 0.2,
  });
};

// 🚀 COUNTDOWN START
export const countdown = (el) => {
  const tl = gsap.timeline();

  tl.fromTo(el, { scale: 0 }, { scale: 2, duration: 0.5 })
    .to(el, { scale: 1, duration: 0.3 })
    .to(el, { opacity: 0, duration: 0.3, delay: 0.5 });
};
