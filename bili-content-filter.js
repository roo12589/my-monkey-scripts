// ==UserScript==
// @name         哔站过滤 排行榜、搜索结果
// @namespace    https://github.com/roo12589
// @version      1.0
// @description  允许通过配置黑名单列表过滤一些污眼的结果,可以通过油猴内置菜单配置黑名单（页面空白处右击或浏览器右上角油猴扩展悬浮窗口界面）,悬浮在上面可以暂时取消屏蔽，点击前往可以跳转
// @author       roo12589
// @match        https://www.bilibili.com/v/popular/rank*
// @match        https://search.bilibili.com/all*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @icon         https://github.com/roo12589/my-monkey-scripts/assets/bili-favicon.ico
// @updateURL       https://github.com/roo12589/my-monkey-scripts/raw/master/bili-content-filter.user.js
// @downloadURL     https://github.com/roo12589/my-monkey-scripts/raw/master/bili-content-filter.user.js
// ==/UserScript==


(function () {
    'use strict';
    // 将中文|unicode互转方法挂载
    window.chineseToUnicode = chineseToUnicode
    window.unicodeToChinese = unicodeToChinese
    const nameList = getList()

    let count = 0
    console.log(count)
    const { pathname, search } = location
    initSheet(pathname)
    filter(pathname, search)

    function filter(pagePath, search) {
        const timer = setInterval(() => {
            let itemClassName, nameClassName
            if (pagePath.includes('/v/popular/rank')) {
                itemClassName = ".rank-list>.rank-item"
                nameClassName = ".up-name"
            } else if (pathname === '/all' && search.includes('keyword')) {
                itemClassName = ".video-list .bili-video-card"
                nameClassName = ".bili-video-card__info--author"
            }
            const list = document.querySelectorAll(itemClassName)
            list.forEach(el => {
                if (nameList.map(unicodeToChinese).includes(el.querySelector(nameClassName).innerText)) {
                    replace(el)
                }
            })
            if (list) {
                clearInterval(timer)
            } count++
            if (count >= 5) { clearInterval(timer); console.log('执行失败，未获取到元素') }
        }, 1000);
    }

    function replace(el) {
        //代替div块
        const block = document.createElement('div')
        block.className = 'block'
        const href = el.querySelector('a').href
        block.innerHTML = `<span>内容令人不适，已被屏蔽。</span><a href='${href}' style='color:gray'>点击前往</a>`
        el.insertBefore(block, el.firstChild)
        /*         let holdtime = 0
                let timer = null
                block.onmouseenter = function (e) { timer = setTimeout(() => { holdtime = 3000 }, 3000) }
                block.onmousemove = function (e) { if (holdtime >= 3000) { e.stopPropagation(); e.target.style.display = 'none' } }
                block.onmouseleave = function (e) {
                    if (timer) { clearTimeout(timer); holdtime = 0 }
                    setTimeout(() => { e.target.style.display = 'flex' }, 2000)
                } */
    }

    function chineseToUnicode(str) {
        let unicodeStr = '';
        for (let i = 0; i < str.length; i++) {
            const unicode = str.charCodeAt(i).toString(16).toUpperCase();
            unicodeStr += '\\u' + '0'.repeat(4 - unicode.length) + unicode;
        }
        return unicodeStr;
    }
    function unicodeToChinese(str) {
        return str.replace(/\\u(\w{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    }

    // 获取配置项的值
    function getList() {
        // 内置21个典型 默认为unicode
        const nameList = [
            "\\u656C\\u6C49\\u537F", "\\u5B9D\\u5251\\u5AC2\\u548C\\u96E8\\u54E5", "\\u4F55\\u540C\\u5B66", "\\u4E09\\u4EE3\\u9E7F\\u4EBA", "\\u62C9\\u5B8F\\u6851", "\\u67D0\\u5E7B\\u541B", "\\u5F90\\u5927\\u867E", "\\u5C0F\\u6F6E\\u9662\\u957F", "\\u5C0F\\u7FD4\\u54E5", "\\u8001\\u756A\\u8304", "\\u86CB\\u9EC4\\u6D3E", "\\u6556\\u5382\\u957F", "\\u6258\\u9A6C\\u65AF\\u5BB6\\u7684", "\\u4FAF\\u7FE0\\u7FE0", "\\u5F90\\u5927\\u867E\\u54AF", "\\u529B\\u5143\\u541B", "\\u5728\\u4E0B\\u54F2\\u522B", "\\u96E8\\u54E5\\u5230\\u5904\\u8DD1", "\\u554A\\u5417\\u7CBD", "\\u675C\\u6D77\\u7687", "\\u62DC\\u6258\\u4E86\\u5C0F\\u7FD4\\u54E5", "\\u4E2D\\u56FD\\u0062\\u006F\\u0079",
            // chineseToUnicode('陈睿')
        ]
        var value = GM_getValue('nameList')
        if (!value) {
            GM_setValue('nameList', nameList)
        }
        return value.map(unicodeToChinese) || nameList.map(unicodeToChinese)

    }
    // 设置配置项的值
    function setList(value) {
        return GM_setValue('nameList', value.split(',').map(chineseToUnicode));
    }
    // 注册菜单命令，允许用户设置背景色
    GM_registerMenuCommand("黑名单列表", function () {
        var value = prompt("请输入名单:（英,文,逗,号,隔,开）", getList());
        if (value !== null) {
            setList(value)
            createNoti(`已添加,目前共${value.split(',').length}个,刷新后生效`, {
                backgroundColor: '#f0f9eb',
                color: '#67c23a'
            })
        }
    });



    function initSheet(pagePath) {
        // const height = pagePath === '/all' ? "204px" : "100%"
        var style = document.createElement('style');
        // style.type = 'text/css';
        style.appendChild(document.createTextNode(`
               .block{
                width: 100%;
                height: 100%;
                float: left;
                border: 1px solid #e2e2e2;
                border-radius: 6px;
                background-color: #f2f2f2;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                z-index: 1000;
                opacity:1;
                transition: opacity 0.3s ease-in-out;
            }
            .block:hover{
                opacity: 0;
                transition-delay: 1s;
            }
            .notice{
                height: 50px;
                line-height: 50px;
                border-radius: 10px;
                font-size: 16px;
                position: fixed;
                left: 50%;
                top: 10%;
                transform: translate(-50%);
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                max-width: 9999px;
                overflow: hidden;
                transition: all 1s;
                white-space:nowrap;
            }
        `));
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(style);
    }
    var timer
    function createNoti(text, styleObj) {
        if (timer) clearTimeout(timer)
        if (!window.noti) {
            let div = document.createElement("div")
            div.className = 'notice'
            styleObj && Object.assign(div.style, styleObj)
            window.noti = div
            div.innerHTML = `&nbsp;&nbsp;${text}&nbsp;&nbsp;`
            //document.body.appendChild(div)
            const ele = document.querySelector(".bpx-player-video-wrap")
                || document.querySelector("#playerWrap")
                || document.body
            ele && ele.appendChild(div)
        } else {
            window.noti.style.maxWidth = '9999px'
            window.noti.innerText = text
        }
        timer = setTimeout(function () { window.noti.style.maxWidth = "0" }, 2300)

    }

})();