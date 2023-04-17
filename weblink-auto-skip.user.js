// ==UserScript==
// @name         多网站外链自动跳转 知乎
// @namespace    https://github.com/roo12589/
// @version      0.1
// @description  try to take over the world!
// @author       roo12589
// @match        https://link.zhihu.com/?target=*
// @match        https://link.juejin.cn/?target=*
// @match        https://link.csdn.net/?target=*
// @updateURL       https://github.com/roo12589/my-monkey-scripts/blob/master/weblink-auto-skip.user.js
// @downloadURL     https://github.com/roo12589/my-monkey-scripts/blob/master/weblink-auto-skip.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==



(function() {
    'use strict';
    window.onload = function() {
        let count = 0
        const timer = setInterval(() => {
            if(window.location){
                const arr = window.location.search.split("target=")
                if(arr.length>1){
                window.location = decodeURIComponent(arr[arr.length-1])
                }
            }
            count++
            if (count >= 5) { clearInterval(timer); console.log('执行失败，未获取方法') }
        }, 1000);
    }

})();