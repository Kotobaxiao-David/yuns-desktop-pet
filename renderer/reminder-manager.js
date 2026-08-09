/**
 * 提醒管理器
 * 负责调度日历提醒、触发通知和气泡
 */

const store = require('../store');

class ReminderManager {
  constructor(calendarService) {
    this.calendarService = calendarService;
    // 已通知的事件ID集合，避免重复通知
    this.notifiedEvents = new Set();
    // 检查间隔（1分钟）
    this.checkInterval = 60000;
    // 检查定时器
    this.checkTimer = null;
    // 每日摘要定时器
    this.dailySummaryTimer = null;
    // 日志前缀
    this.logPrefix = '[ReminderManager]';
    // 窗口引用（用于发送IPC消息）
    this.petWindow = null;
  }

  /**
   * 设置宠物窗口引用
   * @param {BrowserWindow} window
   */
  setPetWindow(window) {
    this.petWindow = window;
  }

  /**
   * 启动提醒管理器
   */
  start() {
    console.log(`${this.logPrefix} 启动提醒管理器`);

    // 启动提醒检查
    this.startReminderCheck();

    // 启动每日摘要调度
    this.startDailySummary();
  }

  /**
   * 停止提醒管理器
   */
  stop() {
    console.log(`${this.logPrefix} 停止提醒管理器`);

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    if (this.dailySummaryTimer) {
      clearInterval(this.dailySummaryTimer);
      this.dailySummaryTimer = null;
    }
  }

  /**
   * 启动提醒检查
   */
  startReminderCheck() {
    // 每分钟检查一次
    this.checkTimer = setInterval(() => {
      this.checkReminders();
    }, this.checkInterval);

    // 立即检查一次
    this.checkReminders();
  }

  /**
   * 检查是否有需要触发的提醒
   */
  checkReminders() {
    const config = store.getCalendarConfig();
    if (!config.enabled) {
      return;
    }

    const upcoming = this.calendarService.getUpcomingEvents();
    const now = new Date();

    for (const event of upcoming) {
      // 跳过已通知的事件
      if (this.notifiedEvents.has(event.id)) {
        continue;
      }

      // 计算提醒时间
      const reminderMinutes = this.calculateReminderTime(event, config);
      const eventStart = new Date(event.start);
      const minutesUntil = (eventStart - now) / 60000;

      // 如果距离事件开始时间 <= 提醒时间，且 > 0，则触发提醒
      if (minutesUntil <= reminderMinutes && minutesUntil > 0) {
        this.triggerReminder(event, Math.round(minutesUntil));
        this.notifiedEvents.add(event.id);
      }
    }

    // 清理已过期的通知记录
    this.cleanupNotifiedEvents();
  }

  /**
   * 计算提醒时间（分钟）
   * @param {Object} event - 事件对象
   * @param {Object} config - 日历配置
   * @returns {number} 提前提醒分钟数
   */
  calculateReminderTime(event, config) {
    // 用户自定义提醒时间优先
    if (config.reminderMinutesBefore !== null) {
      return config.reminderMinutesBefore;
    }
    // 否则使用事件自带的提醒时间
    return event.reminderMinutes || 15;
  }

  /**
   * 触发提醒
   * @param {Object} event - 事件对象
   * @param {number} minutesUntil - 距离事件开始的分钟数
   */
  triggerReminder(event, minutesUntil) {
    console.log(`${this.logPrefix} 触发提醒: ${event.title}`);

    // 格式化时间
    const timeStr = this.formatTime(event.start);
    const locationStr = event.location ? ` @ ${event.location}` : '';

    // 构建 HTML 内容（用于持久气泡）
    const content = `
      <div style="font-weight: bold; margin-bottom: 4px;">${event.title}</div>
      <div>🕐 ${timeStr}</div>
      ${event.location ? `<div>📍 ${event.location}</div>` : ''}
      <div style="color: #FF9800; margin-top: 4px; font-weight: 500;">${minutesUntil}分钟后开始</div>
    `;

    // 1. 发送持久气泡（需要点击关闭）
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.webContents.send('show-persistent-bubble', {
        title: '会议提醒',
        content: content,
        type: 'meeting'
      });
    }

    // 2. 发送系统通知
    this.sendNotification(
      `会议提醒: ${event.title}`,
      `${timeStr} ${locationStr}\n${minutesUntil}分钟后开始`
    );
  }

    // 2. 发送系统通知
    this.sendNotification(
      `会议提醒: ${event.title}`,
      `${timeStr}${locationStr}\n${minutesUntil}分钟后开始`
    );
  }

  /**
   * 发送 macOS 系统通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   */
  sendNotification(title, body) {
    try {
      const notification = new Notification(title, {
        body: body,
        silent: false
      });

      notification.onclick = () => {
        console.log(`${this.logPrefix} 用户点击了通知`);
        // 可以在这里打开日历窗口或聚焦应用
      };

      notification.show();
    } catch (error) {
      console.error(`${this.logPrefix} 发送通知失败:`, error.message);
    }
  }

  /**
   * 显示今日日程摘要
   */
  showDailySummary() {
    const events = this.calendarService.getTodayEvents();

    if (events.length === 0) {
      this.sendBubbleMessage('📅 今天没有会议安排~');
      return;
    }

    // 构建摘要消息
    const summaryLines = events.slice(0, 3).map((e, i) => {
      const time = this.formatTime(e.start);
      return `${i + 1}. ${time} ${e.title}`;
    });

    const moreText = events.length > 3 ? `\n...还有 ${events.length - 3} 个会议` : '';
    const message = `📅 今天有 ${events.length} 个会议：\n${summaryLines.join('\n')}${moreText}`;

    this.sendBubbleMessage(message, 8000);

    // 同时发送系统通知
    this.sendNotification(
      '今日日程',
      `今天有 ${events.length} 个会议`
    );
  }

  /**
   * 发送气泡消息到桌宠
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时长（毫秒）
   */
  sendBubbleMessage(message, duration = 5000) {
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.webContents.send('calendar-bubble', {
        message: message,
        duration: duration
      });
    }
  }

  /**
   * 启动每日摘要调度
   */
  startDailySummary() {
    // 每分钟检查一次是否到达摘要时间
    this.dailySummaryTimer = setInterval(() => {
      this.checkDailySummaryTime();
    }, 60000);
  }

  /**
   * 检查是否到达每日摘要时间
   */
  checkDailySummaryTime() {
    const config = store.getCalendarConfig();
    if (!config.enabled) {
      return;
    }

    const now = new Date();
    const [targetHour, targetMinute] = (config.dailySummaryTime || '09:00').split(':').map(Number);

    // 检查是否到达目标时间（允许1分钟误差）
    if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
      console.log(`${this.logPrefix} 到达每日摘要时间，显示今日日程`);
      this.showDailySummary();
    }
  }

  /**
   * 清理已过期的通知记录
   */
  cleanupNotifiedEvents() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // 遍历已通知事件，移除超过1小时的
    for (const eventId of this.notifiedEvents) {
      // 这里简化处理，直接清除所有已通知事件
      // 实际可以从事件列表中查找事件结束时间
      // 为简单起见，我们每小时清理一次
      if (this._lastCleanup && (now - this._lastCleanup) > 3600000) {
        this.notifiedEvents.clear();
        this._lastCleanup = now;
        break;
      }
    }

    if (!this._lastCleanup) {
      this._lastCleanup = now;
    }
  }

  /**
   * 格式化时间
   * @param {string|Date} date - 日期对象或ISO字符串
   * @returns {string} 格式化的时间字符串 HH:MM
   */
  formatTime(date) {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * 手动触发今日摘要（供IPC调用）
   */
  triggerDailySummary() {
    this.showDailySummary();
  }
}

// 导出单例
module.exports = ReminderManager;
