# 角色切换功能 - 实施计划

## 总览

本计划指导如何在现有桌面宠物项目中实现角色切换功能。

**涉及文件**：

| 文件 | 操作 | 说明 |
|------|------|------|
| `renderer/sprite-generator.js` | 重构 | 添加多角色预设定义 + sprite sheet 加载器 |
| `renderer/pet-animator.js` | 修改 | 支持动态切换角色数据源，`getColor()` 使用当前角色调色板 |
| `renderer/pet.html` | 微调 | 添加角色初始化逻辑，启动时加载上次选择的角色 |
| `renderer/settings.html` | 修改 | 新增"角色"标签页，显示角色卡片列表 |
| `renderer/settings.js` | 修改 | 添加角色选择、预览、导入逻辑 |
| `renderer/settings.css` | 修改 | 角色卡片样式、选中高亮、预览图 |
| `main.js` | 修改 | 添加角色管理 IPC：get-characters、set-character、import-character |
| `preload.js` | 修改 | 暴露角色 API 到渲染进程 |
| `store.js` | 修改 | 添加 currentCharacter 字段和角色管理方法 |

---

## 阶段 1：角色数据层（1-2天）

### 任务 1.1：重构 sprite-generator.js

**目标**：将角色数据从硬编码改为可配置的预设系统

**改动要点**：

1. 定义 `CHARACTER_PRESETS` 对象，包含 5 个预设角色
2. 每个预设包含：id、name、description、palette（调色板）、ears（耳朵类型）
3. 将 `getIdlePixels()` 等函数改为 `getCharacterPixels(charId, state, frameIndex)`
4. `getColor(index)` 改为 `getColor(index, palette)`，接受当前角色的调色板
5. 添加 `loadSpriteSheet(imagePath)` 函数，用于加载外部 PNG sprite sheet
6. 添加 sprite sheet 格式说明注释

**调色板结构**：
```javascript
{
  hair: '#FF6B9D',      // 头发主色
  hairDark: '#E05580',  // 头发暗部
  skin: '#FFE0BD',      // 肤色
  eye: '#4A90D9',       // 眼睛
  eyeWhite: '#FFFFFF',  // 眼白
  eyePupil: '#2C5F8A',  // 瞳孔
  mouth: '#FF4466',     // 嘴巴
  blush: '#FFB3B3',     // 腮红
  cloth: '#6C5CE7',     // 衣服
  accent: '#FFD700'     // 点缀色
}
```

**验证**：能通过 `SpriteGenerator.CHARACTER_PRESETS.catGirl` 获取角色数据

---

### 任务 1.2：修改 store.js

**目标**：添加角色持久化存储

**改动要点**：

1. 在 `defaults` 中添加 `currentCharacter: 'catGirl'`
2. 添加 `store.getCurrentCharacter()` 方法
3. 添加 `store.setCurrentCharacter(charId)` 方法
4. 添加 `store.getCustomCharacters()` 方法（获取用户导入的自定义角色）
5. 添加 `store.addCustomCharacter(charData)` 方法

**验证**：调用 `store.setCurrentCharacter('dogBoy')` 后重启应用，能读取到 'dogBoy'

---

## 阶段 2：动画引擎改造（1-2天）

### 任务 2.1：修改 pet-animator.js

**目标**：让 PetAnimator 支持动态切换角色

**改动要点**：

1. 构造函数添加 `this.currentCharacterId` 属性，初始从 store 读取
2. `initAnimations()` 改为根据 `currentCharacterId` 加载对应角色的像素数据
3. `getColor()` 方法改为使用当前角色的调色板
4. `renderFrame()` 方法根据当前角色调色板渲染
5. 添加 `switchCharacter(newCharId)` 方法：
   - 更新 `currentCharacterId`
   - 重新加载动画帧
   - 保存到 store
   - 保持当前状态不变（心情、对话等）
6. 添加 `loadCustomSpriteSheet(imagePath)` 方法，用于加载外部角色

**关键代码逻辑**：
```javascript
switchCharacter(newCharId) {
  this.currentCharacterId = newCharId;
  this.currentPalette = SpriteGenerator.CHARACTER_PRESETS[newCharId].palette;
  this.initAnimations(); // 重新加载动画
  // 保存选择
  if (window.electronAPI) {
    window.electronAPI.storeSet('currentCharacter', newCharId);
  }
}
```

**验证**：调用 `animator.switchCharacter('bunnyGirl')` 后外观变化，心情值不变

---

### 任务 2.2：修改 pet.html 启动逻辑

**目标**：应用启动时加载上次选择的角色

**改动要点**：

1. 在初始化 PetAnimator 后，从 store 读取 `currentCharacter`
2. 如果有保存的角色，调用 `switchCharacter()` 恢复
3. 如果有自定义 sprite sheet 路径，加载它

**验证**：选择狗耳少年后重启应用，仍然是狗耳少年

---

## 阶段 3：主进程 IPC（0.5天）

### 任务 3.1：添加角色管理 IPC 处理器

**目标**：在 main.js 中添加角色相关的 IPC 处理

**新增处理器**：

```javascript
// 获取所有可用角色（预设 + 自定义）
ipcMain.handle('get-characters', () => {
  const presets = Object.entries(CHARACTER_PRESETS).map(([id, data]) => ({
    id, ...data, type: 'preset'
  }));
  const customs = store.getCustomCharacters().map(c => ({
    ...c, type: 'custom'
  }));
  return [...presets, ...customs];
});

// 设置当前角色
ipcMain.handle('set-character', (event, { characterId }) => {
  store.setCurrentCharacter(characterId);
  if (petWindow) petWindow.webContents.send('character-changed', characterId);
  return { success: true };
});

// 获取当前角色
ipcMain.handle('get-current-character', () => {
  return store.getCurrentCharacter();
});

// 导入自定义角色 sprite sheet
ipcMain.handle('import-character', async (event, { filePath, name, description }) => {
  // 复制文件到用户数据目录
  // 验证 sprite sheet 格式
  // 保存到 store
  const userDataPath = app.getPath('userData');
  const charactersDir = path.join(userDataPath, 'characters');
  // ...
  return { success: true, characterId: newId };
});
```

**验证**：渲染进程调用 `electronAPI.getCharacters()` 能返回 5 个预设角色

---

### 任务 3.2：更新 preload.js

**目标**：暴露角色管理 API

**新增 API**：

```javascript
// 获取所有角色
getCharacters: async () => {
  return await ipcRenderer.invoke('get-characters');
},

// 获取当前角色
getCurrentCharacter: async () => {
  return await ipcRenderer.invoke('get-current-character');
},

// 设置当前角色
setCharacter: async (characterId) => {
  return await ipcRenderer.invoke('set-character', { characterId });
},

// 导入自定义角色
importCharacter: async (filePath, name, description) => {
  return await ipcRenderer.invoke('import-character', { filePath, name, description });
},

// 监听角色切换事件
onCharacterChanged: (callback) => {
  ipcRenderer.on('character-changed', (event, characterId) => callback(characterId));
},
```

**验证**：在渲染进程中 `window.electronAPI.getCharacters()` 可用

---

## 阶段 4：设置界面 UI（2-3天）

### 任务 4.1：修改 settings.html

**目标**：添加角色选择标签页

**改动要点**：

1. 在标签栏添加"角色"标签按钮
2. 添加角色标签页内容区域
3. 角色卡片结构：
```html
<div class="character-card" data-id="catGirl">
  <div class="character-preview">
    <canvas class="character-thumbnail" width="64" height="64"></canvas>
  </div>
  <div class="character-info">
    <h4>猫耳少女</h4>
    <p>可爱的猫耳娘，粉色头发紫色衣服</p>
  </div>
  <button class="character-use-btn">使用</button>
</div>
```
4. 添加"导入自定义角色"按钮和导入对话框

**验证**：设置界面能看到"角色"标签，点击后显示角色卡片列表

---

### 任务 4.2：修改 settings.js

**目标**：实现角色选择逻辑

**改动要点**：

1. 添加 `loadCharacters()` 函数，从主进程获取角色列表
2. 渲染角色卡片，为每个角色生成缩略图预览
3. 绑定"使用"按钮点击事件，调用 `electronAPI.setCharacter()`
4. 当前选中角色添加高亮样式 `.selected`
5. 添加导入功能：打开文件对话框选择 PNG，填写名称和描述
6. 监听 `character-changed` 事件，更新 UI 状态

**验证**：点击"使用"按钮后，桌宠外观立即变化

---

### 任务 4.3：修改 settings.css

**目标**：角色卡片样式

**新增样式**：
- `.character-grid` - 网格布局（3列）
- `.character-card` - 卡片样式（圆角、阴影、hover 效果）
- `.character-card.selected` - 选中高亮（边框变主题色）
- `.character-preview` - 预览区域（64x64 canvas）
- `.character-use-btn` - 使用按钮
- `.character-import-btn` - 导入按钮

**验证**：角色卡片显示美观，选中状态清晰可见

---

## 阶段 5：Sprite Sheet 模板与文档（0.5天）

### 任务 5.1：创建 sprite sheet 模板

**目标**：提供空白模板供用户绘制自定义角色

**产出**：
- `assets/sprite_template.png` - 192x256 空白模板（带网格线和状态标注）
- `docs/SPRITE_SHEET_GUIDE.md` - 绘制指南文档

**模板格式**：
```
192x256 像素 (6列 x 8行，每帧 32x32)
状态行：idle, walk, sit, sleep, happy, sad, angry, surprised
```

---

### 任务 5.2：更新项目文档

**目标**：更新 README 和 CHANGELOG

**改动**：
- README.md 添加角色切换功能说明
- CHANGELOG.md 添加 v2.4.0 版本记录

---

## 阶段 6：测试与修复（1天）

### 测试清单

| 测试项 | 预期结果 |
|--------|----------|
| 切换到狗耳少年 | 外观变化，动画正常 |
| 切换到兔耳娘 | 外观变化，动画正常 |
| 切换到小恶魔 | 外观变化，动画正常 |
| 切换到史莱姆 | 外观变化，动画正常 |
| 切换回猫耳少女 | 外观恢复，动画正常 |
| 切换后心情值保持 | 心情值不变 |
| 切换后对话正常 | 气泡显示正常 |
| 重启应用后角色保持 | 加载上次选择的角色 |
| 导入自定义 sprite sheet | 角色正常显示 |
| 导入格式错误的文件 | 显示友好错误提示 |

---

## 里程碑

| 里程碑 | 内容 | 预计天数 |
|--------|------|----------|
| M1 | 角色数据层完成（sprite-generator + store） | 1-2天 |
| M2 | 动画引擎改造完成（pet-animator） | 1-2天 |
| M3 | 主进程 IPC 完成（main + preload） | 0.5天 |
| M4 | 设置界面 UI 完成（settings） | 2-3天 |
| M5 | 模板与文档完成 | 0.5天 |
| M6 | 测试通过 | 1天 |

**总计**：约 6-9 天

---

## 注意事项

1. **调色板一致性**：所有预设角色使用相同的颜色索引（1=头发, 3=皮肤, 9=衣服），只是调色板颜色不同
2. **状态保持**：切换角色时只改变外观，不改变心情、对话历史等状态
3. **内存管理**：自定义 sprite sheet 不要太大（建议 < 512x512），避免内存问题
4. **错误处理**：导入 sprite sheet 时要验证格式，失败时给用户友好提示
5. **向后兼容**：现有的 `getIdlePixels()` 等函数签名保持不变，内部改为调用 `getCharacterPixels()`

---

**文档版本**: 1.0
**创建日期**: 2026-08-08
**预计完成**: 2026-08-17
