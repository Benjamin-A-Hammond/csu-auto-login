// ==UserScript==
// @name         CSU校园网自动登录
// @namespace    csu-auto-login
// @version      1.0
// @description  断网自动点击登录按钮
// @match        *://portal.csu.edu.cn/*
// @match        *://portal.csu.edu.cn:802/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
    'use strict';

    function toast(msg, color = '#1677ff') {
        const div = document.createElement('div');
        div.textContent = msg;
        div.style.cssText = `
            position:fixed;top:20px;right:20px;z-index:999999;
            background:${color};color:#fff;padding:12px 18px;
            border-radius:10px;font-size:14px;font-family:system-ui,sans-serif;
            box-shadow:0 4px 12px rgba(0,0,0,.25);transition:opacity .3s;`;
        document.documentElement.appendChild(div);
        setTimeout(() => { div.style.opacity = '0'; }, 3500);
        setTimeout(() => div.remove(), 4000);
    }

    function tryClick() {
        // 找登录按钮：value="登录" 的 input 按钮
        const btn = document.querySelector('input[value="登录"]')
                 || document.querySelector('input[name="0MKKey"]');
        if (btn) {
            toast('✅ 检测到登录页，自动点击登录…', '#52c41a');
            setTimeout(() => btn.click(), 1000);  // 等1秒让页面完全就绪
            return true;
        }
        return false;
    }

    // 页面可能还在加载，用轮询持续监测
    if (tryClick()) return;

    toast('⏳ 等待登录按钮加载…');
    let attempts = 0;
    const maxAttempts = 30; // 最多等15秒

    const timer = setInterval(() => {
        attempts++;
        if (tryClick() || attempts >= maxAttempts) {
            clearInterval(timer);
            if (attempts >= maxAttempts) {
                toast('❌ 未找到登录按钮', '#ff4d4f');
            }
        }
    }, 500);
})();
