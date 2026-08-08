# Yuns 桌面宠物 - macOS 改造实施计划

## 总体时间线：2-3 周

---

## 阶段 1：基础架构（第 1-2 天）

### 任务 1.1：配置 macOS 构建
**目标**：让项目能在 macOS 上正常构建和运行

**步骤**：
1. 修改 `package.json` 的 build 配置
   - 添加 macOS 构建目标（dmg, zip）
   - 配置 macOS 应用信息（appId, category）
   - 配置代码签名（可选）

2. 测试 macOS 构建
   - 运行 `npm run build:mac`
   - 测试生成的 .app 文件
   - 测试拖拽安装

**验收标准**：
- [ ] macOS 构建成功
- [ ] 应用可以正常启动
- [ ] 基本功能正常

---

### 任务 1.2：实现透明窗口基础
**目标**：创建支持透明背景的悬浮窗口

**步骤**：
1. 修改 `main.js` 的窗口配置
   ```javascript
   {
     transparent: true,
     frame: false,
     hasShadow: false,
     alwaysOnTop: true,
     resizable: false,
     skipTaskbar: true
   }
   ```

2. 创建新的 `pet.html` 基础结构
   - 透明背景
   - Canvas 画布
   - 事件监听

3. 实现窗口拖拽
   - 使用 `-webkit-app-region: drag`
   - 实现自定义拖拽逻辑

**验收标准**：
- [ ] 窗口透明正常
- [ ] 窗口可以拖拽
- [ ] 窗口始终在最上层

---

## 阶段 2：角色系统（第 3-7 天）

### 任务 2.1：设计像素风角色
**目标**：创建二次元风格的像素角色

**步骤**：
1. 设计角色形象
   - 32x32 像素
   - 猫耳少女/少年形象
   - 粉色/蓝色系配色

2. 创建 Sprite Sheet
   - idle 状态：4 帧
   - walk 状态：6 帧
   - sit 状态：4 帧
   - sleep 状态：4 帧
   - happy 状态：4 帧
   - sad 状态：4 帧

3. 导出为 PNG 文件
   - 保存到 `assets/sprites/`
   - 命名规范：`{state}_{direction}.png`

**验收标准**：
- [ ] 角色设计完成
- [ ] Sprite Sheet 导出成功
- [ ] 所有状态都有对应素材

---

### 任务 2.2：实现动画系统
**目标**：实现基于 Sprite Sheet 的动画系统

**步骤**：
1. 创建 `renderer/pet-anim.js` 动画引擎
   - 加载 Sprite Sheet
   - 帧动画控制
   - 状态机管理

2. 实现动画播放
   ```javascript
   class PetAnimator {
     constructor(canvas, spriteSheet) {
       this.canvas = canvas;
       this.ctx = canvas.getContext('2d');
       this.spriteSheet = spriteSheet;
       this.currentFrame = 0;
       this.frameRate = 30;
     }
     
     playAnimation(state, direction) {
       // 播放指定状态的动画
     }
     
     update() {
       // 更新帧
     }
     
     render() {
       // 渲染当前帧
     }
   }
   ```

3. 集成到 `pet.html`
   - 初始化 Canvas
   - 启动动画循环
   - 处理状态切换

**验收标准**：
- [ ] 动画播放流畅（30fps）
- [ ] 状态切换正常
- [ ] 内存占用合理

---

### 任务 2.3：实现状态切换
**目标**：实现角色状态的自动切换

**步骤**：
1. 创建状态机
   ```javascript
   class PetStateMachine {
     constructor() {
       this.currentState = 'idle';
       this.stateTimer = 0;
     }
     
     update(deltaTime) {
       // 根据时间切换状态
     }
     
     setState(newState) {
       // 切换状态
     }
   }
   ```

2. 实现状态切换规则
   - 空闲 30秒 → sit
   - 空闲 60秒 → sleep
   - 点击互动 → happy/surprised
   - 长时间无互动 → sad

3. 集成动画系统
   - 状态切换时播放对应动画
   - 动画播放完成后切换到下一个状态

**验收标准**：
- [ ] 状态切换逻辑正确
- [ ] 动画切换流畅
- [ ] 无状态冲突

---

## 阶段 3：闲逛功能（第 8-10 天）

### 任务 3.1：实现移动逻辑
**目标**：实现桌宠在屏幕底部随机移动

**步骤**：
1. 创建移动控制器
   ```javascript
   class PetMovement {
     constructor(window) {
       this.window = window;
       this.x = 0;
       this.y = 0;
       this.speed = 2;
       this.direction = 1; // 1: right, -1: left
     }
     
     update(deltaTime) {
       // 更新位置
     }
     
     setPosition(x, y) {
       // 设置位置
     }
   }
   ```

2. 实现随机移动
   - 每 5-10 秒随机改变方向
   - 移动速度 1-3 像素/帧
   - 保持在屏幕底部区域

3. 集成窗口位置更新
   - 使用 `window.setPosition(x, y)`
   - 平滑移动动画

**验收标准**：
- [ ] 桌宠可以随机移动
- [ ] 移动速度适中
- [ ] 位置更新平滑

---

### 任务 3.2：实现边界检测
**目标**：确保桌宠不会移出屏幕

**步骤**：
1. 获取屏幕信息
   ```javascript
   const { screen } = require('electron');
   const primaryDisplay = screen.getPrimaryDisplay();
   const { width, height } = primaryDisplay.workAreaSize;
   ```

2. 实现边界检测
   - 左边界：x >= 0
   - 右边界：x <= screenWidth - petWidth
   - 底边界：y <= screenHeight - petHeight

3. 实现边界反弹
   - 碰到边界时改变方向
   - 平滑反弹动画

**验收标准**：
- [ ] 桌宠不会移出屏幕
- [ ] 边界反弹自然
- [ ] 无卡顿现象

---

### 任务 3.3：实现状态切换
**目标**：实现移动和待机状态的切换

**步骤**：
1. 创建状态管理器
   - walk：行走状态
   - stand：站立状态
   - sit：坐下状态

2. 实现状态切换规则
   - 行走 5-10秒 → 站立
   - 站立 3-8秒 → 行走
   - 点击互动 → 停止移动
   - 双击 → 停止移动，打开对话

3. 集成动画系统
   - 状态切换时播放对应动画
   - 动画播放完成后切换状态

**验收标准**：
- [ ] 状态切换逻辑正确
- [ ] 动画切换流畅
- [ ] 交互响应及时

---

## 阶段 4：互动系统（第 11-13 天）

### 任务 4.1：实现点击检测
**目标**：实现多种点击互动方式

**步骤**：
1. 创建点击检测器
   ```javascript
   class ClickDetector {
     constructor(canvas) {
       this.canvas = canvas;
       this.setupEventListeners();
     }
     
     setupEventListeners() {
       this.canvas.addEventListener('click', this.onClick.bind(this));
       this.canvas.addEventListener('dblclick', this.onDblClick.bind(this));
       this.canvas.addEventListener('contextmenu', this.onRightClick.bind(this));
     }
     
     onClick(e) {
       // 检测点击位置
       // 判断互动类型
     }
   }
   ```

2. 实现点击位置检测
   - 头部区域：摸头互动
   - 身体区域：拍肩互动
   - 其他区域：普通点击

3. 实现互动反馈
   - 单击：摸头反应
   - 双击：打开对话窗口
   - 右键：显示菜单

**验收标准**：
- [ ] 点击检测准确
- [ ] 互动类型正确
- [ ] 反馈及时

---

### 任务 4.2：实现特效系统
**目标**：实现点击特效和心情特效

**步骤**：
1. 创建特效管理器
   ```javascript
   class ParticleSystem {
     constructor(canvas) {
       this.canvas = canvas;
       this.ctx = canvas.getContext('2d');
       this.particles = [];
     }
     
     emit(x, y, type) {
       // 发射粒子
     }
     
     update() {
       // 更新粒子状态
     }
     
     render() {
       // 渲染粒子
     }
   }
   ```

2. 实现特效类型
   - 爱心特效：点击时飘出
   - 星星特效：开心时飘出
   - 汗滴特效：尴尬时显示

3. 集成到动画系统
   - 特效与动画同步
   - 特效自动消失

**验收标准**：
- [ ] 特效显示正常
- [ ] 特效与动画同步
- [ ] 无性能问题

---

### 任务 4.3：实现心情系统
**目标**：实现心情值管理和心情显示

**步骤**：
1. 创建心情管理器
   ```javascript
   class MoodSystem {
     constructor() {
       this.mood = 50; // 0-100
       this.decayRate = 5; // 每小时衰减
     }
     
     addMood(amount) {
       // 增加心情
     }
     
     decayMood(deltaTime) {
       // 衰减心情
     }
     
     getMoodLevel() {
       // 获取心情等级
     }
   }
   ```

2. 实现心情影响因素
   - 正面互动：+5 到 +20
   - 长时间无互动：-5/小时
   - 收到礼物：+10 到 +30

3. 实现心情显示
   - 根据心情值显示不同表情
   - 心情影响对话内容

**验收标准**：
- [ ] 心情值计算正确
- [ ] 心情显示正常
- [ ] 心情影响对话

---

## 阶段 5：对话气泡（第 14-15 天）

### 任务 5.1：实现气泡显示
**目标**：实现桌面对话气泡

**步骤**：
1. 创建气泡组件
   ```javascript
   class SpeechBubble {
     constructor(canvas) {
       this.canvas = canvas;
       this.ctx = canvas.getContext('2d');
       this.text = '';
       this.visible = false;
       this.timer = 0;
     }
     
     show(text, duration) {
       // 显示气泡
     }
     
     hide() {
       // 隐藏气泡
     }
     
     render() {
       // 渲染气泡
     }
   }
   ```

2. 实现气泡样式
   - 圆角矩形
   - 箭头指向角色
   - 文字自动换行

3. 实现气泡动画
   - 显示动画：淡入
   - 隐藏动画：淡出
   - 自动隐藏：3-5秒后消失

**验收标准**：
- [ ] 气泡显示正常
- [ ] 气泡样式美观
- [ ] 气泡动画流畅

---

### 任务 5.2：实现对话内容
**目标**：实现对话内容管理和显示

**步骤**：
1. 创建对话内容管理器
   ```javascript
   class DialogueManager {
     constructor() {
       this.dialogues = {
         greeting: ['早上好呀~', '今天也要加油哦！'],
         system: ['该休息眼睛啦~', '电量只剩 20% 了'],
         mood: ['好开心见到你~', '有点无聊呢...'],
         fun: ['你知道吗？猫咪每天要睡 16 小时哦~']
       };
     }
     
     getRandomDialogue(category) {
       // 获取随机对话
     }
   }
   ```

2. 实现对话分类
   - 日常问候
   - 系统提醒
   - 心情表达
   - 趣味对话

3. 实现对话触发
   - 定时触发：每 5-10 分钟
   - 事件触发：收到通知、电量低
   - 互动触发：点击后显示

**验收标准**：
- [ ] 对话内容丰富
- [ ] 对话分类正确
- [ ] 对话触发正常

---

### 任务 5.3：实现触发逻辑
**目标**：实现对话气泡的触发逻辑

**步骤**：
1. 创建触发器管理器
   ```javascript
   class TriggerManager {
     constructor() {
       this.timers = [];
       this.setupTimers();
     }
     
     setupTimers() {
       // 设置定时触发器
     }
     
     onEvent(event) {
       // 处理事件触发
     }
   }
   ```

2. 实现定时触发
   - 每 5-10 分钟随机显示
   - 避免频繁触发

3. 实现事件触发
   - 系统通知
   - 电量变化
   - 用户互动

**验收标准**：
- [ ] 定时触发正常
- [ ] 事件触发正常
- [ ] 无频繁触发

---

## 阶段 6：集成测试（第 16-17 天）

### 任务 6.1：功能测试
**目标**：测试所有功能是否正常

**步骤**：
1. 测试角色系统
   - 动画播放
   - 状态切换
   - 角色显示

2. 测试闲逛功能
   - 随机移动
   - 边界检测
   - 状态切换

3. 测试互动系统
   - 点击检测
   - 特效显示
   - 心情系统

4. 测试对话气泡
   - 气泡显示
   - 对话内容
   - 触发逻辑

**验收标准**：
- [ ] 所有功能正常
- [ ] 无明显 bug
- [ ] 用户体验良好

---

### 任务 6.2：性能测试
**目标**：测试应用性能是否达标

**步骤**：
1. 测试 CPU 占用
   - idle 状态：< 5%
   - 移动状态：< 10%
   - 互动状态：< 15%

2. 测试内存占用
   - 启动时：< 100MB
   - 运行时：< 200MB
   - 无内存泄漏

3. 测试动画帧率
   - 目标：30fps
   - 最低：24fps
   - 无卡顿

**验收标准**：
- [ ] CPU 占用 < 5%
- [ ] 内存占用 < 200MB
- [ ] 动画流畅（30fps）

---

### 任务 6.3：兼容性测试
**目标**：测试在不同 macOS 版本上的兼容性

**步骤**：
1. 测试不同 macOS 版本
   - macOS 11.0 (Big Sur)
   - macOS 12.0 (Monterey)
   - macOS 13.0 (Ventura)
   - macOS 14.0 (Sonoma)

2. 测试不同屏幕分辨率
   - 标准分辨率
   - Retina 分辨率
   - 超宽屏

3. 测试多显示器
   - 主显示器
   - 副显示器
   - 显示器切换

**验收标准**：
- [ ] macOS 11.0+ 正常运行
- [ ] Retina 显示正常
- [ ] 多显示器正常

---

## 里程碑

| 里程碑 | 完成日期 | 状态 |
|--------|----------|------|
| M1：基础架构完成 | 第 2 天 | 待完成 |
| M2：角色系统完成 | 第 7 天 | 待完成 |
| M3：闲逛功能完成 | 第 10 天 | 待完成 |
| M4：互动系统完成 | 第 13 天 | 待完成 |
| M5：对话气泡完成 | 第 15 天 | 待完成 |
| M6：集成测试完成 | 第 17 天 | 待完成 |

---

## 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 透明窗口兼容性 | 高 | 测试多种 macOS 版本 |
| 动画性能问题 | 中 | 优化 Canvas 渲染 |
| 内存泄漏 | 中 | 定期检查资源释放 |
| 角色素材缺失 | 高 | 使用简单像素风设计 |
| 开发时间不足 | 中 | 优先实现核心功能 |

---

## 资源需求

### 角色素材
- 像素风二次元角色 Sprite Sheet
- 8 种状态，每种 4-6 帧
- 32x32 像素/帧

### 开发工具
- Electron 28.0.0
- Node.js 18+
- Canvas API
- 图像编辑工具（Aseprite, Photoshop）

### 参考资料
- Electron 文档
- Canvas 动画教程
- 像素艺术教程

---

**计划版本**：1.0  
**创建日期**：2026-08-08  
**预计完成**：2026-08-25
