/**
 * 角色 Sprite 生成器 - 程序化生成像素风猫耳少女
 * 使用 Canvas 绘制各状态的像素动画帧
 */

const PIXEL_SIZE = 4; // 每个像素点的实际渲染大小
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;

// 角色调色板
const PALETTE = {
  skin: '#FFE0BD',
  skinShadow: '#F5C5A3',
  hair: '#FF6B9D',       // 粉色头发
  hairDark: '#E05580',
  hairLight: '#FF8DB5',
  eye: '#4A90D9',        // 蓝色眼睛
  eyeWhite: '#FFFFFF',
  eyePupil: '#2C5F8A',
  mouth: '#FF4466',
  blush: '#FFB3B3',      // 腮红
  cloth: '#6C5CE7',      // 紫色衣服
  clothLight: '#8B7FF0',
  clothDark: '#5A4BD1',
  catEar: '#FF6B9D',     // 猫耳
  catEarInner: '#FFB3C6',
  ribbon: '#FFD700',     // 蝴蝶结
  ribbonDark: '#E6C200',
  outline: '#2D2D2D',
  transparent: 'rgba(0,0,0,0)'
};

// 猫耳少女像素数据 (32x32, 0=透明, 1-9=颜色索引)
// 每行32个像素
const SPRITE_IDLE_1 = [
  // Row 0-3: 猫耳
  '00000000000000000000000000000000',
  '00000000001111000011110000000000',
  '00000000112221101122211000000000',
  '00000000112221101122211000000000',
  // Row 4-7: 头发上部
  '00000001111111111111111110000000',
  '00000011111111111111111111000000',
  '00000111111111111111111111100000',
  '00001111111111111111111111110000',
  // Row 8-11: 脸部
  '00001111133333333333111111110000',
  '00001111333333333333311111110000',
  '00001111334445544453311111110000',
  '00001111334445544453311111110000',
  // Row 12-15: 眼睛
  '00001111334465564453311111110000',
  '00001111334465564453311111110000',
  '00001111333445544353311111110000',
  '00001111333377773353311111110000',
  // Row 16-19: 嘴巴和下巴
  '00001111333338833333311111110000',
  '00001111333333333333311111110000',
  '00000111133333333331111111100000',
  '00000111111111111111111111100000',
  // Row 20-23: 身体上部
  '00000011111111111111111110000000',
  '00000009999999999999999900000000',
  '00000099999999999999999990000000',
  '00000099999999999999999990000000',
  // Row 24-27: 身体下部
  '00000099999999999999999990000000',
  '00000099999999999999999990000000',
  '00000009999999999999999900000000',
  '00000000999999999999999000000000',
  // Row 28-31: 腿和脚
  '00000000099900000009990000000000',
  '00000000099900000009990000000000',
  '00000000999900000099990000000000',
  '00000009999900000099999000000000'
];

/**
 * 将像素数据字符串转换为二维数组
 */
function parseSpriteData(data) {
  return data.map(row => row.split('').map(Number));
}

/**
 * 根据像素索引获取颜色
 */
function getColor(index) {
  const colorMap = {
    0: PALETTE.transparent,
    1: PALETTE.hair,
    2: PALETTE.hairDark,
    3: PALETTE.skin,
    4: PALETTE.eyeWhite,
    5: PALETTE.eyePupil,
    6: PALETTE.eye,
    7: PALETTE.blush,
    8: PALETTE.mouth,
    9: PALETTE.cloth
  };
  return colorMap[index] || PALETTE.transparent;
}

/**
 * 在 Canvas 上渲染一帧像素画
 */
function renderPixelFrame(ctx, spriteData, offsetX = 0, offsetY = 0, scale = 1) {
  const pixels = parseSpriteData(spriteData);
  const pixelSize = PIXEL_SIZE * scale;

  ctx.clearRect(offsetX, offsetY, FRAME_WIDTH * pixelSize, FRAME_HEIGHT * pixelSize);

  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      const colorIndex = pixels[y][x];
      if (colorIndex === 0) continue; // 透明

      const color = getColor(colorIndex);
      ctx.fillStyle = color;
      ctx.fillRect(
        offsetX + x * pixelSize,
        offsetY + y * pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }
}

/**
 * 创建完整的角色 Sprite 系统
 * 返回 Canvas sprite sheet
 */
function createSpriteSheet() {
  const canvas = document.createElement('canvas');
  const scale = 1;
  const frameW = FRAME_WIDTH * PIXEL_SIZE * scale;
  const frameH = FRAME_HEIGHT * PIXEL_SIZE * scale;

  // 8种状态，每种4-6帧
  canvas.width = frameW * 6; // 最大6帧宽
  canvas.height = frameH * 8; // 8种状态

  const ctx = canvas.getContext('2d');

  // 绘制idle状态帧1
  renderPixelFrame(ctx, SPRITE_IDLE_1, 0, 0, scale);

  return {
    canvas,
    frameWidth: frameW,
    frameHeight: frameH,
    states: {
      idle: { row: 0, frames: 1 },
      walk: { row: 1, frames: 6 },
      sit: { row: 2, frames: 4 },
      sleep: { row: 3, frames: 4 },
      happy: { row: 4, frames: 4 },
      sad: { row: 5, frames: 4 },
      angry: { row: 6, frames: 4 },
      surprised: { row: 7, frames: 2 }
    }
  };
}

// 导出到全局
window.SpriteGenerator = {
  createSpriteSheet,
  renderPixelFrame,
  parseSpriteData,
  getColor,
  PALETTE,
  SPRITE_IDLE_1,
  PIXEL_SIZE,
  FRAME_WIDTH,
  FRAME_HEIGHT
};
