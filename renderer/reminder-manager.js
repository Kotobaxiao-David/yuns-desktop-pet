/**
 * 提醒管理器
 * 负责调度日历提醒、触发通知和气泡
 * 支持持久提醒：从提醒时间到会议结束持续显示，用户可手动关闭
 */

const { Notification } = require('electron');
const store = require('../store');

class ReminderManager {
  constructor(calendarService) {
    this.calendarService = calendarService;

    // 活跃提醒（正在显示的）: eventId → { event, endTime }
    this.activeReminders = new Map();

    // 已关闭的提醒（用户手动关闭的）: Set of eventIds
    this.dismissedReminders = new Set();

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
   * 核心逻辑：在"提醒时间 → 会议结束"窗口期内持续显示泡泡
   */
  checkReminders() {
    const config = store.getCalendarConfig();
    if (!config.enabled) {
      return;
    }

    const upcoming = this.calendarService.getUpcomingEvents();
    const now = new Date();

    console.log(`${this.logPrefix} checkReminders: ${upcoming.length} 个即将到来的事件`);

    for (const event of upcoming) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const reminderMinutes = this.calculateReminderTime(event, config);
      const reminderTime = new Date(eventStart.getTime() - reminderMinutes * 60000);

      // 判断是否在提醒窗口期内
      const isInWindow = now >= reminderTime && now <= eventEnd;
      // 判断是否已激活（正在显示）
      const isActive = this.activeReminders.has(event.id);
      // 判断是否已关闭（用户手动关闭）
      const isDismissed = this.dismissedReminders.has(event.id);

      console.log(`${this.logPrefix} 事件: ${event.title}`);
      console.log(`  开始: ${eventStart.toISOString()}`);
      console.log(`  结束: ${eventEnd.toISOString()}`);
      console.log(`  提醒时间: ${reminderTime.toISOString()}`);
      console.log(`  当前: ${now.toISOString()}`);
      console.log(`  在窗口期内: ${isInWindow}, 已激活: ${isActive}, 已关闭: ${isDismissed}`);

      if (isInWindow) {
        // 在提醒窗口期内
        if (!isActive && !isDismissed) {
          // 新提醒，显示泡泡
          console.log(`${this.logPrefix} ✅ 触发提醒: ${event.title}`);
          this.showReminderBubble(event, eventEnd);
          this.activeReminders.set(event.id, { event, endTime: eventEnd });
        }
        // 如果已激活或已关闭，不做任何事
      } else if (isActive) {
        // 会议已结束，隐藏泡泡
        console.log(`${this.logPrefix} 会议结束，隐藏提醒: ${event.title}`);
        this.hideReminderBubble(event.id);
        this.activeReminders.delete(event.id);
      }
    }

    // 清理已过期的 dismissed 记录
    this.cleanupDismissedReminders();
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
   * 显示提醒泡泡（持久显示，直到会议结束或用户关闭）
   * @param {Object} event - 事件对象
   * @param {Date} endTime - 会议结束时间
   */
  showReminderBubble(event, endTime) {
    const timeStr = this.formatTime(event.start);
    const endStr = this.formatTime(endTime);

    // 构建 HTML 内容
    const content = `
      <div style="font-weight: bold; margin-bottom: 4px;">${event.title}</div>
      <div>🕐 ${timeStr} - ${endStr}</div>
      ${event.location ? `<div>📍 ${event.location}</div>` : ''}
      <div style="color: #FF9800; margin-top: 4px; font-weight: 500;">会议进行中</div>
    `;

    // 发送持久气泡
    console.log(`${this.logPrefix} showReminderBubble: petWindow=${this.petWindow ? '存在' : 'null'}`);
    if (this.petWindow) {
      console.log(`${this.logPrefix} petWindow.isDestroyed=${this.petWindow.isDestroyed()}`);
    }

    if (this.petWindow && !this.petWindow.isDestroyed()) {
      console.log(`${this.logPrefix} 发送 show-persistent-bubble IPC 消息`);
      this.petWindow.webContents.send('show-persistent-bubble', {
        title: '会议提醒',
        content: content,
        type: 'meeting',
        eventId: event.id
      });
      console.log(`${this.logPrefix} IPC 消息已发送`);
    } else {
      console.log(`${this.logPrefix} ⚠️ petWindow 不可用，无法发送 IPC`);
    }

    // 发送系统通知
    this.sendNotification(
      `会议开始: ${event.title}`,
      `${timeStr} - ${endStr}${event.location ? ` @ ${event.location}` : ''}`
    );
  }

  /**
   * 隐藏提醒泡泡
   * @param {string} eventId - 事件ID
   */
  hideReminderBubble(eventId) {
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.webContents.send('hide-persistent-bubble', { eventId });
    }
  }

  /**
   * 关闭提醒（用户手动点击关闭按钮）
   * @param {string} eventId - 事件ID
   */
  dismissReminder(eventId) {
    console.log(`${this.logPrefix} 用户关闭提醒: ${eventId}`);
    this.dismissedReminders.add(eventId);
    this.activeReminders.delete(eventId);
    this.hideReminderBubble(eventId);
  }

  /**
   * 清理已过期的 dismissed 记录（会议结束后移除）
   */
  cleanupDismissedReminders() {
    const now = new Date();
    for (const eventId of this.dismissedReminders) {
      const event = this.calendarService.events.find(e => e.id === eventId);
      if (event && new Date(event.end) < now) {
        this.dismissedReminders.delete(eventId);
      }
    }
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
