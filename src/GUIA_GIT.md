# 📤 Guía Completa: Subir Código a Git desde Visual Studio Code

## 🎯 Objetivo
Subir todos los cambios del sistema de notificaciones push a tu repositorio Git (GitHub/GitLab/Bitbucket).

---

## 📋 MÉTODO 1: Usando Visual Studio Code (Interfaz Gráfica)

### ✅ Paso 1: Abrir Control de Código Fuente

1. **Click en el ícono de Git** en la barra lateral izquierda (o presiona `Ctrl + Shift + G`)
   - Es el ícono que parece ramas 🌿
   - O usa el menú: Ver > Control de código fuente

2. **Verás una lista de archivos modificados:**
   ```
   Cambios
   ├── M  App.tsx
   ├── M  supabase/functions/server/index.tsx
   ├── U  components/PushNotificationManager.tsx
   ├── U  components/NewContentBadge.tsx
   ├── U  components/NewContentBanner.tsx
   ├── U  public/service-worker.js
   └── ... más archivos
   ```

   **Leyenda:**
   - `M` = Modified (Modificado)
   - `U` = Untracked (Nuevo, no rastreado)

---

### ✅ Paso 2: Preparar archivos (Stage)

**Opción A: Agregar TODOS los archivos (recomendado)**

1. Pasa el mouse sobre la palabra **"Cambios"**
2. Aparecerá un **símbolo +** a la derecha
3. **Click en el +**
4. Todos los archivos se mueven a "Cambios preconfirmados"

**Opción B: Agregar archivos uno por uno**

1. Pasa el mouse sobre cada archivo individual
2. Click en el **+** al lado del nombre
3. El archivo se mueve a "Cambios preconfirmados"

---

### ✅ Paso 3: Hacer Commit

1. **En la caja de texto arriba** (donde dice "Mensaje"), escribe:
   ```
   feat: Sistema de notificaciones push con badges y banners
   ```

   **O un mensaje más detallado:**
   ```
   feat: Implementar notificaciones push completas

   - Notificaciones push con sonido aunque app esté cerrada
   - Badges de contenido nuevo en tabs (noticias, alertas, etc)
   - Banner superior "X novedades nuevas - Ver ahora"
   - Service Worker para notificaciones en background
   - Push automático para noticias importantes y alertas críticas
   - Polling cada 30 segundos para chequear nuevo contenido
   ```

2. **Click en el botón ✓ Confirmar** (o presiona `Ctrl + Enter`)

3. Si Git pide configurar tu identidad, aparecerá un mensaje. Click en "Configurar":
   ```
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu@email.com"
   ```

---

### ✅ Paso 4: Subir a GitHub/GitLab (Push)

**Método A: Botón de sincronización**

1. **Busca en la barra inferior** (azul) un ícono de nube ☁️ o flechas ⬍⬍
2. **Click en el botón** (puede decir "Sincronizar cambios" o "Publicar rama")
3. Si pide autenticación, ingresa tus credenciales de GitHub/GitLab

**Método B: Menú de opciones**

1. Click en los **tres puntos ...** arriba (Control de código fuente)
2. Selecciona **"Push"** o **"Enviar cambios"**
3. Espera a que se complete

---

### ✅ Paso 5: Verificar

1. **En VS Code:**
   - La barra inferior debe mostrar: `0 ↓ 0 ↑` (sin cambios pendientes)
   - Los archivos desaparecen de "Cambios"

2. **En tu repositorio web:**
   - Abre GitHub/GitLab en el navegador
   - Ve a tu repositorio
   - Verifica que aparezcan los archivos nuevos
   - Revisa que el último commit tenga tu mensaje
   - Debe mostrar "hace X minutos"

---

## 🖥️ MÉTODO 2: Usando la Terminal (Comandos)

### ✅ Paso 1: Abrir Terminal

1. En VS Code: `Ctrl + Ñ` o `Ctrl + `` (acento grave)
2. O menú: Terminal > Nuevo Terminal

---

### ✅ Paso 2: Verificar estado

```bash
git status
```

**Deberías ver algo como:**
```
Cambios no rastreados:
  modified:   App.tsx
  modified:   supabase/functions/server/index.tsx
  untracked:  components/PushNotificationManager.tsx
  untracked:  components/NewContentBadge.tsx
  untracked:  components/NewContentBanner.tsx
  untracked:  public/service-worker.js
```

---

### ✅ Paso 3: Agregar todos los archivos

```bash
git add .
```

**O agregar archivos específicos:**
```bash
git add App.tsx
git add components/PushNotificationManager.tsx
git add components/NewContentBadge.tsx
git add components/NewContentBanner.tsx
git add public/service-worker.js
git add supabase/functions/server/index.tsx
```

---

### ✅ Paso 4: Hacer Commit

```bash
git commit -m "feat: Sistema de notificaciones push con badges y banners"
```

**O commit con descripción larga:**
```bash
git commit -m "feat: Implementar notificaciones push completas

- Notificaciones push con sonido aunque app esté cerrada
- Badges de contenido nuevo en tabs
- Banner superior para nuevo contenido
- Service Worker para background
- Push automático para alertas críticas
- Polling cada 30 segundos"
```

---

### ✅ Paso 5: Subir a repositorio remoto (Push)

**Si es la primera vez:**
```bash
git push -u origin main
```

**O si tu rama se llama 'master':**
```bash
git push -u origin master
```

**Si ya has hecho push antes:**
```bash
git push
```

---

### ✅ Paso 6: Verificar

```bash
git status
```

**Debería decir:**
```
En la rama main
Tu rama está actualizada con 'origin/main'.

nada para hacer commit, el árbol de trabajo está limpio
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS COMUNES

### ❌ Error: "fatal: not a git repository"

**Problema:** El proyecto no está inicializado con Git.

**Solución:**
```bash
# 1. Inicializar Git
git init

# 2. Conectar con tu repositorio remoto
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# 3. Crear rama main
git branch -M main

# 4. Agregar archivos
git add .

# 5. Primer commit
git commit -m "Initial commit: Sistema de notificaciones push"

# 6. Subir
git push -u origin main
```

---

### ❌ Error: "Updates were rejected"

**Problema:** Alguien más subió cambios antes que tú.

**Solución:**
```bash
# 1. Guardar tus cambios temporalmente
git stash

# 2. Traer cambios del servidor
git pull origin main

# 3. Recuperar tus cambios
git stash pop

# 4. Si hay conflictos, resuélvelos (ver siguiente sección)

# 5. Agregar y subir
git add .
git commit -m "feat: Sistema de notificaciones push"
git push
```

---

### ❌ Error: "CONFLICT (content): Merge conflict"

**Problema:** Hay conflictos entre tu código y el del servidor.

**Solución en VS Code:**

1. **Git mostrará los archivos en conflicto** marcados con ⚠️
2. **Abre cada archivo** - verás marcadores como:
   ```javascript
   <<<<<<< HEAD
   // Tu código
   =======
   // Código del servidor
   >>>>>>> origin/main
   ```

3. **Decide qué mantener:**
   - Click en "Accept Current Change" (tu código)
   - Click en "Accept Incoming Change" (código del servidor)
   - Click en "Accept Both Changes" (ambos)
   - O edita manualmente

4. **Elimina los marcadores** `<<<<<<<`, `=======`, `>>>>>>>`

5. **Guarda el archivo**

6. **Marca como resuelto:**
   ```bash
   git add ARCHIVO_RESUELTO.tsx
   ```

7. **Continúa con el commit:**
   ```bash
   git commit -m "Resolver conflictos de merge"
   git push
   ```

---

### ❌ Error: "Permission denied (publickey)"

**Problema:** Git no puede autenticarte con GitHub/GitLab.

**Solución A: Usar HTTPS en lugar de SSH**

```bash
# 1. Ver URL actual
git remote -v

# 2. Si es SSH (git@github.com:...), cambiar a HTTPS
git remote set-url origin https://github.com/TU_USUARIO/TU_REPO.git

# 3. Intentar push de nuevo
git push
```

**Solución B: Configurar SSH (avanzado)**

1. Generar clave SSH:
   ```bash
   ssh-keygen -t ed25519 -C "tu@email.com"
   ```

2. Copiar clave pública:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. Agregar en GitHub/GitLab:
   - GitHub: Settings > SSH and GPG keys > New SSH key
   - GitLab: Preferences > SSH Keys

---

### ❌ Error: "Please tell me who you are"

**Problema:** Git no sabe tu nombre/email.

**Solución:**
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Verificar
git config --list
```

---

### ❌ Error: "refusing to merge unrelated histories"

**Problema:** El repositorio remoto tiene un historial diferente.

**Solución:**
```bash
git pull origin main --allow-unrelated-histories
git push
```

---

## 🔍 COMANDOS ÚTILES

### Ver estado actual:
```bash
git status
```

### Ver historial de commits:
```bash
git log --oneline
```

### Ver cambios antes de commit:
```bash
git diff
```

### Ver ramas disponibles:
```bash
git branch -a
```

### Cambiar de rama:
```bash
git checkout nombre-rama
```

### Crear nueva rama:
```bash
git checkout -b feature/nueva-funcionalidad
```

### Ver archivos ignorados:
```bash
cat .gitignore
```

### Deshacer último commit (mantener cambios):
```bash
git reset --soft HEAD~1
```

### Deshacer cambios en archivo (peligroso):
```bash
git checkout -- nombre-archivo.tsx
```

---

## 📝 CREAR/VERIFICAR .gitignore

**Asegúrate de tener este archivo en la raíz del proyecto:**

```bash
# .gitignore

# Dependencias
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Producción
build/
dist/
.next/
out/

# Variables de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Supabase local
supabase/.branches
supabase/.temp

# Archivos temporales
.tmp/
*.tmp
```

**Verificar qué está siendo ignorado:**
```bash
git status --ignored
```

---

## ✅ CHECKLIST FINAL

Antes de dar por terminado:

- [ ] `git status` muestra "árbol de trabajo limpio"
- [ ] Los archivos aparecen en GitHub/GitLab
- [ ] El último commit tiene tu mensaje
- [ ] La fecha del commit es reciente
- [ ] No hay errores en la consola
- [ ] Los archivos importantes NO están en .gitignore

---

## 🎯 FLUJO COMPLETO (COPIAR Y PEGAR)

```bash
# 1. Ver estado
git status

# 2. Agregar todos los cambios
git add .

# 3. Ver qué se va a subir
git status

# 4. Hacer commit
git commit -m "feat: Sistema de notificaciones push con badges y banners

- Notificaciones push con sonido aunque app esté cerrada
- Badges de contenido nuevo en tabs
- Banner superior de novedades
- Service Worker para background
- Push automático para alertas críticas
- Polling cada 30 segundos"

# 5. Subir a repositorio
git push

# 6. Verificar
git status
```

---

## 📊 VERIFICACIÓN EN GITHUB/GITLAB

### GitHub:
1. Ve a `https://github.com/TU_USUARIO/TU_REPO`
2. Deberías ver:
   - ✅ "feat: Sistema de notificaciones push..." en el último commit
   - ✅ Archivos nuevos: `PushNotificationManager.tsx`, `NewContentBadge.tsx`, etc.
   - ✅ "committed X minutes ago"

### GitLab:
1. Ve a `https://gitlab.com/TU_USUARIO/TU_REPO`
2. Deberías ver:
   - ✅ Tu commit en el historial
   - ✅ Archivos nuevos en el árbol
   - ✅ Fecha y hora actuales

---

## 🚀 WORKFLOW RECOMENDADO (Para futuro)

```bash
# Al empezar el día
git pull

# Mientras trabajas
# ... haces cambios ...

# Cada vez que termines una funcionalidad
git add .
git commit -m "descripción clara del cambio"

# Al terminar el día (o cuando quieras)
git push

# Si trabajas en equipo
git pull  # Antes de empezar
git push  # Después de terminar
```

---

## 💡 TIPS PRO

### Commits frecuentes:
- ✅ Haz commit cada vez que termines algo funcional
- ✅ NO hagas commit de código roto
- ✅ Mensajes descriptivos (no "fix" o "update")

### Mensajes de commit:
```bash
# Bueno ✅
git commit -m "feat: Agregar sistema de notificaciones push"
git commit -m "fix: Corregir error en badges de tabs"
git commit -m "docs: Actualizar README con instrucciones"

# Malo ❌
git commit -m "cambios"
git commit -m "fix"
git commit -m "asdf"
```

### Prefijos recomendados:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Documentación
- `style:` - Formato, no cambia funcionalidad
- `refactor:` - Refactorización de código
- `test:` - Agregar tests
- `chore:` - Mantenimiento

---

## 🎉 ¡LISTO!

Ahora tu código está en Git/GitHub/GitLab y puedes:
- ✅ Compartirlo con otros desarrolladores
- ✅ Trabajar desde múltiples computadoras
- ✅ Ver el historial de cambios
- ✅ Hacer deploy automático
- ✅ Colaborar con tu equipo

---

**Desarrollado para:** Informa - Comunidad de Gualán, Zacapa, Guatemala  
**Fecha:** Noviembre 2024  
**Sistema:** Notificaciones Push v2.0
