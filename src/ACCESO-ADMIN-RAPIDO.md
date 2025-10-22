# ⚡ Acceso Rápido al Panel de Admin

## 🎯 Lo Más Rápido - 3 Pasos

### **Paso 1: Abre la Consola** 
Presiona **F12** en tu navegador

### **Paso 2: Copia y Ejecuta Este Script**

```javascript
(async function() {
  const supabaseKey = Object.keys(localStorage).find(k => k.includes('supabase.auth.token'));
  if (!supabaseKey) { console.error('❌ No hay sesión activa'); return; }
  
  const authData = JSON.parse(localStorage.getItem(supabaseKey));
  const token = authData?.currentSession?.access_token;
  if (!token) { console.error('❌ No se pudo obtener el token'); return; }
  
  console.log('🔄 Haciendo administrador...');
  
  const response = await fetch(
    'https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/auth/update-profile',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'admin' })
    }
  );
  
  if (response.ok) {
    console.log('✅ ¡Ahora eres administrador!');
    alert('✅ ¡Ahora eres administrador!\n\nRecarga la página (F5) para ver el botón "Admin"');
  } else {
    console.error('❌ Error:', await response.text());
  }
})();
```

### **Paso 3: Recarga la Página**
Presiona **F5**

---

## ✅ Verificar que Funcionó

1. **Desktop:** Busca el botón **"Admin"** 🛡️ en el header
2. **Mobile:** Abre el menú (☰) y busca **"Admin"** 🛡️
3. **En tu perfil:** Click en tu avatar → Pestaña "Información" → Verás "🛡️ Administrador"

---

## 🎛️ Usar el Panel

1. Click en botón **"Admin"**
2. Verás el **Panel de Moderación**
3. Puedes:
   - Ver reportes de la comunidad
   - Aprobar o eliminar publicaciones
   - Banear usuarios problemáticos
   - Ver historial de moderación

---

## 🚨 Problemas?

### **No veo el botón "Admin"**
```bash
# Recarga forzada
Ctrl + Shift + R
```

### **Error "Unauthorized"**
- Cierra sesión y vuelve a entrar
- Ejecuta el script de nuevo

### **Script no funciona**
- Asegúrate de estar en la página de Informa
- Asegúrate de haber iniciado sesión
- Verifica que no haya errores en la consola

---

## 📚 Más Información

**Guía completa:** [COMO-SER-ADMIN.md](./COMO-SER-ADMIN.md)  
**Sistema de moderación:** [RESUMEN-SISTEMA-MODERACION.md](./RESUMEN-SISTEMA-MODERACION.md)

---

**¡Listo! Ahora tienes acceso al Panel de Administrador** 🛡️✨

**Última actualización:** 22 de octubre, 2025
