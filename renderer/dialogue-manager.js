/**
 * 对话气泡管理器
 * 管理桌宠的对话内容和触发逻辑
 */

class DialogueManager {
  constructor(animator, moodSystem) {
    this.animator = animator;
    this.moodSystem = moodSystem;

    // 定时触发配置
    this.autoTriggerInterval = 5 * 60 * 1000; // 5分钟
    this.autoTriggerTimer = 0;
    this.lastAutoTrigger = Date.now();

    // 对话内容库
    this.dialogues = {
      // 日常问候
      greeting: [
        '早上好呀~',
        '中午好~',
        '下午好~',
        '晚上好~',
        '夜深了，早点休息哦~'
      ],

      // 系统提醒
      system: [
        '该休息眼睛啦~',
        '记得喝水哦~',
        '站起来活动一下吧~',
        '不要久坐哦~'
      ],

      // 心情相关
      mood: [
        '好开心见到你~',
        '和你在一起真好~',
        '今天也要加油哦！',
        '有什么需要帮忙的吗？',
        '想和你聊聊天~'
      ],

      // 趣味对话
      fun: [
        '你知道吗？猫咪每天要睡16小时哦~',
        '今天天气真好呢~',
        '想吃小鱼干~',
        '喵~',
        '突然想跳舞~',
        '你知道二次元吗？',
        '我是不是很可爱？',
        '嘿嘿~'
      ],

      // 互动回应
      interaction: [
        '嘿嘿，好痒~',
        '再摸摸~',
        '喜欢你~',
        '好开心~',
        '谢谢~'
      ],

      // 长时间无互动
      miss: [
        '好久没和你聊天了...',
        '你在忙什么呀？',
        '想你了...',
        '还记得我吗？',
        '...呜...'
      ]
    };

    // 时间段问候
    this.timeGreetings = {
      morning: ['早上好~', '新的一天开始了~', '今天也要加油哦~'],
      noon: ['中午好~', '该吃午饭了~', '吃饱了吗？'],
      afternoon: ['下午好~', '下午茶时间~', '困了吗？'],
      evening: ['晚上好~', '今天辛苦了~', '放松一下吧~'],
      night: ['夜深了~', '早点休息哦~', '不要熬夜~']
    };

    // 开始自动触发
    this.startAutoTrigger();
  }

  /**
   * 获取当前时间段
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * 获取随机对话
   */
  getRandomDialogue(category) {
    const options = this.dialogues[category];
    if (!options || options.length === 0) return '';
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * 获取时间段问候
   */
  getTimeGreeting() {
    const timeOfDay = this.getTimeOfDay();
    const options = this.timeGreetings[timeOfDay];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * 获取心情相关对话
   */
  getMoodDialogue() {
    return this.moodSystem.getMoodDialogue();
  }

  /**
   * 获取系统提醒
   */
  getSystemReminder() {
    const reminders = [
      '该休息眼睛啦~',
      '记得喝水哦~',
      '站起来活动一下吧~',
      '不要久坐哦~',
      '看看远处放松一下~'
    ];
    return reminders[Math.floor(Math.random() * reminders.length)];
  }

  /**
   * 触发对话气泡
   */
  triggerDialogue(category) {
    let text = '';

    switch (category) {
      case 'greeting':
        text = this.getTimeGreeting();
        break;
      case 'system':
        text = this.getSystemReminder();
        break;
      case 'mood':
        text = this.getMoodDialogue();
        break;
      case 'fun':
        text = this.getRandomDialogue('fun');
        break;
      case 'interaction':
        text = this.getRandomDialogue('interaction');
        break;
      case 'miss':
        text = this.getRandomDialogue('miss');
        break;
      default:
        text = this.getRandomDialogue('fun');
    }

    if (text) {
      this.animator.showBubble(text);
    }
  }

  /**
   * 启动自动触发
   */
  startAutoTrigger() {
    setInterval(() => {
      this.checkAutoTrigger();
    }, 60000); // 每分钟检查一次
  }

  /**
   * 检查是否需要自动触发
   */
  checkAutoTrigger() {
    const now = Date.now();
    const timeSinceLastTrigger = now - this.lastAutoTrigger;

    // 超过间隔时间自动触发
    if (timeSinceLastTrigger >= this.autoTriggerInterval) {
      // 根据心情和时间选择对话
      const mood = this.moodSystem.getMoodInfo();

      if (mood.value < 30) {
        this.triggerDialogue('miss');
      } else {
        // 随机选择类型
        const types = ['fun', 'system', 'mood'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.triggerDialogue(randomType);
      }

      this.lastAutoTrigger = now;
    }
  }

  /**
   * 触发互动回应
   */
  triggerInteraction() {
    this.triggerDialogue('interaction');
    this.lastAutoTrigger = Date.now(); // 重置自动触发计时
  }

  /**
   * 触发时间问候
   */
  triggerTimeGreeting() {
    this.triggerDialogue('greeting');
    this.lastAutoTrigger = Date.now();
  }

  /**
   * 显示自定义消息
   */
  showCustomMessage(text, duration = 3000) {
    this.animator.showBubble(text, duration);
  }
}

// 导出到全局
window.DialogueManager = DialogueManager;
