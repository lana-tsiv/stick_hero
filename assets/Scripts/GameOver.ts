const { ccclass, property } = cc._decorator;

@ccclass
export default class GameOver extends cc.Component {
  @property(cc.Label)
  currentScoreLabel: cc.Label = null;

  @property(cc.Label)
  bestScoreLabel: cc.Label = null;

  @property(cc.Button)
  restartButton: cc.Button = null;

  @property(cc.Button)
  mainMenuButton: cc.Button = null;

  onLoad() {
    this.restartButton.node.on("click", this.restartGame, this);
    this.mainMenuButton.node.on("click", this.goToMainMenu, this);
  }

  setScores(currentScore: number, bestScore: number) {
    this.currentScoreLabel.string = `Current Score: ${currentScore}`;
    this.bestScoreLabel.string = `Best Score: ${bestScore}`;
  }

  restartGame() {
    const game = cc.find("GameCanvas").getComponent("Game");
    if (game) {
      game.resetGame();
    }

    this.node.active = false;
  }

  goToMainMenu() {
    const game = cc.find("GameCanvas").getComponent("Game");
    if (game) {
      game.stopBackgroundMusic();
    }

    cc.director.loadScene("MainMenu");
  }
}
