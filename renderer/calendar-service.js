/**
 * 日历服务核心模块
 * 支持 CalDAV（钉钉/飞书）和 ICS 两种协议
 * 负责获取日历事件数据
 */

const { DAVClient } = require('tsdav');
const ical = require('node-ical');
const store = require('../store');

class CalendarService {
  constructor() {
    // 缓存的事件数据
    this.events = [];
    // 默认刷新间隔（5分钟）
    this.refreshInterval = 300000;
    // 刷新定时器
    this.refreshTimer = null;
    // 日志前缀
    this.logPrefix = '[CalendarService]';
    // 刷新完成回调
    this.onRefreshComplete = null;
  }

  /**
   * 列出 CalDAV 服务器上的可用日历
   * @param {Object} config - { server, username, password }
   * @returns {Promise<Array>} 可用日历列表 [{ path, name, color }]
   */
  async listCalDAVCalendars(config) {
    console.log(`${this.logPrefix} 列出 CalDAV 日历: ${config.server}`);

    const client = new DAVClient({
      serverUrl: `https://${config.server}`,
      credentials: {
        username: config.username,
        password: config.password
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav'
    });

    try {
      await client.login();
      console.log(`${this.logPrefix} CalDAV 登录成功`);

      const calendars = await client.fetchCalendars();
      console.log(`${this.logPrefix} 获取到 ${calendars.length} 个日历`);

      return calendars.map(cal => ({
        path: cal.url,
        name: cal.displayName || '未命名日历',
        color: cal.color || '#4A90D9',
        description: cal.description || ''
      }));
    } catch (error) {
      console.error(`${this.logPrefix} 列出 CalDAV 日历失败:`, error.message);
      throw new Error(`连接 CalDAV 服务器失败: ${error.message}`);
    }
  }

  /**
   * 从 CalDAV 拉取事件
   * @param {Object} connection - 连接配置
   * @returns {Promise<Array>} 事件列表
   */
  async fetchCalDAVEvents(connection) {
    console.log(`${this.logPrefix} 从 CalDAV 获取事件: ${connection.name}`);

    const client = new DAVClient({
      serverUrl: `https://${connection.server}`,
      credentials: {
        username: connection.username,
        password: connection.password
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav'
    });

    try {
      await client.login();

      const calendarObjects = await client.fetchCalendarObjects({
        calendar: { url: connection.calendarPath }
      });

      console.log(`${this.logPrefix} 获取到 ${calendarObjects.length} 个日历对象`);

      const events = [];

      for (const obj of calendarObjects) {
        try {
          // node-ical 解析 iCal 数据
          const parsed = ical.parseICS(obj.data);

          for (const [key, value] of Object.entries(parsed)) {
            if (value.type === 'VEVENT') {
              events.push(this.normalizeEvent(value, connection));
            }
          }
        } catch (parseError) {
          console.warn(`${this.logPrefix} 解析事件失败:`, parseError.message);
        }
      }

      console.log(`${this.logPrefix} 解析得到 ${events.length} 个事件`);
      return events;
    } catch (error) {
      console.error(`${this.logPrefix} CalDAV 获取事件失败:`, error.message);
      throw new Error(`获取 CalDAV 事件失败: ${error.message}`);
    }
  }

  /**
   * 从 ICS 链接拉取事件
   * @param {string} url - ICS 订阅链接
   * @param {Object} connection - 连接配置（用于标识来源）
   * @returns {Promise<Array>} 事件列表
   */
  async fetchICSEvents(url, connection) {
    console.log(`${this.logPrefix} 从 ICS 获取事件: ${url}`);

    try {
      const data = await ical.fromURL(url);
      const events = [];

      for (const [key, value] of Object.entries(data)) {
        if (value.type === 'VEVENT') {
          events.push(this.normalizeEvent(value, connection || { type: 'ics', url }));
        }
      }

      console.log(`${this.logPrefix} ICS 解析得到 ${events.length} 个事件`);
      return events;
    } catch (error) {
      console.error(`${this.logPrefix} ICS 获取事件失败:`, error.message);
      throw new Error(`获取 ICS 事件失败: ${error.message}`);
    }
  }

  /**
   * 标准化事件格式
   * @param {Object} rawEvent - 原始事件数据
   * @param {Object} connection - 连接配置
   * @returns {Object} 标准化后的事件
   */
  normalizeEvent(rawEvent, connection) {
    // 提取提醒时间
    const reminderMinutes = this.extractReminderMinutes(rawEvent);

    // 处理日期
    const start = rawEvent.start ? new Date(rawEvent.start) : new Date();
    const end = rawEvent.end ? new Date(rawEvent.end) : new Date(start.getTime() + 3600000);

    return {
      id: rawEvent.uid || this.generateId(),
      title: rawEvent.summary || '无标题',
      start: start.toISOString(),
      end: end.toISOString(),
      location: rawEvent.location || '',
      description: rawEvent.description || '',
      allDay: rawEvent.datetype === 'date',
      calendarId: connection.calendarPath || connection.url || 'unknown',
      calendarName: connection.calendarName || connection.name || '未命名日历',
      reminderMinutes: reminderMinutes,
      source: connection.type || 'caldav',
      // 保留原始数据用于调试
      _raw: {
        uid: rawEvent.uid,
        dtstart: rawEvent.start,
        dtend: rawEvent.end
      }
    };
  }

  /**
   * 从事件中提取提醒时间
   * @param {Object} event - 事件对象
   * @returns {number} 提前提醒分钟数
   */
  extractReminderMinutes(event) {
    // 尝试从 VALARM 提取
    if (event.alarms && event.alarms.length > 0) {
      for (const alarm of event.alarms) {
        if (alarm.trigger) {
          // trigger 格式可能是 "-PT15M" 或 "-15M" 或数字
          const triggerStr = String(alarm.trigger);
          const match = triggerStr.match(/(\d+)/);
          if (match) {
            return parseInt(match[1], 10);
          }
        }
      }
    }

    // 默认提前15分钟
    return 15;
  }

  /**
   * 刷新所有启用的连接
   * @returns {Promise<void>}
   */
  async refreshAll() {
    console.log(`${this.logPrefix} 开始刷新所有日历连接`);

    const config = store.getCalendarConfig();
    if (!config.enabled) {
      console.log(`${this.logPrefix} 日历功能未启用，跳过刷新`);
      return;
    }

    const enabledConnections = config.connections.filter(c => c.enabled);
    console.log(`${this.logPrefix} 共 ${enabledConnections.length} 个启用的连接`);

    const allEvents = [];

    for (const connection of enabledConnections) {
      try {
        let events = [];

        if (connection.type === 'caldav') {
          events = await this.fetchCalDAVEvents(connection);
        } else if (connection.type === 'ics') {
          events = await this.fetchICSEvents(connection.url, connection);
        }

        allEvents.push(...events);

        // 更新连接状态
        store.updateCalendarConnection(connection.id, {
          status: 'connected',
          lastSync: Date.now(),
          eventCount: events.length
        });
      } catch (error) {
        console.error(`${this.logPrefix} 刷新连接 ${connection.name} 失败:`, error.message);

        // 更新连接状态为错误
        store.updateCalendarConnection(connection.id, {
          status: 'error',
          lastError: error.message
        });
      }
    }

    // 按开始时间排序
    allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    this.events = allEvents;
    console.log(`${this.logPrefix} 刷新完成，共 ${allEvents.length} 个事件`);

    // 调用刷新完成回调
    if (this.onRefreshComplete) {
      console.log(`${this.logPrefix} 调用刷新完成回调`);
      this.onRefreshComplete(allEvents);
    }

    return allEvents;
  }

  /**
   * 获取今日事件
   * @returns {Array} 今日事件列表
   */
  getTodayEvents() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    return this.events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= todayStart && eventStart < todayEnd;
    });
  }

  /**
   * 获取即将到来的事件（未来24小时）
   * @returns {Array} 即将到来的事件
   */
  getUpcomingEvents() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);

    return this.events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= now && eventStart <= tomorrow;
    });
  }

  /**
   * 启动自动刷新
   * 从配置中读取用户设置的刷新间隔
   * @returns {Promise} 初始刷新完成的 Promise
   */
  startAutoRefresh() {
    // 读取用户配置的刷新间隔（分钟），默认5分钟
    const config = store.getCalendarConfig();
    const refreshMinutes = config.refreshIntervalMinutes || 5;
    this.refreshInterval = refreshMinutes * 60 * 1000;

    console.log(`${this.logPrefix} 启动自动刷新，间隔 ${refreshMinutes} 分钟`);

    // 设置定时刷新
    this.refreshTimer = setInterval(() => {
      this.refreshAll().catch(err => {
        console.error(`${this.logPrefix} 定时刷新失败:`, err.message);
      });
    }, this.refreshInterval);

    // 立即刷新一次，返回 Promise
    return this.refreshAll().catch(err => {
      console.error(`${this.logPrefix} 初始刷新失败:`, err.message);
      throw err;
    });
  }

  /**
   * 更新刷新间隔（用户修改设置时调用）
   * @param {number} minutes - 刷新间隔（分钟）
   */
  updateRefreshInterval(minutes) {
    console.log(`${this.logPrefix} 更新刷新间隔为 ${minutes} 分钟`);

    // 停止旧的定时器
    this.stopAutoRefresh();

    // 更新间隔
    this.refreshInterval = minutes * 60 * 1000;

    // 重新启动自动刷新
    this.startAutoRefresh();
  }

  /**
   * 停止自动刷新
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log(`${this.logPrefix} 停止自动刷新`);
    }
  }

  /**
   * 生成唯一ID
   * @returns {string}
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 导出单例
module.exports = new CalendarService();
