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
    public players: string[];
    constructor(gamemode: GameMode, templatetRoom: ROOM.Room, players: string[])
    {
        this.gamemode = gamemode;
        this.templatetRoom = templatetRoom;
        this.players = players;
    }

    Start()
    {
        this.StartVersus();
        //TODO
    }

    async StartVersus()
    {
        const username = this.players[0];
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
        /*console.log(playerNames[0] , 'player \n');
        console.log(playerNames[1] , 'player \n');
        console.log(playerNames[2] , 'player \n');
        console.log(playerNames[3] , 'player \n');
        console.log(game, ' le jeu\n')
        console.log(custom, ' custom?')
        console.log(mode, 'le mode\n')*/
    }
}