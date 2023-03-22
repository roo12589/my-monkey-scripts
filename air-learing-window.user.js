// ==UserScript==
// @name         air多窗口
// @namespace    https://github.com/roo12589/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://l.airchina.com.cn/app/course/detail/*
// @grant        none
// @updateURL       https://github.com/roo12589/my-monkey-scripts/blob/master/air-learing-window.user.js
// @downloadURL     https://github.com/roo12589/my-monkey-scripts/blob/master/air-learing-window.user.js
// ==/UserScript==


(function() {
    'use strict';
    window.onload = function() {
        let count = 0
        const timer = setInterval(() => {
            if (window.wbUtilsOpenWin) {
                window.wbUtilsOpenWin = function(win_url, win_name, is_full_screen, str_feature) {
	var win_obj = null;
	if (str_feature === undefined || str_feature === null
			|| str_feature.length === 0) {
		// use default window feature
		str_feature = 'location=0,menubar=0,resizable=1,scrollbars=1,status=1,toolbar=0';
	}
	win_name = Math.random()
	//alert(win_name);
	if(win_name == 'test_player'){
		if(openNumber > 9999999999){
			alert('您好！只能同时打开一个窗口?');
			return false;
		}
	}
	win_obj = window.open(win_url, win_name, str_feature);
	var loop = setInterval(function() {
	    if(win_obj.closed) {
	        clearInterval(loop);
	        openNumber = 0;
	    }
	}, 1000);
	if (win_obj != null) {
		if (is_full_screen) {
			win_obj.moveTo(0, 0);
			win_obj.resizeTo(screen.availWidth, screen.availHeight);
		}
		win_obj.focus();
	}
	openNumber = 1;
	return win_obj;
}

                console.log("方法已覆盖")
               // document.querySelector("*").oncopy=null
                clearInterval(timer)
            }
            count++
            if (count >= 5) { clearInterval(timer); console.log('执行失败，未获取方法') }
        }, 1000);
    }
})();