const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenu extends cc.Component {
  @property(cc.Button)
  playButton: cc.Button = null;

  @property(cc.AudioClip)
  backgroundMusic: cc.AudioClip = null;

  private backgroundMusicPlayed: boolean = false;

  onLoad() {
    this.playButton.node.on("click", this.onPlayButtonClicked, this);
    cc.log("MainMenu загружено, кнопка Play привязана");
  }

  onPlayButtonClicked() {
    cc.log("Кнопка Play нажата");

    if (!this.backgroundMusicPlayed && this.backgroundMusic) {
      cc.audioEngine.playMusic(this.backgroundMusic, true);
      this.backgroundMusicPlayed = true;
      cc.log("Фоновая музыка запущена в MainMenu");
    }

    cc.director.loadScene("GameScene");
  }
}
