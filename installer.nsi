; Script de instalador NSIS para Sistema Inventario Ferretería
; Requiere NSIS (Nullsoft Scriptable Install System)

!define APPNAME "Sistema Inventario Ferretería"
!define COMPANYNAME "Ferretería"
!define DESCRIPTION "Sistema de Gestión de Inventario para Ferretería"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 0
!define HELPURL "http://localhost:3000"
!define UPDATEURL "http://localhost:3000"
!define ABOUTURL "http://localhost:3000"
!define INSTALLSIZE 200000

; Configuración general
Name "${APPNAME}"
OutFile "dist\${APPNAME}-Setup.exe"
Unicode True
InstallDir "$PROGRAMFILES\${APPNAME}"
RequestExecutionLevel admin
InstallDirRegKey HKLM "Software\${APPNAME}" ""

; Páginas del instalador
Page directory
Page instfiles

; Sección de instalación
Section "install"
    ; Establecer directorio de salida
    SetOutPath $INSTDIR
    
    ; Copiar todos los archivos de la aplicación
    File /r "dist\Sistema Inventario Ferretería-win32-x64\*"
    
    ; Crear acceso directo en el escritorio
    CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\Sistema Inventario Ferretería.exe" "" "$INSTDIR" 0
    
    ; Crear acceso directo en el menú de inicio
    CreateDirectory "$SMPROGRAMS\${APPNAME}"
    CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\Sistema Inventario Ferretería.exe" "" "$INSTDIR" 0
    
    ; Escribir clave de registro
    WriteRegStr HKLM "Software\${APPNAME}" "" $INSTDIR
    
    ; Escribir desinstalador
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Agregar entrada en Agregar/Quitar Programas
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "EstimatedSize" ${INSTALLSIZE}
SectionEnd

; Sección de desinstalación
Section "uninstall"
    ; Eliminar archivos
    RMDir /r "$INSTDIR"
    
    ; Eliminar accesos directos
    Delete "$DESKTOP\${APPNAME}.lnk"
    RMDir /r "$SMPROGRAMS\${APPNAME}"
    
    ; Eliminar clave de registro
    DeleteRegKey HKLM "Software\${APPNAME}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
SectionEnd
