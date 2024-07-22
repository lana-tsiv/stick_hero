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
    cc.log("GameOver загружено, кнопки привязаны");
  }

  setScores(currentScore: number, bestScore: number) {
    cc.log(`Установка очков - Текущий: ${currentScore}, Лучший: ${bestScore}`);
    this.currentScoreLabel.string = `Current Score: ${currentScore}`;
    this.bestScoreLabel.string = `Best Score: ${bestScore}`;
  }

  restartGame() {
    cc.log("Кнопка рестарта нажата");

    const game = cc.find("GameCanvas").getComponent("Game");
    if (game) {
      cc.log("Вызов метода resetGame");
      game.resetGame();
    } else {
      cc.log("Компонент Game не найден на GameCanvas");
    }

    this.node.active = false;
  }

  goToMainMenu() {
    cc.log("Кнопка главного меню нажата");

    // Остановка фоновой музыки
    const game = cc.find("GameCanvas").getComponent("Game");
    if (game) {
      game.stopBackgroundMusic();
    } else {
      cc.log("Компонент Game не найден на GameCanvas");
    }

    cc.director.loadScene("MainMenu");
  }
}
