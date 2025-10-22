# 📝 Guía para Subir el Proyecto a GitHub

## ✅ Repositorio Git Inicializado

Tu proyecto ya está listo para ser subido a GitHub. Se ha creado el repositorio local con el primer commit.

## 🚀 Pasos para Subir a GitHub

### 1. Crear un Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Haz clic en el botón **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Completa la información:
   - **Repository name**: `informa-app` (o el nombre que prefieras)
   - **Description**: Red social comunitaria para Gualán, Zacapa
   - **Visibility**: Private o Public (recomendado: Private)
   - ❌ **NO** inicialices con README, .gitignore o licencia (ya los tienes)
5. Haz clic en **"Create repository"**

### 2. Conectar tu Repositorio Local con GitHub

GitHub te mostrará instrucciones. Copia el URL del repositorio y ejecuta:

```powershell
# Reemplaza <TU-USUARIO> y <NOMBRE-REPO> con tus datos
git remote add origin https://github.com/<TU-USUARIO>/<NOMBRE-REPO>.git

# Por ejemplo:
# git remote add origin https://github.com/miusuario/informa-app.git
```

### 3. Subir tu Código a GitHub

```powershell
# Renombrar la rama a main (si es necesario)
git branch -M main

# Subir el código
git push -u origin main
```

### 4. Verificar

Ve a tu repositorio en GitHub y verifica que todos los archivos se hayan subido correctamente.

## 📋 Comandos Git Útiles

### Ver el estado de tus archivos
```powershell
git status
```

### Agregar cambios nuevos
```powershell
# Agregar todos los cambios
git add .

# O agregar archivos específicos
git add src/components/NuevoComponente.tsx
```

### Hacer commit de los cambios
```powershell
git commit -m "Descripción de los cambios"
```

### Subir cambios a GitHub
```powershell
git push
```

### Ver el historial de commits
```powershell
git log --oneline
```

### Crear una nueva rama
```powershell
git checkout -b nueva-funcionalidad
```

### Cambiar de rama
```powershell
git checkout main
```

### Ver ramas
```powershell
git branch
```

## 🔒 Seguridad - Archivos Sensibles

El `.gitignore` ya está configurado para NO subir:
- ❌ `node_modules/` - Dependencias (muy pesadas)
- ❌ `.env` y `.env.local` - Variables de entorno sensibles
- ❌ `dist/` y `build/` - Archivos compilados
- ❌ `.vscode/` - Configuración personal de VS Code

**IMPORTANTE**: Las credenciales de Supabase están en `src/utils/supabase/info.tsx`. Si tu repositorio es público, considera:
1. Mover estas credenciales a variables de entorno
2. O mantener el repositorio privado

## 🌐 Desplegar en Vercel (Opcional)

Una vez que tu código esté en GitHub:

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite
5. Haz clic en **"Deploy"**
6. ¡Listo! Tu app estará en línea en minutos

### Variables de Entorno en Vercel

Si decides usar variables de entorno, agrégalas en:
- Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

```
VITE_SUPABASE_URL=https://yuanvbqjiwpvdkncaqql.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 📚 Recursos Adicionales

- [Documentación de Git](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🎯 Siguiente Paso

**Ejecuta estos comandos ahora:**

```powershell
# 1. Ve a GitHub y crea un nuevo repositorio
# 2. Luego ejecuta (reemplaza con tu URL):

git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

---

**¡Tu proyecto está listo para ser compartido! 🎉**
