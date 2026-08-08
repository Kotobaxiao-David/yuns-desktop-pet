/**
 * 桌面宠物闲逛系统
 * 负责控制桌宠在屏幕上随机移动
 */

class PetRoaming {
  constructor(petWindow, animator) {
    this.petWindow = petWindow;
    this.animator = animator;

    // 位置状态
    this.x = 0;
    this.y = 0;

    // 移动参数
    this.speed = 0.8;
    this.direction = 1; // 1=右, -1=左
    this.moving = false;

    // 屏幕信息
    this.screenWidth = 0;
    this.screenHeight = 0;
    this.petWidth = 128;
    this.petHeight = 128;

    // 状态定时器
    this.stateTimer = 0;
    this.moveDuration = 0;
    this.idleDuration = 0;

    // 是否被用户拖拽
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    // 初始化
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    // 获取屏幕信息
    if (window.electronAPI) {
      window.electronAPI.getScreenSize().then(size => {
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        this.initPosition();
      });
    }

    // 设置拖拽
    this.setupDrag();

    // 设置随机移动
    this.startRoaming();
  }

  /**
   * 初始化位置（屏幕底部中央）
   */
  initPosition() {
    this.x = this.screenWidth / 2 - this.petWidth / 2;
    this.y = this.screenHeight - this.petHeight - 50;
    this.updateWindowPosition();
  }

  /**
   * 设置拖拽功能
   */
  setupDrag() {
    const canvas = this.animator.canvas;
    let startX, startY;

    canvas.addEventListener('mousedown', (e) => {
      // 右键不拖拽
      if (e.button !== 0) return;

      this.isDragging = true;
      this.animator.roaming = false;

      startX = e.clientX - this.x;
      startY = e.clientY - this.y;

      canvas.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      this.x = e.clientX - startX;
      this.y = e.clientY - startY;

      // 边界限制
      this.x = Math.max(0, Math.min(this.x, this.screenWidth - this.petWidth));
      this.y = Math.max(0, Math.min(this.y, this.screenHeight - this.petHeight));

      this.updateWindowPosition();
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.animator.roaming = true;
        canvas.style.cursor = 'default';
      }
    });
  }

  /**
   * 更新窗口位置
   */
  updateWindowPosition() {
    if (window.electronAPI) {
      window.electronAPI.setWindowPosition(Math.round(this.x), Math.round(this.y));
    }
  }

  /**
   * 开始闲逛
   */
  startRoaming() {
    this.scheduleNextAction();
    this.update();
  }

  /**
   * 调度下一个动作
   */
  scheduleNextAction() {
    // 随机决定是移动还是站立
    const action = Math.random() > 0.4 ? 'move' : 'idle';

    if (action === 'move') {
      this.moving = true;
      this.moveDuration = 3000 + Math.random() * 5000; // 3-8秒
      this.direction = Math.random() > 0.5 ? 1 : -1;
      this.animator.setState('walk');
      this.animator.direction = this.direction;
    } else {
      this.moving = false;
      this.idleDuration = 2000 + Math.random() * 4000; // 2-6秒
      this.animator.setState('idle');
    }

    this.stateTimer = 0;
  }

  /**
   * 更新位置
   */
  update() {
    const deltaTime = 16; // ~60fps

    if (this.isDragging) {
      requestAnimationFrame(() => this.update());
      return;
    }

    this.stateTimer += deltaTime;

    if (this.moving) {
      // 移动
      this.x += this.speed * this.direction;

      // 边界检测
      if (this.x <= 0) {
        this.x = 0;
        this.direction = 1;
        this.animator.direction = 1;
      } else if (this.x >= this.screenWidth - this.petWidth) {
        this.x = this.screenWidth - this.petWidth;
        this.direction = -1;
        this.animator.direction = -1;
      }

      this.updateWindowPosition();

      // 检查是否结束移动
      if (this.stateTimer >= this.moveDuration) {
        this.scheduleNextAction();
      }
    } else {
      // 站立
      if (this.stateTimer >= this.idleDuration) {
        this.scheduleNextAction();
      }
    }

    requestAnimationFrame(() => this.update());
  }

  /**
   * 设置速度
   */
  setSpeed(speed) {
    this.speed = speed;
  }

  /**
   * 暂停/恢复
   */
  pause() {
    this.animator.roaming = false;
  }

  resume() {
    this.animator.roaming = true;
    this.scheduleNextAction();
  }
}

// 导出到全局
window.PetRoaming = PetRoaming;
