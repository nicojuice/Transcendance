export class Room {
  players: string[];
  withIA: boolean;

  constructor() {
    this.players = [];
    this.withIA = false;
  }

  addPlayer(playerName: string) {
    this.players.push(playerName);
  }

  removePlayer(playerName: string) {
    this.players = this.players.filter(p => p !== playerName);
  }
};


export class MatchStats {
  loserName: string;
  maxBallSpeed: number;
  bounceCount: number;
  duration: number;

  constructor() {
    this.loserName = "";
    this.maxBallSpeed = 0;
    this.bounceCount = 0;
    this.duration = 0;
  }

  updateMaxSpeed(currentSpeed: number) {
    if (currentSpeed > this.maxBallSpeed) {
      this.maxBallSpeed = currentSpeed;
    }
  }

  incrementBounces() {
    this.bounceCount++;
  }

  setLoser(name: string) {
    this.loserName = name;
  }
};
