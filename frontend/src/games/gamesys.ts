import * as ROOM from "./room"
import { navigate } from "../nav";

export enum GameMode
{
    Versus,
    Tournament
}

export class GameManager
{
    public gamemode: GameMode;
    public templatetRoom: ROOM.Room;
    constructor(gamemode: GameMode, templatetRoom: ROOM.Room)
    {
        this.gamemode = gamemode;
        this.templatetRoom = templatetRoom;
    }

    Start()
    {
        this.StartVersus();
    }

    async StartVersus()
    {
        const username = localStorage.getItem("username") || "Invité";
        try {
            const res = await fetch(`http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`);
            if (!res.ok) throw new Error("Avatar not found");

            const blob = await res.blob();
            const imageUrl = URL.createObjectURL(blob);
            this.templatetRoom.addPlayer(username, imageUrl);
        } catch (err) {
            console.error("Erreur avatar:", err);
            this.templatetRoom.addPlayer(username);
        }
        if (this.templatetRoom.withIA)
            this.templatetRoom.addPlayer("IA");
        else
            this.templatetRoom.addPlayer("Ghest");
        this.templatetRoom.saveToLocalStorage();
        navigate("game");
    }

    async StartTournament()
    {
        //TODO
    }
}