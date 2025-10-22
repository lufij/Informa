# 📌 LEER PRIMERO - Guía de Configuración de Informa

> **¡Bienvenido!** Esta es tu guía de inicio para trabajar con Informa en Visual Studio Code.

---

## 🎯 ¿Qué es este proyecto?

**Informa** es una red social comunitaria para Gualán, Zacapa, Guatemala que incluye:

- 📰 **Noticias verificadas**
- 🚨 **Sistema de alertas comunitarias**
- 💼 **Clasificados locales**
- 💬 **Foros de discusión**
- 🚒 **Sistema de emergencias para bomberos**
- 👥 **Mensajería privada**
- 🛡️ **Panel de moderación para admins**

---

## 📚 Documentación Disponible

Hemos preparado **7 documentos** para ayudarte. Aquí está el orden recomendado:

### 🚀 Para Empezar (Lee en este orden):

| # | Documento | ¿Para qué sirve? | ⏱️ Tiempo |
|---|-----------|------------------|----------|
| 1️⃣ | **INICIO-RAPIDO.md** | Configurar y ejecutar en 5 minutos | 5 min |
| 2️⃣ | **GUIA-DESCARGA-VSCODE.md** | Setup completo paso a paso | 15 min |
| 3️⃣ | **CHECKLIST-SETUP.md** | Verificar que todo funcione | 10 min |

### 📖 Para Desarrollo (Consultar después):

| # | Documento | ¿Para qué sirve? | Cuándo usarlo |
|---|-----------|------------------|---------------|
| 4️⃣ | **README-DESARROLLO.md** | Guía completa de desarrollo | Al empezar a codear |
| 5️⃣ | **COMANDOS-WINDOWS.md** | Comandos específicos de PowerShell | Usuarios Windows |
| 6️⃣ | **DOCUMENTACION.md** | Documentación técnica detallada | Referencia avanzada |
| 7️⃣ | **DEPLOYMENT.md** | Cómo desplegar a producción | Al publicar |

---

## ⚡ Inicio Ultra-Rápido (30 segundos)

Si ya tienes Node.js instalado y quieres empezar YA:

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# (Editar .env.local con credenciales de Supabase)

# 3. Iniciar
npm run dev

# 4. Abrir navegador
http://localhost:5173
```

**¿No funciona?** → Lee **INICIO-RAPIDO.md**

---

## 📋 Checklist Antes de Empezar

Marca cada item antes de continuar:

### Requisitos del Sistema
- [ ] **Node.js v18+** instalado
- [ ] **npm v9+** instalado  
- [ ] **Visual Studio Code** instalado
- [ ] **Cuenta de Supabase** creada

### Archivos del Proyecto
- [ ] Proyecto **descargado** y **descomprimido**
- [ ] Carpeta abierta en **VS Code**
- [ ] `package.json` existe en la raíz

### Credenciales
- [ ] Tienes acceso a **Supabase Dashboard**
- [ ] Puedes ver **Settings → API** de tu proyecto
- [ ] Tienes las 3 keys: URL, Anon, Service Role

---

## 🎓 ¿Eres Nuevo en Desarrollo?

### Si NO tienes Node.js instalado:

1. **Descarga Node.js**: https://nodejs.org/
2. Instala la versión **LTS** (recomendada)
3. Reinicia tu computadora
4. Verifica instalación:
   ```bash
   node --version
   npm --version
   ```

### Si NO tienes VS Code instalado:

1. **Descarga VS Code**: https://code.visualstudio.com/
2. Instala con configuración por defecto
3. Abre VS Code y presiona **Ctrl + Ñ** para abrir terminal

### Si NO tienes cuenta en Supabase:

1. Ve a: https://supabase.com/
2. Haz clic en **"Start your project"**
3. Crea cuenta (puedes usar GitHub)
4. Crea un nuevo proyecto llamado **"Informa"**
5. Espera 2 minutos a que se cree
6. Ve a **Settings → API** para ver tus credenciales

---

## 🛠️ Stack Tecnológico

Para que sepas con qué trabajarás:

### Frontend
- **React 18** - Librería de UI
- **TypeScript** - JavaScript con tipos
- **Tailwind CSS v4** - Estilos utility-first
- **Vite** - Build tool ultra-rápido
- **ShadCN UI** - Componentes pre-hechos

### Backend
- **Supabase** - Backend as a Service
- **Edge Functions** - API serverless
- **PostgreSQL** - Base de datos

### Deploy
- **Vercel** - Hosting del frontend
- **Supabase** - Hosting del backend

---

## 📁 Estructura del Proyecto (Simplificada)

```
informa/
├── components/          # 👉 Componentes React (aquí editarás)
│   ├── NewsSection.tsx
│   ├── AlertsSection.tsx
│   └── ...
├── supabase/           # 👉 Backend API
│   └── functions/server/
├── styles/             # 👉 Estilos CSS
│   └── globals.css
├── public/             # 👉 Imágenes y assets
├── App.tsx             # 👉 Componente principal
├── package.json        # 👉 Dependencias
└── .env.local          # 👉 Variables de entorno (CREAR)
```

---

## 🎯 Siguientes Pasos

### 1️⃣ Configuración Inicial (Primera vez)

Lee en orden:
1. **INICIO-RAPIDO.md** - 5 minutos ⚡
2. **GUIA-DESCARGA-VSCODE.md** - Setup detallado 📖
3. **CHECKLIST-SETUP.md** - Verificar todo ✅

### 2️⃣ Empezar a Desarrollar

Una vez configurado:
1. Lee **README-DESARROLLO.md**
2. Ejecuta `npm run dev`
3. Abre http://localhost:5173
4. ¡Empieza a codear! 💻

### 3️⃣ Desplegar a Producción

Cuando estés listo:
1. Lee **DEPLOYMENT.md**
2. Haz build: `npm run build`
3. Despliega a Vercel

---

## 🚨 Problemas Comunes

### ❌ "node: command not found"
**Solución:** Node.js no está instalado. Descarga de https://nodejs.org/

### ❌ "npm install" da errores
**Solución:** 
```bash
npm cache clean --force
npm install
```

### ❌ ".env.local not found"
**Solución:** Crea el archivo:
```bash
cp .env.example .env.local
```

### ❌ Página en blanco en navegador
**Solución:** 
1. Abre DevTools (F12)
2. Ve a Console
3. Busca error en rojo
4. Probablemente falta `.env.local` o credenciales incorrectas

### ❌ "Port 5173 already in use"
**Solución:**
```bash
npm run dev -- --port 5174
```

---

## 🆘 ¿Necesitas Ayuda?

### Paso 1: Ejecuta diagnóstico
```bash
npm run verify
```

### Paso 2: Revisa logs
- **Terminal de VS Code**: Errores del servidor
- **Console del navegador (F12)**: Errores del frontend
- **Supabase Dashboard**: Errores del backend

### Paso 3: Consulta documentación
- **GUIA-DESCARGA-VSCODE.md** → Sección "Solución de Problemas"
- **README-DESARROLLO.md** → Sección "Depuración"

### Paso 4: Verifica lo básico
- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] `node_modules/` existe
- [ ] `.env.local` existe y tiene las 3 variables
- [ ] Credenciales de Supabase son correctas

---

## ✅ Verificación Rápida

Ejecuta estos comandos para verificar que todo está bien:

```bash
# 1. Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# 2. Verificar npm
npm --version
# Debe mostrar: 9.x.x o superior

# 3. Verificar dependencias instaladas
npm list react
# Debe mostrar: react@18.2.0

# 4. Verificar que .env.local existe
cat .env.local
# Debe mostrar tus variables de entorno

# 5. Ejecutar verificación automática
npm run verify
# Debe decir: "Todo está configurado correctamente"
```

Si todos pasan: **¡Estás listo! 🎉**

---

## 🎊 ¡Todo Listo!

Has completado la lectura inicial. Ahora:

### Opción A: Configuración Express (5 min)
→ Lee **INICIO-RAPIDO.md**

### Opción B: Configuración Detallada (15 min)
→ Lee **GUIA-DESCARGA-VSCODE.md**

### Opción C: Ya está configurado
→ Lee **README-DESARROLLO.md** y empieza a codear

---

## 📞 Recursos y Links

| Recurso | Link |
|---------|------|
| Node.js | https://nodejs.org/ |
| VS Code | https://code.visualstudio.com/ |
| Supabase | https://supabase.com/ |
| Vercel | https://vercel.com/ |
| Tailwind CSS | https://tailwindcss.com/ |
| React | https://react.dev/ |

---

## 🎯 Objetivos de Aprendizaje

Al completar este setup, sabrás:
- ✅ Configurar un proyecto React + TypeScript
- ✅ Trabajar con Vite como bundler
- ✅ Usar Tailwind CSS para estilos
- ✅ Conectar con Supabase backend
- ✅ Ejecutar servidor de desarrollo
- ✅ Hacer build de producción
- ✅ Desplegar a Vercel

---

## 💡 Consejo Final

> **"No te agobies"**  
> 
> Si es tu primera vez con React, TypeScript, o Tailwind, es normal sentirse abrumado.
> Toma las cosas paso a paso. La documentación está aquí para ayudarte.
> 
> ¡Vas a hacer un gran trabajo! 💪

---

## 🚀 ¡Adelante!

**Siguiente paso:** Lee **INICIO-RAPIDO.md** para comenzar

**¡Éxito en tu desarrollo!** 🎉✨

---

<div align="center">

**Informa** - Red Social Comunitaria  
Gualán, Zacapa, Guatemala 🇬🇹

</div>
