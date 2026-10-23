# CAMILETE

Sitio web estático para CAMILETE. El contenido publicado se define en `data.json`; las imágenes del menú usan SVG locales.

## Desarrollo y publicación

Sirve la carpeta desde un servidor HTTP estático (por ejemplo, la función de vista previa de tu editor o el hosting elegido). `fetch()` no puede cargar `data.json` de forma fiable si se abre `index.html` directamente como archivo.

El administrador está en `/admin/` y solicita una contraseña. La comprobación usa SHA-256 en el navegador y mantiene la sesión en la pestaña. Como el sitio es estático, esto solo disuade el acceso casual: no reemplaza autenticación en servidor y alguien con acceso a los archivos puede inspeccionar o modificar la protección. Para restringir el panel en producción, protege `/admin/` con el control de acceso del hosting o añade un backend. La verificación criptográfica requiere HTTPS o `localhost`.

El panel edita productos y categorías, datos de la empresa, tarifas tentativas de domicilio por zona, SEO, textos legales y colores. Los cambios se guardan en el almacenamiento local de ese navegador. Usa **Descargar data.json** y publica el archivo reemplazando el `data.json` del sitio para que los cambios queden disponibles a todos los visitantes.

Completa y confirma la razón social, NIT, dirección, canales, horarios, precios e información legal antes de publicar. Las páginas legales incluidas son plantillas informativas y deben ajustarse a las prácticas reales del negocio.

El carrito prepara un mensaje de WhatsApp; configura el número internacional en `empresa.whatsapp` (solo dígitos, incluyendo código de país). Al dejarlo vacío, abre WhatsApp sin destinatario preseleccionado.
