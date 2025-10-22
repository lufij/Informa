# 🧪 Guía de Pruebas de Rendimiento - Informa

## 📋 Checklist de Pruebas

Sigue estos pasos para verificar que las optimizaciones están funcionando correctamente.

---

## 🚀 Paso 1: Ejecutar Diagnóstico Automático

### En Terminal:

```bash
npm run diagnostico
```

O también:

```bash
npm run performance
```

**Esto verificará:**
- ✅ Lazy loading implementado
- ✅ Suspense boundaries
- ✅ ContentSkeleton existe
- ✅ Session check optimizado
- ✅ Llamadas diferidas
- ✅ Renderizado condicional
- ✅ Cache localStorage

**Resultado esperado:** Score de 90% o superior 🎯

---

## 🌐 Paso 2: Pruebas en el Navegador

### A. Abrir Chrome DevTools

1. Presiona **F12** o **Ctrl + Shift + I**
2. Ve a la pestaña **Network**
3. Marca el checkbox **"Disable cache"**
4. Recarga la página: **Ctrl + Shift + R**

### B. Verificar Carga Inicial

**Observa el tab Network:**

✅ **BUENO** - Deberías ver:
- Total de archivos cargados inicialmente: **~15-20 archivos**
- Tamaño total transferido: **~200-300 KB**
- Tiempo de carga (Load): **< 2 segundos**
- Tiempo DOMContentLoaded: **< 1 segundo**

❌ **MALO** - Si ves:
- Más de 40 archivos cargados al inicio
- Más de 800 KB transferidos
- Más de 4 segundos de carga

### C. Verificar Lazy Loading

1. Recarga la página
2. Observa el tab **Network**
3. Cambia a la pestaña **"Noticias"**
4. **Deberías ver nuevos archivos cargándose** (NewsSection.tsx)

✅ **CORRECTO:** Los componentes se cargan solo cuando los usas

### D. Verificar Code Splitting

En la lista de archivos del Network tab, busca archivos como:

```
index-[hash].js          (~150 KB)  ← Bundle principal
NewsSection-[hash].js    (~30 KB)   ← Lazy loaded
AlertsSection-[hash].js  (~25 KB)   ← Lazy loaded
```

✅ **CORRECTO:** Múltiples archivos .js en lugar de uno solo gigante

---

## ⚡ Paso 3: Lighthouse Audit

### Ejecutar Lighthouse:

1. Abre Chrome DevTools (**F12**)
2. Ve a la pestaña **Lighthouse**
3. Selecciona:
   - ✅ Mode: **Navigation**
   - ✅ Device: **Mobile**
   - ✅ Categories: **Performance**
4. Click en **"Analyze page load"**

### Resultados Esperados:

| Métrica | Objetivo | Bueno | Excelente |
|---------|----------|-------|-----------|
| **Performance Score** | > 70 | 70-89 | 90-100 |
| **First Contentful Paint** | < 2.0s | < 1.5s | < 1.0s |
| **Time to Interactive** | < 3.5s | < 2.5s | < 2.0s |
| **Speed Index** | < 3.0s | < 2.0s | < 1.5s |
| **Total Blocking Time** | < 300ms | < 200ms | < 150ms |
| **Largest Contentful Paint** | < 2.5s | < 2.0s | < 1.5s |

### Captura de Pantalla

📸 **Guarda el reporte de Lighthouse** para comparar antes/después

---

## 🐌 Paso 4: Prueba con Red Lenta (Simular 3G)

### Simular Conexión Lenta:

1. DevTools > **Network** tab
2. Click en el dropdown que dice **"No throttling"**
3. Selecciona **"Slow 3G"**
4. Recarga la página (**Ctrl + Shift + R**)

### Verificar:

✅ **BUENO:**
- Logo aparece en < 2 segundos
- Skeleton screens se muestran mientras carga
- La app es usable en < 5 segundos
- No hay pantalla blanca extendida

❌ **MALO:**
- Más de 10 segundos para ver contenido
- Pantalla blanca por más de 5 segundos
- Errores en la consola

---

## 🖥️ Paso 5: Prueba con CPU Lenta

### Simular CPU Lenta:

1. DevTools > **Performance** tab
2. Click en el icono de **configuración** (⚙️)
3. En "CPU", selecciona **"6x slowdown"**
4. Click en **"Record"** (círculo) y recarga la página
5. Espera a que cargue completamente
6. Click en **"Stop"** (cuadrado rojo)

### Analizar el Performance Profile:

Busca en el timeline:
- ✅ **Scripting** (amarillo) no debe dominar (< 30%)
- ✅ **Rendering** (morado) debe ser mínimo
- ✅ Time to Interactive debe estar claramente marcado

---

## 📊 Paso 6: Comparación Antes/Después

### Crea una tabla de comparación:

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo de carga | ___ s | ___ s | ___ % |
| Bundle inicial | ___ KB | ___ KB | ___ % |
| Lighthouse Score | ___ | ___ | ___ pts |
| First Paint | ___ s | ___ s | ___ % |

### Ejemplo de resultado esperado:

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo de carga | 4.2s | 1.1s | **74%** ⚡ |
| Bundle inicial | 850KB | 220KB | **74%** 📦 |
| Lighthouse Score | 65 | 92 | **+27** 🎯 |
| First Paint | 2.8s | 0.7s | **75%** 🎨 |

---

## 🔍 Paso 7: Verificar en Consola del Navegador

### Abre la Console (DevTools > Console):

**No deberías ver:**
- ❌ Errores relacionados con lazy loading
- ❌ Warnings sobre Suspense
- ❌ Errores 404 de chunks

**Es normal ver:**
- ✅ Mensajes de "Lazy loading chunk for [Component]"
- ✅ Logs de navegación

---

## 📱 Paso 8: Prueba en Dispositivo Móvil Real

### Opción A: Usando Chrome Remote Debugging

1. Conecta tu celular con USB
2. Activa "Depuración USB" en opciones de desarrollador
3. Chrome Desktop > `chrome://inspect`
4. Abre la app en el celular
5. Click en "Inspect" en Chrome Desktop

### Opción B: Prueba Manual

1. Deploy a Vercel o servidor de pruebas
2. Abre en el celular
3. Cronometra el tiempo de carga
4. Verifica que sea usable en < 3 segundos

---

## ✅ Checklist Final de Verificación

Marca cada item:

- [ ] Diagnóstico automático pasa con > 90%
- [ ] Bundle inicial < 300 KB
- [ ] Lighthouse Performance > 85
- [ ] First Contentful Paint < 1.2s
- [ ] Time to Interactive < 2.5s
- [ ] Lazy loading funciona (archivos se cargan on-demand)
- [ ] Skeleton screens se muestran durante carga
- [ ] Sin errores en consola
- [ ] Funciona bien con "Slow 3G"
- [ ] Funciona bien con CPU 6x slowdown
- [ ] Probado en dispositivo móvil real

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "Lazy loading error: Failed to load chunk"

**Solución:**
```bash
# Limpiar caché de Vite
npm run clean
npm install
npm run dev
```

### Problema: Lighthouse Score bajo en "Unused JavaScript"

**Solución:**
- ✅ Ya implementado con lazy loading
- Verificar que los componentes usen `React.lazy()`

### Problema: Skeleton no se muestra

**Solución:**
- Verificar que `ContentSkeleton.tsx` existe
- Verificar imports de Suspense fallback

### Problema: Tiempo de carga sigue siendo lento

**Verificar:**
1. ¿Backend de Supabase responde rápido? (< 500ms)
2. ¿Internet del dispositivo es estable?
3. ¿Hay imágenes muy grandes sin optimizar?

---

## 📈 Métricas de Éxito

**Mínimo Aceptable:**
- ✅ Performance Score > 70
- ✅ Carga inicial < 2.5s
- ✅ Bundle < 400 KB

**Óptimo:**
- ⭐ Performance Score > 90
- ⭐ Carga inicial < 1.2s
- ⭐ Bundle < 250 KB

**Excelente:**
- 🚀 Performance Score > 95
- 🚀 Carga inicial < 0.8s
- 🚀 Bundle < 200 KB

---

## 🎯 Próximos Pasos

1. Ejecutar todas las pruebas listadas arriba
2. Documentar resultados en tabla de comparación
3. Si hay problemas, revisar `OPTIMIZACIONES-RENDIMIENTO.md`
4. Deploy a producción cuando Performance > 85
5. Monitorear Web Vitals en producción

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa `OPTIMIZACIONES-RENDIMIENTO.md`
2. Ejecuta `npm run diagnostico`
3. Verifica la consola del navegador
4. Revisa el Network tab para ver qué está tardando

---

**Última actualización:** 22 de octubre, 2025
**Versión:** 2.1.0
