import * as ROOM from "./room";
import { navigate } from "../nav";
import { showToast } from "../showToast";

export enum GameMode {
  Versus,
  Tournament
}

export class GameManager {
  public gamemode: GameMode;
  public templatetRoom: ROOM.Room;
  public players: string[];

  constructor(gamemode: GameMode, templatetRoom: ROOM.Room, players: string[]) {
    this.gamemode = gamemode;
    this.templatetRoom = templatetRoom;
    this.players = players;
  }

  Start() {
    if (this.gamemode === GameMode.Versus) this.StartVersus();
    if (this.gamemode === GameMode.Tournament) this.StartTournament();
  }

  async StartVersus() {
    const username = this.players[0];
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Avatar not found");
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      this.templatetRoom.addPlayer(username, imageUrl);
    } catch {
      this.templatetRoom.addPlayer(username);
    }

    let secondName: string;
    if (this.templatetRoom.withIA) {
      secondName = "IA";
    } else if (this.templatetRoom.isTournament) {
      secondName = this.players[1] || "Invité";
    } else {
      secondName = "Ghest";
    }
    this.templatetRoom.addPlayer(secondName);

    this.templatetRoom.saveToLocalStorage();
    navigate("game");
  }

  async StartTournament() {
    const players = [...this.players];
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    const pairs: [string, string][] = [
      [players[0], players[1]],
      [players[2], players[3]],
    ];

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8001/api/backend/games/tournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          player1: pairs[0][0],
          player2: pairs[0][1],
          player3: pairs[1][0],
          player4: pairs[1][1],
        }),
      });

      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

      const data = await res.json();
      localStorage.setItem("tournamentId", data.id.toString());
      if (this.templatetRoom.gameName === "pong")
        localStorage.setItem("tournamentGame", "pong");
      else if (this.templatetRoom.gameName === "pacman")
        localStorage.setItem("tournamentGame", "pacman");
    } catch (err) {
      showToast("Impossible de créer le tournoi", "error");
      return;
    }

    const currentUser = localStorage.getItem("username");
    const bracketRooms: ROOM.Room[] = [];

    for (const [p1, p2] of pairs) {
      const room = this.templatetRoom.clone();

      const addWithAvatar = async (name: string) => {
        if (name === currentUser) {
          try {
            const res = await fetch(
              `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(name)}`,
              {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                },
              }
            );
            if (!res.ok) throw new Error("Avatar not found");
            const blob = await res.blob();
            const imageUrl = URL.createObjectURL(blob);
            room.addPlayer(name, imageUrl);
          } catch {
            console.warn("Pas d'avatar pour", name);
            room.addPlayer(name);
          }
        } else {
          room.addPlayer(name);
        }
      };

      await addWithAvatar(p1);
      await addWithAvatar(p2);
      bracketRooms.push(room);
    }

    navigate("tournament");
  }
}
