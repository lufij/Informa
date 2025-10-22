# ⚡ Inicio Rápido - Informa

> Configura y ejecuta Informa en **menos de 5 minutos** ⏱️

---

## 🎯 Paso 1: Descargar el Proyecto

### Opción A: Desde Figma Make
1. Descarga el proyecto como archivo `.zip`
2. Descomprime en tu carpeta de proyectos
3. Abre la carpeta en Visual Studio Code

### Opción B: Desde Git (si tienes acceso)
```bash
git clone https://github.com/tu-usuario/informa.git
cd informa
code .
```

---

## 📦 Paso 2: Instalar Dependencias

Abre la terminal en VS Code (**Ctrl + Ñ**) y ejecuta:

```bash
npm install
```

⏱️ Esto tomará 2-3 minutos. Ve por un café ☕

---

## 🔑 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo de entorno

```bash
# Windows PowerShell
copy .env.example .env.local

# Mac/Linux
cp .env.example .env.local
```

### 3.2 Obtener credenciales de Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto **"Informa"**
3. Ve a: **Settings → API**
4. Copia estas 3 credenciales:

| Campo | Copiar de Supabase |
|-------|-------------------|
| `VITE_SUPABASE_URL` | **Project URL** |
| `VITE_SUPABASE_ANON_KEY` | **anon public** |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | **service_role** |

### 3.3 Editar `.env.local`

Abre el archivo `.env.local` y pega tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

💾 Guarda el archivo (**Ctrl + S**)

---

## ✅ Paso 4: Verificar Setup (Opcional)

Ejecuta este comando para verificar que todo está bien:

```bash
npm run verify
```

Si ves errores, consulta `GUIA-DESCARGA-VSCODE.md`.

---

## 🚀 Paso 5: ¡Iniciar la Aplicación!

```bash
npm run dev
```

Deberías ver algo como:

```
VITE v5.1.0  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 🌐 Abrir en navegador

1. Abre tu navegador
2. Ve a: **http://localhost:5173**
3. ¡Deberías ver Informa funcionando! 🎉

---

## 🎨 ¿Qué deberías ver?

✅ Logo circular de Informa en header  
✅ Header con gradiente amarillo → rosa → morado  
✅ Botones "Ingresar" y "Registrarse"  
✅ Tabs: Feed | Noticias | Alertas | Clasificados | Foros  

Si ves esto, **¡todo funciona correctamente!** 🎊

---

## 🧪 Paso 6: Probar la App

### Registrarse

1. Haz clic en **"Registrarse"**
2. Completa:
   - Nombre: `Tu Nombre`
   - Teléfono: `12345678`
   - Contraseña: `test1234`
3. Haz clic en **"Registrarse"**

### Crear Contenido

1. Ve a tab **"Noticias"**
2. Haz clic en **"Nueva Noticia"**
3. Escribe algo
4. Haz clic en **"Publicar"**

¡Listo! Ya creaste tu primera publicación 🎯

---

## 📱 Bonus: Probar en tu Celular

### 1. Iniciar servidor en red local

```bash
npm run dev -- --host
```

### 2. Conectar tu celular

1. Conecta tu celular a la **misma red WiFi** que tu PC
2. En la terminal, busca la línea que dice **Network:**
   ```
   ➜  Network: http://192.168.1.10:5173/
   ```
3. Abre esa URL en el navegador de tu celular

¡Ahora puedes probar la app en móvil! 📱

---

## 🛠️ Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Ver build de producción |
| `npm run verify` | Verificar configuración |
| `npm run lint` | Verificar errores de código |

---

## ❓ Problemas Comunes

### ❌ Error: "Cannot find module"

```bash
npm run reset
```

### ❌ Error: "VITE_SUPABASE_URL is not defined"

Verifica que:
1. El archivo `.env.local` existe
2. Las variables están correctamente definidas
3. Reiniciaste el servidor después de crear el archivo

```bash
# Detener servidor: Ctrl + C
# Iniciar de nuevo:
npm run dev
```

### ❌ Puerto 5173 ocupado

```bash
npm run dev -- --port 5174
```

Luego abre: http://localhost:5174

### ❌ Página en blanco

1. Abre DevTools (**F12**)
2. Ve a tab **Console**
3. Busca errores en rojo
4. Si dice "Failed to fetch": verifica las credenciales de Supabase

---

## 📚 Siguiente Paso: Documentación

Ahora que tienes todo funcionando, consulta:

| Documento | Para qué sirve |
|-----------|----------------|
| `README-DESARROLLO.md` | Guía completa de desarrollo |
| `GUIA-DESCARGA-VSCODE.md` | Setup detallado paso a paso |
| `CHECKLIST-SETUP.md` | Lista de verificación completa |
| `DOCUMENTACION.md` | Documentación técnica |

---

## 🎯 Resumen en 30 Segundos

```bash
# 1. Instalar
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# (Editar .env.local con tus credenciales)

# 3. Iniciar
npm run dev

# 4. Abrir navegador
# http://localhost:5173
```

---

## ✅ Checklist Rápido

- [ ] Node.js instalado (v18+)
- [ ] Proyecto descargado
- [ ] `npm install` ejecutado
- [ ] `.env.local` creado con credenciales
- [ ] `npm run dev` funciona
- [ ] App carga en http://localhost:5173
- [ ] Puedes registrarte y crear contenido

Si todos están marcados: **¡Estás listo! 🚀**

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa la consola del navegador** (F12 → Console)
2. **Lee GUIA-DESCARGA-VSCODE.md** para troubleshooting
3. **Ejecuta `npm run verify`** para diagnóstico

---

## 🎉 ¡Felicidades!

Ya tienes **Informa** corriendo en tu computadora.

Ahora puedes:
- ✅ Hacer cambios en el código
- ✅ Ver resultados en tiempo real
- ✅ Probar en móviles
- ✅ Preparar para producción

**¡Feliz desarrollo!** 💻✨

---

**Tip:** Guarda este archivo en tus favoritos para referencia rápida 📌
