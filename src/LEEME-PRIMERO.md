# 🚀 ¡Bienvenido a Informa!

## ⚡ Inicio Ultra-Rápido (5 minutos)

Si quieres tener la app funcionando en **5 minutos**, sigue estos pasos:

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Configurar Supabase

Ve a https://supabase.com y crea un proyecto gratuito. Luego:

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y pega tus credenciales de Supabase
```

### 3️⃣ Iniciar la app
```bash
npm run dev
```

🎉 **¡Listo!** Abre http://localhost:5173

---

## 📚 Guías Disponibles

Dependiendo de lo que necesites, lee la guía correspondiente:

### 🔰 Para Empezar
- **[SETUP-COMPLETO.md](./SETUP-COMPLETO.md)** ⭐ - Guía completa paso a paso (recomendada)
- **[README.md](./README.md)** - Documentación técnica completa

### 🌐 Para Subir a Git
- **[PREPARAR-PARA-GIT.md](./PREPARAR-PARA-GIT.md)** - Cómo preparar el proyecto para Git
- **[COMANDOS-GIT.md](./COMANDOS-GIT.md)** - Referencia rápida de comandos Git

### 🚀 Para Deploy
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía detallada de deploy en Vercel
- **[PWA-USER-GUIDE.md](./PWA-USER-GUIDE.md)** - Guía de la PWA para usuarios

---

## 📋 Checklist Rápido

Marca cada paso conforme lo completes:

### Configuración Inicial
- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Proyecto descargado/clonado
- [ ] `npm install` ejecutado
- [ ] Cuenta de Supabase creada
- [ ] Archivo `.env` configurado
- [ ] `npm run dev` funciona

### Git & GitHub
- [ ] Git configurado (name, email)
- [ ] Repositorio inicializado (`git init`)
- [ ] Primer commit hecho
- [ ] Repositorio en GitHub creado
- [ ] Código subido a GitHub

### Deployment
- [ ] Cuenta de Vercel creada
- [ ] Proyecto conectado a GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso
- [ ] URLs actualizadas en index.html

### Verificación
- [ ] App funciona en local
- [ ] App funciona en producción
- [ ] Deep links funcionan
- [ ] PWA se puede instalar
- [ ] Puedes crear cuenta y publicar

---

## 🎯 Archivos Importantes

### 📄 Archivos que DEBES revisar:
- `.env` - Tus credenciales (NO subir a Git)
- `index.html` - Actualizar URLs cuando deploys
- `README.md` - Documentación del proyecto

### 📁 Carpetas importantes:
- `/components` - Todos los componentes React
- `/supabase/functions` - El backend (Edge Functions)
- `/public` - Archivos estáticos (íconos, manifest, etc.)
- `/styles` - Estilos globales de Tailwind

### ⚙️ Archivos de configuración:
- `package.json` - Dependencias y scripts
- `vite.config.ts` - Configuración de Vite
- `tsconfig.json` - Configuración de TypeScript
- `.gitignore` - Archivos a ignorar en Git

---

## 🔑 Credenciales que Necesitas

### Supabase (Obligatorio)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VITE_SUPABASE_DB_URL=postgresql://...
```

👉 **Dónde obtenerlas:** [SETUP-COMPLETO.md - Paso 2](./SETUP-COMPLETO.md#2-configurar-supabase)

---

## 🆘 Problemas Comunes

### "npm: command not found"
➡️ Instala Node.js desde https://nodejs.org

### "Error connecting to Supabase"
➡️ Verifica que tu `.env` tenga las credenciales correctas

### "Module not found"
➡️ Ejecuta `npm install` de nuevo

### "Port 5173 already in use"
➡️ Cierra otros proyectos o usa: `npm run dev -- --port 3000`

### No puedo crear cuenta
➡️ Verifica que las Edge Functions estén deployadas en Supabase

---

## 💡 Tips Pro

1. **VS Code**: Abre el proyecto con `code .` para una mejor experiencia
2. **Extensions**: VS Code te sugerirá extensiones útiles automáticamente
3. **Admin**: Registra tu cuenta con teléfono `50404987` para ser admin
4. **Backup**: Sube a GitHub frecuentemente como respaldo
5. **Dev Tools**: Usa F12 en el navegador para debug

---

## 🎓 Recursos de Aprendizaje

- [React Docs](https://react.dev/) - Documentación oficial de React
- [Tailwind CSS](https://tailwindcss.com/docs) - Documentación de Tailwind
- [Supabase Docs](https://supabase.com/docs) - Documentación de Supabase
- [Git Tutorial](https://git-scm.com/book/es/v2) - Libro de Git en español

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa la documentación** - Probablemente esté en una de las guías
2. **Busca en los Issues** - Alguien más pudo tener el mismo problema
3. **Crea un Issue** - Si no encuentras solución, crea uno nuevo
4. **Stack Overflow** - Para problemas de código específicos

---

## 🎉 ¡Éxito!

Recuerda:
- 📖 Lee **[SETUP-COMPLETO.md](./SETUP-COMPLETO.md)** si es tu primera vez
- 🐛 Los errores son normales, ¡sigue intentando!
- 💪 Cada desarrollador empezó donde tú estás ahora
- 🚀 El proyecto ya está 95% completo, solo necesitas configurarlo

**¡Mucha suerte con tu proyecto! 🎊**

---

## ⏭️ Siguiente Paso

👉 **Abre [SETUP-COMPLETO.md](./SETUP-COMPLETO.md)** y sigue la guía paso a paso.
