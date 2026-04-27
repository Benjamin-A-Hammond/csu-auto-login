@echo off
:: 向阿里云的公共网络地址发送两次测试信号
ping -n 2 223.5.5.5 >nul

:: 如果信号发送失败（代表断网了或被注销了）
if errorlevel 1 (
    :: 强制使用Edge浏览器打开你的登录网页
    start msedge "https://portal.csu.edu.cn/"
)