// ==UserScript==
// @name         微博自动刷新(特别关注)
// @namespace    https://github.com/roo12589/
// @version      0.1
// @description  try to take over the world!
// @author       roo12589
// @match        https://weibo.com/*
// @updateURL       https://github.com/roo12589/my-monkey-scripts/blob/master/weibo-auto-refresh.user.js
// @downloadURL     https://github.com/roo12589/my-monkey-scripts/blob/master/weibo-auto-refresh.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  let count = 0
  const keyWords = [
    '有水',
    '大水',
    '概率大',
    '速度',
  ]
  var fn = function () {
    var specialFollow = document.querySelector(".woo-box-flex[title=特别关注] .woo-badge-box")
    if (specialFollow && specialFollow.innerText > 0) {
      specialFollow.click()
      count++
      specialFollow = null
    }
    if (count % 100 == 0) console.log('持续点击次数' + count)
    var contentList = document.querySelectorAll(".wbpro-feed-content")
    var retweetList = document.querySelectorAll(".Feed_retweet_JqZJb");
    [].concat(contentList)
      .concat(retweetList)
      .forEach((item, index) => {
        //一个微博内容对每个关键词都判断一次
        keyWords.forEach(word => {
          if (item.innerText && item.innerText.includes(word)) { showMess(word, item.innerText) }
        })
      })
  }
  console.log('执行了')
  window.f = setInterval(fn, 6000)
  //判断浏览器是否支持弹出实例
  function showMess(title, content) {
    setTimeout(function () {
      console.log('1：' + Notification.permission);
      //如果支持window.Notification 并且 许可不是拒绝状态
      if (window.Notification && Notification.permission !== "denied") {
        //Notification.requestPermission这是一个静态方法，作用就是让浏览器出现是否允许通知的提示
        Notification.requestPermission(function (status) {
          console.log('2: ' + status);
          //如果状态是同意
          if (status === "granted") {
            var m = new Notification(title, {
              body: content,　　//消息体内容
            });
            //   m.onclick = function () {//点击当前消息提示框后，跳转到当前页面
            //     window.location="https:baidu.com"
            //}
          } else {
            console.log('当前浏览器不支持弹出消息')
          }
        });
      }
    }, 0)
  }

})();