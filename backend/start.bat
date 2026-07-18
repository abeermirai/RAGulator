@echo off
cd /d %~dp0

where python3 >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Using python3...
  python3 -m pip install -r requirements.txt
  python3 run.py
  goto :done
)

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Using py...
  py -m pip install -r requirements.txt
  py run.py
  goto :done
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Using python...
  python -m pip install -r requirements.txt
  python run.py
  goto :done
)

echo Python was not found. Try: python3 --version
pause
exit /b 1

:done
