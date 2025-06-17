import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import * as Entities from "./entities";
import * as Engine from "../engine";

export function drawUI(engine: Engine.GameEngine, p1: Entities.Player, p2: Entities.Player): void
{
  const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, engine.scene);
  // Score UI
  const scoreText = new GUI.TextBlock();
  scoreText.text = "0 - 0";
  scoreText.color = "white";
  scoreText.fontSize = 48;
  scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  scoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  scoreText.top = "50px";
  scoreText.left = "10px";
  ui.addControl(scoreText);

  // Pause Menu
  const pauseMenu = new GUI.Rectangle();
  pauseMenu.width = "50%";
  pauseMenu.height = "40%";
  pauseMenu.cornerRadius = 20;
  pauseMenu.color = "white";
  pauseMenu.thickness = 2;
  pauseMenu.background = "rgba(0, 0, 0, 0.6)";
  pauseMenu.isVisible = false;
  ui.addControl(pauseMenu);

  // Nouveau layout vertical
  const pauseLayout = new GUI.StackPanel();
  pauseLayout.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  pauseLayout.top = "20px"; // Marge du haut
  pauseMenu.addControl(pauseLayout);

  // Ajout du texte
  const pauseText = new GUI.TextBlock();
  pauseText.text = "Pause";
  pauseText.color = "white";
  pauseText.fontSize = 48;
  pauseText.height = "100px"; // taille fixe utile dans StackPanel
  pauseLayout.addControl(pauseText);

  // Bouton Reprendre
  const resumeBtn = GUI.Button.CreateSimpleButton("resume", "Reprendre");
  resumeBtn.width = "60%";
  resumeBtn.height = "40px";
  resumeBtn.color = "white";
  resumeBtn.background = "#00cc00";
  resumeBtn.onPointerUpObservable.add(() => {
      engine.paused = false;
      pauseMenu.isVisible = false;
  });
  pauseLayout.addControl(resumeBtn);

  // === BOUTON PAUSE ===
  const pauseBtn = GUI.Button.CreateSimpleButton("pauseBtn", "⏸ Pause");
  pauseBtn.width = "100px";
  pauseBtn.height = "40px";
  pauseBtn.color = "white";
  pauseBtn.background = "#444";
  pauseBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  pauseBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  pauseBtn.top = "10px";
  pauseBtn.left = "10px";

  pauseBtn.onPointerUpObservable.add(() => {
      engine.paused = true;
      pauseMenu.isVisible = true;
      pauseBtn.isVisible = false;
  });

  ui.addControl(pauseBtn);

  // === Mettre à jour le bouton dans le resumeBtn existant ===
  resumeBtn.onPointerUpObservable.add(() => {
      engine.paused = false;
      pauseMenu.isVisible = false;
      pauseBtn.isVisible = true;
  });

  const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
      engine.paused = !engine.paused;
      pauseMenu.isVisible = engine.paused;
      pauseBtn.isVisible = !engine.paused;
      }
  };
  window.addEventListener("keydown", handleKeyDown);

  engine.scene.onDisposeObservable.add(() => {
      window.removeEventListener("keydown", handleKeyDown);
  });

  engine.scene.onBeforeRenderObservable.add(() => {
    // Mettre à jour le texte du score
    scoreText.text = `${p1.score} - ${p2.score}`;
  }
  );
}