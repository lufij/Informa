# 💻 Comandos para Windows PowerShell - Informa

> Guía específica para usuarios de Windows trabajando con PowerShell en VS Code

---

## 🎯 Abrir PowerShell en VS Code

1. Abre **Visual Studio Code**
2. Presiona **Ctrl + Ñ** (o **Ctrl + `**)
3. Si no aparece PowerShell, haz clic en el dropdown y selecciona **PowerShell**

---

## 📦 Instalación y Setup

### Verificar Node.js instalado

```powershell
node --version
# Debe mostrar: v18.x.x o superior

npm --version
# Debe mostrar: 9.x.x o superior
```

### Instalar dependencias

```powershell
npm install
```

### Crear archivo de variables de entorno

```powershell
# Copiar .env.example a .env.local
Copy-Item .env.example .env.local
```

### Editar .env.local

```powershell
# Abrir en VS Code
code .env.local
```

Luego completa con tus credenciales de Supabase.

---

## 🚀 Comandos de Desarrollo

### Iniciar servidor de desarrollo

```powershell
npm run dev
```

### Iniciar en modo red (para móviles)

```powershell
npm run dev -- --host
```

### Usar puerto personalizado

```powershell
npm run dev -- --port 5174
```

### Detener servidor

Presiona **Ctrl + C** en la terminal

---

## 🔧 Comandos de Mantenimiento

### Verificar configuración

```powershell
npm run verify
```

### Compilar para producción

```powershell
npm run build
```

### Vista previa de producción

```powershell
npm run preview
```

### Verificar errores de código

```powershell
npm run lint
```

### Verificar tipos TypeScript

```powershell
npm run type-check
```

---

## 🧹 Comandos de Limpieza

### Limpiar node_modules y dist

```powershell
# Ejecutar script de limpieza
npm run clean

# O manualmente:
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
```

### Reset completo (limpiar y reinstalar)

```powershell
npm run reset
```

### Limpiar caché de npm

```powershell
npm cache clean --force
```

---

## 📁 Navegación y Archivos

### Ver contenido de carpeta actual

```powershell
Get-ChildItem
# O simplemente:
dir
```

### Navegar entre carpetas

```powershell
# Entrar a carpeta
cd components

# Volver atrás
cd ..

# Ir a raíz del proyecto
cd \
```

### Crear archivo

```powershell
New-Item -Path .env.local -ItemType File
```

### Crear carpeta

```powershell
New-Item -Path nueva-carpeta -ItemType Directory
```

### Ver contenido de archivo

```powershell
Get-Content .env.local
# O simplemente:
cat .env.local
```

### Editar archivo en VS Code

```powershell
code archivo.tsx
```

---

## 🌐 Git en PowerShell

### Inicializar repositorio

```powershell
git init
```

### Verificar estado

```powershell
git status
```

### Agregar archivos

```powershell
# Agregar todos
git add .

# Agregar archivo específico
git add App.tsx
```

### Hacer commit

```powershell
git commit -m "feat: descripción del cambio"
```

### Ver historial

```powershell
git log --oneline
```

### Crear rama

```powershell
git checkout -b desarrollo
```

### Cambiar de rama

```powershell
git checkout main
```

### Push a repositorio remoto

```powershell
git push origin main
```

---

## 🔐 Variables de Entorno

### Ver variables de entorno

```powershell
Get-Content .env.local
```

### Verificar que .env.local no está en Git

```powershell
git status
# .env.local NO debe aparecer en la lista
```

### Editar .env.local

```powershell
notepad .env.local
# O mejor en VS Code:
code .env.local
```

---

## 📊 Comandos de Diagnóstico

### Verificar espacio en disco

```powershell
Get-PSDrive C
```

### Ver procesos de Node

```powershell
Get-Process node
```

### Matar proceso de Node (si se quedó colgado)

```powershell
Stop-Process -Name node
```

### Ver puerto ocupado (ej: 5173)

```powershell
Get-NetTCPConnection -LocalPort 5173
```

### Liberar puerto ocupado

```powershell
# Encontrar proceso usando el puerto
$process = Get-NetTCPConnection -LocalPort 5173 | Select-Object -ExpandProperty OwningProcess
# Matar proceso
Stop-Process -Id $process -Force
```

---

## 🔄 Actualización de Dependencias

### Ver dependencias desactualizadas

```powershell
npm outdated
```

### Actualizar dependencia específica

```powershell
npm update react
```

### Actualizar todas las dependencias

```powershell
npm update
```

### Reinstalar dependencias

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 🌐 Supabase CLI

### Instalar Supabase CLI globalmente

```powershell
npm install -g supabase
```

### Verificar instalación

```powershell
supabase --version
```

### Login en Supabase

```powershell
supabase login
```

### Ver proyectos

```powershell
supabase projects list
```

### Desplegar Edge Functions

```powershell
supabase functions deploy server
```

### Ver logs de functions

```powershell
supabase functions logs server
```

---

## 📱 Comandos de Red

### Ver IP local

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}
```

### Probar conectividad

```powershell
Test-NetConnection -ComputerName google.com
```

---

## 🎨 Comandos Útiles de PowerShell

### Limpiar pantalla

```powershell
Clear-Host
# O simplemente:
cls
```

### Ver historial de comandos

```powershell
Get-History
```

### Buscar en historial

```powershell
# Presiona Ctrl + R
# Luego escribe parte del comando
```

### Autocompletar

Presiona **Tab** para autocompletar nombres de archivos y carpetas

### Copiar output al portapapeles

```powershell
npm run verify | clip
```

---

## ⚡ Aliases Útiles (Shortcuts)

Puedes crear aliases para comandos frecuentes:

### Crear alias temporal (solo esta sesión)

```powershell
# Alias para npm run dev
Set-Alias -Name dev -Value "npm run dev"

# Uso:
dev
```

### Crear alias permanente

Edita tu perfil de PowerShell:

```powershell
notepad $PROFILE
```

Agrega:

```powershell
function dev { npm run dev }
function build { npm run build }
function clean { npm run clean }
```

Guarda y recarga:

```powershell
. $PROFILE
```

---

## 🐛 Solución de Problemas en Windows

### Error: "cannot be loaded because running scripts is disabled"

```powershell
# Ejecutar como Administrador:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Access denied" al instalar paquetes globales

```powershell
# Ejecutar PowerShell como Administrador
# Clic derecho en PowerShell → "Ejecutar como administrador"
```

### Error: "ENOENT: no such file or directory"

```powershell
# Verificar ruta actual
Get-Location

# Navegar a carpeta correcta
cd C:\Users\TuUsuario\Proyectos\informa
```

### Error: "npm ERR! code EEXIST"

```powershell
# Limpiar caché
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 📋 Checklist de Comandos Esenciales

```powershell
# 1. Instalar dependencias
npm install

# 2. Crear variables de entorno
Copy-Item .env.example .env.local
code .env.local

# 3. Verificar setup
npm run verify

# 4. Iniciar desarrollo
npm run dev

# 5. Compilar producción
npm run build

# 6. Desplegar backend
supabase functions deploy server

# 7. Git init (opcional)
git init
git add .
git commit -m "chore: setup inicial"
```

---

## 🎯 Flujo de Trabajo Típico

### Inicio del día

```powershell
# 1. Abrir VS Code
code .

# 2. Iniciar servidor
npm run dev

# 3. Abrir navegador
start http://localhost:5173
```

### Durante desarrollo

```powershell
# Ver cambios en tiempo real
# (Hot reload automático al guardar)

# Verificar errores
npm run lint
```

### Antes de hacer commit

```powershell
# 1. Verificar
npm run verify

# 2. Build
npm run build

# 3. Git
git add .
git commit -m "feat: nueva funcionalidad"
git push
```

---

## 🆘 Comandos de Emergencia

### Servidor no responde

```powershell
# 1. Ctrl + C para detener
# 2. Matar procesos de Node
Stop-Process -Name node -Force
# 3. Reiniciar
npm run dev
```

### Cambios no se reflejan

```powershell
# 1. Detener servidor
Ctrl + C
# 2. Limpiar cache de Vite
Remove-Item -Recurse -Force node_modules/.vite
# 3. Reiniciar
npm run dev
```

### Error de dependencias

```powershell
# Reset completo
npm run reset
```

---

## 💡 Tips para PowerShell

1. **Usa Tab** para autocompletar
2. **Usa ↑ ↓** para navegar historial
3. **Ctrl + C** para detener procesos
4. **Ctrl + L** para limpiar pantalla
5. **F7** para ver historial completo
6. **Clic derecho** para pegar en terminal

---

## 📚 Recursos Adicionales

- [Documentación PowerShell](https://docs.microsoft.com/powershell/)
- [Comandos Node.js](https://nodejs.org/docs/)
- [Comandos npm](https://docs.npmjs.com/)
- [Comandos Git](https://git-scm.com/docs)

---

**¡Listo para desarrollar en Windows!** 💻🚀
