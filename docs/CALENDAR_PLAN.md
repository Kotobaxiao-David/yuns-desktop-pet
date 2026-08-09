# 日历提醒功能 - 实施计划

## 总览

本计划指导如何在桌面宠物项目中实现日历提醒功能，支持 CalDAV（钉钉/飞书）和 ICS 两种协议。

**涉及文件**：

| 文件 | 操作 | 说明 |
|------|------|------|
| `renderer/calendar-service.js` | **新增** | 日历服务核心：CalDAV/ICS 数据获取与解析 |
| `renderer/reminder-manager.js` | **新增** | 提醒管理器：调度提醒、触发通知/气泡 |
| `renderer/settings.html` | 修改 | 添加"日历"标签页 |
| `renderer/settings.js` | 修改 | 日历配置逻辑 |
| `renderer/settings.css` | 修改 | 日历相关样式 |
| `main.js` | 修改 | 添加日历 IPC 处理器 + 系统通知 |
| `preload.js` | 修改 | 暴露日历 API |
| `store.js` | 修改 | 添加日历配置存储 |

**新增依赖**：

```json
{
  "tsdav": "^2.0.0",
  "node-ical": "^0.16.0"
}
```

---

## 阶段 1：依赖与存储（0.5天）

### 任务 1.1：安装依赖

```bash
cd yuns-desktop-pet
npm install tsdav node-ical
```

**验证**：`package.json` 中出现 `tsdav` 和 `node-ical`

---

### 任务 1.2：修改 store.js

**目标**：添加日历配置存储

**改动要点**：

1. 在 `defaults` 中添加 `calendarConfig`：

```javascript
calendarConfig: {
  enabled: false,
  connections: [],
  reminderMinutesBefore: null,  // null = 使用日历自带设置
  dailySummaryTime: '09:00',
  showPastEvents: false
}
```

2. 添加管理方法：

```javascript
// 获取日历配置
store.getCalendarConfig = function() { ... }

// 添加连接
store.addCalendarConnection = function(connection) { ... }

// 更新连接
store.updateCalendarConnection = function(id, updates) { ... }

// 删除连接
store.deleteCalendarConnection = function(id) { ... }

// 获取启用的连接
store.getEnabledCalendarConnections = function() { ... }
```

3. 连接数据结构：

```javascript
{
  id: string,
  type: 'caldav' | 'ics',
  name: string,
  // CalDAV 字段
  server: string,
  username: string,
  password: string,       // 建议加密存储
  calendarPath: string,   // 选择的日历路径
  calendarName: string,   // 选择的日历显示名
  // ICS 字段
  url: string,
  // 通用字段
  enabled: boolean,
  lastSync: number,       // 上次同步时间戳
  status: 'connected' | 'error' | 'pending'
}
```

**验证**：调用 `store.addCalendarConnection()` 后重启应用，数据仍在

---

## 阶段 2：日历服务（2天）

### 任务 2.1：创建 calendar-service.js

**目标**：实现 CalDAV 和 ICS 数据获取与解析

**核心类**：

```javascript
class CalendarService {
  constructor() {
    this.connections = [];
    this.events = [];
    this.refreshInterval = 3600000; // 1小时
  }

  // ===== CalDAV 相关 =====

  /**
   * 连接 CalDAV 服务器并列出可用日历
   * @param {Object} config - { server, username, password }
   * @returns {Array} 可用日历列表 [{ path, name }]
   */
  async listCalDAVCalendars(config) { ... }

  /**
   * 从 CalDAV 拉取事件
   * @param {Object} connection - 连接配置
   * @returns {Array} 事件列表
   */
  async fetchCalDAVEvents(connection) { ... }

  // ===== ICS 相关 =====

  /**
   * 从 ICS 链接拉取事件
   * @param {string} url - ICS 订阅链接
   * @returns {Array} 事件列表
   */
  async fetchICSEvents(url) { ... }

  // ===== 通用 =====

  /**
   * 刷新所有启用的连接
   */
  async refreshAll() { ... }

  /**
   * 获取今日事件
   * @returns {Array} 今日事件列表
   */
  getTodayEvents() { ... }

  /**
   * 获取即将到来的事件（未来24小时）
   * @returns {Array} 即将到来的事件
   */
  getUpcomingEvents() { ... }

  /**
   * 启动定时刷新
   */
  startAutoRefresh() { ... }
}
```

**CalDAV 实现要点**（使用 tsdav）：

```javascript
const { DAVClient } = require('tsdav');

async listCalDAVCalendars(config) {
  const client = new DAVClient({
    serverUrl: `https://${config.server}`,
    credentials: {
      username: config.username,
      password: config.password
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav'
  });

  await client.login();
  const calendars = await client.fetchCalendars();

  return calendars.map(cal => ({
    path: cal.url,
    name: cal.displayName,
    color: cal.color
  }));
}

async fetchCalDAVEvents(connection) {
  const client = new DAVClient({
    serverUrl: `https://${connection.server}`,
    credentials: {
      username: connection.username,
      password: connection.password
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav'
  });

  await client.login();

  const calendarObjects = await client.fetchCalendarObjects({
    calendar: { url: connection.calendarPath }
  });

  // 解析每个 calendarObject 的 iCalData
  const ical = require('node-ical');
  const events = [];

  for (const obj of calendarObjects) {
    const parsed = ical.parseICS(obj.data);
    for (const [key, value] of Object.entries(parsed)) {
      if (value.type === 'VEVENT') {
        events.push(this.normalizeEvent(value, connection));
      }
    }
  }

  return events;
}
```

**ICS 实现要点**（使用 node-ical）：

```javascript
const ical = require('node-ical');

async fetchICSEvents(url) {
  const data = await ical.fromURL(url);
  const events = [];

  for (const [key, value] of Object.entries(data)) {
    if (value.type === 'VEVENT') {
      events.push(this.normalizeEvent(value, { type: 'ics', url }));
    }
  }

  return events;
}
```

**事件标准化**：

```javascript
normalizeEvent(rawEvent, connection) {
  return {
    id: rawEvent.uid || generateId(),
    title: rawEvent.summary || '无标题',
    start: new Date(rawEvent.start),
    end: new Date(rawEvent.end),
    location: rawEvent.location || '',
    description: rawEvent.description || '',
    allDay: rawEvent.datetype === 'date',
    calendarId: connection.calendarPath || connection.url,
    calendarName: connection.calendarName || connection.name,
    reminderMinutes: this.extractReminderMinutes(rawEvent),
    source: connection.type
  };
}

extractReminderMinutes(event) {
  // 从 VALARM 提取提前时间
  if (event.alarms && event.alarms.length > 0) {
    const alarm = event.alarms[0];
    // VALARM 的 trigger 通常是负数，表示提前分钟数
    if (alarm.trigger && alarm.trigger.includes('-')) {
      return parseInt(alarm.trigger.replace(/[^0-9]/g, ''), 10);
    }
  }
  return 15; // 默认提前15分钟
}
```

**验证**：
- `listCalDAVCalendars()` 能返回飞书日历列表
- `fetchCalDAVEvents()` 能返回事件数据
- `fetchICSEvents()` 能解析 ICS 链接

---

## 阶段 3：提醒管理器（1天）

### 任务 3.1：创建 reminder-manager.js

**目标**：调度提醒、触发通知和气泡

**核心类**：

```javascript
class ReminderManager {
  constructor(calendarService, animator) {
    this.calendarService = calendarService;
    this.animator = animator;
    this.notifiedEvents = new Set(); // 已通知的事件ID，避免重复
    this.checkInterval = 60000; // 每分钟检查一次
  }

  /**
   * 启动提醒检查
   */
  start() {
    // 每分钟检查一次
    setInterval(() => this.checkReminders(), this.checkInterval);

    // 每天早上显示今日日程
    this.scheduleDailySummary();
  }

  /**
   * 检查是否有需要触发的提醒
   */
  checkReminders() {
    const config = store.getCalendarConfig();
    if (!config.enabled) return;

    const upcoming = this.calendarService.getUpcomingEvents();
    const now = new Date();

    for (const event of upcoming) {
      if (this.notifiedEvents.has(event.id)) continue;

      const reminderTime = this.calculateReminderTime(event, config);
      const eventStart = new Date(event.start);
      const minutesUntil = (eventStart - now) / 60000;

      if (minutesUntil <= reminderTime && minutesUntil > 0) {
        this.triggerReminder(event);
        this.notifiedEvents.add(event.id);
      }
    }
  }

  /**
   * 计算提醒时间（分钟）
   */
  calculateReminderTime(event, config) {
    if (config.reminderMinutesBefore !== null) {
      return config.reminderMinutesBefore;
    }
    return event.reminderMinutes || 15;
  }

  /**
   * 触发提醒
   */
  triggerReminder(event) {
    const timeStr = this.formatTime(event.start);
    const locationStr = event.location ? ` @ ${event.location}` : '';
    const message = `⏰ ${event.title}，${timeStr}${locationStr}`;

    // 1. 显示桌宠气泡
    this.animator.showBubble(message, 8000);

    // 2. 发送系统通知
    this.sendNotification(event.title, `${timeStr}${locationStr}`);
  }

  /**
   * 发送 macOS 系统通知
   */
  sendNotification(title, body) {
    new Notification(title, {
      body: body,
      icon: 'assets/icon.png'
    });
  }

  /**
   * 显示今日日程摘要
   */
  showDailySummary() {
    const events = this.calendarService.getTodayEvents();

    if (events.length === 0) {
      this.animator.showBubble('今天没有会议安排~', 5000);
      return;
    }

    const summary = events
      .slice(0, 3)
      .map((e, i) => `${i + 1}. ${this.formatTime(e.start)} ${e.title}`)
      .join('\n');

    const more = events.length > 3 ? `\n...还有 ${events.length - 3} 个` : '';
    this.animator.showBubble(`📅 今天有 ${events.length} 个会议：\n${summary}${more}`, 8000);
  }

  /**
   * 调度每日摘要
   */
  scheduleDailySummary() {
    const checkDaily = () => {
      const config = store.getCalendarConfig();
      const now = new Date();
      const [targetHour, targetMinute] = (config.dailySummaryTime || '09:00').split(':').map(Number);

      if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
        this.showDailySummary();
      }
    };

    setInterval(checkDaily, 60000);
  }

  /**
   * 格式化时间
   */
  formatTime(date) {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * 清除已通知记录（事件结束后）
   */
  cleanupNotified() {
    const now = new Date();
    for (const id of this.notifiedEvents) {
      // 如果事件已过期超过1小时，清除记录
      // 这里简化处理，实际可以从事件列表中查找
    }
  }
}
```

**验证**：
- 设置一个5分钟后开始的事件，能收到提醒
- 气泡显示正确的标题、时间、地点
- 系统通知正常弹出

---

## 阶段 4：主进程 IPC（1天）

### 任务 4.1：修改 main.js

**目标**：添加日历相关的 IPC 处理器

**新增处理器**：

```javascript
// ===== 日历相关 IPC =====

// 列出 CalDAV 服务器上的可用日历
ipcMain.handle('list-caldav-calendars', async (event, { server, username, password }) => {
  try {
    const calendarService = require('./renderer/calendar-service');
    const calendars = await calendarService.listCalDAVCalendars({ server, username, password });
    return { success: true, calendars };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 测试日历连接
ipcMain.handle('test-calendar-connection', async (event, connection) => {
  try {
    const calendarService = require('./renderer/calendar-service');
    if (connection.type === 'caldav') {
      const calendars = await calendarService.listCalDAVCalendars(connection);
      return { success: true, calendars };
    } else {
      const events = await calendarService.fetchICSEvents(connection.url);
      return { success: true, eventCount: events.length };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 获取今日日程
ipcMain.handle('get-today-events', async () => {
  const calendarService = require('./renderer/calendar-service');
  return calendarService.getTodayEvents();
});

// 获取即将到来的事件
ipcMain.handle('get-upcoming-events', async () => {
  const calendarService = require('./renderer/calendar-service');
  return calendarService.getUpcomingEvents();
});

// 保存日历配置
ipcMain.handle('save-calendar-config', async (event, config) => {
  store.set('calendarConfig', { ...store.get('calendarConfig'), ...config });
  return { success: true };
});

// 手动刷新日历
ipcMain.handle('refresh-calendar', async () => {
  try {
    const calendarService = require('./renderer/calendar-service');
    await calendarService.refreshAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

**修改应用启动逻辑**：

```javascript
// 在 app.whenReady() 中添加
const CalendarService = require('./renderer/calendar-service');
const ReminderManager = require('./renderer/reminder-manager');

const calendarService = new CalendarService();
const reminderManager = new ReminderManager(calendarService, petAnimator);

// 启动日历服务
calendarService.startAutoRefresh();
reminderManager.start();
```

**验证**：渲染进程调用 `electronAPI.listCalDAVCalendars()` 能返回日历列表

---

### 任务 4.2：修改 preload.js

**目标**：暴露日历 API

**新增 API**：

```javascript
// ===== 日历相关 API =====

// 列出 CalDAV 日历
listCalDAVCalendars: async (server, username, password) => {
  return await ipcRenderer.invoke('list-caldav-calendars', { server, username, password });
},

// 测试连接
testCalendarConnection: async (connection) => {
  return await ipcRenderer.invoke('test-calendar-connection', connection);
},

// 获取今日日程
getTodayEvents: async () => {
  return await ipcRenderer.invoke('get-today-events');
},

// 获取即将到来的事件
getUpcomingEvents: async () => {
  return await ipcRenderer.invoke('get-upcoming-events');
},

// 保存日历配置
saveCalendarConfig: async (config) => {
  return await ipcRenderer.invoke('save-calendar-config', config);
},

// 手动刷新
refreshCalendar: async () => {
  return await ipcRenderer.invoke('refresh-calendar');
},
```

**验证**：`window.electronAPI.getTodayEvents()` 可用

---

## 阶段 5：设置界面 UI（2天）

### 任务 5.1：修改 settings.html

**目标**：添加日历标签页

**标签栏**：
```html
<div class="tab-bar">
  <button class="tab" data-tab="api">API配置</button>
  <button class="tab" data-tab="appearance">外观</button>
  <button class="tab" data-tab="calendar">日历</button>  <!-- 新增 -->
  <button class="tab" data-tab="mcp">MCP</button>
  <button class="tab" data-tab="about">关于</button>
</div>
```

**日历标签页内容**：
```html
<div class="tab-content" id="tab-calendar" style="display:none;">
  <!-- 启用开关 -->
  <div class="setting-item">
    <label>
      <input type="checkbox" id="calendar-enabled"> 启用日历提醒
    </label>
  </div>

  <!-- 日历源列表 -->
  <div class="section-title">日历源</div>
  <div id="calendar-connections-list">
    <!-- 动态生成 -->
  </div>
  <button id="add-calendar-btn" class="btn-primary">+ 添加日历源</button>

  <!-- 提醒设置 -->
  <div class="section-title">提醒设置</div>
  <div class="setting-item">
    <label>提前提醒时间</label>
    <select id="reminder-time-select">
      <option value="null">使用日历设置</option>
      <option value="5">5 分钟</option>
      <option value="10">10 分钟</option>
      <option value="15">15 分钟</option>
      <option value="30">30 分钟</option>
      <option value="60">1 小时</option>
    </select>
  </div>
  <div class="setting-item">
    <label>今日日程提醒时间</label>
    <input type="time" id="daily-summary-time" value="09:00">
  </div>

  <!-- 今日日程预览 -->
  <div class="section-title">今日日程</div>
  <div id="today-events-list">
    <!-- 动态生成 -->
  </div>
  <button id="refresh-calendar-btn" class="btn-secondary">立即刷新</button>
</div>
```

**添加日历源对话框**：
```html
<div id="add-calendar-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <h3>添加日历源</h3>

    <!-- 类型选择 -->
    <div class="setting-item">
      <label>类型</label>
      <select id="calendar-type-select">
        <option value="caldav">CalDAV（钉钉/飞书）</option>
        <option value="ics">ICS 订阅链接</option>
      </select>
    </div>

    <!-- CalDAV 字段 -->
    <div id="caldav-fields">
      <div class="setting-item">
        <label>服务器地址</label>
        <input type="text" id="caldav-server" placeholder="caldav.feishu.cn">
      </div>
      <div class="setting-item">
        <label>用户名</label>
        <input type="text" id="caldav-username">
      </div>
      <div class="setting-item">
        <label>密码</label>
        <input type="password" id="caldav-password">
      </div>
      <button id="test-caldav-btn" class="btn-secondary">测试连接</button>
      <div id="caldav-calendars-select" style="display:none;">
        <label>选择日历</label>
        <select id="caldav-calendar-select"></select>
      </div>
    </div>

    <!-- ICS 字段 -->
    <div id="ics-fields" style="display:none;">
      <div class="setting-item">
        <label>订阅链接</label>
        <input type="text" id="ics-url" placeholder="https://...">
      </div>
      <button id="test-ics-btn" class="btn-secondary">测试连接</button>
    </div>

    <!-- 通用字段 -->
    <div class="setting-item">
      <label>名称</label>
      <input type="text" id="calendar-name" placeholder="我的日历">
    </div>

    <div class="modal-actions">
      <button id="cancel-calendar-btn" class="btn-secondary">取消</button>
      <button id="save-calendar-btn" class="btn-primary">保存</button>
    </div>
  </div>
</div>
```

---

### 任务 5.2：修改 settings.js

**目标**：实现日历配置逻辑

**核心函数**：

```javascript
// 加载日历配置
async function loadCalendarConfig() {
  const config = await window.electronAPI.storeGet('calendarConfig');
  renderCalendarConnections(config.connections || []);
  renderTodayEvents();
}

// 渲染日历源列表
function renderCalendarConnections(connections) {
  const container = document.getElementById('calendar-connections-list');
  container.innerHTML = connections.map(conn => `
    <div class="calendar-connection-card" data-id="${conn.id}">
      <div class="connection-info">
        <h4>${conn.name}</h4>
        <p>${conn.type === 'caldav' ? `CalDAV: ${conn.server}` : `ICS: ${conn.url}`}</p>
        <span class="status ${conn.status}">${conn.status === 'connected' ? '✅ 已连接' : '❌ 连接失败'}</span>
      </div>
      <div class="connection-actions">
        <button onclick="deleteCalendarConnection('${conn.id}')">删除</button>
      </div>
    </div>
  `).join('');
}

// 测试 CalDAV 连接
async function testCalDAVConnection() {
  const server = document.getElementById('caldav-server').value;
  const username = document.getElementById('caldav-username').value;
  const password = document.getElementById('caldav-password').value;

  const result = await window.electronAPI.testCalendarConnection({
    type: 'caldav', server, username, password
  });

  if (result.success) {
    // 显示日历选择下拉框
    const select = document.getElementById('caldav-calendar-select');
    select.innerHTML = result.calendars.map(cal =>
      `<option value="${cal.path}">${cal.name}</option>`
    ).join('');
    document.getElementById('caldav-calendars-select').style.display = 'block';
  } else {
    alert(`连接失败: ${result.error}`);
  }
}

// 保存日历源
async function saveCalendarConnection() {
  const type = document.getElementById('calendar-type-select').value;
  const name = document.getElementById('calendar-name').value;

  const connection = {
    id: generateId(),
    type,
    name,
    enabled: true,
    status: 'pending'
  };

  if (type === 'caldav') {
    connection.server = document.getElementById('caldav-server').value;
    connection.username = document.getElementById('caldav-username').value;
    connection.password = document.getElementById('caldav-password').value;
    connection.calendarPath = document.getElementById('caldav-calendar-select').value;
  } else {
    connection.url = document.getElementById('ics-url').value;
  }

  // 保存到 store
  await window.electronAPI.saveCalendarConnection(connection);
  closeModal();
  loadCalendarConfig();
}

// 渲染今日日程
async function renderTodayEvents() {
  const events = await window.electronAPI.getTodayEvents();
  const container = document.getElementById('today-events-list');

  if (events.length === 0) {
    container.innerHTML = '<p>今天没有日程安排</p>';
    return;
  }

  container.innerHTML = events.map(event => `
    <div class="event-item">
      <div class="event-time">${formatTime(event.start)} - ${formatTime(event.end)}</div>
      <div class="event-title">${event.title}</div>
      ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
    </div>
  `).join('');
}
```

---

### 任务 5.3：修改 settings.css

**目标**：日历相关样式

```css
/* 日历连接卡片 */
.calendar-connection-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connection-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.connection-info p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.status.connected {
  color: #2ecc71;
}

.status.error {
  color: #e74c3c;
}

/* 日程列表 */
.event-item {
  padding: 10px;
  border-left: 3px solid var(--accent-color);
  margin-bottom: 8px;
  background: var(--bg-secondary);
  border-radius: 0 8px 8px 0;
}

.event-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.event-title {
  font-size: 14px;
  font-weight: 500;
  margin: 4px 0;
}

.event-location {
  font-size: 12px;
  color: var(--text-secondary);
}
```

---

## 阶段 6：集成测试（1天）

### 测试清单

| 测试项 | 预期结果 |
|--------|----------|
| 添加飞书 CalDAV | 连接成功，列出日历 |
| 添加钉钉 CalDAV | 连接成功，列出日历 |
| 添加 ICS 链接 | 解析成功，显示事件数 |
| 选择日历后保存 | 配置持久化 |
| 会议前15分钟提醒 | 气泡 + 系统通知 |
| 自定义提前时间 | 按设置时间提醒 |
| 今日日程摘要 | 早上9点自动显示 |
| 手动刷新 | 立即更新事件 |
| 网络断开 | 显示离线状态，不崩溃 |
| 重启应用 | 配置保持，自动同步 |

---

## 里程碑

| 里程碑 | 内容 | 预计天数 |
|--------|------|----------|
| M1 | 依赖安装 + store 配置 | 0.5天 |
| M2 | calendar-service.js 完成 | 2天 |
| M3 | reminder-manager.js 完成 | 1天 |
| M4 | main.js + preload.js IPC 完成 | 1天 |
| M5 | settings UI 完成 | 2天 |
| M6 | 测试通过 | 1天 |

**总计：约 7.5 天**

---

## 注意事项

1. **密码安全**：CalDAV 密码建议使用 electron-store 的加密选项存储
2. **网络超时**：CalDAV/ICS 请求设置 10 秒超时
3. **时区处理**：事件时间统一转换为本地时区显示
4. **重复事件**：第一版仅支持单次事件，RRULE 支持后续迭代
5. **错误处理**：单个日历源失败不应影响其他源的正常工作

---

**文档版本**: 1.0
**创建日期**: 2026-08-08
**预计完成**: 2026-08-16
