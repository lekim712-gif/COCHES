# Despliegue en Hostinger

La web es **estática** (HTML, CSS e imágenes). Se puede desplegar de dos formas: importando el repositorio desde GitHub (Hostinger la construye) o subiendo el contenido de `dist/` a mano. No necesita base de datos.

> Nada de esto está probado contra tu Hostinger real. Verifica cada punto al terminar (sección «Comprobaciones»).

## 1. Dominio
1. En Hostinger: **Dominios**, busca `obdcodigos.com`. Antes de pagar, mira el **precio de renovación** (el primer año suele ser promocional).
2. Activa la **protección de privacidad del dominio** si está disponible: tu nombre y domicilio saldrían en el registro público.

## 2. Añadir el dominio a tu hosting
1. **hPanel → Sitios web → Añadir sitio web**, y elige la opción de **subir tus archivos / sitio vacío**. No uses WordPress ni el creador de webs.
2. Anota **la carpeta** del dominio, normalmente `domains/obdcodigos.com/public_html`. Es la única carpeta donde se subirá algo.
3. **SSL:** activa el SSL gratuito del dominio y espera a que esté activo antes de abrir la web. Mientras no funcione, la redirección a https dará error.

## 3. Carpeta del dominio
Si usas la opción B (subida manual), sube **solo** a la carpeta de este dominio y, si usas FTP, crea una cuenta limitada a ella. Así un fallo nunca puede tocar tus otras webs. Con la opción A no hace falta FTP.

## 4. Opción A (recomendada): despliegue automático por FTP desde GitHub
Cada vez que se sube un cambio a la rama de producción, GitHub construye la web (`npm run build:prod`) y la sube a Hostinger por FTP. **Nadie más que GitHub ve la contraseña.** El flujo es `.github/workflows/deploy-hostinger.yml`.

**Una sola vez, en hPanel:** Archivos → Cuentas FTP → crea una cuenta **limitada a la carpeta `public_html` de este dominio** con una contraseña larga y única. Anota el servidor (p. ej. `ftp.obdcodigos.com`), el usuario y la contraseña.

**Una sola vez, en GitHub:** repositorio → Settings → Secrets and variables → Actions → New repository secret. Crea estos 5:
| Secreto | Valor |
|---|---|
| `DOTENV` | El contenido completo de tu `.env` local (las 7 variables obligatorias, una por línea) |
| `FTP_SERVER` | El servidor FTP, p. ej. `ftp.obdcodigos.com` |
| `FTP_USERNAME` | El usuario de la cuenta FTP |
| `FTP_PASSWORD` | La contraseña de la cuenta FTP |
| `FTP_SERVER_DIR` | `./` si la cuenta ya está limitada a `public_html` |

Opcionales si falla la conexión: `FTP_PROTOCOL` (`ftps` por defecto; prueba `ftp`) y `FTP_PORT` (21 por defecto).

- Hasta que existan `DOTENV` y `FTP_SERVER`, el flujo **se salta** el despliegue con un aviso, sin fallar.
- `build:prod` hace fallar el despliegue si falta algún dato obligatorio (mejor un fallo que una web con `[PENDIENTE]`).
- El flujo **no borra** archivos que él no haya subido antes, así que no toca otras webs.
- Las fichas sin revisar se publican con `noindex`, así que desplegar a menudo es seguro.
- **Nunca pegues la contraseña FTP en un chat ni en un archivo del repositorio.** Si se filtra, cámbiala en hPanel.

## 5. Opción B: subida manual del `dist/` (alternativa)
1. En tu ordenador: `npm run build:prod` (necesita tu `.env`).
2. En el Administrador de archivos de hPanel, sube el zip del contenido de `dist/` a la carpeta del dominio y **extráelo allí** (así se conserva `.htaccess`).
3. Los archivos ocultos deben verse y subirse; sin `.htaccess` no hay redirecciones ni página 404.

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
