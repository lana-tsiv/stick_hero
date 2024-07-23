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
  }

  onPlayButtonClicked() {
    if (!this.backgroundMusicPlayed && this.backgroundMusic) {
      cc.audioEngine.playMusic(this.backgroundMusic, true);
      this.backgroundMusicPlayed = true;
    }

    cc.director.loadScene("GameScene");
  }
}
