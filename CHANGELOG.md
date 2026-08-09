# 更新日志 / Changelog

本文档记录了 Yuns桌面助手 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [2.4.0] - 2026-08-09

### Added / 新增
- **日历提醒系统**
  - CalDAV 日历集成（支持钉钉、飞书）
  - ICS 订阅链接支持
  - 每5分钟自动刷新日历（用户可配置1-60分钟）
  - 持久会议提醒气泡（从提醒时间到会议结束持续显示）
  - 点击关闭按钮手动关闭提醒
  - 会议结束后自动消失
  - macOS 系统通知
  - 每日日程摘要（定时提醒）
  - CalDAV 设置指引（飞书/钉钉官方文档链接）

- **全量模型更新**
  - DeepSeek: 新增 V4 Flash、V4 Pro
  - OpenAI: 新增 GPT-5、GPT-4.1、o3-pro、o4-mini
  - Claude: 更新为 Sonnet 4.6、Opus 5、Sonnet 5
  - Gemini: 新增 3.5 Flash、3.5 Flash Lite
  - 智谱: 更新为 GLM-5 系列
  - Kimi: 更新为 K3、K2.7-Code、K2.6、K2.5
  - 硅基流动: 新增 Qwen3.5、GLM-5、DeepSeek-V4

### Fixed / 修复
- 修复 Notification is not defined 错误（使用 Electron Notification）
- 修复 getUpcomingEvents 过滤逻辑（包含正在进行中的事件）
- 修复时序问题（初始刷新完成后再启动提醒管理器）
- 修复泡泡不可见问题（动态调整窗口大小）
- 桌宠固定位置，不再随机移动

### Technical / 技术
- 新增 `renderer/calendar-service.js` - 日历服务核心
- 新增 `renderer/reminder-manager.js` - 提醒管理器
- 添加 IPC: refresh-calendar、get-today-events、dismiss-reminder、resize-pet-window
- 添加 IPC: list-caldav-calendars、test-calendar-connection

## [2.3.0] - 2026-08-08

### Added / 新增
- **桌面宠物系统**
  - 二次元像素风猫耳少女角色（32x32 像素，4x 缩放）
  - 桌面闲逛功能：桌宠在屏幕底部随机移动
  - 多种状态动画：idle、walk、sit、sleep、happy、sad、surprised
  - 点击互动：摸头（爱心特效）、拍身体（惊讶反应）
  - 双击打开 AI 对话窗口
  - 右键显示功能菜单
  - 拖拽移动桌宠位置
  - 心情系统：0-100 心情值，影响表情和对话
  - 对话气泡：定时显示趣味对话、时间段问候、系统提醒
  - 粒子特效：点击时显示爱心飘浮效果

- **macOS 支持**
  - 添加 macOS 构建配置（dmg、zip）
  - 优化 macOS 透明窗口设置
  - 支持 Retina 显示

### Changed / 变更
- 项目版本升级至 2.3.0
- 更新 README 添加桌面宠物功能说明
- 优化宠物窗口大小为 128x128 像素
- 默认开启窗口置顶

### Technical / 技术
- 新增 `renderer/sprite-generator.js` - 像素角色生成器
- 新增 `renderer/pet-animator.js` - 动画引擎
- 新增 `renderer/pet-roaming.js` - 闲逛系统
- 新增 `renderer/mood-system.js` - 心情系统
- 新增 `renderer/dialogue-manager.js` - 对话管理器
- 新增 IPC 处理器：get-screen-size、set-window-position、show-context-menu、get/set-pet-mood
- 更新 preload.js 暴露桌宠系统 API

## [2.2.0] - 2025-12

### Added / 新增
- 新增 6 个 AI 提供商：Claude、智谱、月之暗面、零一万物、硅基流动、Groq
- 更新 Gemini 3 系列模型支持
- 新增网络代理配置功能（动态切换，无需重启）
- 自定义 API 支持手动输入任意模型 ID

### Fixed / 修复
- 修复编辑配置时 API 地址被重置的问题

### Changed / 变更
- 优化设置页面 UI

## [2.1.0] - 2024-12

### Added / 新增
- 新增 MCP 工具调用功能
- 新增 Gemini API 中转站

### Fixed / 修复
- 修复多项已知问题

### Changed / 变更
- 优化用户界面

## [2.0.0]

### Added / 新增
- 多卡片配置系统
- 多模型支持
- 视觉分析功能
- 流式输出
