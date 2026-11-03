# Dub en ChatGPT Sites — estado verificado

Revisión: 2 de noviembre de 2026 (America/Lima).

## Resultado

El alcance confirmado por Mauro se concentra en enlaces, QR, estadísticas y procedencia de las visitas. Se implementó una adaptación para Sites en `apps/sites`, conservando la aplicación original del upstream en `apps/web` y sus paquetes.

La versión inicial está publicada en https://dub-vocera-links.oxyfps.chatgpt.site con acceso privado del propietario. No se ha habilitado acceso público. Para campañas con destinatarios anónimos se requiere solicitar explícitamente el cambio de audiencia; el panel y sus APIs permanecen restringidos al propietario por autorización de servidor incluso si el Site pasa a público.

## Implementado

- Enlaces con alias único, destino editable, pausa y reactivación.
- Canal, campaña y medio UTM; parámetros del destino preservados.
- QR SVG y PNG de 1 024 px; los escaneos se distinguen con `via=qr`.
- Clics, escaneos, serie por día, canal asignado, host de procedencia, país aproximado, dispositivo, navegador y visitas recientes.
- Estadísticas por enlace, períodos de 7/30/90 días o histórico y CSV.
- Persistencia D1, migración de esquema y autorización con identidad de ChatGPT.
- Bots/previsualizaciones/prefetch conocidos separados; HEAD no suma visitas.

## Evidencia

- Fuente de Sites publicada: `80f165e8c7d2ba8fc67fa49edd85fef6183565c3`.
- Build Vinext/Worker: correcto.
- TypeScript sin errores.
- Prueba de integración de los handlers reales con D1 aislada: correcta para permisos, CSRF, protocolos seguros, colisiones, redirecciones, UTMs, QR, origen, dispositivos, bots, prefetch, HEAD, edición, pausa/reactivación, filtros y CSV.
- Lector QR independiente ZXing-C++: decodificó la URL de seguimiento exacta con `via=qr`.
- Revisión visual en navegador: panel y formulario. El preview no incluye una sesión de propietario; la gestión funcional se validó en el entorno de pruebas aislado.
- Publicación nativa de Sites: `succeeded`, versión 1.

No se afirman pruebas de tráfico real de campañas ni atribución perfecta.

## Límites que afectan la interpretación

El canal asignado representa dónde se distribuyó ese enlace; no garantiza el origen real si se vuelve a compartir. El Referer puede faltar en apps y navegadores. En ese caso se muestra `Directo / no disponible`. Se cuentan visitas, no personas únicas. La clasificación de bots es heurística y el país es aproximado. No se guardan IP, cookies ni identidades de visitantes en los eventos.

La lista muestra hasta 1 000 enlaces, la exportación hasta 10 000 eventos y el gráfico histórico hasta 180 días; los totales agregan el período completo. No incluye funciones Enterprise, afiliados, pagos ni conversiones.

## Operación

`ADMIN_EMAIL` está configurado como secreto del servidor; su valor no se guarda en el repositorio. D1 es la base de datos de Sites. No se contrataron servicios externos de pago ni se modificaron DNS. Un dominio corto personalizado se configura aparte; la URL actual es principalmente una URL de seguimiento.

La documentación y los comandos de desarrollo y pruebas están en `apps/sites/README.md`. Las licencias y avisos originales se conservan.

## Checkpoint

Pendiente para campañas anónimas: autorización expresa del propietario para que el Site sea público, conservando el panel protegido, y una comprobación posterior de acceso anónimo.

## Token audit

Skills: Sites, Senior Product Engineer y Browser. Consumo real: no disponible. Se evitó instalar la infraestructura completa del upstream; la adaptación utiliza persistencia nativa y mantiene las dependencias del starter. La evidencia queda en GitHub, sin secretos.
