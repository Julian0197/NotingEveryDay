@echo off
cd /d "F://面试前端八股"
today = $(date +%Y-%m-%d)
git add .
git commit -m "auto update at $today"
git push origin master
pause