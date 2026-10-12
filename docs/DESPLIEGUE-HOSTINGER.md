# Despliegue en Hostinger

La web es **estática** (HTML, CSS e imágenes): solo hay que subir el contenido de `dist/` a la carpeta del dominio. No necesita Node ni base de datos en el servidor.

> Nada de esto está probado contra tu Hostinger real. Verifica cada punto al terminar (sección «Comprobaciones»).

## 1. Dominio
1. En Hostinger: **Dominios**, busca `obdcodigos.com`. Antes de pagar, mira el **precio de renovación** (el primer año suele ser promocional).
2. Activa la **protección de privacidad del dominio** si está disponible: tu nombre y domicilio saldrían en el registro público.

## 2. Añadir el dominio a tu hosting
1. **hPanel → Sitios web → Añadir sitio web**, y elige la opción de **subir tus archivos / sitio vacío**. No uses WordPress ni el creador de webs.
2. Anota **la carpeta** del dominio, normalmente `domains/obdcodigos.com/public_html`. Es la única carpeta donde se subirá algo.
3. **SSL:** activa el SSL gratuito del dominio y espera a que esté activo antes de abrir la web. Mientras no funcione, la redirección a https dará error.

## 3. Cuenta FTP limitada a esa carpeta
**hPanel → Archivos → Cuentas FTP**: crea una cuenta cuyo directorio sea **solo** la carpeta de este dominio. Así un fallo nunca puede tocar tus otras webs. Anota servidor, usuario y contraseña.

## 4. Subida manual (la primera vez, recomendada)
1. En tu ordenador: `npm run build:prod` (necesita tu `.env`).
2. Con el Administrador de archivos de hPanel o FileZilla, sube **el contenido** de `dist/` (no la carpeta `dist`) a la carpeta del dominio.
3. **Muestra los archivos ocultos** para que suba `.htaccess`. Sin él no hay redirección a https/sin www, ni cabeceras de seguridad, ni página 404.

## 5. Subida automática desde GitHub (para las automatizaciones)
El flujo `.github/workflows/deploy-hostinger.yml` construye la web y la sube por FTP. **Solo se ejecuta cuando tú lo lanzas** (Actions → Desplegar en Hostinger → Run workflow).

1. Debe estar en la **rama principal** del repositorio para que aparezca en Actions.
2. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Crea estos secretos con los valores de tu `.env`:
   `SITE_URL`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_OWNER_NAME`, `PUBLIC_OWNER_TAXID`, `PUBLIC_OWNER_ADDRESS`, `PUBLIC_REVIEWER_NAME`, `PUBLIC_REVIEWER_EXPERIENCE`, y los de AdSense, Amazon y Analytics cuando existan (`PUBLIC_ADSENSE_CLIENT`, `PUBLIC_ADSLOT_1`, `PUBLIC_ADSLOT_2`, `PUBLIC_AMAZON_TAG`, `PUBLIC_GA_ID`).
3. Y los de FTP: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` y `FTP_SERVER_DIR` (la carpeta del dominio, **con barra final**, p. ej. `domains/obdcodigos.com/public_html/`; si tu cuenta FTP ya está limitada a esa carpeta, suele ser `/`).
4. El flujo **no borra** archivos que él no haya subido antes, así que no toca otras webs. Aun así, revisa dos veces `FTP_SERVER_DIR`.

## 6. Comprobaciones tras publicar
- `http://obdcodigos.com` y `https://www.obdcodigos.com` redirigen (301) a `https://obdcodigos.com/`.
- Una URL inexistente muestra la página 404 y devuelve código 404.
- `https://obdcodigos.com/ads.txt`, `/robots.txt` y `/sitemap-index.xml` cargan.
- Pasa la auditoría del sitio contra el dominio real (`auditar_sitio.py` de la guía de SEO) y revisa Search Console.
- Si algo falla con https o aparece un bucle de redirecciones, suele ser el SSL aún sin activar. Quita temporalmente el bloque de redirección del `.htaccess`.

## 7. Correo de contacto
Mira si tu plan de Hostinger incluye cuentas de correo. Si sí, crea `contacto@obdcodigos.com` en **hPanel → Correos**. Si no, configura un reenvío a tu correo o cambia `PUBLIC_CONTACT_EMAIL` por otro que uses.

## Notas
- El `.htaccess` lleva el dominio escrito. Si cambias de dominio, edítalo (`public/.htaccess`).
- HSTS queda activado: si algún día el SSL falla, el navegador se negará a cargar la web sin https. Confirma que el SSL está activo antes de lanzar.
- **No subas** `.env` ni nada fuera de `dist/`.
