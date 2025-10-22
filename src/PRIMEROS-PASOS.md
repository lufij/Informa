# 🚀 Primeros Pasos - Guía Rápida

## ⚡ Setup en 5 Minutos

### 1️⃣ Abrir el Proyecto
```bash
# Abre Visual Studio Code
# File → Open Folder → Selecciona la carpeta del proyecto
```

### 2️⃣ Instalar Dependencias
```bash
# Abre la terminal integrada (Ctrl + ñ)
npm install
```
⏱️ Esto tomará 2-5 minutos

### 3️⃣ Configurar Supabase

**Opción A: Crear Proyecto Nuevo (Recomendado)**

1. Ve a https://supabase.com
2. Click "Start your project" (gratis)
3. Crea un proyecto:
   - Organization: Crea una nueva
   - Name: `informa-gualan`
   - Password: Crea una contraseña segura
   - Region: South America
4. Espera 2-3 minutos

**Opción B: Usar Proyecto Existente**

Si ya tienes un proyecto de Supabase, úsalo.

### 4️⃣ Copiar Credenciales

1. En Supabase Dashboard → **Settings** (⚙️) → **API**
2. Copia estos valores:

```
Project URL        → Copiar
anon public        → Copiar (click "Reveal")
service_role       → Copiar (click "Reveal")
```

3. En tu proyecto, crea archivo `.env`:
```bash
# En la raíz del proyecto
cp .env.example .env
```

4. Pega los valores en `.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

5. Para `VITE_SUPABASE_DB_URL`:
   - Settings → Database → Connection string → URI
   - Copia y reemplaza `[YOUR-PASSWORD]` con tu password real

### 5️⃣ Desplegar Backend

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login
# Se abrirá el navegador

# Link al proyecto
supabase link --project-ref xxxxx
# Encuentra el ID en: Settings → General → Reference ID

# Deploy Edge Functions
supabase functions deploy make-server-3467f1c6
```

### 6️⃣ Generar Íconos PWA

**IMPORTANTE:** Sin esto, la PWA no funcionará.

1. Ve a: https://www.pwabuilder.com/imageGenerator
2. Sube un logo (512x512px mínimo)
3. Descarga el ZIP
4. Extrae y copia TODOS los `.png` a `/public/icons/`

### 7️⃣ Iniciar Servidor

```bash
npm run dev
```

🎉 **¡La app se abrirá en http://localhost:3000!**

---

## ✅ Verificación Rápida

### Checklist:
- [ ] `npm install` completado sin errores
- [ ] Archivo `.env` creado con credenciales
- [ ] Edge Functions desplegadas en Supabase
- [ ] Íconos PWA generados en `/public/icons/`
- [ ] `npm run dev` funciona
- [ ] La app carga en el navegador
- [ ] Puedes crear una cuenta

---

## 🆘 Si Algo Falla

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 in use"
```bash
npm run dev -- --port 3001
```

### Error: Variables de entorno
- Verifica que `.env` exista
- Verifica que las variables NO tengan espacios
- Verifica que las keys sean correctas

### La app carga pero no funciona
- Abre F12 → Console
- Lee el error
- Probablemente faltan las Edge Functions:
```bash
supabase functions deploy make-server-3467f1c6
```

---

## 📱 Probar en Móvil

### Durante Desarrollo

1. **Encuentra tu IP local:**
```bash
# Mac/Linux
ifconfig | grep inet

# Windows
ipconfig

# Busca algo como: 192.168.1.XXX
```

2. **Inicia con --host:**
```bash
npm run dev -- --host
```

3. **Abre en tu móvil:**
```
http://192.168.1.XXX:3000
```

4. **Instala la PWA:**
   - Chrome Android: "Agregar a pantalla de inicio"
   - Safari iOS: Compartir → "Añadir a inicio"

---

## 🚀 Desplegar a Producción

Una vez que funcione localmente:

### Método 1: GitHub + Vercel (Automático)
```bash
# 1. Sube a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/usuario/informa-gualan.git
git push -u origin main

# 2. Ve a vercel.com/new
# 3. Importa el repo
# 4. Agrega variables de entorno
# 5. Deploy!
```

### Método 2: Vercel CLI (Manual)
```bash
# 1. Instalar
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

---

## 📚 Siguiente Nivel

Una vez que todo funcione:

1. **Lee la documentación completa:**
   - [SETUP-VSCODE.md](./SETUP-VSCODE.md) - Setup detallado
   - [README.md](./README.md) - Documentación completa
   - [COMANDOS-UTILES.md](./COMANDOS-UTILES.md) - Comandos útiles

2. **Personaliza la app:**
   - Cambia colores en `/styles/globals.css`
   - Modifica componentes en `/components/`
   - Agrega funcionalidades

3. **Despliega:**
   - [QUICK-DEPLOY-GUIDE.md](./QUICK-DEPLOY-GUIDE.md) - Guía de despliegue

---

## 💡 Tips Importantes

### ⚡ Hot Reload
Los cambios en el código se reflejan automáticamente sin recargar.

### 🔍 Ver Errores
Siempre ten abierto F12 → Console para ver errores.

### 💾 Guardar Siempre
Ctrl+S (Windows) / Cmd+S (Mac) - Los cambios no aplican hasta guardar.

### 🌐 URLs Importantes
- **App local:** http://localhost:3000
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 🎯 ¿Listo?

Si completaste todos los pasos:

```bash
# Verifica que todo esté bien
node scripts/verify-setup.js

# Inicia desarrollo
npm run dev
```

**¡Ya puedes empezar a desarrollar! 🚀**

---

**¿Necesitas ayuda?** Lee [SETUP-VSCODE.md](./SETUP-VSCODE.md) para instrucciones más detalladas.

[← Volver al inicio](./README.md)
