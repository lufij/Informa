# INSTRUCCIONES SIMPLES PARA REMOVER MOTION

En tu terminal de VSCode, ejecuta estos comandos:

```powershell
# 1. Eliminar el paquete motion del package.json
npm uninstall motion

# 2. Eliminar el paquete next-themes del package.json (no se usa)
npm uninstall next-themes

# 3. Limpiar cache
npm cache clean --force

# 4. Reinstalar
npm install

# 5. Build
npm run build
```

Los archivos con importaciones de `motion/react` se ejecutarán en modo desarrollo pero no en build. El build ignorará las importaciones que no puede resolver.

**ALTERNATIVA MÁS RÁPIDA:**

Edita manualmente `package.json` y ELIMINA estas dos líneas:

```json
"motion": "^10.16.4",
"next-themes": "^0.4.6",
```

Luego ejecuta:
```powershell
npm install
npm run build
```
