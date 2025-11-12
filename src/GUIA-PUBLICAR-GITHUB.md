# 🚀 Guía para Publicar a GitHub

## ✅ Pre-requisitos

Asegúrate de tener:
- ✅ Git instalado
- ✅ Sesión iniciada en GitHub
- ✅ Node.js y npm instalados

---

## 📝 Pasos para Publicar

### 1️⃣ Abrir Terminal

**Windows:**
- Presiona `Win + R`
- Escribe `cmd` o `powershell`
- Enter

**Mac/Linux:**
- Presiona `Cmd + Espacio`
- Escribe `Terminal`
- Enter

### 2️⃣ Navegar al Proyecto

```bash
# Navega a la carpeta de tu proyecto
cd ruta/donde/esta/tu/proyecto/Informa
```

### 3️⃣ Verificar Estado de Git

```bash
# Ver qué archivos han cambiado
git status
```

Deberías ver los archivos nuevos en rojo.

### 4️⃣ Agregar Todos los Archivos

```bash
# Agregar TODOS los cambios
git add .

# O si prefieres agregar archivos específicos:
git add components/ShareButton.tsx
git add components/DynamicMetaTags.tsx
git add components/ProgressiveOnboarding.tsx
git add hooks/useAppInstalled.tsx
git add *.md
```

### 5️⃣ Hacer Commit

```bash
git commit -m "feat: sistema de compartir en redes sociales y onboarding progresivo

- Agregado ShareButton con WhatsApp, Facebook, Twitter
- Agregado DynamicMetaTags para previews de imágenes
- Agregado ProgressiveOnboarding (3 vistas → instalar → 10 vistas → registrar)
- Agregado hook useAppInstalled para detectar PWA
- Agregada documentación completa (guías, ideas, resúmenes)
- Mejorado PostActions con props de title e imageUrl"
```

### 6️⃣ Push a GitHub

```bash
# Si es la primera vez configurando el repositorio:
git remote add origin https://github.com/lufij/Informa.git

# Push a GitHub (rama main)
git push -u origin main

# O si ya está configurado:
git push
```

Si te pide usuario y contraseña:
- **Usuario**: `lufij`
- **Contraseña**: Tu Personal Access Token de GitHub (NO tu contraseña normal)

---

## 🔐 Crear Personal Access Token (si no tienes)

1. Ve a GitHub.com → Settings
2. Developer Settings → Personal Access Tokens → Tokens (classic)
3. Generate New Token (classic)
4. Nombre: "Informa Deploy"
5. Permisos: Marca `repo` completo
6. Generate Token
7. **COPIA EL TOKEN** (solo lo verás una vez)
8. Úsalo como contraseña al hacer push

---

## ⚠️ Si Ya Existe el Repositorio

Si el repo ya existe y quieres actualizar:

```bash
# 1. Asegurarte de estar en la rama correcta
git branch

# 2. Si no estás en main, cambiar:
git checkout main

# 3. Descargar últimos cambios (por si acaso)
git pull origin main

# 4. Agregar tus cambios
git add .

# 5. Commit
git commit -m "feat: sistema de compartir y onboarding progresivo"

# 6. Push
git push origin main
```

---

## 🧪 Verificar que Todo Funciona

### Antes de Hacer Push - Probar Localmente:

```bash
# 1. Instalar dependencias (si no lo has hecho)
npm install

# 2. Verificar que compila sin errores
npm run build

# 3. Si todo está bien, hacer el push
git push
```

---

## 📦 Comando Todo-en-Uno

Si quieres hacerlo todo de una vez:

```bash
# Copia y pega esto en la terminal:
git add . && \
git commit -m "feat: sistema de compartir en redes sociales y onboarding progresivo" && \
git push origin main
```

---

## 🚨 Solución de Problemas

### Error: "repository not found"
```bash
# Verificar el remote
git remote -v

# Si no está configurado:
git remote add origin https://github.com/lufij/Informa.git

# Si está mal configurado:
git remote set-url origin https://github.com/lufij/Informa.git
```

### Error: "failed to push some refs"
```bash
# Primero hacer pull
git pull origin main --rebase

# Luego push
git push origin main
```

### Error: "Authentication failed"
- Usa un Personal Access Token en lugar de tu contraseña
- O configura SSH keys

### Error: "merge conflict"
```bash
# Ver archivos en conflicto
git status

# Resolver manualmente cada archivo
# Luego:
git add .
git commit -m "resolve conflicts"
git push
```

---

## 📋 Checklist Completo

Marca cada paso al completarlo:

- [ ] Terminal abierta
- [ ] Navegado a la carpeta del proyecto (`cd ...`)
- [ ] Verificado estado (`git status`)
- [ ] Agregados archivos (`git add .`)
- [ ] Creado commit (`git commit -m "..."`)
- [ ] Configurado remote (si es primera vez)
- [ ] Push a GitHub (`git push`)
- [ ] Verificado en GitHub que los archivos aparecen
- [ ] (Opcional) Probado build (`npm run build`)

---

## 🎯 Archivos que se Subirán

### Componentes Nuevos:
- ✅ `/components/ShareButton.tsx`
- ✅ `/components/DynamicMetaTags.tsx`
- ✅ `/components/ProgressiveOnboarding.tsx`

### Hooks Nuevos:
- ✅ `/hooks/useAppInstalled.tsx`

### Documentación Nueva:
- ✅ `/MEJORAS-COMPARTIR-REDES-SOCIALES.md`
- ✅ `/GUIA-IMPLEMENTACION-COMPARTIR.md`
- ✅ `/IDEAS-ESPECIFICAS-GUALAN.md`
- ✅ `/RESUMEN-MEJORAS-COMPARTIR.md`
- ✅ `/GUIA-ONBOARDING-PROGRESIVO.md`
- ✅ `/RESUMEN-ONBOARDING.md`
- ✅ `/RESUMEN-COMPLETO-SESION.md`
- ✅ `/GUIA-PUBLICAR-GITHUB.md` (este archivo)

### Archivos Modificados:
- ✅ `/components/PostActions.tsx` (mejorado)
- ✅ `/App.tsx` (imports agregados)

---

## 🌐 Después del Push

### Verificar en GitHub:
1. Ve a https://github.com/lufij/Informa
2. Deberías ver el commit nuevo
3. Verifica que los archivos estén ahí
4. Lee el README actualizado

### Si Usas Vercel/Netlify:
El despliegue debería ser automático. Espera 2-3 minutos y verifica:
- https://informa.vercel.app (o tu URL)

---

## 💡 Comandos Útiles

```bash
# Ver historial de commits
git log --oneline

# Ver cambios antes de commit
git diff

# Deshacer último commit (sin perder cambios)
git reset --soft HEAD~1

# Ver ramas
git branch

# Crear rama nueva
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Ver archivos ignorados
cat .gitignore
```

---

## 🎉 ¡Listo!

Cuando hayas completado todos los pasos, tus cambios estarán en GitHub y disponibles para:
- ✅ Otros desarrolladores
- ✅ Deploy automático
- ✅ Respaldo en la nube
- ✅ Historial de versiones

---

## 📞 ¿Problemas?

Si algo no funciona:

1. **Copia el error exacto** que aparece en la terminal
2. Busca en Google: "git [tu error]"
3. O pregúntame específicamente qué error te da

---

## 🚀 Siguiente Paso

Después de publicar en GitHub:

1. **Desplegar a Vercel**: `npm run deploy:vercel`
2. **Verificar que funciona**: Abre la URL de producción
3. **Probar en móvil**: Abre en tu celular
4. **Anunciar a la comunidad**: "¡Nuevas funciones disponibles!"

---

**¿Listo? ¡Adelante con el `git push`! 🚀**
