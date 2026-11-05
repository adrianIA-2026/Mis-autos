# Publicar Mis Autos e instalarla en Android

Esta es la aplicación real, versión 3.0.0. El paquete para publicar no incluye la muestra, datos ficticios, pruebas, copias de seguridad ni registros personales. Arranca con JAC J2 2015 y Citroën Xsara 1.9 D aspirado 2000, y permite agregar más vehículos.

La búsqueda de códigos OEM queda pendiente, tal como acordamos. No se precargan códigos inventados. Podés agregar tus referencias desde la app.

## 1. Antes de actualizar

Si ya cargaste datos en una versión anterior, abrila y usá **Exportar copia**. Guardá ese JSON fuera del repositorio. No borres los datos de Chrome ni desinstales la app para actualizar.

Los archivos del programa son públicos, pero tus registros y fotos se guardan solo en el navegador de tu dispositivo. Publicar el programa no sube esos registros. No incluyas archivos JSON de respaldo entre los archivos que subas a GitHub.

## Corrección de la instalación desde Android

En la revisión del repositorio publicado faltaba la carpeta de iconos: el manifiesto y el service worker apuntaban a imágenes que no estaban subidas. Este paquete corregido deja los cuatro iconos en la raíz, junto a `index.html`, y actualiza sus rutas en el manifiesto, la página y el service worker. Subí **todos** los archivos extraídos y reemplazá los anteriores. No borres los datos de Chrome: la corrección conserva la misma dirección y el mismo almacenamiento de tus registros.

## 2. Descargar y extraer

1. Descargá **Mis-Autos-publicacion-corregida.zip** desde el chat.
2. Extraelo en tu computadora. No subas el ZIP cerrado a GitHub.
3. Dentro deben verse `index.html`, `app.js`, `core.js`, `storage.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, los cuatro archivos de iconos (`icon.svg`, `icon-192.png`, `icon-512.png` y `maskable-512.png`) y este README. El archivo oculto `.nojekyll` también está incluido, aunque tu explorador podría no mostrarlo.

## 3. Subir al repositorio de GitHub

1. Iniciá sesión en GitHub y abrí **adrianIA-2026/Mis-autos**.
2. Si el repositorio es privado y querés hacerlo público, abrí **Settings → General → Danger Zone → Change repository visibility → Make public** y seguí la confirmación de GitHub. Si ya es público, omití este paso. Verificá antes que no tenga respaldos o archivos personales, porque su contenido e historial pasarán a ser públicos.
3. Volvé a **Code** y seleccioná la rama **main**.
4. Elegí **Add file → Upload files**.
5. Arrastrá **el contenido de la carpeta extraída**, incluidos los cuatro archivos de iconos. No arrastres una carpeta contenedora: `index.html` debe quedar directamente en la raíz del repositorio.
6. Pulsá **Commit changes** para guardar los archivos en `main`. Si GitHub muestra una confirmación adicional, completala. Los archivos nuevos deben reemplazar sus versiones anteriores.
7. Comprobá que `index.html` aparece al lado de `app.js`, `core.js` y `storage.js`, y que los cuatro iconos también están en la raíz.

Si el repositorio conserva `MUESTRA.html` o una demo de pruebas que subiste antes, podés eliminar ese archivo desde GitHub para no confundirlo con la aplicación real. La página de inicio debe ser `index.html`.

## 4. Activar GitHub Pages

1. Abrí **Settings → Pages** del repositorio.
2. En **Build and deployment → Source**, elegí **Deploy from a branch**.
3. Seleccioná **main** y **/ (root)**; pulsá **Save**. Si ya tenías esa configuración, no hace falta cambiarla: el commit debe lanzar una actualización.
4. Esperá a que termine el despliegue. La sección **Actions** permite ver si el trabajo de Pages finalizó correctamente.
5. Volvé a **Settings → Pages** y abrí la dirección que GitHub muestre como publicada. Con el usuario y repositorio actuales debería ser:

   https://adrianIA-2026.github.io/Mis-autos/

Esa dirección solo funcionará una vez que GitHub confirme el despliegue. No es la dirección `github.com/...` del código fuente. Este paquete no activa Pages ni publica por sí solo. Los iconos van en la raíz para que puedas seleccionar todos los archivos desde Android sin tener que subir carpetas.

## 5. Instalar en tu Android

1. Con Internet, abrí **Google Chrome** en el teléfono.
2. Entrá a la dirección HTTPS publicada por GitHub Pages.
3. Esperá el mensaje **Disponible sin conexión en este dispositivo** al pie de Mis Autos.
4. Tocá **Instalar aplicación** si aparece. Si no, abrí **⋮ → Agregar a la pantalla principal → Instalar** o **Instalar aplicación**. Los nombres pueden variar según Chrome y Android.
5. Abrí la aplicación desde el icono de **Mis Autos**.
6. Activá modo avión y comprobá que vuelve a abrirse. Después desactivá modo avión.

No necesitás un APK, Play Store, Python, Node.js ni ejecutar comandos para instalar la app desde GitHub Pages.

## 6. Si ya usabas Mis Autos

- Mantené la misma dirección, navegador y perfil. La actualización convierte las copias antiguas sin borrar los registros existentes.
- Con Internet, abrí la app, cerrá todas sus ventanas y volvé a abrirla para activar una versión descargada nueva. No borres el almacenamiento para forzarla.
- Si tus datos estaban en otra dirección o en la muestra, no aparecerán automáticamente aquí. Desde la aplicación real anterior exportá el JSON y usá **Importar copia** en la nueva. La importación reemplaza los datos actuales de todos los vehículos; revisá el aviso antes de confirmar.
- La muestra utiliza datos ficticios y almacenamiento temporal: no la uses como respaldo de tus datos reales.
- Exportá una copia después de cargar información importante y antes de cambiar de teléfono.

## Comprobación rápida después de publicar

1. Verificá que aparezcan **Agregar vehículo**, el botón desplegable **Listado** y el catálogo.
2. Agregá un registro de prueba, recargá y comprobá que siga guardado; después podés eliminarlo.
3. Probá exportar una copia y encontrala en Descargas.
4. Verificá que la app abra sin conexión después de la primera carga.

Las alertas se muestran dentro de la aplicación al abrirla; no se envían notificaciones con la app cerrada. La instalación en un Android físico y la publicación de tu repositorio deben comprobarse con estos pasos.
