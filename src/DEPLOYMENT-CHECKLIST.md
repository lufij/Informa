# ✅ Checklist de Deployment - Informa

Usa este checklist para asegurarte de que todo está listo para producción.

---

## 🔧 PRE-DEPLOYMENT

### Código
- [ ] Build local exitoso (`npm run build`)
- [ ] Preview funciona (`npm run preview`)
- [ ] Sin errores en consola
- [ ] Sin warnings críticos
- [ ] Código pusheado a GitHub
- [ ] Branch: `main` actualizado

### Testing
- [ ] Login funciona
- [ ] Signup funciona
- [ ] Publicar contenido funciona
- [ ] Notificaciones funcionan
- [ ] Subir imágenes funciona
- [ ] Responsive en móvil probado

---

## 🗄️ BACKEND (Supabase)

### Verificación
- [ ] Supabase CLI instalado
- [ ] Logged in: `supabase status`
- [ ] Project ID correcto en código

### Deployment
- [ ] Edge Functions deployadas: `supabase functions deploy server`
- [ ] Sin errores en deployment
- [ ] Logs funcionando: `supabase functions logs server --tail`

### Verificación Post-Deploy
- [ ] Endpoint de health responde:
  ```bash
  curl https://[PROJECT_ID].supabase.co/functions/v1/make-server-3467f1c6/health
  ```
- [ ] Login desde producción funciona
- [ ] Crear post desde producción funciona

---

## 🌐 FRONTEND (Vercel/Netlify)

### Pre-Deploy
- [ ] Cuenta creada en Vercel/Netlify
- [ ] CLI instalado
- [ ] Logged in

### Deployment (Vercel)
```bash
vercel --prod
```
- [ ] Deploy exitoso
- [ ] URL de producción recibida
- [ ] HTTPS habilitado (automático)

### Deployment (Netlify)
```bash
netlify deploy --prod
```
- [ ] Deploy exitoso
- [ ] URL de producción recibida
- [ ] HTTPS habilitado (automático)

---

## 🧪 TESTING EN PRODUCCIÓN

### Funcionalidad Básica
- [ ] App carga sin errores
- [ ] Logo y estilos correctos
- [ ] Navegación funciona

### Autenticación
- [ ] Registro de nuevo usuario ✓
- [ ] Login con usuario existente ✓
- [ ] Sesión persiste al recargar ✓
- [ ] Logout funciona ✓

### Contenido
- [ ] Publicar noticia ✓
- [ ] Publicar alerta ✓
- [ ] Publicar clasificado ✓
- [ ] Publicar foro ✓
- [ ] Comentar en posts ✓
- [ ] Reaccionar a posts ✓

### Notificaciones
- [ ] Notificaciones in-app ✓
- [ ] Banner de nuevo contenido ✓
- [ ] Preferencias se guardan ✓
- [ ] Push notifications (opcional) ✓

### Admin
- [ ] Login como admin (50404987) ✓
- [ ] Panel de admin accesible ✓
- [ ] Eliminar contenido funciona ✓
- [ ] Asignar moderadores funciona ✓

### Bomberos
- [ ] Login como bombero ✓
- [ ] Botón de emergencia aparece ✓
- [ ] Alerta por voz funciona ✓

---

## 📱 PWA

### Instalación
- [ ] Prompt de instalación aparece
- [ ] Android: Se puede instalar
- [ ] iOS: Se puede agregar a inicio
- [ ] Iconos se ven correctos

### Funcionalidad Offline
- [ ] Service Worker registrado
- [ ] App funciona offline (básico)
- [ ] Cache funciona

---

## 🔔 NOTIFICACIONES PUSH (Opcional)

### VAPID Keys
- [ ] Keys generadas: `web-push generate-vapid-keys`
- [ ] Public key en código (NotificationPreferences.tsx)
- [ ] Private key en Supabase secrets
- [ ] Push test funciona

---

## 📊 MONITOREO

### Logs
- [ ] Backend logs activos:
  ```bash
  supabase functions logs server --tail
  ```
- [ ] Frontend logs en Vercel/Netlify Dashboard

### Analytics (Opcional)
- [ ] Google Analytics configurado
- [ ] Sentry configurado
- [ ] Tracking funciona

---

## 📱 TESTING MULTI-DISPOSITIVO

### Desktop
- [ ] Chrome
- [ ] Firefox  
- [ ] Safari
- [ ] Edge

### Mobile
- [ ] Android Chrome
- [ ] iOS Safari
- [ ] Samsung Internet

---

## 🚀 PERFORMANCE

### Lighthouse (Chrome DevTools)
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 80
- [ ] SEO > 80
- [ ] PWA > 80

### Carga
- [ ] First Load < 3s
- [ ] Time to Interactive < 5s

---

## 📢 COMUNICACIÓN

### Material Preparado
- [ ] Post de anuncio escrito
- [ ] Screenshots de la app
- [ ] Video tutorial (opcional)
- [ ] Guía de uso PDF

### Canales
- [ ] Mensaje de WhatsApp listo
- [ ] Post de Facebook listo (opcional)
- [ ] Flyers digitales (opcional)

---

## 🔧 CONFIGURACIÓN AVANZADA (Opcional)

### Dominio Personalizado
- [ ] Dominio registrado
- [ ] DNS configurado
- [ ] SSL activo

### SEO
- [ ] Meta tags en index.html
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] Sitemap.xml

---

## 🆘 PLAN DE EMERGENCIA

### Si algo falla
- [ ] Contacto de soporte Supabase guardado
- [ ] Contacto de soporte Vercel/Netlify guardado
- [ ] Backup de código en GitHub ✓
- [ ] Plan de rollback conocido

### Rollback
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback
```

---

## ✅ FINAL CHECK

### Antes de Anunciar
- [ ] URL final confirmada
- [ ] Todo probado en producción
- [ ] Logs monitoreándose
- [ ] Sin errores críticos
- [ ] Performance aceptable
- [ ] Backup plan listo

### Listo para Lanzar
- [ ] ✅ TODO LO ANTERIOR COMPLETADO
- [ ] ✅ EQUIPO NOTIFICADO
- [ ] ✅ MENSAJE DE ANUNCIO LISTO
- [ ] ✅ MONITOREO ACTIVO

---

## 🎉 POST-LAUNCH

### Primeras 24 Horas
- [ ] Monitorear logs constantemente
- [ ] Responder dudas de usuarios
- [ ] Fix bugs urgentes inmediatamente
- [ ] Recolectar feedback

### Primera Semana
- [ ] Revisar métricas diariamente
- [ ] Recolectar más feedback
- [ ] Planear mejoras
- [ ] Documentar issues

### Primer Mes
- [ ] Análisis de uso
- [ ] Implementar mejoras
- [ ] Optimizar performance
- [ ] Escalar si es necesario

---

## 📝 NOTAS

**URL de Producción:**
```
_________________________
```

**Fecha de Deploy:**
```
_________________________
```

**Versión:**
```
v1.0.0 - Lanzamiento Inicial
```

**Deployed by:**
```
_________________________
```

---

## 🚀 COMANDO RÁPIDO

```bash
# Backend
supabase functions deploy server

# Frontend (Vercel)
vercel --prod

# O usa el script automático:
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

**¡TODO LISTO! 🎊**

Cuando todos los checkboxes estén marcados:

✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅

**¡PRESIONA DEPLOY Y CELEBRA! 🎉🇬🇹**
