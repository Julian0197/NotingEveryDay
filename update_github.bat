@echo off

cd /d "F://面试前端八股"

rem 获取当前日期
for /f "tokens=1-3 delims=/" %%a in ('date /t') do (
  set today=%%a-%%b-%%c
)

git add .
git commit -m "Automatic update on %today%"
git push origin master

echo Code was successfully pushed to Github on %today%
pause