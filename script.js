// 圖片陣列
const birdCardImages = [
    'bird_1.png', 'bird_1.png',
    'bird_2.png', 'bird_2.png',
    'bird_3.png', 'bird_3.png',
    'bird_4.png', 'bird_4.png',
    'bird_5.png', 'bird_5.png',
    'bird_6.png', 'bird_6.png',
    'bird_7.png', 'bird_7.png',
    'bird_8.png', 'bird_8.png',
    'bird_9.png', 'bird_9.png',
    'bird_10.png', 'bird_10.png',
    'bird_11.png', 'bird_11.png',
    'bird_12.png', 'bird_12.png',
    'bird_13.png', 'bird_13.png',
    'bird_14.png', 'bird_14.png',
    'bird_15.png', 'bird_15.png',
    'bird_16.png', 'bird_16.png',
    'bird_17.png', 'bird_17.png',
    'bird_18.png', 'bird_18.png'
];

const dinosaurCardImages = [
    'dinosaur_1.png', 'dinosaur_1.png',
    'dinosaur_2.png', 'dinosaur_2.png',
    'dinosaur_3.png', 'dinosaur_3.png',
    'dinosaur_4.png', 'dinosaur_4.png',
    'dinosaur_5.png', 'dinosaur_5.png',
    'dinosaur_6.png', 'dinosaur_6.png',
    'dinosaur_7.png', 'dinosaur_7.png',
    'dinosaur_8.png', 'dinosaur_8.png',
    'dinosaur_9.png', 'dinosaur_9.png',
    'dinosaur_10.png', 'dinosaur_10.png',
    'dinosaur_11.png', 'dinosaur_11.png',
    'dinosaur_12.png', 'dinosaur_12.png',
    'dinosaur_13.png', 'dinosaur_13.png',
    'dinosaur_14.png', 'dinosaur_14.png',
    'dinosaur_15.png', 'dinosaur_15.png',
    'dinosaur_16.png', 'dinosaur_16.png',
    'dinosaur_17.png', 'dinosaur_17.png',
    'dinosaur_18.png', 'dinosaur_18.png'
];

// DOM 元素
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const showAllButton = document.getElementById('show-all-button');
const hideAllButton = document.getElementById('hide-all-button');
const themeButton = document.getElementById('theme-button');
const timeSelect = document.getElementById('time-select');
const sizeSelect = document.getElementById('size-select');
const toggleHideMatchedButton = document.getElementById('toggle-hide-matched-button'); // 新增的按鈕

// 遊戲狀態變數
let firstCard = null;
let secondCard = null;
let lockBoard = false;  // 控制是否允許翻牌
let matches = 0;
let gameStarted = false; // 控制遊戲是否開始
let currentCardImages = birdCardImages; // 儲存當前使用的卡片圖片
let frontImage = 'bird_front.png'; // 初始正面圖片
let totalPairs = 0; // 全局變數來追蹤總對數
let hideMatched = false; // 控制是否隱藏已完成的圖片

// 音效
const winSound = new Audio('win.mp3');
const loseSound = new Audio('lose.mp3');

// 隨機打亂卡片
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 建立遊戲板
function createBoard(boardSize) {
    gameBoard.innerHTML = '';  // 清空遊戲板
    matches = 0;  // 重置配對計數
    gameStarted = false; // 重置遊戲開始狀態
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    // 計算所需的對數（每對有兩張卡片）
    totalPairs = (boardSize * boardSize) / 2;

    // 確保有足夠的圖片
    const availablePairs = currentCardImages.length / 2;
    if (totalPairs > availablePairs) {
        alert(`抱歉，當前主題只有 ${availablePairs} 對圖片，無法建立 ${boardSize}x${boardSize} 的遊戲板。請切換主題或選擇較小的遊戲板大小。`);
        return;
    }

    // 隨機選取所需數量的圖片
    const selectedImages = currentCardImages.slice(0, totalPairs * 2);
    const shuffledImages = shuffle(selectedImages);  // 打亂圖片

    // 建立卡片
    shuffledImages.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-inner">
                <img src="${frontImage}" alt="卡片正面" class="front">
                <img src="${image}" alt="卡片圖案" class="back">
            </div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    // 動態設置網格列數
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
}

// 翻轉卡片
function flipCard() {
    if (lockBoard || this === firstCard || !gameStarted) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;

    checkForMatch();
}

// 檢查是否匹配
function checkForMatch() {
    const isMatch = firstCard.querySelector('img.back').src === secondCard.querySelector('img.back').src;

    isMatch ? disableCards() : unflipCards();
}

// 禁用卡片並播放成功音效
function disableCards() {
    firstCard.removeEventListener('click', flipCard); // 移除點擊事件
    secondCard.removeEventListener('click', flipCard); // 移除點擊事件
    matches++;

    // Add 'matched' class to matched cards
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    // 播放成功音效
    winSound.currentTime = 0; // 重新播放音效
    winSound.play();

    // 如果 hideMatched 為 true，隱藏匹配的卡片
    if (hideMatched) {
        firstCard.classList.add('hidden');
        secondCard.classList.add('hidden');
    }

    resetBoard();

    if (matches === totalPairs) {
        setTimeout(() => {
            alert('你贏了！');
            enableControls(); // 遊戲結束，啟用控制元素
        }, 500);
    }
}

// 翻回卡片並播放失敗音效
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');

        // 播放失敗音效
        loseSound.currentTime = 0; // 重新播放音效
        loseSound.play();

        resetBoard();
    }, 1500);
}

// 重設板面
function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// 顯示正面指定秒數，然後翻轉到背面
function showAllCards(duration) {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.add('flipped'));  // 顯示所有正面

    setTimeout(() => {
        allCards.forEach(card => card.classList.remove('flipped'));
        gameStarted = true;  // 遊戲開始，允許玩家翻牌
        lockBoard = false;   // 解除鎖定，允許翻牌
    }, duration * 1000);
}

// 顯示所有卡片的正面
function showAllCardsNow() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.add('flipped'));
}

// 顯示所有卡片的背面
function hideAllCardsNow() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.remove('flipped'));
}

// 禁用控制元素
function disableControls() {
    startButton.disabled = true;
    restartButton.disabled = true;
    showAllButton.disabled = true;
    hideAllButton.disabled = true;
    themeButton.disabled = true;
    timeSelect.disabled = true;
    sizeSelect.disabled = true;
    toggleHideMatchedButton.disabled = true;
}

// 啟用控制元素
function enableControls() {
    startButton.disabled = false;
    restartButton.disabled = false;
    showAllButton.disabled = false;
    hideAllButton.disabled = false;
    themeButton.disabled = false;
    timeSelect.disabled = false;
    sizeSelect.disabled = false;
    toggleHideMatchedButton.disabled = false;
}

// 重新開始遊戲
restartButton.addEventListener('click', () => {
    gameBoard.innerHTML = '';  // 清除現有的卡片
    matches = 0;
    gameStarted = false;  // 重置遊戲開始狀態
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    hideMatched = false; // 重置隱藏已完成圖片的狀態
    toggleHideMatchedButton.textContent = '隱藏已完成的圖片'; // 重置按鈕文字

    // 取得選擇的遊戲板大小和顯示時間
    const selectedSize = parseInt(sizeSelect.value) || 4;
    const selectedTime = parseInt(timeSelect.value) || 10;

    createBoard(selectedSize);         // 重新建立遊戲板
    showAllCards(selectedTime);        // 顯示所有卡片

    disableControls(); // 禁用控制元素
});

// 開始遊戲按鈕邏輯
startButton.addEventListener('click', () => {
    // 取得選擇的遊戲板大小和顯示時間
    const selectedSize = parseInt(sizeSelect.value) || 4;
    const selectedTime = parseInt(timeSelect.value) || 10;

    alert(`遊戲開始！卡片將顯示 ${selectedTime} 秒，遊戲板大小為 ${selectedSize}x${selectedSize}。`);

    lockBoard = true;  // 鎖定板面，防止在顯示期間玩家點擊
    gameStarted = false; // 遊戲尚未開始，等待顯示時間結束

    createBoard(selectedSize);     // 生成隨機卡片板面
    showAllCards(selectedTime);    // 顯示所有卡片

    disableControls(); // 禁用控制元素
});

// 顯示所有正面按鈕
showAllButton.addEventListener('click', () => {
    showAllCardsNow(); // 顯示所有卡片的正面
});

// 顯示所有背面按鈕
hideAllButton.addEventListener('click', () => {
    hideAllCardsNow(); // 顯示所有卡片的背面
});

// 切換主題按鈕
themeButton.addEventListener('click', () => {
    if (currentCardImages === birdCardImages) {
        currentCardImages = dinosaurCardImages; // 切換到恐龍主題
        frontImage = 'dinosaur_front.png'; // 更新正面圖片
    } else {
        currentCardImages = birdCardImages; // 切換回鳥類主題
        frontImage = 'bird_front.png'; // 更新正面圖片
    }

    // 如果遊戲已經開始，重新建立遊戲板
    if (gameStarted) {
        hideAllCardsNow(); // 顯示背面
        const selectedSize = parseInt(sizeSelect.value) || 4;
        createBoard(selectedSize); // 重新建立遊戲板
    }
});

// 切換隱藏已完成的圖片功能
toggleHideMatchedButton.addEventListener('click', () => {
    hideMatched = !hideMatched; // 切換狀態
    if (hideMatched) {
        toggleHideMatchedButton.textContent = '顯示已完成的圖片';
        // 隱藏所有已完成的卡片
        const matchedCards = document.querySelectorAll('.card.matched');
        matchedCards.forEach(card => card.classList.add('hidden'));
    } else {
        toggleHideMatchedButton.textContent = '隱藏已完成的圖片';
        // 顯示所有已完成的卡片
        const matchedCards = document.querySelectorAll('.card.matched.hidden');
        matchedCards.forEach(card => card.classList.remove('hidden'));
    }
});
