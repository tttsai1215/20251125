let spriteSheet;
let spriteSheet2;
let frames = [];
let frames2 = [];
let defaultFrameWidth = 3905 / 14;

// 角色 1 的設定
const FRAME1_W = 260; // 3905 / 15 = 260.33, 取 260
const FRAME1_H = 454;
const TOTAL_FRAMES = 15;
let currentFrame = 0;
let animTimer = 0;

// 角色 2 的設定 (按下右鍵時顯示)
const FRAME2_W = 306; // 2449 / 8 = 306.125, 取 306
const FRAME2_H = 485;
const TOTAL_FRAMES2 = 8;
let currentFrame2 = 0;
let animTimer2 = 0;

// 角色位置與跳躍狀態
let charPos;
let isJumping = false;
let jumpProgress = 0;
const JUMP_HEIGHT = 200; // 跳躍高度
const JUMP_SPEED = 0.05; // 跳躍動畫速度
const MOVE_SPEED = 5; // 左右移動速度

// 煙火特效
let fireworks = [];

const ANIM_FPS = 2; // 動畫幀率 (每秒2幀，即每0.5秒換一張)

function preload() {
  // 為了瀏覽器相容性，使用相對路徑
  spriteSheet = loadImage('1/all.png');
  spriteSheet2 = loadImage('2/all.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 初始化角色位置
  charPos = { x: width / 2, y: height / 2 };

  // 裁切角色一的 Sprite Sheet (水平)
  if (spriteSheet) {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const x = i * FRAME1_W;
      frames.push(spriteSheet.get(x, 0, FRAME1_W, FRAME1_H));
    }
  }

  // 裁切角色二的 Sprite Sheet (水平)
  if (spriteSheet2) {
    for (let i = 0; i < TOTAL_FRAMES2; i++) {
      const x = i * FRAME2_W;
      frames2.push(spriteSheet2.get(x, 0, FRAME2_W, FRAME2_H));
    }
  }

  // 確保幀索引在範圍內
  if (frames.length > 0) currentFrame = currentFrame % frames.length;
  if (frames2.length > 0) currentFrame2 = currentFrame2 % frames2.length;
}

function draw() {
  background(173, 216, 230);

  // 確保所有圖片都已載入
  if (frames.length > 0 && frames2.length > 0) {
    imageMode(CENTER);

    let currentImage;
    let isFlipped = false;

    // 優先處理跳躍狀態
    if (keyIsDown(UP_ARROW) && !isJumping) {
      isJumping = true;
      jumpProgress = 0;
    }

    if (isJumping) {
      // 執行跳躍動畫
      currentImage = frames2[currentFrame2];
      jumpProgress += JUMP_SPEED;
      // 使用 sin 函數製造一個平滑的跳躍弧線
      charPos.y = (height / 2) - JUMP_HEIGHT * sin(jumpProgress * PI);

      if (jumpProgress >= 1) {
        isJumping = false;
        jumpProgress = 0;
        charPos.y = height / 2; // 跳躍結束後歸位
      }
    } else if (keyIsDown(LEFT_ARROW)) {
      // 按下左鍵，顯示角色2，向左移動並翻轉
      currentImage = frames2[currentFrame2];
      charPos.x -= MOVE_SPEED;
      // 邊界檢查，防止移出畫布
      charPos.x = max(currentImage.width / 2, charPos.x);
      isFlipped = true;
    } else if (keyIsDown(RIGHT_ARROW)) {
      // 按下右鍵，顯示角色2
      currentImage = frames2[currentFrame2];
      // 如果需要向右移動，可以在這裡加入 charPos.x += MOVE_SPEED;
    } else {
      // 預設狀態，顯示角色1
      currentImage = frames[currentFrame];
      // 當沒有按鍵時，讓角色回到畫面中央
      charPos.x = width / 2;
    }

    // --- 繪製角色 ---
    push(); // 保存當前的繪圖狀態
    translate(charPos.x, charPos.y); // 將原點移動到角色位置
    if (isFlipped) {
      scale(-1, 1); // 水平翻轉畫布
    }
    image(currentImage, 0, 0); // 在新的原點繪製圖片
    pop(); // 恢復原本的繪圖狀態

    // --- 更新所有角色的動畫幀 ---
    updateAnimationFrames(isJumping || keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW));
  } else {
    // 如果圖片還沒載入完成，顯示提示文字
    fill(0);
    textAlign(CENTER, CENTER);
    text('Loading...', width / 2, height / 2);
  }

  // --- 更新並繪製煙火 ---
  // 從後往前迭代，以安全地從陣列中刪除元素
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    // 如果煙火粒子都消失了，就從陣列中移除
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

function updateAnimationFrames(isChar2Active) {
  const frameDuration = 1000 / ANIM_FPS;

  if (isChar2Active) {
    // 更新角色二的幀
    animTimer2 += deltaTime;
    if (animTimer2 >= frameDuration) {
      currentFrame2 = (currentFrame2 + 1) % frames2.length;
      animTimer2 = 0;
    }
  } else {
    // 更新角色一的幀
    animTimer += deltaTime;
    if (animTimer >= frameDuration) {
      currentFrame = (currentFrame + 1) % frames.length;
      animTimer = 0;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 視窗大小改變時，重設角色位置
  charPos = { x: width / 2, y: height / 2 };
}

function keyPressed() {
  // 當按下空白鍵時
  if (key === ' ') {
    // 在螢幕最左邊和最右邊各產生一個煙火
    // 煙火的垂直位置隨機，使其更有趣
    let yPos = random(height * 0.2, height * 0.7); // 調整垂直位置範圍
    fireworks.push(new Firework(width * 0.2, yPos)); // 離左邊界 20% 寬度
    fireworks.push(new Firework(width * 0.8, yPos)); // 離右邊界 20% 寬度
  }
}

// ==================================
//  煙火特效的 Class (類別)
// ==================================

/**
 * 代表單一煙火爆炸的 Class
 */
class Firework {
  constructor(x, y) {
    this.particles = [];
    // 隨機產生一個鮮豔的顏色
    this.color = color(random(180, 255), random(180, 255), random(180, 255));
    this.explode(x, y);
  }

  // 在指定位置產生 120 個粒子來模擬爆炸
  explode(x, y) {
    for (let i = 0; i < 120; i++) {
      this.particles.push(new Particle(x, y, this.color));
    }
  }

  // 更新所有粒子的狀態
  update() {
    for (let particle of this.particles) {
      particle.update();
    }
  }

  // 繪製所有粒子
  show() {
    for (let particle of this.particles) {
      particle.show();
    }
  }

  // 如果所有粒子都消失了，則回傳 true
  done() {
    return this.particles.every(p => p.isDone());
  }
}

/**
 * 代表單一粒子的 Class
 */
class Particle {
  constructor(x, y, fireworkColor) {
    this.pos = createVector(x, y);
    // 讓粒子朝隨機方向以不同速度散開
    this.vel = p5.Vector.random2D().mult(random(1, 7));
    this.lifespan = 255; // 生命值，用來控制透明度
    this.color = fireworkColor;
    this.acc = createVector(0, 0.08); // 模擬重力
  }

  // 更新粒子的位置和生命值
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 4;
  }

  // 繪製粒子
  show() {
    // 生命值越低，粒子越透明
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    ellipse(this.pos.x, this.pos.y, 6, 6); // 讓粒子更大更明顯
  }

  // 如果生命值耗盡，則回傳 true
  isDone() {
    return this.lifespan < 0;
  }
}