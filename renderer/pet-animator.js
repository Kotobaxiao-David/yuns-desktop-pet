/**
 * 桌面宠物动画引擎
 * 负责渲染像素风角色、管理动画状态、处理交互
 */

class PetAnimator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 状态机
    this.state = 'idle';
    this.direction = 1; // 1=右, -1=左
    this.frame = 0;
    this.frameTimer = 0;
    this.frameInterval = 150; // ms per frame

    // 动画帧数据 (程序化生成)
    this.animations = {};
    this.currentAnimation = null;

    // 心情系统
    this.mood = 50;
    this.moodDecayTimer = 0;

    // 闲逛系统
    this.roaming = true;
    this.moveSpeed = 0.5;
    this.targetX = null;
    this.idleTimer = 0;
    this.stateTimer = 0;

    // 对话气泡
    this.bubbleText = '';
    this.bubbleTimer = 0;
    this.bubbleVisible = false;

    // 互动特效
    this.particles = [];

    // 初始化
    this.initAnimations();
    this.setupEventListeners();
    this.startAnimationLoop();
  }

  /**
   * 初始化所有状态的动画帧
   * 使用程序化像素绘制替代图片加载
   */
  initAnimations() {
    // 帧定义：每帧是像素数据数组
    this.animations = {
      idle: this.createIdleFrames(),
      walk: this.createWalkFrames(),
      sit: this.createSitFrames(),
      sleep: this.createSleepFrames(),
      happy: this.createHappyFrames(),
      sad: this.createSadFrames(),
      surprised: this.createSurprisedFrames()
    };

    this.currentAnimation = this.animations.idle;
  }

  /**
   * 创建 idle 状态动画帧
   */
  createIdleFrames() {
    return [
      { pixels: this.getIdlePixels(0), duration: 500 },
      { pixels: this.getIdlePixels(1), duration: 500 }
    ];
  }

  /**
   * 创建 walk 状态动画帧
   */
  createWalkFrames() {
    return [
      { pixels: this.getWalkPixels(0), duration: 120 },
      { pixels: this.getWalkPixels(1), duration: 120 },
      { pixels: this.getWalkPixels(2), duration: 120 },
      { pixels: this.getWalkPixels(3), duration: 120 }
    ];
  }

  /**
   * 创建 sit 状态动画帧
   */
  createSitFrames() {
    return [
      { pixels: this.getSitPixels(0), duration: 800 },
      { pixels: this.getSitPixels(1), duration: 800 }
    ];
  }

  /**
   * 创建 sleep 状态动画帧
   */
  createSleepFrames() {
    return [
      { pixels: this.getSleepPixels(0), duration: 1000 },
      { pixels: this.getSleepPixels(1), duration: 1000 }
    ];
  }

  /**
   * 创建 happy 状态动画帧
   */
  createHappyFrames() {
    return [
      { pixels: this.getHappyPixels(0), duration: 200 },
      { pixels: this.getHappyPixels(1), duration: 200 },
      { pixels: this.getHappyPixels(2), duration: 200 },
      { pixels: this.getHappyPixels(3), duration: 200 }
    ];
  }

  /**
   * 创建 sad 状态动画帧
   */
  createSadFrames() {
    return [
      { pixels: this.getSadPixels(0), duration: 800 },
      { pixels: this.getSadPixels(1), duration: 800 }
    ];
  }

  /**
   * 创建 surprised 状态动画帧
   */
  createSurprisedFrames() {
    return [
      { pixels: this.getSurprisedPixels(0), duration: 300 },
      { pixels: this.getSurprisedPixels(1), duration: 300 }
    ];
  }

  // ========== 像素数据生成器 ==========

  /**
   * 获取 idle 状态像素数据
   */
  getIdlePixels(frameIndex) {
    // 基础角色形状
    const base = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,2,2,1,1,0,0,0,0,1,1,2,2,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,2,2,1,1,0,0,0,0,1,1,2,2,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,4,4,5,5,3,3,3,3,3,4,4,5,5,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,4,4,5,5,3,3,3,3,3,4,4,5,5,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,3,6,6,3,3,3,3,3,3,3,6,6,3,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,3,3,7,3,3,3,8,3,3,3,7,3,3,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,9,9,9,0,0,0,0,9,9,9,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,9,9,9,0,0,0,0,9,9,9,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,9,9,9,9,0,0,0,0,9,9,9,9,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,9,9,9,9,9,0,0,0,0,9,9,9,9,9,0,0,0,0,0,0,0,0,0]
    ];

    // idle 帧1：微微浮动（向上移动1像素的效果用y偏移实现）
    if (frameIndex === 1) {
      return base.map(row => [...row]); // 复制，渲染时y偏移-1
    }
    return base;
  }

  /**
   * 获取 walk 状态像素数据
   */
  getWalkPixels(frameIndex) {
    const base = this.getIdlePixels(0);
    // 腿部动画：不同帧调整腿部位置
    const legFrames = [
      // 帧0：左腿前，右腿后
      { leftLegY: 0, rightLegY: 1 },
      // 帧1：双腿并拢
      { leftLegY: 0, rightLegY: 0 },
      // 帧2：右腿前，左腿后
      { leftLegY: 1, rightLegY: 0 },
      // 帧3：双腿并拢
      { leftLegY: 0, rightLegY: 0 }
    ];

    return base; // 简化版，用位移实现行走效果
  }

  /**
   * 获取 sit 状态像素数据
   */
  getSitPixels(frameIndex) {
    return this.getIdlePixels(0); // 简化版
  }

  /**
   * 获取 sleep 状态像素数据
   */
  getSleepPixels(frameIndex) {
    return this.getIdlePixels(0); // 简化版，眼睛闭合效果在渲染时处理
  }

  /**
   * 获取 happy 状态像素数据
   */
  getHappyPixels(frameIndex) {
    return this.getIdlePixels(0); // 简化版
  }

  /**
   * 获取 sad 状态像素数据
   */
  getSadPixels(frameIndex) {
    return this.getIdlePixels(0); // 简化版
  }

  /**
   * 获取 surprised 状态像素数据
   */
  getSurprisedPixels(frameIndex) {
    return this.getIdlePixels(0); // 简化版
  }

  /**
   * 获取颜色
   */
  getColor(index) {
    const P = SpriteGenerator.PALETTE;
    const map = {
      0: 'rgba(0,0,0,0)',
      1: P.hair,
      2: P.hairDark,
      3: P.skin,
      4: P.eyeWhite,
      5: P.eyePupil,
      6: P.eye,
      7: P.blush,
      8: P.mouth,
      9: P.cloth
    };
    return map[index] || 'rgba(0,0,0,0)';
  }

  /**
   * 渲染一帧
   */
  renderFrame(pixels, yOffset = 0) {
    const ctx = this.ctx;
    const ps = SpriteGenerator.PIXEL_SIZE;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 绘制像素
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        const colorIndex = pixels[y][x];
        if (colorIndex === 0) continue;

        const color = this.getColor(colorIndex);
        ctx.fillStyle = color;

        // 翻转方向
        const drawX = this.direction === 1
          ? (31 - x) * ps  // 向右
          : x * ps;        // 向左

        ctx.fillRect(drawX, (y + yOffset) * ps, ps, ps);
      }
    }
  }

  // ========== 动画控制 ==========

  /**
   * 切换状态
   */
  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.frame = 0;
    this.frameTimer = 0;
    this.currentAnimation = this.animations[newState] || this.animations.idle;
  }

  /**
   * 更新动画帧
   */
  update(deltaTime) {
    this.frameTimer += deltaTime;

    const currentFrame = this.currentAnimation[this.frame];
    if (this.frameTimer >= currentFrame.duration) {
      this.frameTimer = 0;
      this.frame = (this.frame + 1) % this.currentAnimation.length;
    }

    // 更新心情衰减
    this.moodDecayTimer += deltaTime;
    if (this.moodDecayTimer > 3600000) { // 1小时
      this.mood = Math.max(0, this.mood - 5);
      this.moodDecayTimer = 0;
    }

    // 更新状态定时器
    this.stateTimer += deltaTime;
    this.updateStateMachine();

    // 更新气泡
    if (this.bubbleVisible) {
      this.bubbleTimer -= deltaTime;
      if (this.bubbleTimer <= 0) {
        this.bubbleVisible = false;
      }
    }

    // 更新粒子
    this.updateParticles(deltaTime);
  }

  /**
   * 状态机更新
   */
  updateStateMachine() {
    switch (this.state) {
      case 'idle':
        if (this.stateTimer > 30000) { // 30秒
          this.setState('sit');
        }
        break;
      case 'sit':
        if (this.stateTimer > 30000) { // 30秒
          this.setState('sleep');
        }
        break;
      case 'sleep':
        // 需要互动唤醒
        break;
      case 'happy':
        if (this.stateTimer > 2000) {
          this.setState('idle');
        }
        break;
      case 'sad':
        if (this.stateTimer > 5000) {
          this.setState('idle');
        }
        break;
      case 'surprised':
        if (this.stateTimer > 1000) {
          this.setState('idle');
        }
        break;
    }
  }

  /**
   * 渲染
   */
  render() {
    const currentFrameData = this.currentAnimation[this.frame];
    const yOffset = this.frame === 1 && this.state === 'idle' ? -0.5 : 0;
    this.renderFrame(currentFrameData.pixels, yOffset);

    // 渲染气泡
    if (this.bubbleVisible) {
      this.renderBubble();
    }

    // 渲染粒子
    this.renderParticles();
  }

  // ========== 交互系统 ==========

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('dblclick', (e) => this.onDblClick(e));
    this.canvas.addEventListener('contextmenu', (e) => this.onRightClick(e));
  }

  /**
   * 单击事件
   */
  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 摸头区域（上方1/3）
    if (y < rect.height / 3) {
      this.onPetHead();
    } else {
      this.onPetBody();
    }
  }

  /**
   * 摸头互动
   */
  onPetHead() {
    this.mood = Math.min(100, this.mood + 10);
    this.setState('happy');
    this.showBubble('好开心~');
    this.emitParticles('heart');
    this.stateTimer = 0;
  }

  /**
   * 拍身体互动
   */
  onPetBody() {
    this.mood = Math.min(100, this.mood + 5);
    this.setState('surprised');
    this.showBubble('哎呀！');
    this.stateTimer = 0;
  }

  /**
   * 双击事件
   */
  onDblClick(e) {
    e.preventDefault();
    if (window.electronAPI) {
      window.electronAPI.openChat();
    }
  }

  /**
   * 右键事件
   */
  onRightClick(e) {
    e.preventDefault();
    // 通过 IPC 显示菜单
    if (window.electronAPI) {
      window.electronAPI.showContextMenu(e.clientX, e.clientY);
    }
  }

  // ========== 气泡系统 ==========

  /**
   * 显示对话气泡
   */
  showBubble(text, duration = 3000) {
    this.bubbleText = text;
    this.bubbleTimer = duration;
    this.bubbleVisible = true;
  }

  /**
   * 渲染气泡
   */
  renderBubble() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.font = '14px "Microsoft YaHei", sans-serif';
    const textWidth = ctx.measureText(this.bubbleText).width;

    const bubbleX = w / 2 - textWidth / 2 - 10;
    const bubbleY = 10;
    const bubbleW = textWidth + 20;
    const bubbleH = 30;

    // 绘制气泡背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 8);
    ctx.fill();

    // 绘制箭头
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 6, bubbleY + bubbleH);
    ctx.lineTo(w / 2, bubbleY + bubbleH + 8);
    ctx.lineTo(w / 2 + 6, bubbleY + bubbleH);
    ctx.fill();

    // 绘制文字
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.bubbleText, w / 2, bubbleY + bubbleH / 2);

    ctx.restore();
  }

  // ========== 粒子系统 ==========

  /**
   * 发射粒子
   */
  emitParticles(type) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 3;

    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        life: 1000,
        maxLife: 1000,
        type: type,
        size: 12 + Math.random() * 8
      });
    }
  }

  /**
   * 更新粒子
   */
  updateParticles(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.life -= deltaTime;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // 重力
      return p.life > 0;
    });
  }

  /**
   * 渲染粒子
   */
  renderParticles() {
    const ctx = this.ctx;

    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;

      if (p.type === 'heart') {
        ctx.fillStyle = '#FF6B9D';
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('♥', p.x, p.y);
      } else if (p.type === 'star') {
        ctx.fillStyle = '#FFD700';
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('★', p.x, p.y);
      }
    });

    ctx.globalAlpha = 1;
  }

  // ========== 动画循环 ==========

  /**
   * 启动动画循环
   */
  startAnimationLoop() {
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      this.update(deltaTime);
      this.render();

      requestAnimationFrame(loop);
    };

    loop();
  }
}

// 导出到全局
window.PetAnimator = PetAnimator;
