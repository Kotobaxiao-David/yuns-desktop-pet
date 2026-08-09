# 日历提醒功能 - PRD

## 1. 文档概览

### 1.1 功能名称
日历提醒与会议通知系统

### 1.2 目标用户
- 使用钉钉/飞书日历的职场用户
- 需要会议提醒的用户
- 希望在桌面宠物上查看日程的用户

### 1.3 核心价值
通过桌面宠物集成钉钉、飞书等日历服务，实现会议提醒和今日日程展示，让用户不再错过重要会议。

---

## 2. 用户故事与范围

### 2.1 用户故事

**作为用户，我想要：**
1. 在设置中添加钉钉/飞书的 CalDAV 日历源
2. 在设置中添加第三方 ICS 日历订阅链接
3. 选择订阅哪个日历（如工作日历、个人日历）
4. 会议前通过桌宠气泡和系统通知收到提醒
5. 每天早上查看今日日程摘要
6. 自定义提前提醒时间（或使用日历自带设置）
7. 支持同时订阅多个日历源

### 2.2 范围

#### In-Scope

1. **CalDAV 日历集成**
   - 支持钉钉 CalDAV（calendar.dingtalk.com）
   - 支持飞书 CalDAV（caldav.feishu.cn）
   - 用户名+密码认证方式
   - 连接后列出可用日历供用户选择
   - 每小时刷新一次事件数据

2. **ICS 日历订阅**
   - 支持标准 ICS 格式的订阅链接
   - 支持 Google Calendar、Outlook 等第三方服务
   - 每小时刷新一次

3. **提醒系统**
   - 会议前通过桌宠气泡提醒
   - 会议前通过 macOS 系统通知提醒
   - 支持自定义提前提醒时间
   - 若未自定义，使用日历事件的 VALARM 设置
   - 提醒内容包含：会议标题、时间、地点

4. **今日日程**
   - 每天早上定时显示今日日程摘要
   - 设置界面显示今日日程列表
   - 支持手动刷新

5. **设置界面**
   - 日历标签页
   - 添加/删除日历源
   - CalDAV 连接配置（服务器、用户名、密码）
   - ICS 链接输入
   - 测试连接功能
   - 日历选择（连接后列出可用日历）
   - 提醒时间设置
   - 今日日程预览

#### Out-of-Scope
1. 日历事件创建/编辑/删除
2. 重复事件（RRULE）完整支持
3. 日历邀请回复
4. 多时区支持（后续迭代）
5. 日历视图（月视图/周视图）

---

## 3. 功能需求

### 3.1 CalDAV 连接

#### 3.1.1 连接配置
```
{
  id: string              // 唯一标识
  type: 'caldav'          // 协议类型
  name: string            // 用户自定义名称，如 "飞书工作日历"
  server: string          // 服务器地址，如 "caldav.feishu.cn"
  username: string        // 用户名
  password: string        // 密码（加密存储）
  calendarPath: string    // 选择的日历路径
  enabled: boolean        // 是否启用
}
```

#### 3.1.2 连接流程
1. 用户输入服务器地址、用户名、密码
2. 点击"测试连接"验证凭据
3. 连接成功后列出该账户下的所有日历
4. 用户选择要订阅的日历
5. 保存配置，开始定时同步

#### 3.1.3 支持的 CalDAV 服务器

| 服务器 | 地址 | 认证方式 |
|--------|------|----------|
| 钉钉 | calendar.dingtalk.com | 用户名+密码 |
| 飞书 | caldav.feishu.cn | 用户名+密码 |

### 3.2 ICS 订阅

#### 3.2.1 连接配置
```
{
  id: string              // 唯一标识
  type: 'ics'             // 协议类型
  name: string            // 用户自定义名称
  url: string             // ICS 订阅链接
  enabled: boolean        // 是否启用
}
```

#### 3.2.2 支持的 ICS 来源
- Google Calendar
- Outlook / Office 365
- Apple iCloud Calendar
- 任何标准 ICS 格式链接

### 3.3 事件数据结构

```
CalendarEvent {
  id: string              // 事件唯一标识
  title: string           // 事件标题 (SUMMARY)
  start: Date             // 开始时间 (DTSTART)
  end: Date               // 结束时间 (DTEND)
  location: string        // 地点 (LOCATION)
  description: string     // 描述 (DESCRIPTION)
  allDay: boolean         // 是否全天事件
  calendarId: string      // 来源日历 ID
  calendarName: string    // 来源日历名称
  reminderMinutes: number // 提前提醒分钟数 (来自 VALARM)
  source: string          // 来源类型: 'caldav' | 'ics'
}
```

### 3.4 提醒机制

#### 3.4.1 提醒时间判断
```
if (用户设置了自定义提前时间) {
  使用用户设置的时间
} else if (事件有 VALARM) {
  使用 VALARM 的提前时间
} else {
  默认提前 15 分钟
}
```

#### 3.4.2 提醒触发方式
1. **桌宠气泡**：显示「⏰ {标题}，{时间}，{地点}」
2. **系统通知**：macOS Notification，标题为事件标题，内容为时间+地点

#### 3.4.3 今日日程摘要
- 触发时间：每天早上 9:00（可配置）
- 显示内容：今日所有事件列表
- 格式：「今天有 N 个会议：1. xxx 2. xxx」

### 3.5 数据刷新策略

| 操作 | 频率 | 说明 |
|------|------|------|
| 事件同步 | 每小时 | 从 CalDAV/ICS 拉取最新事件 |
| 提醒检查 | 每分钟 | 检查是否有需要触发的提醒 |
| 今日日程 | 每天 9:00 | 显示今日日程摘要 |

---

## 4. 非功能需求

### 4.1 性能需求
- CalDAV 连接响应时间: < 5s
- ICS 数据解析时间: < 2s
- 提醒触发延迟: < 1分钟
- 内存占用增量: < 30MB

### 4.2 安全需求
- CalDAV 密码加密存储（使用 electron-store 的 encryption 选项）
- 不在日志中输出密码
- 连接超时设置（10秒）

### 4.3 可靠性需求
- 网络异常时显示离线状态，不崩溃
- 单个日历源失败不影响其他源
- 定时重试失败的连接

---

## 5. 技术约束与依赖

### 5.1 npm 依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| tsdav | ^2.0.0 | CalDAV 客户端 |
| node-ical | ^0.16.0 | ICS 格式解析 |
| date-fns | ^3.0.0 | 日期处理（可选） |

### 5.2 涉及文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `renderer/calendar-service.js` | 新增 | 日历服务核心 |
| `renderer/reminder-manager.js` | 新增 | 提醒管理器 |
| `renderer/settings.html` | 修改 | 添加日历标签页 |
| `renderer/settings.js` | 修改 | 日历配置逻辑 |
| `renderer/settings.css` | 修改 | 日历相关样式 |
| `main.js` | 修改 | 添加日历 IPC |
| `preload.js` | 修改 | 暴露日历 API |
| `store.js` | 修改 | 日历配置存储 |

### 5.3 系统 API
- macOS Notification API（Electron 内置）
- CalDAV 协议（RFC 4791）
- WebDAV 协议（RFC 4918）

---

## 6. 验收标准

### 6.1 功能验收
- [ ] 可以添加飞书 CalDAV 日历源并连接成功
- [ ] 可以添加钉钉 CalDAV 日历源并连接成功
- [ ] 连接后能列出可用日历供选择
- [ ] 可以添加 ICS 订阅链接
- [ ] 事件数据正确解析（标题、时间、地点）
- [ ] 会议前通过气泡提醒
- [ ] 会议前通过系统通知提醒
- [ ] 今日日程摘要正常显示
- [ ] 自定义提前时间生效
- [ ] 多日历源同时工作

### 6.2 UI 验收
- [ ] 日历标签页显示正常
- [ ] 添加日历源流程顺畅
- [ ] 测试连接反馈清晰
- [ ] 今日日程列表显示正确
- [ ] 错误提示友好

### 6.3 性能验证
- [ ] 每小时刷新不影响桌宠动画流畅度
- [ ] 内存占用无明显增长
- [ ] 网络异常时不崩溃

---

## 7. 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| CalDAV 认证失败 | 高 | 提供测试连接功能，显示详细错误 |
| 时区转换错误 | 中 | 统一使用 UTC 存储，显示时转换 |
| 重复事件解析复杂 | 中 | 第一版仅支持单次事件 |
| 网络超时 | 低 | 设置合理超时，显示离线状态 |
| 密码安全 | 中 | 使用 electron-store 加密存储 |

---

## 附录

### A. CalDAV 请求示例

```xml
PROPFIND /dav/u_ldhc1159/calendars/ HTTP/1.1
Host: caldav.feishu.cn
Authorization: Basic base64(username:password)
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
  </d:prop>
</d:propfind>
```

### B. ICS 格式示例

```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260809T100000Z
DTEND:20260809T110000Z
SUMMARY:产品评审会
LOCATION:3楼会议室
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR
```

---

**文档版本**: 1.0
**创建日期**: 2026-08-08
**状态**: 待实施
