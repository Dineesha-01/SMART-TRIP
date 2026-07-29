@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script for Windows
@REM ----------------------------------------------------------------------------
@if "%DEBUG%" == "2" @echo on
@if "%DEBUG%" == "1" @echo on

@set ERROR_CODE=0

@setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
if "%MAVEN_PROJECTBASEDIR%" == "" set MAVEN_PROJECTBASEDIR=%CD%

@REM Execute Maven command
echo Running Spring Boot Backend Build...
"%~dp0apache-maven-3.9.8\bin\mvn.cmd" %*

