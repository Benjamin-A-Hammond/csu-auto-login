@echo off
setlocal

set "FLAG_FILE=%TEMP%\csu_login_triggered.flag"

:: 测试网络
ping -n 2 223.5.5.5 >nul

if not errorlevel 1 (
    :: ===== 网络正常 =====
    :: 删除标记文件,下次断网时可以重新开标签
    if exist "%FLAG_FILE%" del "%FLAG_FILE%"
    exit /b 0
)

:: ===== 网络异常 =====
if exist "%FLAG_FILE%" (
    :: 已经触发过了,这次只刷新已有的 Edge 窗口
    :: 用 Ctrl+R 比 F5 更通用,且不需要精确激活某个标签
    powershell -NoProfile -Command ^
        "$wsh = New-Object -ComObject WScript.Shell;" ^
        "$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1;" ^
        "if ($p) { $wsh.AppActivate($p.Id) | Out-Null; Start-Sleep -Milliseconds 300; $wsh.SendKeys('^{F5}') }"
) else (
    :: 第一次断网,新开标签并打标记
    start msedge "https://portal.csu.edu.cn/"
    echo triggered > "%FLAG_FILE%"
)

endlocal
