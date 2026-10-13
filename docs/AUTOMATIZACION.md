# Automatización de contenido

## Cómo funciona
1. **Lunes y jueves (06:00 UTC)**, o a mano desde GitHub → Actions → *Generar fichas y publicar*, el flujo `publish-batch.yml` elige las siguientes fichas de `content-plan/backlog.json` (mezcla de códigos, testigos y guías).
2. Para cada una, `scripts/generate-articles.mjs` llama a la API de Claude (modelo `claude-opus-5-5`, salida estructurada). Un **segundo pase crítico** busca datos inventados, consejos peligrosos o ilegales y errores técnicos. El HTML lo compone el código, no la IA, para que la estructura sea siempre idéntica.
3. Se **valida** la estructura (`validate-content.mjs`) y que no sea casi un duplicado de otra ficha (rechazo a partir del 45 % de texto compartido). Si algo falla, reintenta una vez con la crítica; si vuelve a fallar, la descarta y la anota en `content-plan/rechazadas.json` para no entrar en bucle.
4. Se crea su **imagen** con el generador propio (gratis) y se guarda como **borrador sin revisar**: se publica con `noindex`, fuera del sitemap, mostrando «pendiente de revisión técnica».
5. Se hace una construcción de comprobación; si pasa, se guarda y se despliega en Hostinger. Si algo falla antes de guardar, no se toca la web.
6. El flujo adjunta `pendientes-revision.html`: todas las fichas sin revisar, listas para leer o imprimir a PDF, que se le pasan al revisor técnico.

## Frenos de seguridad
- **Pausa si hay 12 fichas sin revisar** (`MAX_PENDING_REVIEW`). No se genera más rápido de lo que se puede revisar.
- Tope de 3 fichas por ejecución (6 por semana).
- **No se generan fichas por marca**: exigen particularidades reales verificadas y se hacen a mano.
- Las familias casi idénticas (fallos de encendido por cilindro, banco 2 de mezcla) no tienen fichas separadas: una sola ficha cubre la familia.
- Nada llega a Google sin revisión humana: solo las fichas marcadas como revisadas son indexables.

## Qué hay que hacer
**Una sola vez:** en GitHub → Settings → Secrets and variables → Actions, crear el secreto `ANTHROPIC_API_KEY` con la clave de la API. Sin él, el flujo se salta la generación con un aviso.

**Primera ejecución (manual y de una ficha):** Actions → *Generar fichas y publicar* → Run workflow con `count = 1` y `only = codigo-p0301`. Revisar el resultado antes de dejar el calendario automático.

**Cada semana:** descargar `fichas-pendientes-de-revision` (artefacto de la última ejecución), pasárselo al revisor y, cuando devuelva el resultado, Actions → *Marcar fichas como revisadas* con las claves aprobadas (o `todas`). Las fichas con correcciones se arreglan antes de marcarlas.

## Coste
No medido hasta la primera ejecución real. Estimación: unos 0,10-0,35 USD por ficha con el modelo actual (incluye el repaso crítico), es decir, del orden de 3-8 USD al mes con 6 fichas semanales. El resumen de cada ejecución muestra el coste estimado real. Se puede cambiar de modelo con la variable `GEN_MODEL`.

## Cambiar el ritmo
Editar el `cron` de `.github/workflows/publish-batch.yml`, o `GEN_COUNT` / `MAX_PENDING_REVIEW`. Antes de acelerar, mirar Search Console: si la mayoría de las fichas ya publicadas siguen sin indexarse, mejorar antes de añadir más.

## Pruebas sin API
`node scripts/generate-articles.mjs --mock --count 3` ejecuta todo el flujo con texto de prueba (no se permite en GitHub Actions). Úsalo en una copia, porque escribe fichas de prueba en `src/content/articulos/`.
