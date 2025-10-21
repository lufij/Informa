# Generación de Íconos para PWA

## Opción 1: Usar PWA Asset Generator (Recomendado)

### Instalación
```bash
npm install -g pwa-asset-generator
```

### Generar todos los íconos desde el logo
```bash
# Usa el logo circular existente como fuente
pwa-asset-generator logoCircular.png ./public/icons \
  --icon-only \
  --favicon \
  --background "#ec4899" \
  --padding "10%" \
  --type png
```

## Opción 2: Usar Favicon Generator Online

1. Ve a: https://realfavicongenerator.net/
2. Sube el logo circular de Informa
3. Configura:
   - iOS: Color de fondo #ec4899 (rosa)
   - Android: Color de tema #ec4899
   - Windows: Color de tile #ec4899
4. Descarga el paquete
5. Extrae los archivos en `/public/icons/`

## Opción 3: Crear manualmente con herramientas de diseño

### Tamaños necesarios:

#### Android/Chrome
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

#### iOS/Safari
- 152x152 (iPad)
- 167x167 (iPad Pro)
- 180x180 (iPhone - apple-touch-icon)

#### Favicon
- 16x16
- 32x32
- favicon.ico (multi-size)

#### Social Media
- og-image.png: 1200x630 (Open Graph para Facebook)
- twitter-image.png: 1200x600 (Twitter Card)

### Herramientas de diseño:
- **Figma**: Exporta en múltiples tamaños
- **Sketch**: Usa slices para exportación
- **Photoshop**: Batch export
- **GIMP**: Free alternative

### Script de conversión con ImageMagick:
```bash
# Instalar ImageMagick
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Script para convertir desde logo original
#!/bin/bash

SOURCE="logoCircular.png"
OUTPUT_DIR="./public/icons"

mkdir -p $OUTPUT_DIR

# Android/Chrome icons
convert $SOURCE -resize 72x72 $OUTPUT_DIR/icon-72x72.png
convert $SOURCE -resize 96x96 $OUTPUT_DIR/icon-96x96.png
convert $SOURCE -resize 128x128 $OUTPUT_DIR/icon-128x128.png
convert $SOURCE -resize 144x144 $OUTPUT_DIR/icon-144x144.png
convert $SOURCE -resize 152x152 $OUTPUT_DIR/icon-152x152.png
convert $SOURCE -resize 167x167 $OUTPUT_DIR/icon-167x167.png
convert $SOURCE -resize 180x180 $OUTPUT_DIR/icon-180x180.png
convert $SOURCE -resize 192x192 $OUTPUT_DIR/icon-192x192.png
convert $SOURCE -resize 384x384 $OUTPUT_DIR/icon-384x384.png
convert $SOURCE -resize 512x512 $OUTPUT_DIR/icon-512x512.png

# Apple touch icon
convert $SOURCE -resize 180x180 $OUTPUT_DIR/apple-touch-icon.png

# Favicons
convert $SOURCE -resize 32x32 $OUTPUT_DIR/favicon-32x32.png
convert $SOURCE -resize 16x16 $OUTPUT_DIR/favicon-16x16.png

# Social media
convert $SOURCE -resize 1200x630 -gravity center -extent 1200x630 $OUTPUT_DIR/og-image.png
convert $SOURCE -resize 1200x600 -gravity center -extent 1200x600 $OUTPUT_DIR/twitter-image.png

echo "✅ Iconos generados exitosamente!"
```

## Validación

Después de generar los íconos:

1. **Verifica que existan todos:**
   ```bash
   ls -la public/icons/
   ```

2. **Valida el manifest:**
   - https://manifest-validator.appspot.com/

3. **Prueba en dispositivos:**
   - Android: Chrome DevTools > Application > Manifest
   - iOS: Safari > Compartir > Agregar a inicio

## Notas Importantes

- **Formato**: Usa PNG para todos los íconos (mejor soporte)
- **Transparencia**: Puede causar problemas en algunos dispositivos, usa fondo sólido
- **Padding**: Agrega 10-20% de padding para evitar que el ícono se vea cortado
- **Color de fondo**: Usa #ec4899 (rosa) para mantener consistencia con la marca
- **Optimización**: Usa herramientas como TinyPNG para reducir tamaño

## Troubleshooting

### Íconos no aparecen en Android
- Asegúrate de tener 192x192 y 512x512
- Verifica que las rutas en manifest.json sean correctas
- Limpia caché del navegador

### Íconos no aparecen en iOS
- iOS requiere apple-touch-icon.png de 180x180
- El archivo debe estar en la raíz o especificado en HTML
- Safari es más estricto con formatos

### Íconos se ven pixelados
- Usa la resolución más alta posible como fuente
- Asegúrate de exportar en PNG, no JPG
- Revisa que no estés escalando hacia arriba
