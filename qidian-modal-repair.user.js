// ==UserScript==
// @name         起点弹窗优化
// @namespace    https://github.com/roo12589/
// @version      0.1
// @description  try to take over the world!
// @author       roo12589
// @match        https://vipreader.qidian.com/chapter/*
// @updateURL       https://github.com/roo12589/my-monkey-scripts/blob/master/qidian-modal-repair.user.js
// @downloadURL     https://github.com/roo12589/my-monkey-scripts/blob/master/qidian-modal-repair.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var fn = function () {
        var bg = document.querySelector(".review-replies-modal-bg")
        if (bg) {
            //var parent = document.getElementById('paragraph-review-app')
            var modal = document.querySelector(".review-replies-modal")
            bg.onclick = function () {
                //parent.removeChild(bg)
                //parent.removeChild(modal)
                modal.querySelector('.close-btn').click()
            }
        }
    }
    window.f = setInterval(fn, 1000)

})();