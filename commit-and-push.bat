@echo off
echo Committing and pushing changes to Railway...
git add .
git commit -m "Fix edge functions to use correct backend endpoints"
git push origin main
echo Done! Your backend should redeploy automatically.
pause
