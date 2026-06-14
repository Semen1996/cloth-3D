export function handleGravityEnabled() {
  let gravityEnabled = true;
  const gravityBtn = document.querySelector("#gravity-btn");

  if (!gravityBtn) {
    console.error("gravity-btn problem");
    return gravityEnabled;
  }

  gravityBtn.addEventListener("click", () => {
    gravityEnabled = !gravityEnabled;
    if (gravityEnabled) {
      gravityBtn.textContent = "turn off gravity";
    } else {
      gravityBtn.textContent = "turn on gravity";
    }
  });

  return {
    gravityEnabled,
  };
}
