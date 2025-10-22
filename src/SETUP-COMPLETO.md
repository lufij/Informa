# 🎯 Setup Completo - De Cero a Deploy

Esta es la guía definitiva para pasar de código descargado a aplicación funcionando en producción.

## 📋 Tabla de Contenido

1. [Prerrequisitos](#1-prerrequisitos)
2. [Configurar Supabase](#2-configurar-supabase)
3. [Configurar Proyecto Local](#3-configurar-proyecto-local)
4. [Configurar Git](#4-configurar-git)
5. [Deploy en Vercel](#5-deploy-en-vercel)
6. [Configuración Final](#6-configuración-final)
7. [Verificación](#7-verificación)

---

## 1. Prerrequisitos

### ✅ Software Necesario

Instala en este orden:

1. **Node.js 18+** 
   - Descarga: https://nodejs.org/
   - Verifica: `node --version` (debe ser v18.0.0 o superior)

2. **Git**
   - Descarga: https://git-scm.com/downloads
   - Verifica: `git --version`

3. **Visual Studio Code** (opcional pero recomendado)
   - Descarga: https://code.visualstudio.com/

4. **Extensiones de VS Code** (opcional):
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript and JavaScript Language Features

---

## 2. Configurar Supabase

### Paso 2.1: Crear Proyecto

1. Ve a https://supabase.com
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub (recomendado)
4. Clic en "New Project"
5. Llena el formulario:
   - **Organization**: Tu organización o crea una nueva
   - **Name**: `informa-gualan`
   - **Database Password**: Genera uno seguro (¡guárdalo!)
   - **Region**: Selecciona el más cercano a Guatemala (ejemplo: `South America (São Paulo)`)
   - **Pricing Plan**: Free (suficiente para empezar)
6. Clic en "Create new project"
7. **Espera 2-3 minutos** mientras Supabase inicializa tu proyecto

### Paso 2.2: Obtener Credenciales

Una vez que el proyecto esté listo:

1. Ve a **Settings** (⚙️) en el menú lateral izquierdo
2. Ve a **API** en el submenú
3. Copia y guarda estos valores:

```
📋 Valores a copiar:

URL del proyecto:
https://xxxxxxxxxxxxx.supabase.co

anon public (Project API keys):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

service_role (Project API keys):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Ve a **Database** en el submenú
5. Baja hasta "Connection string"
6. Selecciona la pestaña "URI"
7. Copia el connection string:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

⚠️ **Reemplaza `[YOUR-PASSWORD]`** con la contraseña que creaste en el paso 2.1

### Paso 2.3: Deploy Edge Functions

Abre una terminal y ejecuta:

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login en Supabase
supabase login

# 3. Navega a la carpeta del proyecto
cd ruta/a/tu/proyecto

# 4. Link al proyecto (reemplaza PROJECT_REF con el ID de tu proyecto)
# Lo encuentras en Settings → General → Reference ID
supabase link --project-ref tu-project-ref

# 5. Deploy la función
supabase functions deploy make-server-3467f1c6
```

✅ Si todo salió bien, verás: `Deployed Function make-server-3467f1c6`

---

## 3. Configurar Proyecto Local

### Paso 3.1: Abrir Proyecto en VS Code

```bash
# Abre VS Code en la carpeta del proyecto
code .
```

### Paso 3.2: Instalar Dependencias

Abre la terminal integrada (Terminal → New Terminal) y ejecuta:

```bash
npm install
```

⏱️ Esto tomará 1-3 minutos dependiendo de tu conexión a internet.

### Paso 3.3: Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

2. Abre el archivo `.env` en VS Code

3. Reemplaza los valores con las credenciales de Supabase del paso 2.2:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_DB_URL=postgresql://postgres:TU-PASSWORD@db.xxxxx.supabase.co:5432/postgres
VITE_APP_NAME=Informa
VITE_APP_VERSION=2.0.0
NODE_ENV=development
```

4. **Guarda el archivo** (Ctrl+S / Cmd+S)

### Paso 3.4: Probar Localmente

```bash
npm run dev
```

✅ Si todo está bien, verás:

```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abre tu navegador en http://localhost:5173/

### Paso 3.5: Crear Usuario Admin

1. En la app local, haz clic en "Registrarse"
2. Llena el formulario:
   - **Nombre**: Tu nombre
   - **Teléfono**: `50404987` ⚠️ Este número específico te hará admin
   - **Contraseña**: La que quieras
   - **Foto de perfil**: Toma una foto con tu celular
3. Haz clic en "Crear Cuenta"

✅ Verás el mensaje: "👑 Bienvenido Administrador Principal"

---

## 4. Configurar Git

### Paso 4.1: Configurar Git (primera vez)

```bash
# Tu nombre
git config --global user.name "Tu Nombre"

# Tu email (usa el de GitHub)
git config --global user.email "tu@email.com"
```

### Paso 4.2: Inicializar Repositorio

```bash
# Inicializar Git
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit - Informa v2.0"
```

### Paso 4.3: Crear Repositorio en GitHub

**Opción A: Desde GitHub.com**

1. Ve a https://github.com/new
2. Repository name: `informa-gualan`
3. Description: `Red social comunitaria de Gualán, Zacapa, Guatemala`
4. **Public** o **Private** (tú decides)
5. ❌ NO marques "Initialize with README"
6. Clic en "Create repository"

7. Conecta tu repositorio local:

```bash
git remote add origin https://github.com/TU-USUARIO/informa-gualan.git
git branch -M main
git push -u origin main
```

**Opción B: Con GitHub CLI (más rápido)**

```bash
# Instalar GitHub CLI: https://cli.github.com/
gh auth login
gh repo create informa-gualan --public --source=. --push
```

✅ Verás tu código en https://github.com/TU-USUARIO/informa-gualan

---

## 5. Deploy en Vercel

### Opción A: Deploy desde GitHub (Recomendado)

1. Ve a https://vercel.com/signup
2. Inicia sesión con GitHub
3. Clic en "Add New..." → "Project"
4. Busca `informa-gualan` y haz clic en "Import"
5. En "Configure Project":
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Expande "Environment Variables" y agrega:

```
VITE_SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
VITE_SUPABASE_DB_URL = postgresql://postgres:...
```

7. Clic en "Deploy"

⏱️ Espera 2-3 minutos...

✅ Deploy completado! Verás tu URL: `https://informa-gualan.vercel.app`

### Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Cuando te pregunte por variables de entorno:
# Agrega las mismas del paso anterior
```

---

## 6. Configuración Final

### Paso 6.1: Actualizar URLs en index.html

1. Abre `/index.html` en VS Code
2. Busca estas líneas (alrededor de línea 45 y 53)
3. Reemplaza `https://informa-gualan.vercel.app` con TU URL de Vercel

```html
<!-- Línea 45 -->
<meta property="og:url" content="https://TU-DOMINIO.vercel.app" />

<!-- Línea 53 -->
<meta name="twitter:url" content="https://TU-DOMINIO.vercel.app" />
```

4. Guarda y haz commit:

```bash
git add index.html
git commit -m "Update URLs in meta tags"
git push
```

✅ Vercel detectará el cambio y re-deployará automáticamente

### Paso 6.2: Generar Íconos PWA (Opcional)

1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube el logo (usa la imagen en `figma:asset/159f250301c9fc78337e0c8aa784431ded1c39c8.png`)
3. Descarga el ZIP
4. Extrae los archivos a `/public/icons/`
5. Commit y push:

```bash
git add public/icons/
git commit -m "Add PWA icons"
git push
```

---

## 7. Verificación

### ✅ Checklist Final

Prueba cada uno de estos puntos:

#### En Local (http://localhost:5173)
- [ ] La app carga sin errores
- [ ] Puedes crear cuenta
- [ ] Puedes iniciar sesión
- [ ] Puedes crear un chisme/noticia
- [ ] Puedes comentar
- [ ] Puedes reaccionar (🔥❤️😱😢😡)
- [ ] Puedes ver notificaciones

#### En Producción (tu-dominio.vercel.app)
- [ ] La app carga sin errores
- [ ] Puedes crear cuenta
- [ ] Puedes iniciar sesión
- [ ] Puedes crear contenido
- [ ] Los deep links funcionan (comparte un post por WhatsApp)
- [ ] La PWA se puede instalar (Chrome → Menú → "Instalar Informa")

#### PWA (después de instalar)
- [ ] El ícono aparece en tu pantalla de inicio
- [ ] Funciona sin internet (modo offline básico)
- [ ] Recibe notificaciones
- [ ] Se ve como app nativa

### 🧪 Test de Deep Linking

1. Crea un chisme en producción
2. Haz clic en "Compartir" → copia el link
3. Abre el link en modo incógnito
4. Deberías ver:
   - ✅ Vista pública del chisme
   - ✅ Banner de "Instalar App"
   - ✅ Después de login, navega al chisme

### 📊 Test de Performance

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
   - ✅ SEO
4. Clic en "Analyze page load"

Objetivos:
- Performance: 90+ 🟢
- PWA: 90+ 🟢
- Best Practices: 90+ 🟢
- SEO: 90+ 🟢

---

## 🎉 ¡Felicitaciones!

Tu aplicación está:
- ✅ Funcionando localmente
- ✅ En Git/GitHub
- ✅ Deployada en Vercel
- ✅ Accesible públicamente
- ✅ Instalable como PWA

## 📚 Siguientes Pasos

1. **Personaliza el diseño** - Ajusta colores, logos, etc.
2. **Invita usuarios** - Comparte el link con tu comunidad
3. **Monitorea** - Revisa Analytics en Vercel
4. **Itera** - Agrega funcionalidades según feedback

## 🆘 ¿Problemas?

### La app no carga
- Verifica que las variables de entorno estén correctas
- Revisa la consola del navegador (F12)
- Verifica que las Edge Functions estén deployadas

### No puedo crear cuenta
- Verifica que Supabase esté funcionando
- Revisa los logs en Vercel (Dashboard → Functions → Logs)
- Verifica que el service_role_key sea correcto

### Deep links no funcionan
- Verifica que las URLs en index.html sean correctas
- Revisa que manifest.json tenga la URL correcta

## 📞 Soporte

- 📖 [README.md](./README.md) - Documentación completa
- 🐛 [Issues en GitHub](https://github.com/TU-USUARIO/informa-gualan/issues)
- 💬 [Discusiones en GitHub](https://github.com/TU-USUARIO/informa-gualan/discussions)

---

**¡Éxito con tu proyecto! 🚀**
