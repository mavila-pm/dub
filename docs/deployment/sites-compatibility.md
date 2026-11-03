# Dub: preparación para ChatGPT Sites

Fecha de revisión: 2 de noviembre de 2026 (America/Lima).

## Estado verificable

- CONFIRMADO: repositorio `mavila-pm/dub` creado como fork público de `dubinc/dub.link`, copiando su rama `main`.
- Base revisada: `6b463b4bdd9ed2fd9aa416f67b5b77d317b1471e`.
- VERIFICADO: código original descargado y requisitos contrastados con la guía oficial de autoalojamiento.
- PENDIENTE: elegir entre conservar el producto original con servicios externos o realizar una adaptación para Sites.
- NO IMPLEMENTADO: adaptación de runtime, datos y autenticación.
- NO DESPLEGADO: no existe todavía una aplicación publicada ni una URL de producción validada.

## Objetivo confirmado

Disponer de una aplicación de enlaces basada en Dub, con código en este repositorio y publicación en ChatGPT Sites. El uso previsto es gestionar enlaces y medir clics de campañas. No se ha aprobado contratar servicios de pago ni reemplazar todo Dub por una aplicación de alcance reducido.

## Resultado del preflight

El repositorio actual no es un sitio estático. Su aplicación principal usa Next.js 15.5.8 y un conjunto de servicios externos. El flujo soportado para aplicaciones con servidor en Sites usa Vinext o un Worker ESM y almacenamiento D1/R2; no instala automáticamente la infraestructura de Dub.

Esto identifica trabajo de migración, no demuestra que una adaptación futura sea imposible. No se ha ejecutado un build de Dub contra Sites y no se afirma compatibilidad de la aplicación completa.

| Componente | Evidencia en el código revisado | Requisito para continuar |
| --- | --- | --- |
| Runtime | `apps/web/package.json`: `next build`; `apps/web/next.config.js` configura Webpack, cabeceras, redirecciones y proxies | Adaptar y verificar el build para el runtime de Sites |
| Datos | `apps/web/prisma/schema/schema.prisma`: proveedor MySQL y `DATABASE_URL` | Conectar una base compatible por una vía admitida o migrar el modelo y las consultas a D1 |
| Caché/redirecciones | `apps/web/lib/upstash/redis.ts` exige URL y token REST | Conectar Redis externo o reemplazar su uso y validar las redirecciones |
| Analítica | `apps/web/.env.example`: `TINYBIRD_API_KEY` y `TINYBIRD_API_URL`; paquetes de Tinybird | Conectar Tinybird o implementar y verificar otra persistencia de eventos |
| Colas | `apps/web/.env.example`: variables QStash | Revisar los flujos necesarios y conectar o sustituir las colas |
| Identidad | NextAuth y sus adaptadores/proveedores en `apps/web/package.json` y `.env.example` | Integrar la identidad de ChatGPT y autorizar operaciones en servidor |
| Dominios | Variables de la API de Vercel; middleware que distingue aplicación, API y dominios cortos | Rediseñar la resolución de rutas y la gestión de dominios para Sites |

Las claves nombradas son requisitos del software, no credenciales configuradas. No se han obtenido ni almacenado secretos del usuario en este repositorio.

## Rutas concretas

### A. Conservar Dub original

Conservar la aplicación y seguir la arquitectura de autoalojamiento documentada por Dub: MySQL, Redis/QStash, Tinybird y hosting compatible. La guía oficial utiliza Vercel. Requiere configurar las cuentas y credenciales correspondientes, comprobar las condiciones vigentes y aprobar cualquier coste antes de contratarlo. Sustituir Sites por otro hosting cambia el destino solicitado.

### B. Adaptar una versión para Sites

Crear una rama separada de implementación, preservando esta copia del proyecto original.

Alcance propuesto para una primera versión:

- Crear, editar, buscar y pausar enlaces con alias.
- Redirigir por URL y registrar eventos reales.
- Mostrar clics por enlace, fecha y referencia cuando esté disponible.
- Gestionar parámetros UTM y generar códigos QR.
- Proteger el panel y las escrituras con identidad y autorización de servidor.
- Guardar enlaces y eventos de forma persistente en D1.

No prometer paridad con todo Dub. Conversiones, afiliados, integraciones y dominios personalizados requieren definir alcance y pruebas adicionales. Esta ruta necesita confirmar la reducción de alcance antes de sustituir componentes del producto.

## Acceso y publicación

Los Sites nuevos empiezan privados. Un sitio privado exige iniciar sesión también al abrir sus enlaces. Para utilizar redirecciones anónimas en campañas reales será necesario definir una audiencia pública y mantener protegidos el panel y todas las escrituras. No se ha cambiado ninguna política de acceso.

## Criterios de aceptación del futuro despliegue

1. Build compatible con el runtime de Sites.
2. Datos persistentes al cerrar y abrir otra sesión.
3. Redirecciones válidas con alias únicos y validación de protocolos de destino.
4. Registro de clics y exclusión de previsualizaciones/bots cuando se implemente; no equiparar clics con personas únicas.
5. Escrituras y estadísticas privadas autorizadas en servidor.
6. Comprobar la experiencia de un visitante anónimo antes de usar enlaces en campañas.
7. No incluir secretos en Git, archivos de hosting ni código del navegador.
8. Validar migraciones, errores, recuperación y una reversión antes de publicar.

## Licencia

Se conserva `LICENSE.md` del upstream. El repositorio declara AGPLv3 para el núcleo y excepciones comerciales para las rutas indicadas por su licencia. Cualquier distribución o adaptación debe conservar avisos y respetar los términos aplicables. No se habilitarán funcionalidades comerciales como si fueran gratuitas.

## Fuentes

- [Repositorio oficial](https://github.com/dubinc/dub.link).
- [Guía oficial de autoalojamiento](https://dub.co/docs/self-hosting).
- [Configuración de ejemplo](https://github.com/dubinc/dub.link/blob/6b463b4bdd9ed2fd9aa416f67b5b77d317b1471e/apps/web/.env.example).
- [Aplicación web](https://github.com/dubinc/dub.link/blob/6b463b4bdd9ed2fd9aa416f67b5b77d317b1471e/apps/web/package.json).
- [Licencia original](https://github.com/dubinc/dub.link/blob/6b463b4bdd9ed2fd9aa416f67b5b77d317b1471e/LICENSE.md).

## Checkpoint

Próximo paso: resolver la ruta de arquitectura con Mauro y ejecutar la implementación correspondiente. No hay servicios de pago contratados, credenciales de terceros creadas ni un despliegue que deba continuarse.

## Token audit

Skills y contexto: Sites, Senior Product Engineer y Browser; código y documentación oficial.
Consumo real: no disponible.
Desperdicio observado: algunas salidas de descubrimiento demasiado extensas.
Ajuste siguiente: limitar resultados a nombres, rutas y fragmentos necesarios.
