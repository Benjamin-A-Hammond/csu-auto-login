// ==UserScript==
// @name         CSU校园网自动登录
// @namespace    csu-auto-login
// @version      1.1
// @description  断网自动选择运营商并点击登录按钮
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

    // 选择运营商（如果存在选择框）
    function selectISP() {
        const ispSelect = document.querySelector('select[name="ISP_select"]');
        if (!ispSelect) return false; // 没有选择框，跳过

        // 如果已经选好了非默认项，就不重复设置
        if (ispSelect.value && ispSelect.value !== '-1') {
            return true;
        }

        // 选中"中国电信"
        const telecomOption = ispSelect.querySelector('option[value="@telecomn"]');
        if (telecomOption) {
            ispSelect.value = '@telecomn';
            // 触发 change 事件，确保页面脚本能感知到变化
            ispSelect.dispatchEvent(new Event('change', { bubbles: true }));
            ispSelect.dispatchEvent(new Event('input', { bubbles: true }));
            toast('📡 已选择运营商：中国电信', '#1677ff');
            return true;
        }
        return false;
    }

    function tryClick() {
        // 找登录按钮：value="登录" 的 input 按钮
        const btn = document.querySelector('input[value="登录"]')
                 || document.querySelector('input[name="0MKKey"]');
        if (btn) {
            // 先处理运营商选择
            const hasISP = !!document.querySelector('select[name="ISP_select"]');
            if (hasISP) {
                selectISP();
            }

            toast('✅ 检测到登录页，自动点击登录…', '#52c41a');
            // 如果有运营商选择，多等一会儿让页面响应 change 事件
            const delay = hasISP ? 1500 : 1000;
            setTimeout(() => btn.click(), delay);
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
