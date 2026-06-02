// 3年E班暗殺系統：目標——殺老師！
let koroSenseis = [];
let bbPellets = [];
let explosions = [];
let score = 0;
let gameDuration = 60; // 遊戲總時間 60 秒
let isGameOver = false; 
let remainingTime = 60; 
let lastSpawnTime = 0;
let muzzleFlash = 0; // 槍口火光計數器
let currentWeapon = 'gun'; // 'gun' 或 'knife'
let knifeHistory = []; // 儲存匕首殘影軌跡
let notebooks = []; // 儲存掉落的弱點筆記本
let screenShake = 0; // 螢幕震動強度
let bgmNormal, bgmBattle; // 音樂變數
let combo = 0; // 連擊數
let lastHitTime = 0; // 上次擊中時間

// 殺老師經典台詞庫
const koroPhrases = ["太慢了！", "蠕呼呼呼~", "被抓到了！", "真不愧是E班", "哎呀呀", "大意了！", "很有精神呢！", "手感不錯喔！", "這就是Mach 20的防禦！"];
// 烏間老師戰術指導庫
const karasumaPhrases = ["冷靜點，觀察他的動作！", "瞄準核心，不要急著開火！", "手太抖了，深呼吸！", "預判他的位移路徑！", "專注！這是暗殺者的基本！"];
// 伊莉娜老師（Bitch-sensei）誘惑語錄
const irinaPhrases = ["跟我去喝杯咖啡如何？", "殺老師，這是我特地為你準備的...", "嘿，看這邊~", "想要我的簽名嗎？", "這可是成年人的誘惑喔~", "這招對那色鬼絕對有用！"];

let karasumaHintTarget = null; // 烏間老師鎖定的提示目標
let karasumaHintTimer = 0;     // 提示顯示時間
let irinaCooldown = 0;         // 誘惑功能冷卻時間

// 劇情系統變數
let isStoryMode = true; 
let storyIndex = 0;
let storyLines = [
  { name: "烏間老師", text: "各位，暗殺訓練開始。這次的目標依然是那個『超生物』。聽好，絕對不要大意！", color: "#64DEFF" },
  { name: "赤羽業", text: "哎呀～這種訓練玩幾次都不會膩呢。殺老師，這次也要被我弄哭嗎？我可是帶了特製的BB彈喔。", color: "#FF4B4B" },
  { name: "茅野楓", text: "大家加油！只要配合好，一定能抓到殺老師的空隙的！渚，準備好了嗎？", color: "#90EE90" },
  { name: "伊莉娜", text: "哼，我也會在一旁看著的。要是表現太難看，我可不會饒了你們這群小鬼。", color: "#FF69B4" },
  { name: "潮田渚", text: "嗯！我會仔細觀察他的表情變化...殺老師，請多指教！", color: "#FFFFFF" },
  { name: "殺老師", text: "蠕呼呼呼，身為老師，看到學生這麼有鬥志真是欣慰。來吧，在下課鐘響前殺掉我吧！", color: "#FFDE39" }
];

// 中場劇情 (時間剩一半時)
let midStoryLines = [
  { name: "殺老師", text: "蠕呼呼呼！時間過了一半，大家的手感似乎熱起來了呢？", color: "#FFDE39" },
  { name: "殺老師", text: "那麼老師我也要稍微提升一點難度囉！Mach 20 模式，全開！", color: "#FFDE39" },
  { name: "烏間老師", text: "全體注意！目標進入第二階段，速度將會大幅提升，守住你們的準心！", color: "#64DEFF" }
];
let isMidStoryMode = false;
let midStoryIndex = 0;
let hasMidStoryTriggered = false;

let milestoneDialogs = {
  100: { name: "殺老師", text: "喔？射擊精度提升了呢，渚同學！這份專注力值得表揚。", color: "#FFDE39" },
  300: { name: "赤羽業", text: "不錯嘛，竟然能跟上這種速度。看來我也要加把勁了。", color: "#FF4B4B" },
  500: { name: "烏間老師", text: "幹得好！保持這個節奏，鎖定他的核心！這是暗殺的最佳時機！", color: "#64DEFF" },
  600: { name: "茅野楓", text: "大家快看！殺老師的觸手動作變遲緩了，是弱點出現了嗎？", color: "#90EE90" },
  900: { name: "伊莉娜", text: "哎呀，這群小鬼比我想象中還能幹呢。殺老師，你已經走投無路了嗎？", color: "#FF69B4" },
  1200: { name: "殺老師", text: "這就是...集體暗殺的力量嗎？你們真的，成長為優秀的殺手了呢。", color: "#FFDE39" }
};
let activeMilestone = null;
let milestoneTimer = 0;
let gameStartTime = 0; // 用於修正計時器起點
let pauseOffset = 0;   // 劇情暫停所產生的時間補償
let hasTriggeredIrinaPlot = false;

// =========================================================================
// 【核心類別定義區】 
// =========================================================================

// 1. 殺老師 (KoroSensei) 類別
class KoroSensei {
  constructor() {
    let minSize = map(remainingTime, gameDuration, 0, 85, 55);
    let maxSize = map(remainingTime, gameDuration, 0, 155, 100);
    this.size = random(minSize, maxSize);
    
    this.x = random(this.size, width - this.size);
    this.y = random(this.size, height - this.size);
    
    let speed = random(1.5, 4.5);
    let angle = random(TWO_PI);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;

    this.rId = random(1000);
    this.history = []; 
    
    this.mode = "normal"; 
    this.laughTimer = 0;
    this.distractionTimer = 0; // 誘惑停頓計時器
  }

  update() {
    // 處理伊莉娜老師的誘惑狀態
    if (this.distractionTimer > 0) {
      this.distractionTimer--;
      this.vx = lerp(this.vx, 0, 0.15);
      this.vy = lerp(this.vy, 0, 0.15);
      this.mode = "smug"; 
      return;
    }

    let rushChance = this.mode === "angry" ? 0.05 : 0.01;
    if (random(1) < rushChance) {
      this.vx *= 2.5;
      this.vy *= 2.5;
    }
    this.vx = lerp(this.vx, (this.vx > 0 ? 1 : -1) * random(1.5, 4.5), 0.1);
    this.vy = lerp(this.vy, (this.vy > 0 ? 1 : -1) * random(1.5, 4.5), 0.1);

    this.history.push({x: this.x, y: this.y, angle: atan2(this.vy, this.vx)});
    if (this.history.length > 5) this.history.shift();

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.size / 2 || this.x > width - this.size / 2) this.vx *= -1;
    if (this.y < this.size / 2 || this.y > height - this.size / 2) this.vy *= -1;

    let mouseDist = dist(mouseX, mouseY, this.x, this.y);
    
    // 逃避匕首的邏輯
    if (currentWeapon === 'knife' && mouseDist < 300) {
      let escapeAngle = atan2(this.y - mouseY, this.x - mouseX);
      this.vx = cos(escapeAngle) * 6;
      this.vy = sin(escapeAngle) * 6;
    }
    
    let incomingDanger = false;
    for (let bb of bbPellets) {
      if (dist(bb.x, bb.y, this.x, this.y) < this.size * 1.2) {
        incomingDanger = true;
        break;
      }
    }

    if (remainingTime < 5) {
      this.mode = "black";   
    } else if (remainingTime < 15 || (currentWeapon === 'knife' && mouseDist < 350)) {
      this.mode = "angry";   
    } else if (incomingDanger) {
      this.mode = "scared";  
    } else if (mouseDist < this.size / 2) {
      this.mode = "mocking"; 
      if (frameCount % 60 === 0) this.laughTimer = 30;
    } else if (mouseDist < this.size * 2) {
      this.mode = "smug";    
    } else {
      this.mode = "normal";  
    }
  }

  getCurrentColor() {
    if (this.mode === "black")   return "#111111"; 
    if (this.mode === "scared")  return "#FFFFFF"; 
    if (this.mode === "mocking") return "#3A7D44"; 
    if (this.mode === "smug")    return "#FF85A1"; 
    if (this.mode === "angry")   return "#FF4B4B"; 
    return "#FFDE39"; 
  }

  collide(other) {
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let distance = dist(this.x, this.y, other.x, other.y);
    let minDist = this.size / 2 + other.size / 2;

    if (distance < minDist && distance > 0) {
      let overlap = minDist - distance;
      let nx = dx / distance;
      let ny = dy / distance;

      this.x -= nx * overlap / 2;
      this.y -= ny * overlap / 2;
      other.x += nx * overlap / 2;
      other.y += ny * overlap / 2;

      let m1 = this.size;
      let m2 = other.size;

      let v1n = nx * this.vx + ny * this.vy;
      let v1t = -ny * this.vx + nx * this.vy;
      let v2n = nx * other.vx + ny * other.vy;
      let v2t = -ny * other.vx + nx * other.vy;

      let v1nFinal = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
      let v2nFinal = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

      this.vx = v1nFinal * nx - v1t * ny;
      this.vy = v1nFinal * ny + v1t * nx;
      other.vx = v2nFinal * nx - v2t * ny;
      other.vy = v2nFinal * ny + v2t * nx;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    noStroke();

    // --- 0. Mach 20 殘影效果 ---
    for (let i = 0; i < this.history.length; i++) {
      let pos = this.history[i];
      let alpha = map(i, 0, this.history.length, 0, 40);
      fill(255, 222, 57, alpha);
      if (this.mode === "mocking") fill(58, 125, 68, alpha);
      if (this.mode === "smug") fill(255, 133, 161, alpha);
      if (this.mode === "angry") fill(255, 75, 75, alpha);
      if (this.mode === "black") fill(0, alpha * 2);
      
      push();
      resetMatrix();
      ellipse(pos.x, pos.y, this.size, this.size * 0.94); 
      pop();
    }

    // --- 1. 下半身服飾 ---
    fill(28, 30, 33);
    quad(-this.size * 0.6, this.size * 0.44, this.size * 0.6, this.size * 0.44, this.size * 0.85, this.size * 1.1, -this.size * 0.85, this.size * 1.1);
    
    fill(245, 245, 240);
    triangle(-this.size * 0.28, this.size * 0.44, 0, this.size * 0.72, 0, this.size * 0.44);
    triangle(this.size * 0.28, this.size * 0.44, 0, this.size * 0.72, 0, this.size * 0.44);
    
    fill(18, 18, 20);
    triangle(-this.size * 0.09, this.size * 0.52, this.size * 0.09, this.size * 0.52, 0, this.size * 1.05);

    // --- 2. 圓臉主體與二次元立體高光陰影 ---
    let baseCol = this.getCurrentColor();
    fill(baseCol);
    ellipse(0, 0, this.size, this.size * 0.94);

    // 精緻化：加入上方球體高光 (Glossy Look)
    fill(255, 255, 255, 40);
    arc(0, -this.size * 0.1, this.size * 0.8, this.size * 0.4, PI * 1.1, PI * 1.9);

    if (this.mode === "normal") {
      fill(225, 145, 20, 65);
      arc(0, 0, this.size, this.size * 0.94, 0, PI);
      fill(255, 255, 230, 100);
      ellipse(-this.size * 0.05, -this.size * 0.22, this.size * 0.55, this.size * 0.23);
    }

    // --- 3. 立體學士帽與細緻流蘇 ---
    push();
    fill(24, 25, 28);
    rectMode(CENTER);
    rect(0, -this.size * 0.47, this.size * 0.26, this.size * 0.12, 1); 
    beginShape();
    vertex(0, -this.size * 0.61);
    vertex(this.size * 0.33, -this.size * 0.53);
    vertex(0, -this.size * 0.45);
    vertex(-this.size * 0.33, -this.size * 0.53);
    endShape(CLOSE);
    
    stroke(220, 130, 50);
    strokeWeight(this.size * 0.022);
    noFill();
    beginShape();
    vertex(0, -53 * (this.size/100)); 
    vertex(this.size * 0.23, -this.size * 0.46);
    vertex(this.size * 0.36, -this.size * 0.24); 
    endShape();
    
    fill(220, 130, 50);
    noStroke();
    circle(this.size * 0.24, -this.size * 0.45, this.size * 0.045); 
    ellipse(this.size * 0.36, -this.size * 0.21, this.size * 0.055, this.size * 0.095); 
    pop();

    // --- 4. 狀態機表情外觀擴充 ---
    if (this.mode === "mocking" || this.mode === "black") {
      push();
      stroke(this.mode === "black" ? "#333" : "#FFDE39");
      strokeWeight(this.size * 0.1);
      for (let yOff = -0.3; yOff <= 0.3; yOff += 0.2) {
        let yCoord = this.size * yOff;
        let xLimit = sqrt(sq(this.size / 2) - sq(yCoord)) * 0.8;
        line(-xLimit, yCoord, xLimit, yCoord);
      }
      pop();
      if (this.laughTimer > 0) {
        fill(255); noStroke(); textSize(16); textStyle(BOLD);
        text("蠕呼呼呼~", this.size * 0.5, -this.size * 0.5);
        this.laughTimer--;
      }
    }
    if (this.mode === "smug") {
      fill(255, 90, 110, 160);
      circle(-this.size * 0.26, 0, this.size * 0.16);
      circle(this.size * 0.26, 0, this.size * 0.16);
    }
    if (this.mode === "angry" || this.mode === "black") {
      stroke(this.mode === "black" ? "#FF0000" : 255); strokeWeight(3);
      let ox = this.size * 0.22, oy = -this.size * 0.34;
      line(ox-7, oy, ox+7, oy); line(ox, oy-7, ox, oy+7); 
      noStroke();
    }

    // --- 5. 寬眼距經典豆豆眼 ---
    let eyeDist = this.size * 0.21; 
    let eyeY = -this.size * 0.14;   
    let eyeSize = this.size * 0.032; 

    if (this.mode === "black") {
      fill(255, 0, 0);
      circle(-eyeDist, eyeY, eyeSize * 2.2);
      circle(eyeDist, eyeY, eyeSize * 2.2);
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'red';
    } else if (this.mode === "scared") {
      fill(0);
      circle(-eyeDist, eyeY, eyeSize * 0.5);
      circle(eyeDist, eyeY, eyeSize * 0.5);
      stroke(0, 120); strokeWeight(1);
      line(-eyeDist, -this.size*0.35, -eyeDist, -this.size*0.1);
      line(eyeDist, -this.size*0.35, eyeDist, -this.size*0.1);
      fill(130, 190, 255); noStroke();
      ellipse(this.size * 0.36, -this.size * 0.08, this.size * 0.07, this.size * 0.11);
    } else if (this.mode === "smug") {
      noFill(); stroke(0); strokeWeight(this.size * 0.035);
      arc(-eyeDist, eyeY, this.size * 0.07, this.size * 0.07, PI, TWO_PI);
      arc(eyeDist, eyeY, this.size * 0.07, this.size * 0.07, PI, TWO_PI);
    } else {
      fill(0);
      noStroke();
      circle(-eyeDist, eyeY, eyeSize);
      circle(eyeDist, eyeY, eyeSize);
      
      stroke(255, 140); strokeWeight(1); noFill();
      circle(-eyeDist, eyeY, eyeSize + 1.5);
      circle(eyeDist, eyeY, eyeSize + 1.5);
    }
    noStroke();

    // --- 6. 雙重拋物線「月牙大微笑」與球面 3D 齒列 ---
    let mouthW = this.size * 0.76;   
    let mouthY = this.size * 0.04;   
    let depthTop = this.size * 0.11;    
    let depthBottom = this.size * 0.33; 

    if (this.mode === "scared") {
      stroke(0); strokeWeight(this.size * 0.035); fill(40);
      ellipse(0, this.size * 0.12, this.size * 0.12, this.size * 0.16);
    } else {
      stroke(0);
      strokeWeight(this.size * 0.028); 
      fill(255); 
      
      beginShape();
      for (let x = -mouthW/2; x <= mouthW/2; x += 2) {
        let t = x / (mouthW/2);
        let y = mouthY + (1 - t*t) * depthTop;
        vertex(x, y);
      }
      for (let x = mouthW/2; x >= -mouthW/2; x -= 2) {
        let t = x / (mouthW/2);
        let y = mouthY + (1 - t*t) * depthBottom;
        vertex(x, y);
      }
      endShape(CLOSE);

      let numTeeth = 13; 
      stroke(0);
      strokeWeight(this.size * 0.018); 
      
      for (let i = 1; i < numTeeth; i++) {
        let angle = map(i, 0, numTeeth, -HALF_PI, HALF_PI);
        let t = sin(angle); 
        let tx = t * (mouthW / 2);
        
        let yTop = mouthY + (1 - t*t) * depthTop;
        let yBottom = mouthY + (1 - t*t) * depthBottom;
        
        line(tx, yTop - 1, tx, yBottom + 1);
      }
    }
    pop();
  }
}

// 2. 對老師專用 BB 彈類別
class Missile {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = 12;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  display() {
    push();
    fill(173, 255, 47); 
    stroke(255, 255, 0); 
    strokeWeight(3);
    circle(this.x, this.y, this.size);
    pop();
  }
  isOffScreen() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }
}

// 3. 基礎消滅爆炸特效
class Explosion {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.color = col;
    this.radius = 15;
    this.alpha = 255;
  }
  update() {
    this.radius += 6; 
    this.alpha -= 12; 
  }
  display() {
    push();
    let c = color(this.color);
    c.setAlpha(this.alpha);
    fill(c);
    noStroke();
    circle(this.x, this.y, this.radius);
    
    fill(255, 0, 128, this.alpha);
    circle(this.x + random(-20, 20), this.y + random(-20, 20), this.radius * 0.2);
    pop();
  }
  isDone() {
    return this.alpha <= 0;
  }
}

// 4. 螢光綠切裂閃光特效
class SlashEffect {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.lifetime = 12; 
    this.maxLifetime = 12;
  }
  update() {
    this.lifetime--;
  }
  display() {
    let progress = this.lifetime / this.maxLifetime;
    let alpha = map(this.lifetime, 0, this.maxLifetime, 0, 255);
    let lengthScale = map(this.lifetime, 0, this.maxLifetime, 1.5, 1.0);
    
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    
    drawingContext.shadowBlur = 35 * progress;
    drawingContext.shadowColor = 'rgba(0, 255, 100, 0.9)';
    fill(0, 255, 100, alpha * 0.6);
    ellipse(0, 0, 160 * lengthScale, 15 * progress);
    
    drawingContext.shadowBlur = 10 * progress;
    fill(255, alpha);
    ellipse(0, 0, 140 * lengthScale, 4 * progress);
    pop();
  }
  isDone() {
    return this.lifetime <= 0;
  }
}

// 5. 20馬赫音爆環特效
class Shockwave {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 10;
    this.alpha = 200;
  }
  update() {
    this.r += 10;
    this.alpha -= 10;
  }
  display() {
    noFill();
    stroke(255, this.alpha);
    strokeWeight(2);
    circle(this.x, this.y, this.r);
  }
  isDone() { return this.alpha <= 0; }
}

// 6. 命中黃色黏液碎片基底類別
class SlimeParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    let angle = random(TWO_PI);
    let speed = random(2, 6);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.size = random(5, 12);
    this.alpha = 255;
    this.gravity = 0.22; 
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity; 
    this.alpha -= 8;         
  }
  display() {
    push();
    fill(255, 222, 57, this.alpha); 
    noStroke();
    ellipse(this.x, this.y, this.size, this.size * 0.6); 
    pop();
  }
  isDone() {
    return this.alpha <= 0;
  }
}

// 7. 能量噴發粒子
class EnergyParticle extends SlimeParticle {
  constructor(x, y) {
    super(x, y);
    this.color = color(random([ '#adff2f', '#ff0080', '#ffffff' ]));
  }
  display() {
    push();
    fill(this.color);
    noStroke();
    rect(this.x, this.y, this.size, this.size);
    pop();
  }
}

// 8. 擊中時的隨機台詞文字特效
class FloatingText {
  constructor(x, y, txt) {
    this.x = x;
    this.y = y;
    this.txt = txt;
    this.alpha = 255;
    this.vy = -1.5; // 向上漂浮
  }
  update() {
    this.x += random(-0.5, 0.5); // 輕微左右晃動增加生動感
    this.y += this.vy;
    this.alpha -= 6; // 逐漸消失
  }
  display() {
    push();
    textAlign(CENTER);
    textSize(28);
    textStyle(BOLD);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'black';
    fill(255, 222, 57, this.alpha); // 殺老師經典黃
    stroke(0, this.alpha);
    strokeWeight(3);
    text(this.txt, this.x, this.y);
    pop();
  }
  isDone() {
    return this.alpha <= 0;
  }
}

// 9. 烏間老師指導文字
class KarasumaText extends FloatingText {
  constructor(x, y, txt) {
    super(x, y, txt);
    this.vy = -0.8; // 飄得比殺老師慢，顯得沉穩
  }
  display() {
    push();
    textAlign(CENTER);
    textSize(24);
    textStyle(BOLD);
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'cyan';
    fill(100, 220, 255, this.alpha); // 戰術藍
    stroke(0, this.alpha);
    strokeWeight(2);
    text("[烏間老師]: " + this.txt, this.x, this.y);
    pop();
  }
}

// 10. 掉落的弱點筆記本類別
class Notebook {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-6, -3);
    this.gravity = 0.2;
    this.size = 28;
    this.alpha = 255;
    this.collected = false;
    this.angle = 0;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.angle += this.vx * 0.05;
    // 地面碰撞回彈
    if (this.y > height - 35) {
      this.y = height - 35;
      this.vy *= -0.4;
      this.vx *= 0.8;
    }
    this.alpha -= 1.2; // 隨時間變淡
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'white';
    stroke(0, this.alpha);
    fill(255, this.alpha);
    rectMode(CENTER);
    rect(0, 0, this.size, this.size * 1.3, 4); // 筆記本造型
    fill(0, this.alpha);
    textSize(10); textAlign(CENTER, CENTER);
    text("弱點", 0, 0);
    pop();
  }
  isDone() { return this.alpha <= 0 || this.collected; }
}

// =========================================================================
// 【p5.js 核心主程式邏輯】
// =========================================================================

function preload() {
  // bgmNormal = loadSound('assets/normal_theme.mp3');
  // bgmBattle = loadSound('assets/battle_theme.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始產生 10 隻殺老師
  for (let i = 0; i < 10; i++) {
    koroSenseis.push(new KoroSensei());
  }
}

function draw() {
  // 0. 劇情模式處理 (開場白渲染)
  if (isStoryMode) {
    background(20, 15, 10);
    drawClassroomBackground();
    drawTacticalGrid();
    drawStoryBox(storyLines[storyIndex].name, storyLines[storyIndex].text, storyLines[storyIndex].color);
    return;
  }

  // 0.5 中場劇情模式處理 (戰術暫停渲染)
  if (isMidStoryMode) {
    background(20, 15, 10);
    drawClassroomBackground();
    drawTacticalGrid();
    drawStoryBox(midStoryLines[midStoryIndex].name, midStoryLines[midStoryIndex].text, midStoryLines[midStoryIndex].color);
    return;
  }

  background(20, 15, 10); // 深色木質基底
  drawClassroomBackground(); // 繪製 3年E班 教室場景

  // 應用螢幕震動
  if (screenShake > 0) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.85; 
  }

  // 在教室上疊加戰術 HUD 格線
  drawTacticalGrid();

  // 1. 檢查遊戲結束
  if (isGameOver) {
    if (bgmNormal && bgmNormal.isPlaying()) bgmNormal.stop();
    if (bgmBattle && bgmBattle.isPlaying()) bgmBattle.stop();

    background(0, 150);
    push(); 
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'red';
    fill(255, 75, 75);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("下課！暗殺行動結束", width / 2, height / 2 - 30);

    // 劇情結算評價
    let endText = "";
    if (score < 200) endText = "烏間：訓練量還遠遠不夠，明天跟我去後山特訓。";
    else if (score < 400) endText = "殺老師：很有潛力喔！老師期待你們下次的表現。";
    else if (score < 900) endText = "業：哼～這種程度，勉強算個及格的暗殺者吧。";
    else endText = "渚：我們...終於做到了！這是獻給老師最好的禮物。";
    
    fill(255);
    textSize(32);
    text("成功暗殺次數: " + score, width / 2, height / 2 + 30);
    fill(255, 215, 0);
    textSize(24);
    text(endText, width / 2, height / 2 + 85);
    pop();
    return; 
  }

  // 2. 計時器系統
  let actualElapsedTime = floor((millis() - gameStartTime - pauseOffset) / 1000);
  remainingTime = max(0, gameDuration - actualElapsedTime);
  if (remainingTime === 0) {
    isGameOver = true;
  }
  
  // 觸發中場劇情
  if (remainingTime <= 30 && !hasMidStoryTriggered) {
    isMidStoryMode = true;
    hasMidStoryTriggered = true;
  }

  // 3. 繪製 UI 計分板
  drawUI();

  // 更新誘惑冷卻
  if (irinaCooldown > 0) irinaCooldown--;
  
  // 連擊劇情
  if (combo === 10 && !activeMilestone) {
    activeMilestone = { name: "赤羽業", text: "唷，手感不錯嘛！就這樣一口氣解決他吧！", color: "#FF4B4B" };
    milestoneTimer = 120;
  }

  // 檢查里程碑劇情
  for (let m in milestoneDialogs) {
    if (score >= m && !activeMilestone && milestoneDialogs[m].shown !== true) {
      activeMilestone = milestoneDialogs[m];
      activeMilestone.shown = true;
      milestoneTimer = 180; // 顯示 3 秒
    }
  }
  
  // 音樂切換邏輯
  if (remainingTime > 15) {
    if (bgmNormal && !bgmNormal.isPlaying()) {
      if (bgmBattle) bgmBattle.stop();
      bgmNormal.loop();
    }
  } else if (remainingTime > 0) {
    if (bgmBattle && !bgmBattle.isPlaying()) {
      if (bgmNormal) bgmNormal.stop();
      bgmBattle.loop();
    }
  }

  // 4. 動態生成系統
  let spawnInterval = map(remainingTime, gameDuration, 0, 4000, 500);
  if (millis() - lastSpawnTime > spawnInterval) {
    koroSenseis.push(new KoroSensei());
    lastSpawnTime = millis();
  }

  if (millis() - lastHitTime > 2000) combo = 0;

  // 5. 物理碰撞處理
  for (let i = 0; i < koroSenseis.length; i++) {
    for (let j = i + 1; j < koroSenseis.length; j++) {
      koroSenseis[i].collide(koroSenseis[j]);
    }
  }

  // 6. 更新與繪製殺老師
  for (let i = koroSenseis.length - 1; i >= 0; i--) {
    koroSenseis[i].update();
    koroSenseis[i].display();
  }

  // 7. 更新與繪製 BB 彈，進行命中判定
  for (let i = bbPellets.length - 1; i >= 0; i--) {
    let bb = bbPellets[i];
    bb.update();
    bb.display();

    if (bb.isOffScreen()) {
      // 如果子彈落空，烏間老師有機會出面指導
      if (random(1) < 0.4 && koroSenseis.length > 0) {
        let closest = null;
        let minDist = Infinity;
        for (let koro of koroSenseis) {
          let d = dist(mouseX, mouseY, koro.x, koro.y);
          if (d < minDist) { minDist = d; closest = koro; }
        }
        if (closest) {
          explosions.push(new KarasumaText(width / 2, height - 120, random(karasumaPhrases)));
          karasumaHintTarget = closest;
          karasumaHintTimer = 90; // 提示持續約 1.5 秒
        }
      }
      bbPellets.splice(i, 1);
      continue;
    }

    let hit = false;
    for (let j = koroSenseis.length - 1; j >= 0; j--) {
      let koro = koroSenseis[j];
      let d = dist(bb.x, bb.y, koro.x, koro.y);
      
      if (d < (koro.size / 2 + bb.size / 2)) {
        explosions.push(new Explosion(koro.x, koro.y, koro.getCurrentColor()));
        for (let k = 0; k < 12; k++) {
          explosions.push(new SlimeParticle(koro.x, koro.y));
        }
        screenShake = 5; 
        koroSenseis.splice(j, 1); 
        hit = true;
        score += 10; 
        combo++;
        lastHitTime = millis();
        spawnHitEnergy(koro.x, koro.y);
        // 擊中時機率掉落筆記本
        if (random(1) < 0.35) {
          notebooks.push(new Notebook(koro.x, koro.y));
        }
        // 觸發隨機台詞
        explosions.push(new FloatingText(koro.x, koro.y, random(koroPhrases)));
        break; 
      }
    }
    
    if (hit) {
      bbPellets.splice(i, 1);
    }
  }

  drawVignette(); 

  // 更新與處理弱點筆記本
  for (let i = notebooks.length - 1; i >= 0; i--) {
    let nb = notebooks[i];
    nb.update();
    nb.display();
    // 收集判定 (滑鼠碰觸到筆記本)
    if (dist(mouseX, mouseY, nb.x, nb.y) < 40) {
      nb.collected = true;
      score += 50; // 收集弱點獎勵更高
      explosions.push(new FloatingText(nb.x, nb.y, "弱點 Get! +50"));
    }
    if (nb.isDone()) notebooks.splice(i, 1);
  }

  // 繪製里程碑對話框
  if (activeMilestone && milestoneTimer > 0) {
    drawStoryBox(activeMilestone.name, activeMilestone.text, activeMilestone.color, true);
    milestoneTimer--;
    if (milestoneTimer <= 0) activeMilestone = null;
  }

  // 繪製烏間老師提供的戰術提示準星
  if (karasumaHintTarget && karasumaHintTimer > 0) {
    drawTacticalHint(karasumaHintTarget.x, karasumaHintTarget.y, karasumaHintTarget.size);
    karasumaHintTimer--;
  }

  // 8. 更新與清除特效
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].display();
    if (explosions[i].isDone()) {
      explosions.splice(i, 1);
    }
  }

  // 9. 繪製武器與匕首判定
  if (currentWeapon === 'gun') {
    drawAimArrow();
  } else {
    let moveX = mouseX - pmouseX;
    let tilt = map(moveX, -20, 20, -PI/10, PI/10);
    knifeHistory.push({x: mouseX, y: mouseY, tilt: tilt});
    if (knifeHistory.length > 8) knifeHistory.shift();
    
    drawKnife();
    checkKnifeHit();
  }
}

// =========================================================================
// 【輔助繪圖與操控函式】
// =========================================================================

// --- 繪製 3年E班 教室環境繪圖 ---
function drawClassroomBackground() {
  push();
  // 1. 牆面 (老舊校舍的灰泥粉刷)
  noStroke();
  fill(85, 80, 75);
  rect(0, 0, width, height * 0.7);

  // 2. 木地板 (帶有透視感的舊木紋)
  fill(60, 40, 25);
  rect(0, height * 0.7, width, height * 0.3);
  
  stroke(40, 25, 15);
  strokeWeight(2);
  for (let i = -width; i < width * 2; i += 120) {
    // 透視線，匯聚點設在黑板中心附近
    line(width / 2 + (i - width / 2) * 0.3, height * 0.7, i, height);
  }

  // 3. 黑板 (經典暗綠色)
  fill(30, 60, 40);
  stroke(100, 80, 60); // 木質邊框
  strokeWeight(8);
  let bw = width * 0.75;
  let bh = height * 0.38;
  rect((width - bw) / 2, height * 0.12, bw, bh, 5);
  
  // 黑板上的粉筆字與塗鴉
  noStroke();
  fill(255, 255, 255, 140);
  textSize(24);
  textAlign(LEFT, TOP);
  text("本日の暗殺目標：", width * 0.18, height * 0.2);
  textSize(45);
  textStyle(BOLD);
  text("殺せんせー", width * 0.2, height * 0.28);
  
  // 黑板右側的殺老師簡筆畫
  stroke(255, 255, 255, 100);
  strokeWeight(2);
  noFill();
  circle(width * 0.75, height * 0.28, 60); 
  arc(width * 0.75, height * 0.28, 40, 25, 0.2, PI - 0.2); // 經典微笑
  fill(255, 255, 255, 100);
  circle(width * 0.73, height * 0.26, 3);
  circle(width * 0.77, height * 0.26, 3);

  // 4. 側邊窗戶 (透出微光)
  noStroke();
  fill(100, 130, 150, 40); 
  let winW = 120;
  rect(15, height * 0.05, winW, height * 0.6);
  rect(width - winW - 15, height * 0.05, winW, height * 0.6);
  
  stroke(70, 50, 40);
  strokeWeight(5);
  noFill();
  rect(15, height * 0.05, winW, height * 0.6);
  line(15 + winW/2, height * 0.05, 15 + winW/2, height * 0.6);
  line(width - 15 - winW/2, height * 0.05, width - 15 - winW/2, height * 0.6);

  pop();
}

function drawTacticalGrid() {
  // 降低亮度以融合教室背景
  stroke(0, 255, 150, 15);
  strokeWeight(1);
  for (let x = 0; x < width; x += 50) line(x, 0, x, height);
  for (let y = 0; y < height; y += 50) line(0, y, width, y);
  
  noStroke();
  fill(255, 255, 255, 5);
  rect(0, (frameCount * 2) % height, width, 2);
}

function drawVignette() {
  let ctx = drawingContext;
  let grd = ctx.createRadialGradient(width/2, height/2, width*0.2, width/2, height/2, width*0.8);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
}

// 10. 伊莉娜老師（Bitch-sensei）誘惑文字特效
class IrinaText extends FloatingText {
  constructor(x, y, txt) {
    super(x, y, txt);
    this.vy = -1.2;
  }
  display() {
    push();
    textAlign(CENTER);
    textSize(26);
    textStyle(ITALIC);
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = '#ff0080';
    fill(255, 100, 200, this.alpha); 
    stroke(255, this.alpha);
    strokeWeight(2);
    text("[伊莉娜老師]: " + this.txt, this.x, this.y);
    pop();
  }
}

function drawUI() {
  push();
  textFont('Arial Black');
  fill(0, 255, 150);
  textSize(28);
  textAlign(LEFT, TOP);
  text(" ASSASSINATION SCORE: " + score, 30, 30);
  
  if (frameCount % 30 < 15) {
    fill(255, 50, 50);
    textSize(14);
    text(" [ TARGET LOCKED ]", 35, 65);
  }

  textAlign(RIGHT, TOP);
  fill(255, 215, 0);
  textSize(24);
  text("LIMIT: " + remainingTime + "s ", width - 30, 30);
  
  fill(255, 255, 255, 150);
  textSize(18);
  textAlign(CENTER, BOTTOM);
  text("按 [空白鍵] 切換武器 | 當前裝備: " + (currentWeapon === 'gun' ? "對老師專用手槍" : "對老師專用匕首"), width / 2, height - 45);

  // 誘惑技能狀態 UI
  fill(255, 100, 200, 220);
  textSize(16);
  let irinaStatus = irinaCooldown > 0 ? "誘惑冷卻中 (" + ceil(irinaCooldown/60) + "s)" : "伊莉娜準備就緒 (按 V 鍵)";
  text(irinaStatus, width / 2, height - 70);

  fill(255, 255, 255, 100);
  textSize(14);
  text("【殺老師弱點其之八：意外地容易暈車】", width / 2, height - 20);

  // 獨家技術浮水印識別碼
  textAlign(LEFT, BOTTOM);
  fill(0, 255, 150, 100);
  textSize(12);
  text("TACTICAL ID: 414730191", 30, height - 20);

  stroke(0, 255, 150, 150);
  strokeWeight(3);
  noFill();
  let pad = 20;
  line(pad, pad, pad + 30, pad); line(pad, pad, pad, pad + 30); 
  line(width-pad, pad, width-pad-30, pad); line(width-pad, pad, width-pad, pad + 30); 
  line(pad, height-pad, pad + 30, height-pad); line(pad, height-pad, pad, height-pad-30); 
  line(width-pad, height-pad, width-pad-30, height-pad); line(width-pad, height-pad, width-pad, height-pad-30); 

  if (combo > 1) {
    push();
    textAlign(CENTER, CENTER);
    fill(255, 255, 0, map(millis() - lastHitTime, 0, 2000, 255, 0));
    textSize(40 + sin(frameCount * 0.5) * 5);
    text(combo + " COMBO!", width / 2, 120);
    pop();
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawAimArrow() {
  push();
  translate(width / 2, height / 2);
  let angle = atan2(mouseY - height / 2, mouseX - width / 2);
  rotate(angle);

  stroke(255, 0, 0, 100);
  strokeWeight(1);
  drawingContext.setLineDash([5, 15]);
  line(70, 0, width, 0);
  drawingContext.setLineDash([]);
  
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 255, 150, 0.4)';
  noStroke();

  push();
  fill(30); 
  translate(5, 5);
  rotate(PI / 6); 
  rect(-8, 0, 18, 38, 4); 
  pop();

  fill(45);
  rect(0, -12, 70, 24, 2); 

  stroke(20);
  strokeWeight(1);
  line(10, 0, 60, 0);
  
  fill(20);
  rect(60, -15, 6, 4); 
  rect(5, -15, 6, 4);  

  noStroke();
  fill(0, 255, 150);
  rect(15, -2, 15, 4);
  circle(55, -5, 3); 

  if (muzzleFlash > 0) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(255, 200, 50, 0.8)';
    fill(255, 255, 150, muzzleFlash * 50);
    push();
    translate(75, 0);
    triangle(0, -10, 25, 0, 0, 10);
    pop();
    muzzleFlash--;
  }
  pop();
}

function drawKnife() {
  for (let i = 0; i < knifeHistory.length; i++) {
    let pos = knifeHistory[i];
    let alpha = map(i, 0, knifeHistory.length, 0, 120);
    push();
    translate(pos.x, pos.y);
    rotate(pos.tilt);
    noStroke();
    fill(0, 255, 100, alpha);
    beginShape();
    vertex(-18, -6); vertex(40, -1); vertex(50, 0); vertex(40, 1); vertex(-18, 6);
    endShape(CLOSE);
    pop();
  }

  push();
  let currentTilt = (knifeHistory.length > 0) ? knifeHistory[knifeHistory.length-1].tilt : 0;
  translate(mouseX, mouseY);
  rotate(currentTilt);
  
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(0, 255, 100, 0.5)';

  fill(40);
  rectMode(CENTER);
  rect(-35, 0, 30, 12, 3);
  
  fill(60);
  rect(-20, 0, 5, 25, 1);

  fill(220);
  stroke(0, 255, 100);
  strokeWeight(2);
  beginShape();
  vertex(-18, -8); vertex(45, -2); vertex(55, 0); vertex(45, 2); vertex(-18, 8);
  endShape(CLOSE);
  pop();
}

function checkKnifeHit() {
  for (let i = koroSenseis.length - 1; i >= 0; i--) {
    let koro = koroSenseis[i];
    if (dist(mouseX, mouseY, koro.x, koro.y) < koro.size / 2) {
      let angle = (mouseX !== pmouseX || mouseY !== pmouseY) ? atan2(mouseY - pmouseY, mouseX - pmouseX) : random(TWO_PI);
      explosions.push(new SlashEffect(koro.x, koro.y, angle));
      explosions.push(new Explosion(koro.x, koro.y, koro.getCurrentColor()));
      for (let k = 0; k < 20; k++) {
        explosions.push(new SlimeParticle(koro.x, koro.y));
      }
      screenShake = 15; 
      koroSenseis.splice(i, 1);
      score += 20; 
      combo++;
      lastHitTime = millis();
      // 匕首砍中時機率掉落筆記本
      if (random(1) < 0.4) {
        notebooks.push(new Notebook(koro.x, koro.y));
      }
      // 觸發隨機台詞
      explosions.push(new FloatingText(koro.x, koro.y, random(koroPhrases)));
    }
  }
}

function spawnHitEnergy(x, y) {
  for (let i = 0; i < 15; i++) {
    explosions.push(new EnergyParticle(x, y));
  }
}

function mousePressed() {
  if (isGameOver) return;

  // 劇情模式點擊前進
  if (isStoryMode) {
    storyIndex++;
    if (storyIndex >= storyLines.length) {
      isStoryMode = false;
      gameStartTime = millis(); 
    }
    return;
  }
  
  // 中場劇情模式點擊前進 (修復卡住的問題)
  if (isMidStoryMode) {
    midStoryIndex++;
    if (midStoryIndex >= midStoryLines.length) {
      isMidStoryMode = false;
      // 當劇情結束時，重新校準遊戲開始時間，扣除掉看劇情的暫停時間
      gameStartTime = millis() - (gameDuration - remainingTime) * 1000;
    }
    return;
  }
  
  if (currentWeapon === 'gun') {
    let angle = atan2(mouseY - height / 2, mouseX - width / 2);
    let speed = 18; 
    muzzleFlash = 5; 
    bbPellets.push(new Missile(width / 2, height / 2, cos(angle) * speed, sin(angle) * speed));
    screenShake = 2; 
  }
}

function keyPressed() {
  if (key === ' ') {
    currentWeapon = (currentWeapon === 'gun') ? 'knife' : 'gun';
    knifeHistory = []; 
  }

  // 按下 V 鍵啟動伊莉娜的誘惑
  if ((key === 'v' || key === 'V') && irinaCooldown === 0 && !isStoryMode) {
    if (!hasTriggeredIrinaPlot) {
        activeMilestone = { name: "伊莉娜", text: "呵呵，見識一下我這招特製的『大人誘惑』吧！", color: "#FF69B4" };
        milestoneTimer = 120;
        hasTriggeredIrinaPlot = true;
    }
    
    explosions.push(new IrinaText(width / 2, height / 2 + 100, random(irinaPhrases)));
    irinaCooldown = 60 * 10; // 10 秒冷卻
    for (let koro of koroSenseis) {
      koro.distractionTimer = 60 * 3; // 停止 3 秒
    }
  }
}

// --- 劇情對話框繪製 ---
function drawStoryBox(name, txt, col, isMini = false) {
  push();
  let bh = isMini ? 100 : 150;
  let by = isMini ? 80 : height - 200;
  
  // 背景框
  fill(10, 20, 40, 220);
  stroke(col);
  strokeWeight(2);
  rect(width * 0.1, by, width * 0.8, bh, 10);
  
  // 角色標籤
  fill(col);
  noStroke();
  rect(width * 0.1, by - 30, 120, 30, 5);
  fill(0);
  textSize(18);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(name, width * 0.1 + 60, by - 15);
  
  // 對話文字
  fill(255);
  textAlign(LEFT, TOP);
  textSize(isMini ? 20 : 24);
  text(txt, width * 0.1 + 30, by + 20, width * 0.8 - 60);
  
  if (!isMini) {
    fill(255, 150);
    textSize(14);
    text("點擊滑鼠繼續...", width * 0.9 - 100, by + bh - 25);
  }
  pop();
}

function drawTacticalHint(x, y, size) {
  push();
  // 烏間老師的戰術提示風格 (科技藍準星)
  noFill();
  stroke(100, 220, 255, 180); // 對應 KarasumaText 的顏色
  strokeWeight(2);
  
  // 加上些微的發光特效
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'cyan';
  
  // 繪製鎖定圓圈
  circle(x, y, size * 1.5);
  
  // 繪製準星的四個邊角十字線
  let len = 15;
  let offset = size * 0.75;
  line(x - offset - len, y, x - offset, y);
  line(x + offset, y, x + offset + len, y);
  line(x, y - offset - len, x, y - offset);
  line(x, y + offset, x, y + offset + len);
  
  pop();
}