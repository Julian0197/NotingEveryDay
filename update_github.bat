@echo off
cd /d "F://面试前端八股"
git add .
git commit -m "auto update at $(date)"
git push origin master
pause