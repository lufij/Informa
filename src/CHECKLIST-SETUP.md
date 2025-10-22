# ✅ Checklist de Configuración - Informa

Usa este checklist para verificar que todo esté configurado correctamente antes de empezar a desarrollar.

---

## 📋 Pre-requisitos del Sistema

- [ ] **Node.js instalado** (v18 o superior)
  ```bash
  node --version
  # Debe mostrar: v18.x.x o superior
  ```

- [ ] **npm instalado** (v9 o superior)
  ```bash
  npm --version
  # Debe mostrar: 9.x.x o superior
  ```

- [ ] **Visual Studio Code instalado**
  ```bash
  code --version
  # Debe mostrar versión de VS Code
  ```

- [ ] **Git instalado** (opcional pero recomendado)
  ```bash
  git --version
  # Debe mostrar: git version 2.x.x
  ```

---

## 📁 Estructura de Archivos

- [ ] **Proyecto descargado completo**
  - [ ] Carpeta `components/` existe
  - [ ] Carpeta `supabase/` existe
  - [ ] Carpeta `utils/` existe
  - [ ] Carpeta `styles/` existe
  - [ ] Carpeta `public/` existe
  - [ ] Archivo `App.tsx` existe
  - [ ] Archivo `package.json` existe
  - [ ] Archivo `vite.config.ts` existe
  - [ ] Archivo `tsconfig.json` existe

- [ ] **Archivos de configuración creados**
  - [ ] `.vscode/settings.json` existe
  - [ ] `.vscode/extensions.json` existe
  - [ ] `.prettierrc` existe
  - [ ] `.gitignore` existe
  - [ ] `.env.example` existe

---

## 📦 Instalación de Dependencias

- [ ] **Ejecutar npm install**
  ```bash
  npm install
  ```

- [ ] **Verificar que se creó `node_modules/`**
  - [ ] Carpeta `node_modules/` aparece en el proyecto
  - [ ] Carpeta `node_modules/` NO debe subirse a Git

- [ ] **Verificar instalación exitosa**
  ```bash
  npm list react
  # Debe mostrar: react@18.2.0
  ```

---

## ⚙️ Configuración de Variables de Entorno

- [ ] **Crear archivo `.env.local`**
  ```bash
  cp .env.example .env.local
  ```

- [ ] **Obtener credenciales de Supabase**
  - [ ] Ir a https://supabase.com/dashboard
  - [ ] Seleccionar proyecto "Informa"
  - [ ] Ir a Settings → API
  - [ ] Copiar "Project URL"
  - [ ] Copiar "anon public key"
  - [ ] Copiar "service_role key"

- [ ] **Completar archivo `.env.local`**
  ```env
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
  ```

- [ ] **Verificar formato de las keys**
  - [ ] URL termina en `.supabase.co`
  - [ ] Anon key empieza con `eyJ`
  - [ ] Service role key empieza con `eyJ`

---

## 🔧 Extensiones de VS Code

- [ ] **Instalar extensiones recomendadas**

Cuando abras el proyecto en VS Code, deberías ver una notificación sugiriendo instalar extensiones. Haz clic en "Install All".

O instálalas manualmente:

- [ ] ES7+ React/Redux/React-Native snippets
- [ ] Tailwind CSS IntelliSense
- [ ] Prettier - Code formatter
- [ ] ESLint
- [ ] Error Lens (opcional pero útil)
- [ ] Path Intellisense (opcional)

### Verificar instalación:
```bash
code --list-extensions
# Debe mostrar las extensiones instaladas
```

---

## 🌐 Configuración de Backend (Supabase)

### Instalación de Supabase CLI

- [ ] **Instalar Supabase CLI globalmente**
  ```bash
  npm install -g supabase
  ```

- [ ] **Verificar instalación**
  ```bash
  supabase --version
  # Debe mostrar versión de Supabase CLI
  ```

### Login y Deploy

- [ ] **Login en Supabase**
  ```bash
  supabase login
  ```
  - Abrirá navegador para autenticación

- [ ] **Desplegar Edge Functions**
  ```bash
  supabase functions deploy server
  ```
  - Debe completarse sin errores

### Variables de Entorno en Supabase

- [ ] **Configurar secrets en Supabase Dashboard**
  - [ ] Ir a Settings → Edge Functions → Secrets
  - [ ] Agregar `SUPABASE_URL`
  - [ ] Agregar `SUPABASE_ANON_KEY`
  - [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] Agregar `SUPABASE_DB_URL` (opcional)

---

## 🚀 Prueba Inicial

### Iniciar Servidor de Desarrollo

- [ ] **Ejecutar servidor de desarrollo**
  ```bash
  npm run dev
  ```

- [ ] **Verificar que no hay errores en terminal**
  - Terminal debe mostrar:
  ```
  VITE vX.X.X  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ```

### Prueba en Navegador

- [ ] **Abrir navegador en http://localhost:5173**

- [ ] **Verificar que la app carga**
  - [ ] Logo de Informa aparece
  - [ ] Header con gradiente amarillo-rosa-morado
  - [ ] Botones "Ingresar" y "Registrarse" visibles

- [ ] **Verificar consola del navegador (F12)**
  - [ ] NO debe haber errores rojos
  - [ ] Puede haber warnings (advertencias) - esto es normal

### Prueba de Autenticación

- [ ] **Hacer clic en "Registrarse"**
  - [ ] Se abre modal de registro
  - [ ] Campos de nombre y teléfono visibles

- [ ] **Intentar registro de prueba**
  - Nombre: `Test Usuario`
  - Teléfono: `12345678`
  - [ ] Registro funciona sin errores

- [ ] **Verificar que aparece el feed**
  - [ ] Tabs de Feed, Noticias, Alertas, etc. visibles
  - [ ] Avatar de usuario aparece en header

---

## 🎨 Verificación Visual

- [ ] **Colores correctos**
  - [ ] Header: gradiente amarillo → rosa → morado
  - [ ] Botones vibrantes y coloridos
  - [ ] Fondo: degradado suave amarillo/rosa/morado

- [ ] **Responsividad**
  - [ ] Redimensionar ventana del navegador
  - [ ] En móvil (< 640px): tabs muestran solo iconos
  - [ ] En desktop: tabs muestran texto completo

- [ ] **Tipografía**
  - [ ] Texto legible
  - [ ] Tamaños apropiados
  - [ ] Sin texto cortado

---

## 🐛 Pruebas de Funcionalidad

### Crear Contenido

- [ ] **Crear noticia de prueba**
  - [ ] Ir a tab "Noticias"
  - [ ] Hacer clic en "Nueva Noticia"
  - [ ] Completar formulario
  - [ ] Publicar exitosamente

- [ ] **Crear alerta de prueba**
  - [ ] Ir a tab "Alertas"
  - [ ] Crear alerta
  - [ ] Verificar que aparece en feed

### Interacciones

- [ ] **Probar reacciones**
  - [ ] Click en 🔥 (Fire)
  - [ ] Click en ❤️ (Love)
  - [ ] Contador actualiza correctamente

- [ ] **Probar comentarios**
  - [ ] Abrir post
  - [ ] Agregar comentario
  - [ ] Comentario aparece en lista

### Búsqueda

- [ ] **Probar búsqueda global**
  - [ ] Click en icono de búsqueda (🔍)
  - [ ] Escribir término de búsqueda
  - [ ] Resultados aparecen

---

## 📱 Prueba en Dispositivos Móviles

- [ ] **Iniciar servidor con --host**
  ```bash
  npm run dev -- --host
  ```

- [ ] **Conectar móvil a misma red WiFi**

- [ ] **Acceder desde móvil**
  - URL: `http://192.168.x.x:5173`
  - [ ] App carga en móvil
  - [ ] Interfaz responsive
  - [ ] Touch interactions funcionan

---

## 🔒 Verificación de Seguridad

- [ ] **Archivo `.env.local` NO está en Git**
  ```bash
  git status
  # .env.local NO debe aparecer en lista
  ```

- [ ] **`.gitignore` incluye `.env.local`**
  ```bash
  grep ".env.local" .gitignore
  # Debe mostrar: .env.local
  ```

- [ ] **Service Role Key solo en backend**
  - [ ] NO usar `VITE_SUPABASE_SERVICE_ROLE_KEY` en componentes React
  - [ ] Solo en `/supabase/functions/server/`

---

## 📊 Verificación de Performance

- [ ] **Tiempo de carga < 3 segundos**
  - Abrir DevTools (F12)
  - Network tab → Recargar página
  - Verificar tiempo total

- [ ] **Hot Reload funciona**
  - Editar archivo (ej: cambiar texto en `App.tsx`)
  - Guardar (Ctrl + S)
  - [ ] Navegador actualiza automáticamente

- [ ] **Build de producción funciona**
  ```bash
  npm run build
  # Debe completarse sin errores
  ```

---

## 🎯 Checklist Final

- [ ] ✅ Node.js y npm instalados
- [ ] ✅ Proyecto descargado completo
- [ ] ✅ `npm install` ejecutado
- [ ] ✅ `.env.local` creado y configurado
- [ ] ✅ Extensiones de VS Code instaladas
- [ ] ✅ Supabase CLI instalado
- [ ] ✅ Edge Functions desplegadas
- [ ] ✅ `npm run dev` funciona
- [ ] ✅ App carga en navegador
- [ ] ✅ Autenticación funciona
- [ ] ✅ Crear contenido funciona
- [ ] ✅ Responsive en móvil
- [ ] ✅ `.env.local` NO en Git
- [ ] ✅ Build de producción funciona

---

## 🎉 ¡Configuración Completa!

Si todos los checkboxes están marcados, ¡estás listo para desarrollar! 🚀

### Próximos pasos:

1. **Leer documentación**
   - `README-DESARROLLO.md` - Guía de desarrollo
   - `DOCUMENTACION.md` - Documentación técnica

2. **Configurar Git** (si aún no lo hiciste)
   ```bash
   git init
   git add .
   git commit -m "chore: setup inicial de Informa"
   ```

3. **Crear rama de desarrollo**
   ```bash
   git checkout -b desarrollo
   ```

4. **¡Empezar a codear!** 💻✨

---

## 🆘 Si algo falló...

### Consulta estos archivos:
- `GUIA-DESCARGA-VSCODE.md` - Solución de problemas
- `README-DESARROLLO.md` - Depuración

### Comandos de reset:
```bash
# Limpiar todo y empezar de nuevo
npm run clean
npm install

# Reiniciar servidor
# Ctrl + C en terminal
npm run dev
```

### Logs útiles:
```bash
# Ver logs de Supabase Functions
# Ir a: https://supabase.com/dashboard → Edge Functions → Logs

# Ver logs del navegador
# F12 → Console tab
```

---

**¡Éxito en tu desarrollo!** 🎊
