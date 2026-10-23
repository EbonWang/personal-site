@echo off
cd /d "%~dp0"
if exist result.txt del result.txt
if exist cj.txt del cj.txt
start "wr" /b cmd /c "npx wrangler pages dev dist --port 8788 > wdev.out 2>&1"
timeout /t 25 /nobreak >nul
set B=http://127.0.0.1:8788
echo PROFILE: >> result.txt
curl -s %B%/api/profile >> result.txt
echo SKILLS_LEN: >> result.txt
curl -s %B%/api/skills >> result.txt
echo BLOG_SEARCH_LEN: >> result.txt
curl -s "%B%/api/blog?q=%%E8%%BE%%B9%%E7%%BC%%98" >> result.txt
echo LOGIN: >> result.txt
curl -s -c cj.txt -X POST -H "Content-Type: application/json" -d "{\"password\":\"admin12345\"}" %B%/api/auth/login >> result.txt
echo UNAUTH_WRITE_CODE: >> result.txt
curl -s -o nul -w "%%{http_code}" -X POST -H "Content-Type: application/json" -d "{\"name\":\"x\"}" %B%/api/skills >> result.txt
echo. >> result.txt
echo AUTHED_WRITE: >> result.txt
curl -s -b cj.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"ce\",\"category\":\"t\",\"level\":55,\"order_index\":99}" %B%/api/skills >> result.txt
echo EXPORT_KEYS: >> result.txt
curl -s -b cj.txt %B%/api/export >> result.txt
echo ===== RESULT =====
type result.txt
taskkill /im workerd.exe /f >nul 2>&1
