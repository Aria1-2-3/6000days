const DATA = {
    targetDate: "2026-10-19T00:00:00+08:00", 
    password: "0117", 
    countdownText: "何时葡萄先熟透，你要静候再静候。", 
    frequencies: [
        { 
            id: "freq1", 
            title: "频段1：通信协议 v6.0.0", 
            desc: "双城稳定运行当前版本", 
            keyword: "deep talk", 
            hint: "对应本频段5.0版本\n内容常常较深刻", 
            type: "protocol" 
        },
        { 
            id: "freq2", 
            title: "频段2：同频时刻", 
            desc: "熄灯后：本频段最轻的一段声音，发生在一天最后。", 
            keyword: "熄灯后", 
            hint: "一天里最轻的频段。", 
            type: "audio" 
        },
        { 
            id: "freq3", 
            title: "频段3：往期节目", 
            desc: "本频段收录的是给你写信那些回忆。", 
            keyword: "手写信", 
            hint: "本频段中你给我的最具情感的礼物", 
            type: "photos" 
        },
        { 
            id: "freq4", 
            title: "频段4：下期预告", 
            desc: "7000：下一个版本号的含义。", 
            keyword: "7000Days", 
            hint: "下一个版本号的含义", 
            type: "future" 
        }
    ],
    protocolVersions: ["v1.0 建立联系：首次通信", "v2.0 增加高频消息通道", "v3.0 引入多模态切换机制", "v4.0 考试周带宽管理", "v5.0 上线深夜语音模块", "v6.0 双城稳定运行当前版本", "v7.0 待发布"],
    protocolClauses: ["2.1 会话发起：无需预约", "2.2 消息优先级：紧急自动升级", "2.3 离线处理：不丢失不折叠", "2.4 多模态切换：文字不够直接语音", "2.5 静默模式：考试周降频不断连", "2.6 延迟容忍：不承诺秒回", "2.7 版本升级：节点自动更新", "2.8 协议不终止：不设终止条款"],
    
    // 这里的音频路径已经匹配了你的中文文件名
    audioList: [
        { name: "标本01 · 走廊", src: "走廊.mp3" }, 
        { name: "标本02 · 晚自习", src: "晚自习.mp3" }, 
        { name: "标本03 · 雨季", src: "雨季.mp3" }
    ],
    
    // 这里的图片路径已经对应了你的 1.jpg 到 6.jpg
    photoList: [
        { img: "1.jpg", frontText: "没人能代替你 即使我们好久不见", backText: "23.08.05\n这是我们去电影院前在车上拍的\n阳光穿过指缝 见证我们的友谊" },
        { img: "2.jpg", frontText: "我们碎碎念念，我们岁岁年年", backText: "25.01.25\n这是我生日你来我家庆祝时拍的\n纵使是两只不同的手 依旧可以拼出完美的爱心 愿我们即使殊途也同归" },
        { img: "3.jpg", frontText: "目之所及 只看背影就能找到你", backText: "25.06.02\n这是在一个晚上你为我画的眼睛条\n我想在我们两鬓发白 见过世间苍凉后 看到对方仍会给予对方温柔的笑靥" },
        { img: "4.jpg", frontText: "命运的标志，你是我，我是你", backText: "25.07.16\n这是我们一起打耳洞时拍的\n如果一起打耳洞的人下辈子还会在一起 我们就通过耳垂上的环痕认出对方 世世纠缠下去" },
        { img: "5.jpg", frontText: "我带走你留给我的回忆 我把飞鸟留给你", backText: "25.07.21\n这是我们打流氓叙事时你给我的手写信\n我很荣幸能在这个本里面与走柳你有这样一段友谊 缪医生会带着你的飞鸟走向自由" },
        { img: "6.jpg", frontText: "两颗紧紧相依的心脏 是永远", backText: "26.07.20\n这是今年暑假我们的合照\n相识多年却没留下多少合照着实遗憾 但没关系 我们还有更多的6000天去实现" }
    ],

    // 频段4：未来盲盒库
    futureTasks: [
        "去对方的学校蹭一顿食堂",
        "在第三座城市看一次日落",
        "一起完成一本实体纪念册",
        "穿闺蜜装去游乐园坐过山车",
        "在深夜的大马路上一起唱歌",
        "互送一封手写信（不借助任何电子设备）"
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("init_6000d_v5")) {
        localStorage.clear();
        localStorage.setItem("init_6000d_v5", "true");
    }

    const screens = { countdown: document.getElementById("screen-countdown"), password: document.getElementById("screen-password"), intro: document.getElementById("screen-intro"), main: document.getElementById("screen-main"), ending: document.getElementById("screen-ending") };
    const modal = document.getElementById("freq-modal");
    const modalBody = document.getElementById("modal-body");
    const bgm = document.getElementById("bgm");
    const radioBtn = document.getElementById("radio-control");
    const particleContainer = document.getElementById("particle-container");
    
    bgm.volume = 0.3; 

    const photoViewer = document.getElementById("photo-viewer");
    const viewerCard = document.getElementById("viewer-card");
    const viewerImg = document.getElementById("viewer-img");
    const viewerCaption = document.getElementById("viewer-caption");
    const viewerBackText = document.getElementById("viewer-back-text");
    const viewerOverlay = document.getElementById("viewer-overlay");

    let currentFreqAudio = null;
    let wasBgmPlaying = false;

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove("active"));
        screens[screenName].classList.add("active");
    }

    // --- 粒子特效 ---
    const doveSVG = `<svg viewBox="0 0 24 24"><path d="M21.5 12c-1.5 0-3.5-.5-5-2-1 1.5-2.5 2.5-4 3V8.5c0-1.5-1-3-2.5-3.5C9 6 7.5 7.5 7.5 9v3C6 12 4.5 11.5 3 11c1 3 4 5 8 5 4.5 0 8-2.5 10.5-4z"/></svg>`;
    function createParticle(type) {
        const el = document.createElement("div");
        el.className = `${type}-particle`;
        el.style.left = `${Math.random() * 100}vw`;
        if (type === "snow") {
            const size = Math.random() * 6 + 2;
            el.style.width = `${size}px`; el.style.height = `${size}px`; el.style.animationDuration = `${Math.random() * 4 + 4}s`;
        } else if (type === "flower") {
            const size = Math.random() * 8 + 6;
            el.style.width = `${size}px`; el.style.height = `${size}px`; el.style.animationDuration = `${Math.random() * 5 + 6}s`;
        } else if (type === "dove") {
            el.innerHTML = doveSVG; el.style.animationDuration = `${Math.random() * 3 + 5}s`;
        }
        particleContainer.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 12000);
    }
    setInterval(() => {
        if (document.hidden) return;
        createParticle("snow");
        if (Math.random() > 0.5) createParticle("flower");
        if (Math.random() > 0.8) createParticle("dove");
    }, 300);

    function burstParticles() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => createParticle("snow"), Math.random() * 2000);
            setTimeout(() => createParticle("flower"), Math.random() * 2000);
        }
        for (let i = 0; i < 5; i++) setTimeout(() => createParticle("dove"), Math.random() * 4000);
    }

    // --- 倒计时逻辑 ---
    const targetTime = new Date(DATA.targetDate).getTime();
    document.getElementById("countdown-text").innerText = DATA.countdownText;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetTime - now;
        if (distance <= 0) { showScreen("password"); return; }
        document.getElementById("days").innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById("hours").innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById("minutes").innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById("seconds").innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    }
    
    if (new Date().getTime() >= targetTime) { showScreen("password"); } 
    else { showScreen("countdown"); updateCountdown(); setInterval(updateCountdown, 1000); }

    // --- 密码页 ---
    document.getElementById("password-submit").addEventListener("click", () => {
        const pwd = document.getElementById("password-input").value;
        if (pwd === DATA.password) {
            document.getElementById("password-error").innerText = "";
            showScreen("intro");
            bgm.play().then(() => {
                radioBtn.classList.add("playing");
                radioBtn.innerHTML = '<span class="status-dot"></span> ⏸ 海盐电台';
            }).catch(e => console.log("等待手动播放", e));
            burstParticles();
            const btn = document.getElementById("btn-enter-main");
            btn.classList.remove("hidden-btn"); btn.classList.add("hidden-btn");
            setTimeout(() => { btn.classList.add("show-btn"); }, 100);
        } else {
            document.getElementById("password-error").innerText = "信号偏移。提示：月份+日期，不是年份。";
        }
    });

    document.getElementById("btn-enter-main").addEventListener("click", () => { showScreen("main"); renderFreqGrid(); });

    // --- BGM 控制 ---
    radioBtn.addEventListener("click", () => {
        if (bgm.paused) {
            bgm.play().catch(e => console.log("音频未找到"));
            radioBtn.classList.add("playing");
            radioBtn.innerHTML = '<span class="status-dot"></span> ⏸ 海盐电台';
        } else {
            bgm.pause();
            radioBtn.classList.remove("playing");
            radioBtn.innerHTML = '<span class="status-dot"></span> ▶ 海盐电台';
        }
    });

    // --- 导览页 ---
    function renderFreqGrid() {
        const grid = document.getElementById("freq-grid");
        grid.innerHTML = "";
        let savedUnlocks = JSON.parse(localStorage.getItem("unlocked_freqs")) || [];
        DATA.frequencies.forEach((freq, index) => {
            const isUnlocked = savedUnlocks.includes(freq.id);
            const card = document.createElement("div");
            card.className = `freq-card ${isUnlocked ? '' : 'locked'}`;
            card.style.transform = `rotate(${(Math.random() * 4 - 2).toFixed(1)}deg)`;
            card.innerHTML = `<div style="position:absolute; top:10px; right:10px; font-size:0.8rem; color:var(--sub-color);">✦</div><h3>${freq.title}</h3><p>${freq.desc}</p>`;
            card.addEventListener("click", () => {
                if (isUnlocked) { openFreqModal(freq); } 
                else {
                    let input = prompt(`【${freq.title}】已锁定\n${freq.hint}\n请输入暗号：`);
                    if (input !== null) {
                        const cleanInput = input.replace(/\s+/g, '').toLowerCase();
                        if (freq.id === 'freq1') {
                            if (cleanInput.includes("deeptalk")) unlockSuccess(freq.id, savedUnlocks);
                            else alert("暗号错误，信号无法识别。");
                        } else {
                            if (cleanInput === freq.keyword.replace(/\s+/g, '').toLowerCase()) unlockSuccess(freq.id, savedUnlocks);
                            else alert("暗号错误，信号无法识别。");
                        }
                    }
                }
            });
            grid.appendChild(card);
        });
        if (savedUnlocks.length === DATA.frequencies.length) checkAllUnlocked();
    }

    function unlockSuccess(freqId, savedUnlocks) {
        savedUnlocks.push(freqId); localStorage.setItem("unlocked_freqs", JSON.stringify(savedUnlocks));
        alert("信号已接通。"); renderFreqGrid();
        if (savedUnlocks.length === DATA.frequencies.length) checkAllUnlocked();
    }

    function checkAllUnlocked() {
        document.getElementById("final-trigger-container").classList.remove("hidden");
        document.getElementById("btn-to-ending").onclick = () => { showScreen("ending"); };
    }

    // --- 弹窗 ---
    function openFreqModal(freq) {
        modal.classList.remove("hidden");
        modalBody.innerHTML = `<h2 class="mono-title">${freq.title}</h2>`;

        if (freq.type === "protocol") {
            let html = `<div class="protocol-log">`; 
            DATA.protocolVersions.forEach(v => html += `<div>${v}</div>`);
            html += `</div><ul class="protocol-clauses">`; 
            DATA.protocolClauses.forEach(c => html += `<li>${c}</li>`);
            html += `</ul>
                <div class="check-list" id="check-list">
                    <div class="check-item" onclick="this.classList.toggle('checked')"><span class="check-box"></span> 会话发起 常驻</div>
                    <div class="check-item" onclick="this.classList.toggle('checked')"><span class="check-box"></span> 离线队列 正常</div>
                    <div class="check-item" onclick="this.classList.toggle('checked')"><span class="check-box"></span> 多模态切换 可用</div>
                    <div class="check-item" onclick="this.classList.toggle('checked')"><span class="check-box"></span> 延迟容忍 生效中</div>
                    <div class="check-item" onclick="this.classList.toggle('checked')"><span class="check-box"></span> 协议不终止 不设终止</div>
                </div>
                <button class="self-check-btn" id="btn-self-check">运行协议自检</button>
                <div class="check-result" id="check-result">检测结果：协议运行正常，下版本第7000天。</div>
                <div class="waveform"></div>
            `;
            modalBody.innerHTML += html;
            setTimeout(() => {
                document.getElementById("btn-self-check").addEventListener("click", () => {
                    const items = document.querySelectorAll("#check-list .check-item");
                    let allChecked = true;
                    items.forEach(item => { if (!item.classList.contains("checked")) allChecked = false; });
                    if (allChecked) {
                        document.getElementById("check-result").classList.add("show");
                        document.getElementById("btn-self-check").style.display = 'none';
                    } else { alert("检测不合格 请调整"); }
                });
            }, 100);

        } else if (freq.type === "audio") {
            let html = `<div class="audio-list">`;
            DATA.audioList.forEach((audio) => { html += `<div class="audio-item"><span>${audio.name}</span><button class="play-btn" data-src="${audio.src}">▶ 播放</button></div>`; });
            html += `</div>`; modalBody.innerHTML += html;
            const playButtons = modalBody.querySelectorAll(".play-btn");
            playButtons.forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const targetBtn = e.target; 
                    // 针对中文路径做编码处理
                    const src = encodeURI(targetBtn.dataset.src);
                    
                    if (targetBtn.classList.contains("playing")) {
                        if (currentFreqAudio) { currentFreqAudio.pause(); currentFreqAudio = null; }
                        targetBtn.classList.remove("playing"); targetBtn.innerText = "▶ 播放";
                        if (wasBgmPlaying) { bgm.play(); wasBgmPlaying = false; }
                        return;
                    }
                    if (currentFreqAudio) { currentFreqAudio.pause(); currentFreqAudio = null; }
                    playButtons.forEach(b => { b.classList.remove("playing"); b.innerText = "▶ 播放"; });
                    if (!bgm.paused) { bgm.pause(); wasBgmPlaying = true; }
                    
                    currentFreqAudio = new Audio(src);
                    currentFreqAudio.play().catch(() => alert("音频文件未找到，请检查目录。"));
                    targetBtn.classList.add("playing"); targetBtn.innerText = "⏸ 暂停";
                    
                    currentFreqAudio.onended = () => {
                        targetBtn.classList.remove("playing"); targetBtn.innerText = "▶ 播放"; currentFreqAudio = null;
                        if (wasBgmPlaying) { bgm.play(); wasBgmPlaying = false; }
                    };
                });
            });

        } else if (freq.type === "photos") {
            let html = `<div class="photo-wall">`;
            DATA.photoList.forEach((photo, index) => {
                html += `
                    <div class="polaroid-thumb" data-index="${index}">
                        <img src="${photo.img}" alt="回忆" onerror="this.style.display='none'; this.parentNode.style.background='#eee';">
                        <div class="caption">${photo.frontText}</div>
                    </div>
                `;
            });
            html += `</div>`;
            modalBody.innerHTML += html;

            const thumbs = modalBody.querySelectorAll(".polaroid-thumb");
            thumbs.forEach(thumb => {
                thumb.addEventListener("click", () => {
                    const idx = thumb.dataset.index;
                    const data = DATA.photoList[idx];
                    
                    viewerImg.src = data.img;
                    viewerImg.style.display = 'block';
                    viewerCaption.innerText = data.frontText;
                    viewerBackText.innerText = data.backText;
                    
                    viewerCard.classList.remove("flipped");
                    photoViewer.classList.remove("hidden");
                });
            });

        } else if (freq.type === "future") {
            // 频段4：丰富后的内容
            let html = `
                <div class="future-header">
                    <p class="mono-text" style="color:var(--sub-color);">距离 v7.0.0 版本推送还有</p>
                    <h1 class="mono-title" style="font-size:3rem;margin:10px 0;color:var(--text-color);">1000 天</h1>
                    <p class="hint" style="margin-bottom:0;">系统预计于 2029 年完成升级</p>
                    
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill"></div>
                    </div>
                </div>

                <div class="release-notes">
                    <h4>v7.0.0 更新日志 (Release Notes)</h4>
                    <ul>
                        <li><strong>新增功能：</strong>解锁高中毕业后的全国地图，支持双人异地/同城自由行。</li>
                        <li><strong>修复缺陷：</strong>修复了“因为课业繁忙而无法秒回消息”的系统延迟问题。</li>
                        <li><strong>性能优化：</strong>大幅提升陪伴时长，底层“永不终止协议”继续生效。</li>
                    </ul>
                </div>

                <div class="blind-box-section">
                    <button id="btn-blind-box" style="background:var(--stamp-color);">抽取未来盲盒</button>
                    <div class="blind-box-result" id="blind-box-result">点击上方按钮，抽取第7000天必须一起做的事</div>
                </div>
            `;
            modalBody.innerHTML += html;

            // 盲盒逻辑
            setTimeout(() => {
                const boxBtn = document.getElementById("btn-blind-box");
                const boxResult = document.getElementById("blind-box-result");
                if (boxBtn) {
                    boxBtn.addEventListener("click", () => {
                        // 简单防抖 + 抽取动画效果
                        boxBtn.innerText = "抽取中...";
                        boxBtn.style.opacity = "0.7";
                        boxResult.style.opacity = "0";
                        
                        setTimeout(() => {
                            const randomTask = DATA.futureTasks[Math.floor(Math.random() * DATA.futureTasks.length)];
                            boxResult.innerText = randomTask;
                            boxBtn.innerText = "再抽一次";
                            boxBtn.style.opacity = "1";
                            boxResult.style.opacity = "1";
                        }, 400);
                    });
                }
            }, 100);
        }
    }

    // --- 拍立得翻转 ---
    viewerCard.addEventListener("click", () => { viewerCard.classList.toggle("flipped"); });
    viewerOverlay.addEventListener("click", () => { photoViewer.classList.add("hidden"); });

    // --- 关闭弹窗 ---
    function closeModal() {
        modal.classList.add("hidden");
        photoViewer.classList.add("hidden");
        if (currentFreqAudio) { currentFreqAudio.pause(); currentFreqAudio = null; }
        if (wasBgmPlaying) { bgm.play(); wasBgmPlaying = false; }
    }

    document.getElementById("close-modal").addEventListener("click", closeModal);
    window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
});
