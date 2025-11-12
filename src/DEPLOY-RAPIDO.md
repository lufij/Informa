# ⚡ Deploy Rápido - Informa

**Para deployar en 5 minutos o menos.**

---

## 🚀 MÉTODO 1: Script Automático (MÁS FÁCIL)

```bash
# 1. Dar permisos al script
chmod +x scripts/deploy.sh

# 2. Ejecutar
./scripts/deploy.sh

# 3. Seguir las instrucciones en pantalla
```

**¡Listo! El script hace todo por ti.** ✅

---

## 🚀 MÉTODO 2: Manual (5 Comandos)

### Backend (1 comando)

```bash
supabase functions deploy server
```

✅ **Espera:** "Deployed Function server successfully"

---

### Frontend (1 comando)

**Opción A - Vercel:**
```bash
vercel --prod
```

**Opción B - Netlify:**
```bash
netlify deploy --prod
```

✅ **Espera:** URL de producción

---

### Verificar (1 comando)

```bash
# Reemplaza con tu URL
curl https://tu-app.vercel.app
```

✅ **Espera:** HTML de tu app

---

## 🧪 Probar (30 segundos)

1. Abre la URL en el navegador
2. Haz login
3. Publica algo
4. **¿Funciona? ✅ ¡ÉXITO!**

---

## ❗ Si Algo Falla

### Build Error
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Backend Error
```bash
supabase functions logs server
# Leer el error y corregir
```

### Frontend Error
```bash
# Vercel
vercel logs

# Netlify
netlify logs
```

---

## 📞 Necesitas Ayuda?

1. Revisa `/GUIA-DEPLOYMENT-PRODUCCION.md` (guía completa)
2. Revisa `/DEPLOYMENT-CHECKLIST.md` (checklist detallado)
3. Revisa logs: `supabase functions logs server --tail`

---

## ✅ Checklist Ultra-Rápido

- [ ] `npm run build` ← Sin errores
- [ ] `supabase functions deploy server` ← Exitoso
- [ ] `vercel --prod` ó `netlify deploy --prod` ← Exitoso
- [ ] Abrir URL ← Funciona
- [ ] Login ← Funciona
- [ ] Publicar ← Funciona

**¿Todo ✅? → ¡DEPLOYED! 🎉**

---

## 🎯 Comandos de Emergencia

### Rollback (si algo sale mal)
```bash
vercel rollback  # Volver a versión anterior
```

### Ver logs en tiempo real
```bash
supabase functions logs server --tail
```

### Limpiar y re-deployar
```bash
rm -rf dist
npm run build
vercel --prod
```

---

**¡Éxito con el deploy! 🚀🇬🇹**
