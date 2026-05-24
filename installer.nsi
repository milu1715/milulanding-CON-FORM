; MiLù Ads Console — Windows Installer
; Build with: makensis installer.nsi

Unicode True
!include "MUI2.nsh"
!include "FileFunc.nsh"

;--------------------------------
; General
Name "MiLù Ads Console"
OutFile "dist-electron/MiLu-Ads-Console-Setup.exe"
InstallDir "$PROGRAMFILES64\MiLu Ads Console"
InstallDirRegKey HKLM "Software\MiLuHome\AdsConsole" "InstallDir"
RequestExecutionLevel admin
BrandingText "MiLù Home © 2025"

;--------------------------------
; Version Info
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName"     "MiLù Ads Console"
VIAddVersionKey "ProductVersion"  "1.0.0"
VIAddVersionKey "CompanyName"     "MiLù Home"
VIAddVersionKey "LegalCopyright"  "2025 MiLù Home"
VIAddVersionKey "FileDescription" "Amazon Ads AI Console"
VIAddVersionKey "FileVersion"     "1.0.0"

;--------------------------------
; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "/tmp/milu_icon.ico"
!define MUI_UNICON "/tmp/milu_icon.ico"
!define MUI_WELCOMEPAGE_TITLE "Benvenuto in MiLù Ads Console"
!define MUI_WELCOMEPAGE_TEXT "Questo wizard installerà MiLù Ads Console$\r$\n— la tua AI console per la gestione delle campagne Amazon Ads.$\r$\n$\r$\nClicca Avanti per continuare."
!define MUI_FINISHPAGE_RUN "$INSTDIR\MiLuAdsConsole.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Avvia MiLù Ads Console ora"

;--------------------------------
; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

;--------------------------------
; Language
!insertmacro MUI_LANGUAGE "Italian"

;--------------------------------
; Installer Section
Section "MiLù Ads Console" SecMain

  SetOutPath "$INSTDIR"
  SetOverwrite on

  ; Copy all app files from staging directory (ASCII filenames)
  File /r "/tmp/win-stage/*"

  ; Write registry
  WriteRegStr HKLM "Software\MiLuHome\AdsConsole" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "Software\MiLuHome\AdsConsole" "Version" "1.0.0"

  ; Uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "DisplayName" "MiLù Ads Console"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "Publisher" "MiLù Home"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "DisplayVersion" "1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "DisplayIcon" "$INSTDIR\MiLuAdsConsole.exe"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "NoRepair" 1

  ; Estimated size
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole" \
    "EstimatedSize" "$0"

  ; Start Menu shortcuts
  CreateDirectory "$SMPROGRAMS\MiLù Ads Console"
  CreateShortcut "$SMPROGRAMS\MiLù Ads Console\MiLù Ads Console.lnk" \
    "$INSTDIR\MiLuAdsConsole.exe"
  CreateShortcut "$SMPROGRAMS\MiLù Ads Console\Disinstalla.lnk" \
    "$INSTDIR\Uninstall.exe"

  ; Desktop shortcut
  CreateShortcut "$DESKTOP\MiLù Ads Console.lnk" \
    "$INSTDIR\MiLuAdsConsole.exe"

SectionEnd

;--------------------------------
; Uninstaller Section
Section "Uninstall"

  RMDir /r "$INSTDIR"
  RMDir /r "$SMPROGRAMS\MiLù Ads Console"
  Delete "$DESKTOP\MiLù Ads Console.lnk"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MiLuAdsConsole"
  DeleteRegKey HKLM "Software\MiLuHome\AdsConsole"

SectionEnd
