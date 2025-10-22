# 📥 Guía Completa: Descargar y Configurar Informa en Visual Studio Code

## 🎯 Objetivo
Esta guía te llevará paso a paso para descargar, configurar y ejecutar **Informa** en tu computadora con Visual Studio Code.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

### ✅ Software Necesario:
1. **Node.js** (versión 18 o superior)
   - Descargar: https://nodejs.org/
   - Verifica instalación: `node --version`

2. **Visual Studio Code**
   - Descargar: https://code.visualstudio.com/
   
3. **Git** (opcional, para control de versiones)
   - Descargar: https://git-scm.com/

---

## 📁 PASO 1: Descargar los Archivos

### Opción A: Desde Figma Make
1. En Figma Make, haz clic en el botón de **exportar/descargar proyecto**
2. Descarga el archivo `.zip` con todos los archivos
3. Descomprime la carpeta en tu ubicación deseada (ej: `C:\Users\TuUsuario\Proyectos\informa`)

### Opción B: Copiar archivos manualmente
1. Crea una carpeta nueva llamada `informa`
2. Copia **TODOS** los archivos que ves en Figma Make a esta carpeta
3. Mantén la estructura de carpetas exacta

---

## 🛠️ PASO 2: Abrir el Proyecto en VS Code

1. Abre **Visual Studio Code**
2. Ve a `Archivo > Abrir Carpeta...` (o `File > Open Folder...`)
3. Selecciona la carpeta `informa` que acabas de crear
4. VS Code cargará el proyecto completo

---

## 📦 PASO 3: Instalar Dependencias

### 1. Abrir la Terminal en VS Code
- Presiona **Ctrl + Ñ** (o **Ctrl + `**)
- O ve a `Terminal > Nueva Terminal`

### 2. Instalar Node Modules
Ejecuta el siguiente comando en la terminal:

```bash
npm install
```

Esto instalará todas las dependencias necesarias (puede tardar 2-3 minutos).

### 3. Verificar que se creó la carpeta `node_modules`
Deberías ver una nueva carpeta llamada `node_modules` en el explorador de VS Code.

---

## ⚙️ PASO 4: Configurar Variables de Entorno

### 1. Crear archivo `.env.local`
En la raíz del proyecto (al mismo nivel que `package.json`), crea un archivo llamado `.env.local`

### 2. Agregar tus credenciales de Supabase
Copia y pega esto en el archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

### 3. Obtener tus credenciales
Ve a tu proyecto en Supabase:
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto "Informa"
3. Ve a **Settings > API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `VITE_SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE:** El archivo `.env.local` NO debe subirse a Git (ya está en `.gitignore`)

---

## 🚀 PASO 5: Ejecutar la Aplicación en Desarrollo

### Comando para iniciar el servidor de desarrollo:

```bash
npm run dev
```

### Resultado esperado:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Abrir la aplicación:
1. Abre tu navegador
2. Ve a: `http://localhost:5173/`
3. ¡Deberías ver Informa funcionando! 🎉

---

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa de build de producción |
| `npm run lint` | Verifica errores de código |

---

## 📂 Estructura del Proyecto

```
informa/
├── components/          # Componentes React
│   ├── ui/             # Componentes de interfaz (ShadCN)
│   ├── figma/          # Componentes de Figma
│   ├── AdminReportsPanel.tsx
│   ├── AlertsSection.tsx
│   ├── NewsSection.tsx
│   └── ...
├── supabase/           # Backend
│   └── functions/
│       └── server/
│           ├── index.tsx      # API endpoints
│           └── kv_store.tsx   # Base de datos KV
├── utils/              # Utilidades
│   └── supabase/
│       ├── client.tsx  # Cliente de Supabase
│       └── info.tsx    # Credenciales
├── styles/             # Estilos CSS
│   └── globals.css     # Tailwind v4 config
├── public/             # Archivos estáticos
│   ├── manifest.json   # PWA manifest
│   └── service-worker.js
├── App.tsx             # Componente principal
├── index.html          # HTML base
├── package.json        # Dependencias
├── vite.config.ts      # Configuración Vite
├── tsconfig.json       # Configuración TypeScript
└── .env.local          # Variables de entorno (CREAR)
```

---

## 🌐 PASO 6: Desplegar el Backend en Supabase

### 1. Instalar Supabase CLI
```bash
npm install -g supabase
```

### 2. Login en Supabase
```bash
supabase login
```

### 3. Desplegar Edge Functions
```bash
supabase functions deploy server
```

### 4. Configurar variables de entorno en Supabase
Ve a tu proyecto en Supabase Dashboard:
- `Settings > Edge Functions > Secrets`
- Agrega las siguientes variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL`

---

## 📱 PASO 7: Desplegar Frontend en Vercel

### Opción 1: Usando Vercel CLI

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Desplegar:
```bash
vercel
```

3. Seguir las instrucciones en pantalla

### Opción 2: Usando Vercel Dashboard

1. Ve a https://vercel.com/
2. Haz clic en **"Add New Project"**
3. Importa el repositorio de Git (o sube la carpeta)
4. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Haz clic en **"Deploy"**

---

## 🔍 Solución de Problemas

### ❌ Error: "Cannot find module"
**Solución:** Ejecuta `npm install` de nuevo

### ❌ Error: "VITE_SUPABASE_URL is not defined"
**Solución:** Verifica que el archivo `.env.local` existe y tiene las variables correctas

### ❌ Error: "Network error" al hacer requests
**Solución:** 
1. Verifica que las Edge Functions estén desplegadas en Supabase
2. Verifica que las credenciales en `.env.local` sean correctas
3. Verifica que las tablas existan en Supabase

### ❌ Puerto 5173 ocupado
**Solución:** 
```bash
# Usa otro puerto
npm run dev -- --port 5174
```

### ❌ Errores de TypeScript
**Solución:**
```bash
# Limpia cache y reinstala
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Extensiones Recomendadas para VS Code

Instala estas extensiones para mejor experiencia:

1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`
   
2. **Tailwind CSS IntelliSense**
   - ID: `bradlc.vscode-tailwindcss`
   
3. **Prettier - Code formatter**
   - ID: `esbenp.prettier-vscode`
   
4. **ESLint**
   - ID: `dbaeumer.vscode-eslint`

5. **TypeScript Vue Plugin (Volar)**
   - ID: `Vue.volar`

### Instalar extensiones desde terminal:
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

---

## 📝 Flujo de Trabajo Recomendado

### 1. Desarrollo Local
```bash
# Terminal 1: Ejecutar app
npm run dev

# Terminal 2: Hacer cambios en archivos
# Los cambios se reflejan automáticamente (Hot Reload)
```

### 2. Probar cambios
- Guarda el archivo (Ctrl + S)
- El navegador se recargará automáticamente
- Verifica que todo funcione

### 3. Compilar para producción
```bash
npm run build
```

### 4. Desplegar a Vercel
```bash
git add .
git commit -m "feat: descripción de cambios"
git push
```

---

## 🎯 Siguiente Paso: Configurar Git (Opcional)

Si quieres control de versiones:

### 1. Inicializar repositorio
```bash
git init
```

### 2. Crear archivo `.gitignore`
Ya está incluido en el proyecto con:
```
node_modules/
.env.local
dist/
.DS_Store
```

### 3. Hacer primer commit
```bash
git add .
git commit -m "chore: configuración inicial de Informa"
```

### 4. Conectar con GitHub
```bash
git remote add origin https://github.com/tu-usuario/informa.git
git branch -M main
git push -u origin main
```

---

## ✅ Checklist Final

Marca cada paso cuando lo completes:

- [ ] Node.js instalado
- [ ] VS Code instalado
- [ ] Proyecto descargado y abierto en VS Code
- [ ] `npm install` ejecutado exitosamente
- [ ] Archivo `.env.local` creado con credenciales
- [ ] `npm run dev` funciona y abre la app
- [ ] Edge Functions desplegadas en Supabase
- [ ] Variables de entorno configuradas en Supabase
- [ ] App funciona correctamente en local
- [ ] (Opcional) Git inicializado
- [ ] (Opcional) Desplegado en Vercel

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa la consola del navegador** (F12 > Console)
2. **Revisa la terminal de VS Code** para errores
3. **Verifica que todas las dependencias estén instaladas**
4. **Verifica que las credenciales de Supabase sean correctas**
5. **Consulta la documentación adicional** en los archivos `.md` del proyecto

---

## 🎉 ¡Listo!

Ahora tienes **Informa** funcionando localmente en tu computadora. Puedes:
- ✅ Hacer cambios en el código
- ✅ Ver los cambios en tiempo real
- ✅ Compilar y desplegar a producción
- ✅ Trabajar sin conexión a internet (excepto para requests a Supabase)

**¡Feliz desarrollo!** 🚀
