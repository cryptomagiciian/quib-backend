@echo off
echo Committing and pushing changes to Railway...
git add .
git commit -m "Fix edge functions to use correct backend endpoints"
echo Pushing to GitHub...
git push origin main
echo Done! Your backend should redeploy automatically.
echo.
echo If you see any browser prompts, you can close them.
pause

