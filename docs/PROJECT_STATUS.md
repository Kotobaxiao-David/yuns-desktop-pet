项目概述 / Project Overview

项目名称 / Project Name: Yuns桌面助手 / Yuns Desktop Assistant
项目描述 / Project Description: 智能桌面宠物 - 多模型AI对话助手 + MCP工具调用 / Smart Desktop Pet - Multi-model AI Chat Assistant + MCP Tool Calling
目标用户 / Target Users:
- macOS 桌面用户 / macOS Desktop Users
- 二次元文化爱好者 / Anime Culture Enthusiasts
- 需要AI对话助手的用户 / Users Needing AI Chat Assistant

当前状态 / Current Status

开发阶段 / Development Phase: 功能完善 / Feature Enhancement
最后更新 / Last Updated: 2026-08-08
版本 / Version: 2.3.0

用户操作记录 / User Operation History

本文档记录了用户对AI助手的每一项操作，帮助理解项目演进过程。

操作1：macOS桌面宠物改造
时间: 2026-08-08
用户指令: 克隆yuns-desktop-pet仓库，改造为macOS原生二次元桌面宠物
执行内容:
- 克隆仓库 https://github.com/JianguSheng/yuns-desktop-pet.git
- 添加macOS构建配置（dmg/zip）
- 创建像素风猫耳少女角色系统
- 实现桌面闲逛功能
- 实现点击互动系统
- 实现心情系统
- 实现对话气泡系统
- 推送到用户fork仓库
结果: 成功实现桌面宠物系统，版本升级至2.3.0

操作2：角色切换功能PRD编写
时间: 2026-08-08
用户指令: 编写角色切换功能的PRD和实施计划文档
执行内容:
- 创建 docs/PRD.md - 角色切换功能需求文档
- 创建 docs/CHARACTER_SWITCH_PLAN.md - 分阶段实施计划
- 定义5个内置预设角色（猫耳少女、狗耳少年、兔耳娘、小恶魔、史莱姆）
- 定义sprite sheet格式规范
- 推送到GitHub
结果: 文档已推送到GitHub，待用户按计划实施

已完成功能 / Completed Features

1. 桌面宠物系统 / Desktop Pet System
 - 像素风猫耳少女角色（32x32, 4x缩放）
 - 桌面闲逛功能（行走/站立状态切换）
 - 点击互动系统（摸头/拍身体/双击/右键/拖拽）
 - 心情系统（0-100心情值，影响对话）
 - 对话气泡（定时问候/系统提醒）
 - 粒子特效（爱心飘浮效果）

2. AI对话系统 / AI Chat System
 - 多模型支持（DeepSeek、Gemini、OpenAI、Claude等10+提供商）
 - MCP工具调用
 - 视觉分析（截屏分析）
 - Gemini API中转站

3. macOS优化 / macOS Optimization
 - 透明窗口设置
 - Retina显示支持
 - 构建配置（dmg/zip）

技术栈 / Tech Stack

组件 / Component | 技术 / Technology | 版本 / Version
---|---|---
前端框架 / Frontend Framework | Electron | 28.0.0
渲染引擎 / Rendering Engine | HTML5 Canvas | -
数据持久化 / Data Persistence | electron-store | 8.1.0
HTTP客户端 / HTTP Client | axios | 1.6.0
MCP协议 / MCP Protocol | @modelcontextprotocol/sdk | 1.25.1
中转站服务器 / Proxy Server | express | 4.18.2

项目结构 / Project Structure

```
yuns-desktop-pet/
├── main.js                    # Electron主进程
├── preload.js                 # 预加载脚本
├── config.js                  # 应用配置
├── store.js                   # 数据持久化
├── api-service.js             # AI API调用服务
├── mcp-client.js              # MCP客户端管理
├── proxy-server.js            # Gemini API中转站
├── renderer/                  # 渲染进程
│   ├── pet.html               # 桌宠窗口
│   ├── pet-animator.js        # 动画引擎
│   ├── pet-roaming.js         # 闲逛系统
│   ├── mood-system.js         # 心情系统
│   ├── dialogue-manager.js    # 对话管理器
│   ├── sprite-generator.js    # 角色生成器
│   ├── chat.html/js/css       # 对话窗口
│   ├── settings.html/js/css   # 设置窗口
│   └── friendly-messages.js   # 友好提示
├── assets/                    # 资源文件
│   ├── icon.png               # 应用图标
│   └── shiba.jpg              # 柴犬图片
├── docs/                      # 文档
│   ├── PRD.md                 # 角色切换功能PRD
│   ├── CHARACTER_SWITCH_PLAN.md  # 角色切换实施计划
│   ├── IMPLEMENTATION_PLAN.md    # 原始实施计划
│   └── PROJECT_STATUS.md         # 项目状态文档
└── package.json               # 项目配置
```

关键决策 / Key Decisions

1. 技术选型 / Technology Selection
 - 选择Electron而非原生macOS：保留现有AI功能，跨平台支持
 - 选择Canvas而非SpriteKit：Web技术栈一致性，易于维护

2. 架构设计 / Architecture Design
 - 角色系统：程序化像素生成 + 预设调色板方案
 - 心情系统：0-100数值，影响表情和对话内容
 - 闲逛系统：随机移动 + 边界检测 + 状态机切换

已知问题 / Known Issues

1. 性能优化
 - 动画帧率可能受Canvas渲染影响
 - 大量粒子特效可能影响性能

2. 功能限制
 - 角色切换功能尚未实施（PRD已编写）
 - 自定义sprite sheet导入尚未实现

下一步计划 / Next Steps

短期目标 / Short-term Goals
- 实施角色切换功能（参考 docs/CHARACTER_SWITCH_PLAN.md）
- 添加更多内置角色预设
- 优化动画性能

中期目标 / Medium-term Goals
- 实现自定义sprite sheet导入
- 添加角色编辑器
- 支持多角色同时显示

最后更新 / Last Updated: 2026-08-08
