# 🚀 Comandos Git - Referencia Rápida

## 📋 Comandos Básicos del Día a Día

### Verificar estado
```bash
# Ver qué archivos han cambiado
git status

# Ver diferencias de lo que cambió
git diff
```

### Hacer commits
```bash
# Agregar todos los archivos modificados
git add .

# O agregar archivo específico
git add ruta/al/archivo.tsx

# Crear commit
git commit -m "Descripción de los cambios"

# Atajo: add + commit en uno
git commit -am "Descripción de los cambios"
```

### Subir cambios a GitHub
```bash
# Primera vez (establece tracking)
git push -u origin main

# Siguientes veces
git push
```

### Descargar cambios de GitHub
```bash
# Si trabajas en equipo o desde múltiples computadoras
git pull
```

## 🔄 Workflow Típico

```bash
# 1. Verificar en qué rama estás
git branch

# 2. Ver qué cambió
git status

# 3. Agregar cambios
git add .

# 4. Crear commit
git commit -m "feat: agregar sistema de notificaciones push"

# 5. Subir a GitHub
git push
```

## 🌿 Trabajar con Ramas

### Crear nueva rama para una funcionalidad
```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# O en dos pasos:
git branch feature/nueva-funcionalidad
git checkout feature/nueva-funcionalidad
```

### Ver ramas
```bash
# Ver todas las ramas locales
git branch

# Ver todas las ramas (local + remoto)
git branch -a
```

### Cambiar de rama
```bash
git checkout main
git checkout feature/nueva-funcionalidad
```

### Fusionar rama
```bash
# 1. Cambia a main
git checkout main

# 2. Fusiona la rama
git merge feature/nueva-funcionalidad

# 3. Sube los cambios
git push
```

### Eliminar rama
```bash
# Local
git branch -d feature/nueva-funcionalidad

# Remota
git push origin --delete feature/nueva-funcionalidad
```

## 📝 Mensajes de Commit (Convencionales)

Usa este formato para commits más organizados:

```bash
# Nueva funcionalidad
git commit -m "feat: agregar panel de estadísticas"

# Corrección de bug
git commit -m "fix: corregir error en login de usuarios"

# Cambios en documentación
git commit -m "docs: actualizar README con instrucciones de deploy"

# Cambios de estilo/formato
git commit -m "style: mejorar espaciado en header"

# Refactorización
git commit -m "refactor: optimizar carga de imágenes"

# Tests
git commit -m "test: agregar tests para componente NewsSection"

# Configuración
git commit -m "chore: actualizar dependencias"
```

Tipos disponibles:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma, etc (no afecta código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

## ⏮️ Deshacer Cambios

### Descartar cambios locales (antes de commit)
```bash
# Descartar TODOS los cambios
git checkout .

# Descartar archivo específico
git checkout -- ruta/al/archivo.tsx

# O con git restore (más nuevo)
git restore .
git restore ruta/al/archivo.tsx
```

### Quitar archivo del staging (después de git add)
```bash
git reset HEAD archivo.tsx

# O con git restore (más nuevo)
git restore --staged archivo.tsx
```

### Deshacer último commit (mantiene cambios)
```bash
git reset --soft HEAD~1
```

### Deshacer último commit (elimina cambios)
```bash
# ⚠️ CUIDADO: Esto elimina los cambios permanentemente
git reset --hard HEAD~1
```

### Revertir un commit (crea nuevo commit)
```bash
git revert [hash-del-commit]
```

## 🔍 Ver Historial

```bash
# Ver historial simple
git log

# Ver historial compacto
git log --oneline

# Ver últimos 5 commits
git log -5

# Ver historial con gráfico
git log --graph --oneline --all

# Ver qué cambió en cada commit
git log -p
```

## 🏷️ Tags (Versiones)

```bash
# Crear tag
git tag v1.0.0

# Crear tag con mensaje
git tag -a v1.0.0 -m "Primera versión estable"

# Ver tags
git tag

# Subir tag a GitHub
git push origin v1.0.0

# Subir todos los tags
git push --tags

# Eliminar tag local
git tag -d v1.0.0

# Eliminar tag remoto
git push origin --delete v1.0.0
```

## 🔄 Actualizar desde GitHub

```bash
# Si alguien más hizo cambios en GitHub
git pull

# Si hay conflictos, Git te lo dirá
# Abre los archivos con conflicto, resuelve, y luego:
git add .
git commit -m "merge: resolver conflictos"
git push
```

## 🚨 Emergencias

### "Cometí un error y subí algo que no debía"

```bash
# 1. Revierte el commit problemático
git revert HEAD

# 2. Sube el cambio
git push
```

### "Subí credenciales al repositorio por error"

```bash
# 1. Cambia INMEDIATAMENTE las credenciales en Supabase
#    (Settings → API → Reset anon key)

# 2. Elimina el archivo del historial completo
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Fuerza el push
git push origin --force --all

# 4. Avisa a tu equipo si trabajan en colaboración
```

### "Quiero empezar de cero con Git"

```bash
# ⚠️ CUIDADO: Esto elimina TODO el historial de Git
rm -rf .git
git init
git add .
git commit -m "Initial commit - fresh start"
git remote add origin https://github.com/TU-USUARIO/informa-gualan.git
git push -u --force origin main
```

## 📦 Clonar Repositorio

```bash
# Clonar tu repositorio en otra computadora
git clone https://github.com/TU-USUARIO/informa-gualan.git

# Entrar al directorio
cd informa-gualan

# Instalar dependencias
npm install

# Crear .env con tus credenciales
cp .env.example .env
# (edita .env)

# Correr proyecto
npm run dev
```

## 🤝 Colaboración

### Configurar Git (primera vez)
```bash
# Tu nombre
git config --global user.name "Tu Nombre"

# Tu email (el de GitHub)
git config --global user.email "tu@email.com"

# Ver configuración
git config --list
```

### Fork + Pull Request
```bash
# 1. Haz fork del repo en GitHub

# 2. Clona TU fork
git clone https://github.com/TU-USUARIO/informa-gualan.git

# 3. Agrega el repo original como "upstream"
git remote add upstream https://github.com/ORIGINAL-USUARIO/informa-gualan.git

# 4. Crea una rama para tu cambio
git checkout -b feature/mi-mejora

# 5. Haz cambios, commit y push
git add .
git commit -m "feat: mi mejora"
git push origin feature/mi-mejora

# 6. Ve a GitHub y crea Pull Request desde tu fork
```

## 🔗 Recursos

- [Git Cheat Sheet PDF](https://education.github.com/git-cheat-sheet-education.pdf)
- [Git Book (español)](https://git-scm.com/book/es/v2)
- [GitHub Docs](https://docs.github.com/es)
- [Visualizar Git](https://git-school.github.io/visualizing-git/)

## 💡 Tips

1. **Commits frecuentes**: Haz commits pequeños y frecuentes
2. **Mensajes descriptivos**: Escribe buenos mensajes de commit
3. **Pull antes de Push**: Siempre `git pull` antes de `git push`
4. **Branches para features**: Usa ramas para nuevas funcionalidades
5. **No subas credenciales**: Verifica el .gitignore
6. **Backup**: GitHub es tu backup, súbelo frecuentemente

---

**Volver a:** [PREPARAR-PARA-GIT.md](./PREPARAR-PARA-GIT.md)
