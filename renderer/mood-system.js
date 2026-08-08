/**
 * 心情系统
 * 管理桌宠的心情值和心情等级
 */

class MoodSystem {
  constructor() {
    this.mood = 50; // 0-100
    this.decayRate = 5; // 每小时衰减
    this.decayTimer = 0;
    this.lastInteractionTime = Date.now();

    // 心情等级配置
    this.levels = {
      veryHappy: { min: 80, max: 100, emoji: '😊', color: '#FFD700' },
      happy: { min: 60, max: 79, emoji: '😊', color: '#FFA500' },
      normal: { min: 40, max: 59, emoji: '😐', color: '#808080' },
      sad: { min: 20, max: 39, emoji: '😢', color: '#4169E1' },
      verySad: { min: 0, max: 19, emoji: '😭', color: '#000080' }
    };

    // 加载保存的心情
    this.load();
  }

  /**
   * 获取当前心情等级
   */
  getLevel() {
    if (this.mood >= 80) return 'veryHappy';
    if (this.mood >= 60) return 'happy';
    if (this.mood >= 40) return 'normal';
    if (this.mood >= 20) return 'sad';
    return 'verySad';
  }

  /**
   * 获取心情信息
   */
  getMoodInfo() {
    const level = this.getLevel();
    return {
      value: this.mood,
      level: level,
      ...this.levels[level]
    };
  }

  /**
   * 增加心情
   */
  addMood(amount) {
    this.mood = Math.min(100, Math.max(0, this.mood + amount));
    this.lastInteractionTime = Date.now();
    this.save();
  }

  /**
   * 减少心情
   */
  subtractMood(amount) {
    this.mood = Math.min(100, Math.max(0, this.mood - amount));
    this.save();
  }

  /**
   * 更新衰减
   */
  update(deltaTime) {
    this.decayTimer += deltaTime;

    // 每小时衰减
    if (this.decayTimer >= 3600000) {
      const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;

      // 超过1小时无互动才衰减
      if (timeSinceLastInteraction > 3600000) {
        this.subtractMood(this.decayRate);
      }

      this.decayTimer = 0;
    }
  }

  /**
   * 保存心情
   */
  save() {
    if (window.electronAPI) {
      window.electronAPI.storeSet('petMood', this.mood);
    }
  }

  /**
   * 加载心情
   */
  async load() {
    if (window.electronAPI) {
      const saved = await window.electronAPI.storeGet('petMood');
      if (saved !== undefined && saved !== null) {
        this.mood = saved;
      }
    }
  }

  /**
   * 获取心情相关的对话
   */
  getMoodDialogue() {
    const level = this.getLevel();

    const dialogues = {
      veryHappy: [
        '今天好开心呀~',
        '和你在一起真幸福~',
        '心情超好的！',
        '有什么需要帮忙的吗？'
      ],
      happy: [
        '心情不错哦~',
        '今天过得怎么样？',
        '有什么有趣的事吗？'
      ],
      normal: [
        '嗯...',
        '今天天气不错呢',
        '有什么事吗？'
      ],
      sad: [
        '有点无聊呢...',
        '好久没和你聊天了',
        '想和你说说话...'
      ],
      verySad: [
        '...呜呜...',
        '好寂寞...',
        '你还记得我吗...'
      ]
    };

    const options = dialogues[level];
    return options[Math.floor(Math.random() * options.length)];
  }
}

// 导出到全局
window.MoodSystem = MoodSystem;
