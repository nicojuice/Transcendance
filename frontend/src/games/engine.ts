import * as BABYLON from "@babylonjs/core";
import { EventManager } from '../eventManager';
import * as ROOM from "./room";
import * as GUI from "@babylonjs/gui";
import { navigate } from "../nav";
import { getText } from "../i18n";
import { updateGameStats } from "../loadPlayerData";
import { loadPlayerStats } from "../loadPlayerData";
import { renderPlayerStats } from "../loadPlayerData";

export class GameEngine extends BABYLON.Engine {
  canvas: HTMLCanvasElement;
  inputMap: Record<string, boolean>;
  scene: BABYLON.Scene;
  paused: boolean; // Indicate if the game is paused
  room: ROOM.Room; // Reference to the current room
  ui: GUI.AdvancedDynamicTexture; // UI texture

  private popupContainer: GUI.Rectangle | null = null; // Container for the popup message
  private popupText: GUI.TextBlock | null = null; // Text block for the popup message
  private popupTimeout?: number;

  

  OnDispose: EventManager;
  OnResize: EventManager;
  constructor(canvas: HTMLCanvasElement, room: ROOM.Room) {
    super(canvas, true, { antialias: true });
    this.canvas = canvas;
    this.room = room;
    if (this.room.players.length < 2) {
      console.warn("Not enough players in the room, adding default players.");
      for (let i = this.room.players.length; i < 2; i++)
        this.room.addPlayer(`Player ${i + 1}`);
    }
    this.enableOfflineSupport = false;
    this.renderEvenInBackground = false;
    this.scene = new BABYLON.Scene(this);
    this.paused = false; // Initialize paused state
    this.inputMap = {};
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => this.inputMap[evt.sourceEvent.key] = true));
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => this.inputMap[evt.sourceEvent.key] = false));

    this.OnDispose = new EventManager();
    this.OnResize = new EventManager();

    // Initialize the UI
    this.ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
    this.ui.idealWidth = 1280; // Set the ideal width for the UI
    this.ui.idealHeight = 720; // Set the ideal height for the UI
    this.SetupPauseMenu();
    this.SetupScoreUI();
    this.SetupPopup();
  }

  //Destructor
  dispose() {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout); // Clear the popup timeout if it exists
      this.popupTimeout = undefined; // Reset the timeout variable
    }
    this.OnDispose.dispatch();
    this.scene.actionManager.dispose();
    this.scene.onAfterRenderObservable.clear();
    this.scene.onBeforeRenderObservable.clear();
    this.scene.dispose();
    this.stopRenderLoop();
    super.dispose();
    this.canvas.remove();
    this.canvas = null as any; // Set to null to avoid memory leaks
  }

  Resize() {
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
    const maxWidth = 1280;
    const widthRatio = window.innerWidth / maxWidth;
    const scaling = widthRatio;
    this.setHardwareScalingLevel(scaling);
    this.resize();
    this.OnResize.dispatch();
  }

  // EndGame()
  // {
  //   if (this.room.players[0].score > this.room.players[1].score) {
  //     this.room.winner = ROOM.Winner.PLAYER1;
  //   } else if (this.room.players[0].score < this.room.players[1].score) {
  //     if (this.room.withIA)
  //       this.room.winner = ROOM.Winner.IA; // If with IA, player 2 is the IA
  //     else
  //       this.room.winner = ROOM.Winner.PLAYER2;
  //   } else {
  //     this.room.winner = ROOM.Winner.DRAW;
  //   }
  //   this.room.manualQuit = false; // Reset manual quit state
  //   console.log("Game ended. Winner:", this.room.winner);
  //   this.room.saveToLocalStorage();
  //   setTimeout(() => navigate(this.room.nextPage), 0);
  // }

// async EndGame() {
//   const currentUser = this.room.players.length > 0 ? this.room.players[0].name : null;

//   if (this.room.players[0].score > this.room.players[1].score) {
//     this.room.winner = ROOM.Winner.PLAYER1;
//     this.room.saveToLocalStorage();
//     if (currentUser) {
//       await updateGameStats(currentUser, true);
//       await loadPlayerStats(); // recharge dans localStorage
//       renderPlayerStatsFromLocalStorage(); // met à jour l’affichage
//     }
//     setTimeout(() => navigate("win"), 0);
//   } else if (this.room.players[0].score < this.room.players[1].score) {
//     if (this.room.withIA)
//       this.room.winner = ROOM.Winner.IA;
//     else
//       this.room.winner = ROOM.Winner.PLAYER2;
//     this.room.saveToLocalStorage();
//     if (currentUser) {
//       await updateGameStats(currentUser, false);
//       await loadPlayerStats();
//       renderPlayerStatsFromLocalStorage();
//     }
//     setTimeout(() => navigate("loose"), 0);
//   }
//   this.room.manualQuit = false;
// }

async EndGame() {
    // Récupérer le nom du joueur courant (player1)
    const currentUser = this.room.players.length > 0 ? this.room.players[0].name : null;

    // Déterminer le nom du gagnant ou null en cas d'égalité
    let winnerName: string | null = null;
    const [p1, p2] = this.room.players;
    if (p1.score > p2.score) {
      winnerName = p1.name;
    } else if (p1.score < p2.score) {
      winnerName = p2.name;
    }

    // Sauvegarder le gagnant dans la room (on stocke la string)
    // @ts-ignore: override Winner enum type to store string
    this.room.winner = winnerName || "";
    this.room.manualQuit = false;
    this.room.saveToLocalStorage();

    // Mettre à jour les statistiques du joueur courant si présent
    if (currentUser) {
      const isWin = winnerName === currentUser;
      await updateGameStats(currentUser, isWin);
      await loadPlayerStats();
      const statsStr = localStorage.getItem('playerStats');
      if (statsStr) {
        const stats = JSON.parse(statsStr);
        renderPlayerStats(stats);
      }
    }

    // Redirection finale
    if (winnerName === currentUser) {
      // Victoire
      setTimeout(() => navigate("win"), 0);
    } else if (winnerName && winnerName !== currentUser) {
      // Défaite
      setTimeout(() => navigate("loose"), 0);
    } else {
      // Égalité
      setTimeout(() => navigate(this.room.nextPage), 0);
    }
  }


  SetupPauseMenu(): void {
      // Pause Menu
      const pauseMenu = new GUI.Rectangle();
      pauseMenu.width = "50%";
      pauseMenu.height = "40%";
      pauseMenu.cornerRadius = 10;
      pauseMenu.color = "white";
      pauseMenu.thickness = 2;
      pauseMenu.background = "rgba(0, 0, 0, 0.6)";
      pauseMenu.isVisible = false;
      pauseMenu.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;  // Centrer horizontalement
      pauseMenu.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;      // Centrer verticalement
      this.ui.addControl(pauseMenu);
    
      // Nouveau layout vertical avec espacement entre les boutons
      const pauseLayout = new GUI.StackPanel();
      pauseLayout.isVertical = true;
      pauseLayout.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;  // Centrer les boutons horizontalement
      pauseLayout.spacing = 10; // Espacement entre les boutons
      pauseMenu.addControl(pauseLayout);
    
      // Ajout du texte
      const pauseText = new GUI.TextBlock();
      pauseText.text = getText("game.pause");
      pauseText.fontFamily = "Pixelify Sans, sans-serif";
      pauseText.color = "white";
      pauseText.fontSize = 48;
      pauseText.height = "100px"; // taille fixe utile dans StackPanel
      pauseLayout.addControl(pauseText);
    
      // Bouton Reprendre
      const resumeBtn = GUI.Button.CreateSimpleButton("resume", getText("game.resume"));
      resumeBtn.fontFamily = "Pixelify Sans, sans-serif";
      resumeBtn.fontSize = 24;
      resumeBtn.cornerRadius = 10;
      resumeBtn.width = "60%";
      resumeBtn.height = "40px";
      resumeBtn.color = "white";
      resumeBtn.background = "#00cc00";
      resumeBtn.onPointerUpObservable.add(() => {
          this.paused = false;
          pauseMenu.isVisible = false;
      });
      pauseLayout.addControl(resumeBtn);

      // Bouton Quitter
      const quitBtn = GUI.Button.CreateSimpleButton("quit", getText("game.quit"));
      quitBtn.fontFamily = "Pixelify Sans, sans-serif";
      quitBtn.fontSize = 24;
      quitBtn.cornerRadius = 10;
      quitBtn.width = "60%";
      quitBtn.height = "40px";
      quitBtn.color = "white";
      quitBtn.background = "#cc0000";
      quitBtn.onPointerUpObservable.add(() => {
          this.paused = false;
          this.room.manualQuit = true; // Marquer la sortie manuelle
          this.room.saveToLocalStorage(); // Sauvegarder l'état de la room
          setTimeout(() => navigate(this.room.nextPage), 0);
      });
      pauseLayout.addControl(quitBtn);
    
      // === BOUTON PAUSE ===
      const pauseBtn = GUI.Button.CreateSimpleButton("pauseBtn", "⏸" + getText("game.btnPause"));
      pauseBtn.fontFamily = "Pixelify Sans, sans-serif";
      pauseBtn.fontSize = 22;
      pauseBtn.cornerRadius = 10;
      pauseBtn.width = "100px";
      pauseBtn.height = "40px";
      pauseBtn.color = "white";
      pauseBtn.background = "#444";
      pauseBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      pauseBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      pauseBtn.top = "10px";
      pauseBtn.left = "10px";
    
      pauseBtn.onPointerUpObservable.add(() => {
          this.paused = true;
          pauseMenu.isVisible = true;
          pauseBtn.isVisible = false;
      });
    
      this.ui.addControl(pauseBtn);
    
      // === Mettre à jour le bouton dans le resumeBtn existant ===
      resumeBtn.onPointerUpObservable.add(() => {
          this.paused = false;
          pauseMenu.isVisible = false;
          pauseBtn.isVisible = true;
      });
    
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
          this.paused = !this.paused;
          pauseMenu.isVisible = this.paused;
          pauseBtn.isVisible = !this.paused;
          }
      };
      window.addEventListener("keydown", handleKeyDown);
    
      this.scene.onDisposeObservable.add(() => {
          window.removeEventListener("keydown", handleKeyDown);
      });
  }

  SetupScoreUI(): void {
    // Créer un Rectangle invisible pour regrouper les éléments
    const scoreContainer = new GUI.Rectangle('scoreContainer');
    scoreContainer.height = "50px"; // Hauteur du container
    scoreContainer.cornerRadius = 10; // Coins arrondis
    scoreContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // Centrer horizontalement
    scoreContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    scoreContainer.top = "10px";  // Positionner verticalement
    scoreContainer.left = "0px"; // Centré horizontalement
    scoreContainer.isVisible = true;
    
    // Ajouter le conteneur à l'UI
    this.ui.addControl(scoreContainer);

    const img1 = this.room.players[0].avatar || "/assets/avatars/avatar1.png"; // Chemin par défaut si pas d'avatar
    const img2 = this.room.players[1].avatar || (this.room.withIA ? "/assets/avatars/IA.png" : "/assets/avatars/avatar2.png"); // Chemin par défaut si pas d'avatar

  
    // Image du profil de p1 (à gauche du score)
    const p1Profile = new GUI.Image("p1Profile", img1);  // Remplace par le chemin de l'image
    p1Profile.width = "50px";  // Taille de l'image
    p1Profile.height = "50px";  // Taille de l'image
    p1Profile.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER; // Centrer verticalement par rapport au conteneur
    p1Profile.left = "-80px";  // Positionner à gauche du score avec un espacement
    p1Profile.stretch = GUI.Image.STRETCH_UNIFORM;  // Garder l'aspect ratio
    scoreContainer.addControl(p1Profile);
  
    // Score UI
    const scoreText = new GUI.TextBlock();
    scoreText.fontFamily = "Pixelify Sans", "sans-serif";
    scoreText.text = "0 - 0";
    scoreText.color = "white";
    scoreText.fontSize = 48;
    scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // Centrer horizontalement
    scoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER; // Centrer verticalement
    scoreContainer.addControl(scoreText);
  
    // Image du profil de p2 (à droite du score)
    const p2Profile = new GUI.Image("p2Profile", img2);  // Remplace par le chemin de l'image
    p2Profile.width = "50px";  // Taille de l'image
    p2Profile.height = "50px";  // Taille de l'image
    p2Profile.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER; // Centrer verticalement par rapport au conteneur
    p2Profile.left = "80px";  // Positionner à droite du score avec un espacement
    p2Profile.stretch = GUI.Image.STRETCH_UNIFORM;  // Garder l'aspect ratio
    scoreContainer.addControl(p2Profile);
  
    this.scene.onBeforeRenderObservable.add(() => {
      // Mettre à jour le texte du score
      scoreText.text = `${this.room.players[0].score} - ${this.room.players[1].score}`;
  
      // Ajuster la largeur du conteneur en fonction de la longueur du texte
      scoreContainer.width = `${scoreText.text.length * 20 + 100}px`; // Ajuster la largeur du container
      // Ajuster la position des images en fonction de la largeur du conteneur
      const containerWidth = parseInt(scoreContainer.width, 10);
      p1Profile.left = `${-containerWidth / 2 + 25}px`; // Ajuster la position de l'image de p1
      p2Profile.left = `${containerWidth / 2 - 25}px`; // Ajuster la position de l'image de p2
  
    });
  }

  SetupPopup(): void {
    // Créer une boîte invisible pour le message popup
    this.popupContainer = new GUI.Rectangle("popupContainer");
    this.popupContainer.width = "40%";
    this.popupContainer.height = "80px";
    this.popupContainer.cornerRadius = 10;
    this.popupContainer.color = "white";
    this.popupContainer.thickness = 2;
    this.popupContainer.background = "rgba(0, 0, 0, 0.7)";
    this.popupContainer.isVisible = false;
    this.popupContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.popupContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.ui.addControl(this.popupContainer);

    // Ajout du texte
    this.popupText = new GUI.TextBlock("popupText");
    this.popupText.fontFamily = "Pixelify Sans, sans-serif";
    this.popupText.text = "";
    this.popupText.fontSize = 28;
    this.popupText.color = "white";
    this.popupText.textWrapping = true;
    this.popupText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.popupText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.popupContainer.addControl(this.popupText);
  }

  ShowPopup(message: string, timeout: number = 10000): void {
    if (this.popupContainer && this.popupText) {
      this.popupText.text = message;
      this.popupContainer.isVisible = true;

      // Nettoyer le précédent timeout si existant
      if (this.popupTimeout) {
        clearTimeout(this.popupTimeout);
      }

      this.popupTimeout = window.setTimeout(() => {
        if (this.popupContainer)
          this.popupContainer.isVisible = false;
      }, timeout); // 10 secondes
    }
  }

}