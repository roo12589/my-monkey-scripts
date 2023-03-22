// ==UserScript==
// @name         bilibili倍速重制
// @namespace    none
// @version      1.3
// @description  bilibili播放视频倍速,支持按钮、键盘X,C及滚轮控制
// @author       none
// @match      *://*.bilibili.com/video/*
// @grant        none
// @updateURL       https://github.com/roo12589/my-monkey-scripts/blob/master/bili-speed-reset.user.js
// @downloadURL     https://github.com/roo12589/my-monkey-scripts/blob/master/bili-speed-reset.user.js
// ==/UserScript==
// 存在不必要问题：后退网页不保持播放速度
// 1.1 支持 当前速度按钮 滚轮控制
// 1.2 支持 当前速度按钮 快捷切换开关倍速
// 1.3 修改开关逻辑
// 1.4 添加up主白名单
(function () {
    "use strict";

    initStorage();

    /* 监听history改变 防止视频换p导致倍速丢失 */
    const bindHistoryEvent = function (type) {
        const historyEvent = history[type];
        return function () {
            const newEvent = historyEvent.apply(this, arguments); //执行history函数
            const e = new Event(type);  //声明自定义事件
            e.arguments = arguments;
            window.dispatchEvent(e);  //抛出事件
            return newEvent;  //返回方法，用于重写history的方法
        };
    };
    history.pushState = bindHistoryEvent('pushState');
    history.replaceState = bindHistoryEvent('replaceState');
    //  window.addEventListener('replaceState', function(e) {
    //    console.log('THEY DID IT AGAIN! replaceState');
    //  });
    window.addEventListener('pushState', function (e) {
        resetVideoSpeed()
    });
    // 倍速列表 暂仅支持localStorage修改
    const videoSpeedListTop = localStorage.getItem("video_speed_list_top").split(",") || [1, 2, 3]
    const videoSpeedListBottom = localStorage.getItem("video_speed_list_bottom").split(",") || [1.2, 1.3, 1.5, 1.8, 2.3, 2.5]

    // 全局保存速度备份
    var videoSpeedBack
    var isOpen = true
    const nameWhiteList = localStorage.getItem('nameWhiteList').split(',')
    for (name of nameWhiteList) {

        if (document.querySelector('.username').innerText.match(name)) {
            isOpen = false
            break
        }
    }

    // 创建元素div
    let videoSpeedElement = document.createElement("div"),
        currentHref = "",
        viewReportDiv;
    videoSpeedElement.setAttribute("id", "video_speed_div");
    videoSpeedElement.setAttribute("style", "position:relative;top:-13.5px;right:0;");
    videoSpeedElement.style.width = "1000px";
    let videoBottom = document.createElement("div");
    let videoTop = document.createElement("div");
    let currentSpeedBtnContainer = document.createElement("div");

    currentSpeedBtnContainer.setAttribute("id", "current-speed-btn-container")
    //全局CSS样式
    let style = document.createElement("style");
    style.innerHTML = `
    #video_speed_div button, #third_video_plugin_btn_cru, #third_video_plugin_btn, #third_video_plugin_btn1 { outline: 0; padding: 2px 2px; margin-left: 5px; background-color: #F4F4F4; border: 0; color: #222; cursor: pointer;border-radius:10%} 
    .video_speed_div-button-active {transition:all 0.2s ease-in-out; border: 0;!important; background-color: #ffafc9!important; color: #fff!important;width:40px; }
    .video-speed-box {width: 100%; height: 28px; display: flex;justify-content: flex-end;align-items: flex-start}
    #current-speed-btn:hover { 
        transform: scale(1.5);
        transform-origin: 50% 100%;
        border-radius: 6px;
     }
    `;

    document.getElementsByTagName("head").item(0).appendChild(style);

    // 按键播放速度控制
    document.onkeydown = function (e) {
        // console.log(e)
        if (e.target.type === 'text' || e.target.type === 'textarea') return
        let speed = getSpeed() || 1.0;
        const playerSpeedButton = document.querySelector(".bilibili-player-video-btn-speed-name")

        let ev = e || window.event; // for IE to cover IEs window event-object

        // z切换开关倍速 和点击currentSpeedBtn一样
        if (ev.key === 'z') {
            if (isOpen) {
                isOpen = false
                videoSpeedBack = getSpeed()
                changeVideoSpeed(1, false)

            } else {
                isOpen = true
                changeVideoSpeed(videoSpeedBack)
                videoSpeedBack = undefined
            }
        }
        if (ev.key === "c") {
            playerSpeedButton && (playerSpeedButton.innerText = third_video_plugin_speed + "x");
            changeVideoSpeed((speed * 10 + 1) / 10)
            return false;
        } else if (ev.key === "x") {
            playerSpeedButton && (playerSpeedButton.innerText = third_video_plugin_speed + "x");
            changeVideoSpeed((speed * 10 - 1) / 10)
            return false;
        }
    }

    window.onload = function () {
        resetVideoSpeed()
    }

    let _interval = setInterval(function () {
        if (document.querySelector(".bb-comment") && document.getElementById("video_speed_div") === null) {
            addSpeedBtns();

        }
    }, 100);

    function addSpeedBtns() {
        viewReportDiv = document.querySelector("#viewbox_report").querySelector(".video-data:last-child");

        initBtn();

        videoBottom.setAttribute("class", "video-speed-box")
        videoTop.setAttribute("class", "video-speed-box")
        videoBottom.setAttribute("id", "video-speed-box-bottom");
        videoTop.setAttribute("id", "video-speed-box-top");
        videoSpeedElement.appendChild(videoTop);
        videoSpeedElement.appendChild(videoBottom);
        viewReportDiv.appendChild(videoSpeedElement);
        clearInterval(_interval);

        videoTop.appendChild(currentSpeedBtnContainer);

    }

    function initBtn() {
        let speedArr = videoSpeedListBottom;
        for (let i = 0; i < speedArr.length; i++) {
            let speed = speedArr[i];
            let btn = document.createElement("button");
            btn.innerHTML = "x" + speed;
            btn.style.width = "40px";
            btn.setAttribute("id", "third_video_plugin_btn_" + speed);
            btn.addEventListener("click", changeVideoSpeed);
            videoBottom.appendChild(btn);
        }

        let spendDefineArr = videoSpeedListTop;
        if (spendDefineArr.length === 0) {
            spendDefineArr = [];
        }
        for (let i = 0; i < spendDefineArr.length; i++) {
            let speed = spendDefineArr[i];
            let btn = document.createElement("button");
            btn.innerHTML = "x" + speed;
            btn.style.width = "40px";
            btn.setAttribute("id", "third_video_plugin_btn1_" + speed);
            btn.addEventListener("click", changeVideoSpeed);
            videoTop.appendChild(btn);
        }
        let currentSpeedBtn = document.createElement("button");
        currentSpeedBtn.innerHTML = "x" + getSpeed();

        currentSpeedBtn.setAttribute("class", "video_speed_div-button-active");
        currentSpeedBtn.setAttribute("id", "current-speed-btn");
        // 鼠标切换开关倍速

        currentSpeedBtn.onclick = function (e) {
            if (isOpen) {
                isOpen = false
                videoSpeedBack = getSpeed()
                changeVideoSpeed(1, false)
            } else {
                isOpen = true
                changeVideoSpeed(videoSpeedBack)
                videoSpeedBack = undefined
            }
        }
        // 滚轮上下加减倍速
        currentSpeedBtn.onmousewheel = function (e) {
            let speed = getSpeed();
            const playerSpeedButton = document.querySelector(".bilibili-player-video-btn-speed-name")
            //补全滚轮事件
            e.preventDefault();//通知浏览器不执行默认的动作
            if (e.wheelDelta) {
                //IE/Opera/Chrome
                if (e.wheelDelta < 0) {
                    //下
                    playerSpeedButton && (playerSpeedButton.innerText = speed + "x");
                    changeVideoSpeed((speed * 10 - 1) / 10)
                } else {
                    //上
                    playerSpeedButton && (playerSpeedButton.innerText = speed + "x");
                    changeVideoSpeed((speed * 10 + 1) / 10)
                }
            }
        };
        currentSpeedBtnContainer.appendChild(currentSpeedBtn);
    }
    /**
     * 
     * @param {number} x speed
     * @param {boolean} save 是否保存到local
     * @returns 
     */
    function changeVideoSpeed(x, save = true) {
        const min = 0.1, max = 16.0
        if (x > max || x < min) return
        // bibibili播放器内置速度显示
        const playerSpeedButton = document.querySelector(".bilibili-player-video-btn-speed-name")
        let speed
        if (typeof x == 'number') {
            speed = x
        } else if (typeof x == 'string') {
            speed = parseFloat(x)
        } else {
            speed = parseFloat(x.target.innerHTML.replace("x", ""));
        }
        if (save) {
            localStorage.setItem("video_speed", speed);
        }
        document.querySelector(".video_speed_div-button-active").innerHTML = save ? "x" + speed : "关闭";
        let videoObj = document.querySelector("video");
        if (!videoObj) videoObj = document.querySelector("bwp-video");
        if (videoObj) {
            videoObj.playbackRate = speed;
            console.log(videoObj.playbackRate)
            playerSpeedButton && (playerSpeedButton.innerText = save ? speed + "x" : "关闭");
        }
        createNoti(save ? getSpeed().toFixed(1) : "关闭")
    }

    function resetVideoSpeed() {
        let count = 0
        const timer = setInterval(() => {
            let videoObj = document.querySelector("video")
                || document.querySelector("bwp-video");
            console.log('等待加载播放器...');
            if (videoObj) {
                if (isOpen) {
                    videoObj.playbackRate = getSpeed();
                } else {
                    videoSpeedBack = getSpeed()
                    changeVideoSpeed(1, false)
                }
                console.log("已加载", videoObj.playbackRate)
                coverTitle()
                clearInterval(timer)
            }
            count++
            if (count >= 20) { clearInterval(timer); createNoti("获取播放器组件超时") }
        }, 1000);
    }
    let timer
    function createNoti(text) {
        if (timer) clearTimeout(timer)
        if (!window.noti) {
            let div = document.createElement("div")
            if (!text) text = getSpeed().toFixed(1)
            div.className = "noti"
            div.style.width = "100px"
            div.style.height = "50px"
            div.style.lineHeight = "50px"
            // div.style.border = "100px"
            div.style.borderRadius = "10px"
            div.style.background = "rgba(31, 14, 14, 0.452)"
            div.style.color = "rgba(233, 232, 232, 0.911)"
            div.style.fontSize = "24px"
            div.style.position = "absolute"
            div.style.left = "10%"
            div.style.top = "10%"
            div.style.textAlign = "center"
            div.style.display = "flex"
            div.style.justifyContent = "center"
            div.style.alignItems = "center"
            window.noti = div
            div.appendChild(document.createTextNode(text))
            //document.body.appendChild(div)
            const ele = document.querySelector(".bpx-player-video-wrap")
                || document.querySelector("#playerWrap")
            ele && ele.appendChild(div)
        } else {
            window.noti.style.display = 'block',
                window.noti.innerText = text
        }
        timer = setTimeout(function () { window.noti.style.display = "none" }, 1300)

    }

    function coverTitle() {
        // 修改视频标题为当前正在播放p名称
        let OnP = document.querySelector(".list-box>.on>a");
        let Title = document.querySelector(".video-info .video-title .tit");
        if (OnP && OnP.getAttribute("title")) {
            let OnPName = OnP.getAttribute("title");
            let docTitle = document.querySelector("head>title");
            docTitle.innerHTML = OnPName;
            Title.innerHTML = OnPName;
        }
        let progresses = document.querySelectorAll(".bui-bar-wrap>.bui-bar-normal");
        progresses.forEach(ele => ele.style.background = "#FFAFC9")

    }

    function getSpeed() {
        return parseFloat(parseFloat(localStorage.getItem('video_speed')).toFixed(1))
    }
    function initStorage() {
        if (!localStorage.getItem("nameWhiteList")) {
            localStorage.setItem("nameWhiteList", ["戒社", "罗翔"].toString())
        }
    }

})();
