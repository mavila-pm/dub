# Dub para Sites

Versión enfocada en enlaces, QR y estadísticas de tráfico. Forma parte del fork `mavila-pm/dub`; el código original de Dub se conserva en el repositorio y esta adaptación vive en `apps/sites`.

## Incluye

- Enlaces con alias, destino editable y pausa/reactivación.
- Canales de campaña y parámetros UTM conservando otros parámetros del destino.
- QR SVG y PNG que codifican el enlace corto con `?via=qr` para distinguir escaneos.
- Visitas por enlace, día, origen detectado, canal asignado, país aproximado, dispositivo y navegador.
- Períodos de 7, 30 y 90 días o histórico, visitas recientes y exportación CSV (máximo 10 000 filas por exportación).
- Persistencia en D1; no se usa localStorage como base de datos.
- Gestión privada del propietario mediante identidad de ChatGPT y `ADMIN_EMAIL` configurado en el servidor.

## Interpretación correcta

El canal asignado es una etiqueta de distribución, no prueba del lugar real de cada visita. El origen detectado usa el host del Referer, cuando existe. Algunas apps eliminan esa información: se informa `Directo / no disponible`, sin inventar atribución. Reutilizar un enlace en varios canales impide conocer con certeza el canal de cada visita sin Referer.

Las cifras cuentan visitas, no personas únicas. Los bots conocidos, previsualizaciones y prefetch detectados se excluyen por heurística; HEAD no suma visitas. La identificación de bots no es exhaustiva. No se guardan IP, cookies de seguimiento ni identidades de visitantes. La aplicación conserva la información mínima del evento: enlace, fecha, país aproximado, dispositivo, navegador, host de referencia, canal y campaña.

La lista del panel muestra los últimos 1 000 enlaces; las estadísticas agregan todos los enlaces del propietario. El gráfico histórico muestra hasta 180 días recientes, mientras que las cifras históricas incluyen todo el período. Las clasificaciones muestran los principales orígenes (12 en la API, 6 en cada tarjeta).

## Entorno

Node 22.13+ y el gestor indicado por `packageManager`. Se conservan los scripts de Sites/Vinext y la integración `sites()` de Vite.

Configurar la variable de servidor `ADMIN_EMAIL` como secreto en Sites, con el correo de la cuenta propietaria. Nunca subir sus valores a Git. `.openai/hosting.json` configura D1 como `DB`; Sites crea la base y aplica las migraciones al publicar. La base local y la de producción son independientes.

Para generar migraciones: `npm run db:generate`. No modificar una migración ya aplicada; añadir otra.

## Verificación

- `npm run check`: TypeScript.
- `npm test`: integra los handlers reales con una D1 aislada mediante Miniflare. Comprueba autorización, CSRF, protocolos, alias, redirecciones, UTMs, QR, Referer, bots, prefetch, HEAD, edición, pausa y CSV. No necesita cuentas externas y no accede a producción.
- Build y publicación: utilizar los helpers oficiales del plugin Sites, conservando su manifiesto y sincronizando la fuente antes de guardar y desplegar.

Los artefactos de prueba se guardan en `work/`, ignorado por Git. `scripts/test-worker.ts` solo se usa en pruebas y nunca se importa en la aplicación.

## Acceso público

Un Site privado exige inicio de sesión incluso para seguir los enlaces cortos. Antes de usarlo en campañas anónimas, el propietario debe solicitar acceso público al Site. Eso no hace públicos los datos ni las escrituras del panel: ambas superficies siguen autorizadas en servidor exclusivamente para `ADMIN_EMAIL`.

## Alcance

Esta adaptación no incluye afiliados, pagos, conversiones, cuentas de equipo ni paridad con todas las funciones de Dub. El dominio provisto por Sites puede ser más largo que el destino; es una URL de seguimiento. Un dominio corto personalizado requiere configurarlo por separado.

## Licencias y origen

Núcleo de esta adaptación: AGPL-3.0-or-later. Biblioteca QR tomada de `apps/web/lib/qr/codegen.ts` de Dub, basada en Project Nayuki (MIT). Consultar `THIRD_PARTY_NOTICES.md` y la licencia original conservada. Los scripts y dependencias mantienen sus licencias correspondientes. No se ha incorporado funcionalidad Enterprise.
