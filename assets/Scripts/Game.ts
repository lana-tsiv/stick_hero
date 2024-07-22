const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
  @property(cc.Node)
  player: cc.Node = null;

  @property(cc.Prefab)
  platformPrefab: cc.Prefab = null;

  @property(cc.Node)
  bridge: cc.Node = null;

  @property(cc.Label)
  scoreLabel: cc.Label = null;

  @property(cc.Camera)
  mainCamera: cc.Camera = null;

  @property(cc.Prefab)
  indicatorPrefab: cc.Prefab = null;

  @property(cc.AudioClip)
  backgroundMusic: cc.AudioClip = null;

  @property(cc.AudioClip)
  bridgeFallSound: cc.AudioClip = null;

  @property(cc.AudioClip)
  gameOverSound: cc.AudioClip = null;

  @property
  moveDuration: number = 0.3;

  private touchStartTime: number = 0;
  private currentPlatform: cc.Node = null;
  private nextPlatform: cc.Node = null;
  private platforms: cc.Node[] = [];
  private indicators: cc.Node[] = [];
  private score: number = 0;
  private bestScore: number = 0;
  private gameOverNode: cc.Node = null;
  private backgroundMusicPlayed: boolean = false; // Флаг для отслеживания воспроизведения музыки

  onLoad() {
    this.initializeGame();
    this.node.on("touchstart", this.onTouchStart, this);
    this.node.on("touchend", this.onTouchEnd, this);

    this.scoreLabel = cc.find("GameCanvas/ScoreLabel").getComponent(cc.Label);
    this.gameOverNode = cc.find("GameCanvas/GameOverNode");
    this.mainCamera = cc.find("GameCanvas/Camera").getComponent(cc.Camera);

    this.setupCamera();

    cc.log("Игра загружена");
  }

  playBackgroundMusic() {
    if (this.backgroundMusic) {
      cc.audioEngine.playMusic(this.backgroundMusic, true);
      this.backgroundMusicPlayed = true;
      cc.log("Фоновая музыка запущена");
    } else {
      cc.log("Фоновая музыка не присвоена");
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusicPlayed) {
      cc.audioEngine.stopMusic();
      this.backgroundMusicPlayed = false;
      cc.log("Фоновая музыка остановлена");
    }
  }

  initializeGame() {
    cc.log("Инициализация игры");
    this.score = 0;
    this.scoreLabel.string = this.score.toString();
    this.clearPlatforms();
    this.clearIndicators();
    this.currentPlatform = this.createPlatform(cc.v2(0, -100));
    this.player.setPosition(
      cc.v2(
        this.currentPlatform.x,
        this.currentPlatform.y +
          this.currentPlatform.height / 2 +
          this.player.height / 2
      )
    );
    cc.log(`Позиция игрока: ${this.player.position}`);

    this.spawnNewPlatform();
    this.resetBridge();

    if (this.gameOverNode) {
      this.gameOverNode.active = false;
    }
  }

  clearPlatforms() {
    cc.log("Очистка платформ");
    this.platforms.forEach((platform) => {
      if (platform) {
        platform.destroy();
      }
    });
    this.platforms = [];
  }

  clearIndicators() {
    cc.log("Очистка индикаторов");
    this.indicators.forEach((indicator) => {
      if (indicator) {
        indicator.destroy();
      }
    });
    this.indicators = [];
  }

  resetBridge() {
    cc.log("Сброс моста");
    this.bridge.height = 0;
    this.bridge.active = false;
    this.unschedule(this.growBridge);
    cc.log(
      `Мост сброшен. Высота: ${this.bridge.height}, Активен: ${this.bridge.active}`
    );
  }

  createPlatform(position: cc.Vec2): cc.Node {
    cc.log("Создание платформы");
    const platform = cc.instantiate(this.platformPrefab);
    platform.setPosition(position);
    platform.setContentSize(cc.size(200, 20));
    platform.name = "Platform";
    this.node.addChild(platform);
    this.platforms.push(platform);

    const indicator = cc.instantiate(this.indicatorPrefab);
    indicator.setPosition(cc.v2(0, platform.height / 2 + indicator.height / 2));
    platform.addChild(indicator);
    indicator.name = "Indicator";
    this.indicators.push(indicator);

    cc.log(`Платформа создана в позиции: ${platform.position}`);
    return platform;
  }

  spawnNewPlatform() {
    cc.log("Создание новой платформы");
    const minDistance = 200;
    const maxDistance = 400;
    const distance = minDistance + Math.random() * (maxDistance - minDistance);

    const newPosition = cc.v2(
      this.currentPlatform.x + distance,
      this.currentPlatform.y
    );
    this.nextPlatform = this.createPlatform(newPosition);
    cc.log(`Новая платформа создана в позиции: ${this.nextPlatform.position}`);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    if (this.bridge.active) return;

    // Запуск фоновой музыки при первом касании, если не запустилась на загрузке сцены
    if (!this.backgroundMusicPlayed) {
      this.playBackgroundMusic();
    }

    this.touchStartTime = new Date().getTime();
    const currentPlatformWorldPos = this.currentPlatform.convertToWorldSpaceAR(
      cc.v2(0, 0)
    );
    const bridgePos = this.node.convertToNodeSpaceAR(currentPlatformWorldPos);
    this.bridge.setPosition(
      cc.v2(
        bridgePos.x + this.currentPlatform.width / 2,
        bridgePos.y + this.currentPlatform.height / 2
      )
    );
    this.bridge.height = 0;
    this.bridge.angle = 0;
    this.bridge.anchorY = 0;
    this.bridge.active = true;

    this.schedule(this.growBridge, 0.01);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (!this.bridge.active) return;

    this.unschedule(this.growBridge);
    this.scheduleOnce(this.dropBridge, 0.5);
  }

  growBridge() {
    this.bridge.height += 2;
  }

  dropBridge() {
    if (this.bridgeFallSound) {
      cc.audioEngine.playEffect(this.bridgeFallSound, false);
    }

    this.bridge.anchorY = 0;

    cc.tween(this.bridge)
      .to(0.5, { angle: -90 })
      .call(() => this.movePlayer())
      .start();
  }

  checkBridgeLength() {
    const bridgeLength = this.bridge.height;
    const currentPlatformEndX =
      this.currentPlatform.x + this.currentPlatform.width / 2;
    const nextPlatformStartX =
      this.nextPlatform.x - this.nextPlatform.width / 2;
    const gap = nextPlatformStartX - currentPlatformEndX;
    const tolerance = 2;

    const isValidLength =
      bridgeLength + tolerance >= gap &&
      bridgeLength <= gap + this.nextPlatform.width;

    return isValidLength;
  }

  checkBridgeAndIndicator() {
    const bridgeEndX = this.bridge.x + this.bridge.height;
    const indicator = this.nextPlatform.getChildByName("Indicator");

    if (indicator) {
      const indicatorX = this.nextPlatform.x + indicator.x;
      if (Math.abs(bridgeEndX - indicatorX) <= 10) {
        cc.log("Мост пересекся с индикатором!");
        return true;
      }
    }
    return false;
  }

  movePlayer() {
    const isBridgeLongEnough = this.checkBridgeLength();
    let targetPosition;

    if (isBridgeLongEnough) {
      targetPosition = cc.v2(
        this.nextPlatform.x -
          this.nextPlatform.width / 2 +
          this.player.width / 2,
        this.player.y
      );
    } else {
      targetPosition = cc.v2(this.player.x, this.player.y - 500);
    }

    const moveAction = cc.moveTo(this.moveDuration, targetPosition);
    const resetAction = cc.callFunc(() => {
      if (!isBridgeLongEnough) {
        this.showGameOverScene();
      } else {
        if (this.checkBridgeAndIndicator()) {
          this.score += 10;
        } else {
          this.score++;
        }

        this.scoreLabel.string = this.score.toString();
        this.currentPlatform = this.nextPlatform;
        this.resetBridge();
        this.spawnNewPlatform();
      }
    });

    const sequence = cc.sequence(moveAction, resetAction);
    this.player.runAction(sequence);
  }

  showGameOverScene() {
    if (this.gameOverSound) {
      cc.audioEngine.playEffect(this.gameOverSound, false);
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }

    const gameOverNode = cc.find("GameCanvas/GameOverNode");
    if (gameOverNode) {
      cc.log("GameOverNode найден");
      const gameOverComponent = gameOverNode.getComponent("GameOver");
      if (gameOverComponent) {
        cc.log("Компонент GameOver найден");
        gameOverComponent.setScores(this.score, this.bestScore);
      } else {
        cc.log("Компонент GameOver не найден на GameOverNode");
      }
      gameOverNode.active = true;
    } else {
      cc.log("GameOverNode не найден");
    }

    const scoreLabel = cc.find("GameCanvas/ScoreLabel");
    if (scoreLabel) {
      cc.log("ScoreLabel найден, деактивируем его");
      scoreLabel.destroy();
    } else {
      cc.log("ScoreLabel не найден");
    }

    this.player.active = false;
    this.platforms.forEach((platform) => {
      platform.active = false;
    });
    this.bridge.active = false;
  }

  resetGame() {
    cc.log("Сброс игры");
    this.score = 0;
    this.scoreLabel.string = this.score.toString();
    this.scoreLabel.node.active = true;

    this.clearPlatforms();
    this.clearIndicators();
    this.currentPlatform = this.createPlatform(cc.v2(0, -100));
    this.player.setPosition(
      cc.v2(
        this.currentPlatform.x,
        this.currentPlatform.y +
          this.currentPlatform.height / 2 +
          this.player.height / 2
      )
    );
    cc.log(`Позиция игрока после сброса: ${this.player.position}`);

    this.spawnNewPlatform();

    this.resetBridge();

    this.player.active = true;
    cc.log(`Активен ли игрок: ${this.player.active}`);

    if (this.mainCamera) {
      this.mainCamera.node.setPosition(cc.v2(0, 0));
    }

    if (this.gameOverNode) {
      this.gameOverNode.active = false;
    }
  }

  setupCamera() {
    if (this.mainCamera) {
      const cameraNode = this.mainCamera.node;
      const sceneSize = cc.director.getScene().getContentSize();

      cameraNode.setPosition(cc.v2(sceneSize.width / 2, sceneSize.height / 2));

      if (this.mainCamera.orthoSize) {
        this.mainCamera.orthoSize =
          Math.max(sceneSize.height, sceneSize.width) / 2;
      }
    }
  }
}
