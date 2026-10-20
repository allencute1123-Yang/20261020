// ==========================================
// 1. 全域變數與資料庫設定
// ==========================================
let cards = [];          // 儲存 6 張國字卡片的陣列
let labels = [];         // 儲存底部可拖曳注音標籤的陣列
let draggedLabel = null; // 紀錄當前正在被滑鼠拖曳的標籤物件
let score = 0;           // 紀錄最後結算的分數 (0 - 100)
let correctCount = 0;    // 紀錄答對的題數
let totalPairs = 6;      // 每頁固定顯示 6 題
let startTime;           // 紀錄遊戲開始的時間戳記
let timerString = "00:00"; // 顯示在畫面的時間字串
let gameState = "PLAY";  // 遊戲狀態：PLAY(進行中), RESULT(顯示結果), RESTRY(不及格重來)

// 擴充字形資料庫：共 16 題，使用 0~100 的相對座標來定義每個字的筆劃軌跡
let wordDatabase = [
  { word: "三", bopomofo: "ㄙㄢ", strokes: [[{x:25,y:35}, {x:75,y:35}], [{x:30,y:52}, {x:70,y:52}], [{x:20,y:70}, {x:80,y:70}]] },
  { word: "十", bopomofo: "ㄕˊ", strokes: [[{x:20,y:50}, {x:80,y:50}], [{x:50,y:20}, {x:50,y:80}]] },
  { word: "人", bopomofo: "ㄖㄣˊ", strokes: [[{x:50,y:20}, {x:25,y:75}], [{x:45,y:45}, {x:75,y:75}]] },
  { word: "大", bopomofo: "ㄉㄚˋ", strokes: [[{x:20,y:38}, {x:80,y:38}], [{x:50,y:20}, {x:25,y:80}], [{x:48,y:38}, {x:75,y:80}]] },
  { word: "山", bopomofo: "ㄕㄢ", strokes: [[{x:50,y:25}, {x:50,y:75}], [{x:25,y:40}, {x:25,y:75}, {x:75,y:75}], [{x:75,y:45}, {x:75,y:75}]] },
  { word: "上", bopomofo: "ㄕㄤˋ", strokes: [[{x:50,y:20}, {x:50,y:75}], [{x:50,y:48}, {x:75,y:48}], [{x:20,y:75}, {x:80,y:75}]] },
  { word: "下", bopomofo: "ㄒㄧㄚˋ", strokes: [[{x:20,y:25}, {x:80,y:25}], [{x:50,y:25}, {x:50,y:80}], [{x:55,y:45}, {x:75,y:65}]] },
  { word: "工", bopomofo: "ㄍㄨㄥ", strokes: [[{x:25,y:25}, {x:75,y:25}], [{x:50,y:25}, {x:50,y:75}], [{x:20,y:75}, {x:80,y:75}]] },
  { word: "天", bopomofo: "ㄊㄧㄢ", strokes: [[{x:25,y:25}, {x:75,y:25}], [{x:20,y:45}, {x:80,y:45}], [{x:50,y:25}, {x:25,y:80}], [{x:48,y:45}, {x:75,y:80}]] },
  { word: "中", bopomofo: "ㄓㄨㄥ", strokes: [[{x:25,y:30}, {x:75,y:30}], [{x:25,y:30}, {x:25,y:65}, {x:75,y:65}], [{x:75,y:30}, {x:75,y:65}], [{x:50,y:15}, {x:50,y:85}]] },
  { word: "日", bopomofo: "ㄖˋ", strokes: [[{x:30,y:25}, {x:30,y:75}], [{x:30,y:25}, {x:70,y:25}, {x:70,y:75}], [{x:30,y:50}, {x:70,y:50}], [{x:30,y:75}, {x:70,y:75}]] },
  { word: "月", bopomofo: "ㄩㄝˋ", strokes: [[{x:30,y:20}, {x:30,y:80}], [{x:30,y:20}, {x:70,y:20}, {x:70,y:80}], [{x:30,y:40}, {x:70,y:40}], [{x:30,y:58}, {x:70,y:58}]] },
  { word: "水", bopomofo: "ㄕㄨㄟˇ", strokes: [[{x:50,y:15}, {x:50,y:75}], [{x:20,y:40}, {x:45,y:50}], [{x:25,y:75}, {x:48,y:52}], [{x:75,y:35}, {x:52,y:50}], [{x:52,y:50}, {x:80,y:80}]] },
  { word: "火", bopomofo: "ㄏㄨㄛˇ", strokes: [[{x:25,y:45}, {x:35,y:55}], [{x:75,y:45}, {x:65,y:55}], [{x:50,y:20}, {x:25,y:80}], [{x:48,y:45}, {x:75,y:80}]] },
  { word: "木", bopomofo: "ㄇㄨˋ", strokes: [[{x:20,y:40}, {x:80,y:40}], [{x:50,y:15}, {x:50,y:80}], [{x:50,y:40}, {x:25,y:80}], [{x:50,y:40}, {x:75,y:80}]] },
  { word: "土", bopomofo: "ㄊㄨˇ", strokes: [[{x:30,y:40}, {x:70,y:40}], [{x:50,y:15}, {x:50,y:75}], [{x:15,y:75}, {x:85,y:75}]] }
];

// 按鈕點擊判定範圍儲存區
let submitBtn = { x: 0, y: 0, w: 120, h: 45 };
let retryBtn = { x: 0, y: 0, w: 160, h: 50 };

// ==========================================
// 2. 初始化與視窗缩放監聽
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  textAlign(CENTER, CENTER);
  startTime = millis();                   // 紀錄遊戲開始時間
  initGame();                             // 初始化出題與佈局
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 視窗改變時自動調整畫布大小
  repositionUI();                          // 重新計算所有卡片與標籤的位置
}

// ==========================================
// 3. 遊戲核心邏輯初始化
// ==========================================
function initGame() {
  cards = [];
  labels = [];
  score = 0;
  correctCount = 0;
  gameState = "PLAY";
  startTime = millis();
  
  // 從資料庫中隨機打亂並抽取 6 個不重複的題目
  let shuffledData = shuffle(wordDatabase);
  let selectedQuestions = shuffledData.slice(0, totalPairs);
  
  // 建立 6 張題目字卡
  for (let i = 0; i < selectedQuestions.length; i++) {
    cards.push({
      word: selectedQuestions[i].word,
      bopomofo: selectedQuestions[i].bopomofo,
      strokes: selectedQuestions[i].strokes,
      x: 0, y: 0, w: 0, h: 0,               // 座標尺寸由 repositionUI 動態計算
      dropX: 0, dropY: 0, dropW: 0, dropH: 0,
      assignedLabel: null,                  // 目前放置在此卡片上的注音標籤物件
      checkResult: "NONE"                   // 判定結果: NONE(未判定), RIGHT(對), WRONG(錯)
    });
  }
  
  // 提取注音符號並隨機打亂，做為底部標籤
  let bopomofoList = selectedQuestions.map(q => q.bopomofo);
  bopomofoList = shuffle(bopomofoList);
  
  for (let i = 0; i < bopomofoList.length; i++) {
    labels.push({
      text: bopomofoList[i],
      x: 0, y: 0, w: 0, h: 0,               // 座標尺寸由 repositionUI 動態計算
      homeX: 0, homeY: 0,                   // 紀錄原本底部的歸屬位置
      targetCard: null                      // 目前被吸附在哪張卡片上
    });
  }
  
  repositionUI(); // 計算全螢幕自適應座標
}

// 根據目前螢幕寬高，自動分配字卡與標籤的座標 (RWD 核心)
function repositionUI() {
  // A. 計算上方「提交答案」按鈕位置
  submitBtn.w = 130;
  submitBtn.h = 45;
  submitBtn.x = windowWidth / 2 - submitBtn.w / 2;
  submitBtn.y = 45;

  // B. 計算 2x3 卡片網格尺寸與位置
  let startY = 120;
  let bottomZoneH = 150; // 保留給底部標籤的空間
  let gridW = windowWidth * 0.85;
  let gridH = windowHeight - startY - bottomZoneH;
  
  let cardW = min(gridW / 3.4, 280); // 限制卡片最大寬度，避免超大螢幕時變形
  let cardH = min(gridH / 2.3, 200); // 限制卡片最大高度
  
  let gapX = (gridW - (cardW * 3)) / 2;
  let gapY = (gridH - (cardH * 2)) / 1;
  let startX = (windowWidth - gridW) / 2 + gapX / 2;

  for (let i = 0; i < cards.length; i++) {
    let col = i % 3;
    let row = floor(i / 3);
    let card = cards[i];
    
    card.x = startX + col * (cardW + gapX);
    card.y = startY + row * (cardH + gapY);
    card.w = cardW;
    card.h = cardH;
    
    // 計算卡片下方的虛線放置框位置
    card.dropW = cardW * 0.85;
    card.dropH = 42;
    card.dropX = card.x + (cardW - card.dropW) / 2;
    card.dropY = card.y + cardH - 55;
    
    // 如果卡片上已經吸附了標籤，同步更新標籤位置
    if (card.assignedLabel) {
      card.assignedLabel.x = card.dropX + (card.dropW - card.assignedLabel.w) / 2;
      card.assignedLabel.y = card.dropY + (card.dropH - card.assignedLabel.h) / 2;
    }
  }

  // C. 計算底部 6 個注音標籤的排版位置
  let labelW = min(windowWidth * 0.12, 130);
  let labelH = 45;
  let labelGap = 15;
  let totalLabelsW = (labelW * totalPairs) + (labelGap * (totalPairs - 1));
  let labelStartX = (windowWidth - totalLabelsW) / 2;
  let labelY = windowHeight - 80;

  for (let i = 0; i < labels.length; i++) {
    let label = labels[i];
    label.w = labelW;
    label.h = labelH;
    label.homeX = labelStartX + i * (labelW + labelGap);
    label.homeY = labelY;
    
    // 如果標籤尚未被吸附，就留守在底部原位
    if (!label.targetCard) {
      label.x = label.homeX;
      label.y = label.homeY;
    } else {
      // 若已被吸附，使其對齊字卡的放置框
      let tc = label.targetCard;
      label.x = tc.dropX + (tc.dropW - label.w) / 2;
      label.y = tc.dropY + (tc.dropH - label.h) / 2;
    }
  }
  
  // D. 計算不集格時「再試一次」按鈕的位置
  retryBtn.w = 180;
  retryBtn.h = 55;
  retryBtn.x = windowWidth / 2 - retryBtn.w / 2;
  retryBtn.y = windowHeight - 130;
}

// ==========================================
// 4. 每影格繪製主循環 (渲染視覺效果)
// ==========================================
function draw() {
  background(242, 246, 250); // 清新淡藍色背景
  
  // A. 繪製上方標題與計時器欄位
  drawHeaderUI();
  
  // B. 循環繪製 6 張國字卡片
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    
    // 繪製卡片本體圓角外框
    fill(255);
    stroke(225);
    strokeWeight(1.5);
    rect(card.x, card.y, card.w, card.h, 12);
    
    // 繪製左上角小標籤 (如 #1, #2)
    fill(60, 90, 120);
    noStroke();
    rect(card.x + 12, card.y + 12, 35, 22, 4);
    fill(255);
    textSize(12);
    text(`#${i + 1}`, card.x + 12 + 17.5, card.y + 12 + 11);
    
    // 執行並繪製國字動態筆劃動畫
    drawStrokeAnimation(card);
    
    // 繪製下方的放置框樣式 (根據提交判定狀態呈現不同顏色)
    if (card.checkResult === "RIGHT") {
      fill(233, 247, 237); // 答對：淡綠色背景
      stroke(46, 204, 113); // 答對：綠色邊框
      strokeWeight(2);
      rect(card.dropX, card.dropY, card.dropW, card.dropH, 8);
    } else if (card.checkResult === "WRONG") {
      fill(253, 237, 237); // 答錯：淡紅色背景
      stroke(231, 76, 60);  // 答錯：紅色邊框
      strokeWeight(2);
      rect(card.dropX, card.dropY, card.dropW, card.dropH, 8);
    } else {
      fill(255);            // 未提交或沒放：白色虛線框
      stroke(180);
      strokeWeight(1.5);
      drawingContext.setLineDash([5, 5]); // 開啟虛線
      rect(card.dropX, card.dropY, card.dropW, card.dropH, 8);
      drawingContext.setLineDash([]);    // 關閉虛線
    }
  }
  
  // C. 循環繪製底部的注音標籤 (倒序繪製，讓正在拿取的物件永遠在最上層)
  for (let i = labels.length - 1; i >= 0; i--) {
    let label = labels[i];
    
    // 設計樣式顏色
    fill(255);
    if (label === draggedLabel) {
      stroke(255, 99, 71); // 拖曳中：亮紅色粗框
      strokeWeight(2.5);
    } else if (label.targetCard && label.targetCard.checkResult === "RIGHT") {
      stroke(46, 204, 113); // 答對結算：綠色細框
      strokeWeight(1.5);
    } else if (label.targetCard && label.targetCard.checkResult === "WRONG") {
      stroke(231, 76, 60);  // 答錯結算：紅色細框
      strokeWeight(1.5);
    } else {
      stroke(120, 160, 220); // 平常狀態：淡藍色細框
      strokeWeight(1.5);
    }
    rect(label.x, label.y, label.w, label.h, 20); // 圓角膠囊形標籤
    
    // 繪製標籤內的注音文字
    fill(50);
    noStroke();
    textSize(22);
    text(label.text, label.x + label.w / 2, label.y + label.h / 2);
  }
  
  // D. 進行中計時邏輯
  if (gameState === "PLAY") {
    let passedTime = floor((millis() - startTime) / 1000);
    let mn = floor(passedTime / 60).toString().padStart(2, '0');
    let sc = (passedTime % 60).toString().padStart(2, '0');
    timerString = `${mn}:${sc}`;
  } 
  // E. 結算狀態：及格畫面 (>= 50分)
  else if (gameState === "RESULT") {
    fill(46, 204, 113);
    textSize(36);
    text(`🎉 挑戰成功！得分：${score} 分 🎉`, windowWidth / 2, windowHeight - 120);
  } 
  // F. 結算狀態：不及格畫面 (< 50分，顯示再試一次按鈕)
  else if (gameState === "RETRY") {
    fill(231, 76, 60);
    textSize(34);
    text(`加油！再練習看看！得分：${score} 分 🎯`, windowWidth / 2, windowHeight - 120);
    
    // 繪製「再試一次」按鈕
    fill(231, 76, 60);
    noStroke();
rect(retryBtn.x, retryBtn.y, retryBtn.w, retryBtn.h, 10);
fill(255);
textSize(20);
text("再試一次", retryBtn.x + retryBtn.w / 2, retryBtn.y + retryBtn.h / 2);
}
}
// ==========================================
// 5. 國字筆劃軌跡動態繪製函數
// ==========================================
function drawStrokeAnimation(card) {
// 將卡片的幾何中心對應為字體書寫的中心範圍
let size = min(card.w * 0.4, 90);
let cx = card.x + card.w / 2 - size / 2;
let cy = card.y + card.h / 2 - size * 0.7;
// 第一步：先用極淡灰色繪製「全字底圖」供學生觀看結構
stroke(240);
strokeWeight(8);
strokeCap(ROUND);
strokeJoin(ROUND);
noFill();
for (let strokePoints of card.strokes) {
beginShape();
for (let p of strokePoints) {
vertex(cx + (p.x / 100) * size, cy + (p.y / 100) * size);
}
endShape();
}
// 第二步：利用時間因子（frameCount）計算目前播放的筆劃進度
let timeFactor = (frameCount * 0.035) % (card.strokes.length + 1);
let currentStrokeIdx = floor(timeFactor);
let strokeProgress = timeFactor - currentStrokeIdx;
// 畫出已經播放完成的歷史筆劃 (深藍色)
stroke(45, 70, 105);
strokeWeight(7);
for (let i = 0; i < currentStrokeIdx; i++) {
if (i >= card.strokes.length) break;
let strokePoints = card.strokes[i];
beginShape();
for (let p of strokePoints) {
vertex(cx + (p.x / 100) * size, cy + (p.y / 100) * size);
}
endShape();
}
// 第三步：動態用「紅色」模擬繪製正在書寫中的那一劃
if (currentStrokeIdx < card.strokes.length) {
let points = card.strokes[currentStrokeIdx];
stroke(231, 76, 60);
strokeWeight(7);
if (points.length === 2) { // 兩點直線筆劃
let x1 = cx + (points[0].x / 100) * size;
let y1 = cy + (points[0].y / 100) * size;
let x2 = cx + (points[1].x / 100) * size;
let y2 = cy + (points[1].y / 100) * size;
line(x1, y1, lerp(x1, x2, strokeProgress), lerp(y1, y2, strokeProgress));
}
else if (points.length === 3) { // 三點折線筆劃 (例如「山」的橫折)
let x1 = cx + (points[0].x / 100) * size;
let y1 = cy + (points[0].y / 100) * size;
let x2 = cx + (points[1].x / 100) * size;
let y2 = cy + (points[1].y / 100) * size;
let x3 = cx + (points[2].x / 100) * size;
let y3 = cy + (points[2].y / 100) * size;
if (strokeProgress < 0.5) {
let p = strokeProgress * 2;
line(x1, y1, lerp(x1, x2, p), lerp(y1, y2, p));
} else {
let p = (strokeProgress - 0.5) * 2;
line(x1, y1, x2, y2);
line(x2, y2, lerp(x2, x3, p), lerp(y2, y3, p));
}
}
}
}
// ==========================================
// 6. 介面文字與按鈕繪製
// ==========================================
function drawHeaderUI() {
textAlign(LEFT, CENTER);
fill(40);
textSize(24);
text("國字注音連連看 🌟", 40, 40);
fill(120);
textSize(13);
text("請將下方的注音標籤拖曳到正確的國字卡片裡，完成後點擊上方「提交答案」！", 40, 68);
// 繪製右上角計時器看板
textAlign(CENTER, CENTER);
stroke(220);
fill(255);
rect(windowWidth - 115, 25, 75, 52, 8);
noStroke();
fill(120);
textSize(11);
text("時間", windowWidth - 77, 38);
fill(40);
textSize(16);
text(timerString, windowWidth - 77, 58);
// 繪製「提交答案」按鈕 (僅在遊玩階段顯示)
if (gameState === "PLAY") {
stroke(100, 149, 237);
fill(100, 149, 237);
rect(submitBtn.x, submitBtn.y, submitBtn.w, submitBtn.h, 8);
fill(255);
noStroke();
textSize(16);
text("提交答案", submitBtn.x + submitBtn.w / 2, submitBtn.y + submitBtn.h / 2);
}
}
// ==========================================
// 7. 滑鼠與互動點擊機制
// ==========================================
function mousePressed() {
// A. 處理不及格點擊「再試一次」的重新出題判定
if (gameState === "RETRY") {
if (mouseX > retryBtn.x && mouseX < retryBtn.x + retryBtn.w &&
mouseY > retryBtn.y && mouseY < retryBtn.y + retryBtn.h) {
initGame();
return;
}
}
// B. 處理點擊「提交答案」的判定
if (gameState === "PLAY") {
if (mouseX > submitBtn.x && mouseX < submitBtn.x + submitBtn.w &&
mouseY > submitBtn.y && mouseY < submitBtn.y + submitBtn.h) {
checkAnswers();
return;
}
}
if (gameState !== "PLAY") return; // 結算後鎖定不允許拖曳
// C. 檢查滑鼠是否點擊到了底部的某個注音標籤
for (let label of labels) {
if (mouseX > label.x && mouseX < label.x + label.w &&
mouseY > label.y && mouseY < label.y + label.h) {
draggedLabel = label;
// 如果這個標籤原本已經吸附在卡片上，先解除原卡片的綁定
if (label.targetCard) {
label.targetCard.assignedLabel = null;
label.targetCard = null;
}
break;
}
}
}
function mouseDragged() {
// 連動更新目前跟隨滑鼠移動的注音標籤位置
if (draggedLabel) {
draggedLabel.x = mouseX - draggedLabel.w / 2;
draggedLabel.y = mouseY - draggedLabel.h / 2;
}
}
function mouseReleased() {
if (!draggedLabel) return;
let hasSnapped = false;
// 檢查標籤放開時，中心點落在第幾張卡片的放置框內
for (let card of cards) {
let lCenterX = draggedLabel.x + draggedLabel.w / 2;
let lCenterY = draggedLabel.y + draggedLabel.h / 2;
if (lCenterX > card.dropX && lCenterX < card.dropX + card.dropW &&
lCenterY > card.dropY && lCenterY < card.dropY + card.dropH) {
// 覆蓋機制：如果該卡片格子內本來就住著別的標籤，要把舊的趕回底部家裡
if (card.assignedLabel && card.assignedLabel !== draggedLabel) {
let oldLabel = card.assignedLabel;
oldLabel.targetCard = null;
oldLabel.x = oldLabel.homeX;
oldLabel.y = oldLabel.homeY;
}
// 將標籤成功與新的卡片對接吸附 (保留答案，無論對錯都不彈回)
card.assignedLabel = draggedLabel;
draggedLabel.targetCard = card;
draggedLabel.x = card.dropX + (card.dropW - draggedLabel.w) / 2;
draggedLabel.y = card.dropY + (card.dropH - draggedLabel.h) / 2;
hasSnapped = true;
break;
}
}
// 如果隨便亂放（沒放進任何卡片格子裡），就直接彈回底部原本位置
if (!hasSnapped) {
draggedLabel.targetCard = null;
draggedLabel.x = draggedLabel.homeX;
draggedLabel.y = draggedLabel.homeY;
}
draggedLabel = null; // 清除拖曳狀態
}
// ==========================================
// 8. 最後答案提交與結算核心
// ==========================================
function checkAnswers() {
correctCount = 0;
// 遍歷 6 張卡片，逐一檢查對錯
for (let card of cards) {
if (card.assignedLabel) {
// 答案與卡片的正確注音一致
if (card.assignedLabel.text === card.bopomofo) {
card.checkResult = "RIGHT";
correctCount++;
} else {
card.checkResult = "WRONG"; // 答案錯誤
}
} else {
card.checkResult = "WRONG";   // 空白沒填當作錯誤
}
}
// 計算總分 (6題答對全部為100分)
score = round((correctCount / totalPairs) * 100);
// 門檻判定：滿 50 分為通過，否則進入 RETRY 狀態跳出重新挑戰按鈕
if (score >= 50) {
gameState = "RESULT";
} else {
gameState = "RETRY";
}
}