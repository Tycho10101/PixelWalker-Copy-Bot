// Use it when error happens while bot is in game
export class GameError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}