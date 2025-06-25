@echo off
echo Testing Instagram DM Bot with curl...
echo.

curl -X POST https://ig-dm-bot-0xvq.onrender.com/send-dm ^
  -H "Content-Type: application/json" ^
  -d "{\"target_username\":\"uday_mehlawat\",\"message\":\"Hello from curl test!\"}"

echo.
echo Test completed!
