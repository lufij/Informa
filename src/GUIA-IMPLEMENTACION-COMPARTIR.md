# 🔧 Guía de Implementación: Sistema de Compartir

## 📋 Resumen de Cambios

### Archivos Nuevos Creados:
1. `/components/ShareButton.tsx` - Componente de compartir en redes sociales
2. `/components/DynamicMetaTags.tsx` - Gestión de meta tags para previews
3. `/MEJORAS-COMPARTIR-REDES-SOCIALES.md` - Documentación completa

### Archivos Modificados:
1. `/components/PostActions.tsx` - Agregados props `title` e `imageUrl` para mejorar compartir

## 🎯 Cómo Integrar en tus Secciones

### Opción 1: Usar el ShareButton independiente (RECOMENDADO)

Este es el método más flexible y con más opciones. Agrega el `ShareButton` en cualquier lugar de tu componente:

```tsx
import { ShareButton } from './ShareButton'

// En NewsSection.tsx, dentro del mapeo de noticias:
{news.map((item) => (
  <Card key={item.id}>
    <CardHeader>
      <CardTitle>{item.title}</CardTitle>
      <CardDescription>{item.content}</CardDescription>
    </CardHeader>
    
    <CardContent>
      {/* Aquí va el contenido del post */}
      
      {/* AGREGAR AQUÍ el ShareButton */}
      <div className="flex justify-end mt-4">
        <ShareButton
          postId={item.id}
          postType="news"
          title={item.title}
          description={item.content.substring(0, 150)}
          imageUrl={item.mediaFiles?.[0]?.url}
          variant="outline"
          size="default"
          showLabel={true}
        />
      </div>
    </CardContent>
  </Card>
))}
```

### Opción 2: Mejorar PostActions existente

Si prefieres mantener el sistema actual de `PostActions`, solo necesitas pasar los nuevos props:

```tsx
import { PostActions } from './PostActions'

// En NewsSection.tsx:
<PostActions
  postType="news"
  postId={item.id}
  token={token}
  isAuthor={item.authorId === userProfile?.id}
  isAdmin={userProfile?.isAdmin || userProfile?.phoneNumber === '50404987'}
  onEdit={() => handleEdit(item)}
  onDelete={() => handleDelete(item.id)}
  // ⬇️ AGREGAR ESTOS PROPS:
  title={item.title}
  imageUrl={item.mediaFiles?.[0]?.url}
/>
```

## 📱 Integración por Sección

### 1. NewsSection.tsx

```tsx
// Al inicio del archivo, agregar import:
import { ShareButton } from './ShareButton'
import { DynamicMetaTags } from './DynamicMetaTags'

// Dentro del componente NewsSection:
export function NewsSection({ token, userProfile, ... }) {
  // ... código existente ...
  
  // Si hay un post destacado/seleccionado, actualizar meta tags:
  const selectedNews = news.find(n => n.id === highlightedItemId)
  
  return (
    <div>
      {/* Actualizar meta tags si hay un post seleccionado */}
      {selectedNews && (
        <DynamicMetaTags
          title={selectedNews.title}
          description={selectedNews.content}
          imageUrl={selectedNews.mediaFiles?.[0]?.url}
          type="news"
        />
      )}
      
      {/* Resto del código... */}
      
      {news.map((item) => (
        <Card key={item.id} id={`news-${item.id}`}>
          {/* ... contenido del card ... */}
          
          {/* OPCIÓN A: Usar ShareButton independiente */}
          <div className="flex justify-between items-center mt-4">
            <PostActions
              postType="news"
              postId={item.id}
              token={token}
              isAuthor={item.authorId === userProfile?.id}
              isAdmin={userProfile?.isAdmin || userProfile?.phoneNumber === '50404987'}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
            
            <ShareButton
              postId={item.id}
              postType="news"
              title={item.title}
              description={item.content}
              imageUrl={item.mediaFiles?.[0]?.url}
              variant="ghost"
              size="sm"
            />
          </div>
          
          {/* OPCIÓN B: Solo usar PostActions mejorado */}
          <PostActions
            postType="news"
            postId={item.id}
            token={token}
            isAuthor={item.authorId === userProfile?.id}
            isAdmin={userProfile?.isAdmin || userProfile?.phoneNumber === '50404987'}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.id)}
            title={item.title}
            imageUrl={item.mediaFiles?.[0]?.url}
          />
        </Card>
      ))}
    </div>
  )
}
```

### 2. AlertsSection.tsx

```tsx
import { ShareButton } from './ShareButton'

// En el mapeo de alertas:
{alerts.map((alert) => (
  <Card key={alert.id}>
    {/* ... contenido ... */}
    
    <ShareButton
      postId={alert.id}
      postType="alert"
      title={alert.title}
      description={alert.content}
      imageUrl={alert.mediaFiles?.[0]?.url}
      variant="ghost"
      size="sm"
    />
  </Card>
))}
```

### 3. ClassifiedsSection.tsx

```tsx
import { ShareButton } from './ShareButton'

// En el mapeo de clasificados:
{classifieds.map((item) => (
  <Card key={item.id}>
    {/* ... contenido ... */}
    
    <ShareButton
      postId={item.id}
      postType="classified"
      title={item.title}
      description={`${item.category} - Q${item.price}`}
      imageUrl={item.mediaFiles?.[0]?.url}
      variant="outline"
      size="default"
    />
  </Card>
))}
```

### 4. ForumsSection.tsx

```tsx
import { ShareButton } from './ShareButton'

// En el mapeo de foros:
{forums.map((forum) => (
  <Card key={forum.id}>
    {/* ... contenido ... */}
    
    <ShareButton
      postId={forum.id}
      postType="forum"
      title={forum.topic}
      description={forum.description}
      imageUrl={forum.mediaFiles?.[0]?.url}
      variant="ghost"
      size="sm"
    />
  </Card>
))}
```

## 🎨 Personalización del ShareButton

### Props disponibles:

```tsx
interface ShareButtonProps {
  postId: string           // ID del post (requerido)
  postType: 'news' | 'alert' | 'classified' | 'forum'  // Tipo (requerido)
  title: string            // Título del post (requerido)
  description?: string     // Descripción (opcional)
  imageUrl?: string        // URL de la imagen (opcional)
  variant?: 'default' | 'ghost' | 'outline'  // Estilo del botón
  size?: 'default' | 'sm' | 'lg' | 'icon'    // Tamaño del botón
  showLabel?: boolean      // Mostrar texto "Compartir" (default: true)
}
```

### Ejemplos de estilos:

```tsx
// Botón grande y destacado
<ShareButton
  variant="default"
  size="lg"
  showLabel={true}
  {...otherProps}
/>

// Botón pequeño sin texto (solo ícono)
<ShareButton
  variant="ghost"
  size="icon"
  showLabel={false}
  {...otherProps}
/>

// Botón con borde
<ShareButton
  variant="outline"
  size="default"
  showLabel={true}
  {...otherProps}
/>
```

## 🔄 Manejo de URLs y Meta Tags

### Estructura de URLs para compartir:

El sistema actual usa este formato:
```
https://tu-dominio.com/?view=news&id=abc123
```

### Cómo funcionan los meta tags:

1. **Cuando se carga la página**, `DynamicMetaTags` actualiza los meta tags en el `<head>`
2. **Cuando se comparte**, las redes sociales leen esos meta tags
3. **WhatsApp/Facebook cachean** los meta tags, así que pueden tardar en actualizar

### Para mejorar (futuro):

Crear rutas dedicadas como:
```
https://tu-dominio.com/news/abc123
https://tu-dominio.com/alert/xyz789
```

Esto permite:
- Meta tags estáticos en el servidor
- Mejor SEO
- Previews más confiables en redes sociales

## 🧪 Cómo Probar

### 1. Probar en desarrollo local:

```bash
npm run dev
```

1. Abre la app
2. Ve a una noticia
3. Haz clic en "Compartir"
4. Prueba cada opción del menú

### 2. Probar compartir en WhatsApp:

1. Comparte un post
2. Copia el link
3. Pégalo en WhatsApp
4. Verifica que aparezca el preview con imagen

**Nota**: En desarrollo local (localhost) las redes sociales NO mostrarán previews. Necesitas un dominio público.

### 3. Probar en producción:

Una vez desplegado en Vercel:

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Pega tu URL
   - Haz clic en "Scrape Again"
   - Verifica que muestre la imagen correcta

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Pega tu URL
   - Verifica el preview

3. **WhatsApp**: Simplemente pega el link en un chat y verifica

## 🐛 Solución de Problemas

### Problema: "No se ve la imagen al compartir en WhatsApp"

**Posibles causas**:
1. La imagen está en un bucket privado de Supabase
2. La URL de la imagen no es accesible públicamente
3. El tamaño de la imagen es muy grande
4. WhatsApp tiene en caché la versión anterior

**Soluciones**:
1. Asegúrate de que las imágenes sean públicas
2. Usa signed URLs con expiración larga (7 días)
3. Optimiza las imágenes (máximo 5MB)
4. Espera ~24 horas para que WhatsApp actualice el caché

### Problema: "El botón Compartir no funciona"

**Verificar**:
1. Consola del navegador (F12) para errores
2. Que el `postId` y `postType` sean correctos
3. Que el navegador soporte la API de compartir

### Problema: "Los meta tags no se actualizan"

**Solución**:
1. Verifica que `DynamicMetaTags` esté montado
2. Revisa que los props se pasen correctamente
3. Inspecciona el `<head>` con DevTools

## 📊 Estadísticas de Compartir

Si quieres rastrear cuántas veces se comparte cada post:

```tsx
// Ya está implementado en PostActions.tsx:
const handleShare = async () => {
  // Registra el share en el servidor
  await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/share/${postType}/${postId}`,
    { method: 'POST' }
  )
  
  // ... resto del código
}
```

Puedes agregar un contador de shares en cada post consultando estos datos.

## 🎯 Siguientes Pasos Recomendados

1. **Agregar ShareButton a todas las secciones** (NewsSection, AlertsSection, etc.)
2. **Probar en dispositivo real** con internet
3. **Publicar en Vercel** para probar meta tags en redes sociales
4. **Configurar imágenes públicas** en Supabase Storage
5. **Crear tutorial** para usuarios explicando cómo compartir

## 💡 Tips Adicionales

### Compartir con texto personalizado según el tipo:

```tsx
// En NewsSection:
<ShareButton
  {...props}
  title={`🔥 NOTICIA: ${item.title}`}
/>

// En AlertsSection:
<ShareButton
  {...props}
  title={`⚠️ ALERTA: ${item.title}`}
/>

// En ClassifiedsSection:
<ShareButton
  {...props}
  title={`💼 ${item.category}: ${item.title} - Q${item.price}`}
/>
```

### Agregar hashtags automáticos:

```tsx
// En ShareButton.tsx, ya están incluidos:
const shareHashtags = '#InformaGualan #Gualan #Zacapa #Guatemala'
```

### Botón flotante de compartir:

Si quieres un botón que siempre esté visible:

```tsx
// En App.tsx o en cada sección:
<div className="fixed bottom-20 right-4 z-50">
  <ShareButton
    {...currentPostProps}
    variant="default"
    size="lg"
    className="shadow-lg"
  />
</div>
```

---

## ✅ Checklist de Implementación

- [ ] Importar `ShareButton` en NewsSection
- [ ] Importar `ShareButton` en AlertsSection  
- [ ] Importar `ShareButton` en ClassifiedsSection
- [ ] Importar `ShareButton` en ForumsSection
- [ ] Agregar `DynamicMetaTags` cuando se visualiza un post individual
- [ ] Probar compartir en WhatsApp
- [ ] Probar compartir en Facebook
- [ ] Probar compartir en Twitter/X
- [ ] Verificar que las imágenes sean públicas
- [ ] Publicar en Vercel
- [ ] Probar meta tags con Facebook Debugger
- [ ] Crear post anunciando la nueva funcionalidad
- [ ] Educar a usuarios sobre cómo compartir

---

**¿Necesitas ayuda implementando esto? Solo dime qué sección quieres actualizar primero y te ayudo paso a paso.**
