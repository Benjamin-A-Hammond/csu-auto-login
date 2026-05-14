// ==UserScript==
// @name         CSU校园网自动登录
// @namespace    csu-auto-login
// @version      2.0
// @description  断网自动填账号密码、选运营商并登录
// @match        *://portal.csu.edu.cn/*
// @match        *://portal.csu.edu.cn:802/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==
(function () {
    'use strict';

    // ====== 需要你核对的地方 ======
    const ACCOUNT_SELECTOR  = 'input[name="DDDDD"]';   // 账号框,已确认
    const PASSWORD_SELECTOR = 'input[name="upass"]';   // 密码框,★请自己 F12 核对★
    // =============================

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

    // —— 凭据管理 ——
    function getCreds() {
        let acc = GM_getValue('csu_account', '');
        let pwd = GM_getValue('csu_password', '');
        if (!acc || !pwd) {
            acc = prompt('首次设置 —— 请输入职工号:', acc || '');
            pwd = prompt('请输入密码:', '');
            if (acc && pwd) {
                GM_setValue('csu_account', acc.trim());
                GM_setValue('csu_password', pwd);
                toast('✅ 账号密码已保存到本地', '#52c41a');
            }
        }
        return { acc: acc ? acc.trim() : '', pwd: pwd || '' };
    }

    // 油猴菜单里加一个"重新设置"入口,改密码时用
    GM_registerMenuCommand('重新设置账号密码', () => {
        const acc = prompt('请输入职工号:', GM_getValue('csu_account', ''));
        const pwd = prompt('请输入密码:', '');
        if (acc && pwd) {
            GM_setValue('csu_account', acc.trim());
            GM_setValue('csu_password', pwd);
            toast('✅ 已更新', '#52c41a');
        }
    });

    // —— 填充账号密码 ——
    function fillCreds() {
        const accInput = document.querySelector(ACCOUNT_SELECTOR);
        const pwdInput = document.querySelector(PASSWORD_SELECTOR);
        if (!accInput || !pwdInput) return false; // 框还没加载出来

        // 两个框都已经有值,不用重复填
        if (accInput.value.trim() && pwdInput.value.trim()) return true;

        const { acc, pwd } = getCreds();
        if (!acc || !pwd) return false; // 用户取消了输入

        accInput.value = acc;
        accInput.dispatchEvent(new Event('input',  { bubbles: true }));
        accInput.dispatchEvent(new Event('change', { bubbles: true }));

        pwdInput.value = pwd;
        pwdInput.dispatchEvent(new Event('input',  { bubbles: true }));
        pwdInput.dispatchEvent(new Event('change', { bubbles: true }));

        toast('🔑 已自动填入账号密码', '#1677ff');
        return true;
    }

    // —— 选运营商 ——
    function selectISP() {
        const ispSelect = document.querySelector('select[name="ISP_select"]');
        if (!ispSelect) return false;
        if (ispSelect.value && ispSelect.value !== '-1') return true;
        const telecomOption = ispSelect.querySelector('option[value="@telecomn"]');
        if (telecomOption) {
            ispSelect.value = '@telecomn';
            ispSelect.dispatchEvent(new Event('change', { bubbles: true }));
            ispSelect.dispatchEvent(new Event('input',  { bubbles: true }));
            toast('📡 已选择运营商:中国电信', '#1677ff');
            return true;
        }
        return false;
    }

    // —— 弹窗兜底:万一还是弹了"请输入账号",自动点确定 ——
    const popupObserver = new MutationObserver(() => {
        const okBtn = document.querySelector('.layui-layer-btn0');
        if (okBtn) {
            const content = document.querySelector('.layui-layer-content');
            const msg = content ? content.textContent.trim() : '';
            okBtn.click();
            toast('⚠️ 弹窗已自动关闭:' + msg, '#faad14');
        }
    });
    popupObserver.observe(document.documentElement, { childList: true, subtree: true });

    // —— 主流程 ——
    function tryClick() {
        const btn = document.querySelector('input[value="登录"]')
                 || document.querySelector('input[name="0MKKey"]');
        if (!btn) return false;

        // 先填账号密码,没填成功就别点,等下一轮
        if (!fillCreds()) {
            toast('⏳ 等待输入框加载…', '#faad14');
            return false;
        }

        const hasISP = !!document.querySelector('select[name="ISP_select"]');
        if (hasISP) selectISP();

        toast('✅ 自动点击登录…', '#52c41a');
        const delay = hasISP ? 1500 : 1000;
        setTimeout(() => btn.click(), delay);
        return true;
    }

    if (tryClick()) return;
    toast('⏳ 等待登录页加载…');
    let attempts = 0;
    const maxAttempts = 30;
    const timer = setInterval(() => {
        attempts++;
        if (tryClick() || attempts >= maxAttempts) {
            clearInterval(timer);
            if (attempts >= maxAttempts) toast('❌ 未找到登录按钮', '#ff4d4f');
        }
    }, 500);
})();
