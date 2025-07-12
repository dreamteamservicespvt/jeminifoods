@echo off
echo Installing enhanced reservation and notification system...

rem Copy updated files
echo Deploying unified reservation page...
copy /Y src\pages\UnifiedReservationPage.tsx src\pages\

echo Deploying enhanced notification hooks...
copy /Y src\hooks\useReservationNotifications.ts src\hooks\
copy /Y src\hooks\useOrderNotifications.ts src\hooks\

echo Deploying enhanced toast helpers...
copy /Y src\lib\unified-toast-helpers.ts src\lib\

echo Deploying enhanced chef dashboard...
copy /Y src\pages\chef\EnhancedChefDashboard.tsx src\pages\chef\

echo Deploying enhanced admin reservation manager...
copy /Y src\pages\admin\ReservationManagerUpdated.tsx src\pages\admin\

echo Building project...
npm run build

echo.
echo ======================================================
echo Jemini Foods Reservation System successfully deployed!
echo ======================================================
echo.
