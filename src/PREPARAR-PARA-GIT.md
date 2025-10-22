# 📦 Guía: Preparar Proyecto para Git

Esta guía te ayudará a limpiar y preparar el proyecto "Informa" antes de subirlo a Git.

## ✅ Paso 1: Verificar que tienes Git instalado

```bash
git --version
```

Si no está instalado, descárgalo de: https://git-scm.com/downloads

## 🧹 Paso 2: Limpiar archivos temporales

Ya creé un archivo `.gitignore` que excluirá automáticamente todos los archivos de documentación temporal. 

### Archivos que SE SUBIRÁN a Git:
- ✅ `README.md` - Documentación principal
- ✅ `LICENSE` - Licencia del proyecto
- ✅ `PWA-USER-GUIDE.md` - Guía de usuario
- ✅ `Attributions.md` - Créditos
- ✅ Todo el código fuente (`/components`, `/utils`, `/supabase`, etc.)
- ✅ Archivos de configuración (`package.json`, `vite.config.ts`, etc.)

### Archivos que NO SE SUBIRÁN (automáticamente ignorados):
- ❌ Todos los archivos `.md` de documentación temporal (CHECKLIST, COMANDOS, etc.)
- ❌ `node_modules/`
- ❌ `.env` (credenciales)
- ❌ Archivos de configuración de VS Code específicos

## 🔧 Paso 3: Crear archivo de variables de entorno de ejemplo

```bash
# En la raíz del proyecto, crea .env.example
```

Contenido del archivo:

```env
# Supabase (REQUERIDO)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VITE_SUPABASE_DB_URL=postgresql://postgres:...

# App (OPCIONAL)
VITE_APP_NAME=Informa
VITE_APP_VERSION=2.0.0
NODE_ENV=development
```

## 🎯 Paso 4: Inicializar Git

```bash
# 1. Abre la terminal en la raíz del proyecto
cd ruta/a/tu/proyecto

# 2. Inicializa Git
git init

# 3. Agrega todos los archivos
git add .

# 4. Verifica qué archivos se van a subir
git status

# Deberías ver SOLO archivos de código, NO los .md temporales
```

## 📋 Paso 5: Primer Commit

```bash
# Crea el commit inicial
git commit -m "Initial commit - Informa v2.0"
```

## 🌐 Paso 6: Conectar a GitHub

### Opción A: Crear repositorio desde GitHub.com

1. Ve a https://github.com
2. Clic en el botón "+" arriba a la derecha → "New repository"
3. Nombre: `informa-gualan` (o el que prefieras)
4. Descripción: `Red social comunitaria de Gualán, Zacapa, Guatemala`
5. **NO inicialices** con README, .gitignore ni LICENSE (ya los tienes)
6. Clic en "Create repository"

7. Copia los comandos que GitHub te muestra:

```bash
git remote add origin https://github.com/TU-USUARIO/informa-gualan.git
git branch -M main
git push -u origin main
```

### Opción B: Usar GitHub CLI (más rápido)

```bash
# Instalar GitHub CLI si no lo tienes
# https://cli.github.com/

# Login
gh auth login

# Crear repositorio y subirlo (todo en uno)
gh repo create informa-gualan --public --source=. --push
```

## 🔐 Paso 7: Proteger credenciales

**MUY IMPORTANTE:** Verifica que tu archivo `.env` NO se haya subido:

```bash
# Busca si .env está en el repositorio
git ls-files | grep .env

# Si aparece .env (y no debería), elimínalo:
git rm --cached .env
git commit -m "Remove .env file"
git push
```

## 📝 Paso 8: Actualizar información del repositorio

Actualiza estos campos en el README.md si es necesario:

1. URL del repositorio
2. URL de la demo
3. Email de contacto
4. Información del autor

## ✅ Verificación Final

Antes de compartir el repositorio, verifica:

- [ ] `.gitignore` está funcionando (no hay archivos temporales)
- [ ] `.env` NO está en el repositorio
- [ ] `README.md` tiene la información correcta
- [ ] El proyecto compila sin errores: `npm run build`
- [ ] El código está organizado y limpio

## 🚀 Bonus: Configurar GitHub Actions (CI/CD)

Si quieres que el proyecto se pruebe automáticamente en cada push, crea `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
```

## 📚 Recursos Adicionales

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Docs](https://docs.github.com/es)
- [Conventional Commits](https://www.conventionalcommits.org/es/) - Estándar de mensajes

## 🆘 Problemas Comunes

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/informa-gualan.git
```

### Error: "Updates were rejected"
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### Olvidé agregar algo al .gitignore
```bash
# Agrega el archivo/carpeta a .gitignore
echo "archivo-a-ignorar.txt" >> .gitignore

# Elimínalo del repositorio (pero mantén el archivo local)
git rm --cached archivo-a-ignorar.txt

# Commit
git commit -m "Update .gitignore"
git push
```

## 🎉 ¡Listo!

Tu proyecto ya está en Git y listo para:
- Colaboración con otros desarrolladores
- Despliegue en Vercel/Netlify
- Control de versiones
- Backup en la nube

---

**Siguiente paso:** [DEPLOYMENT.md](./DEPLOYMENT.md) - Desplegar en Vercel
