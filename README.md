# Mis Autos

Aplicación web progresiva (PWA), en español, para llevar el mantenimiento del **JAC J2 2015** y del **Citroën Xsara 1.9 Diesel 2000**. Diseño adaptable al celular, botones grandes y funcionamiento sin conexión después de la primera carga.

El proyecto ya está creado. No necesitás escribir código, contratar una base de datos ni configurar claves. Los datos se guardan en el navegador del dispositivo: no se envían a un servidor y no se sincronizan automáticamente entre celulares o computadoras.

## 1. Qué incluye

- Selección de vehículo y kilometraje independiente, inicialmente en cero.
- Historial de aceite, filtros, reparaciones y otros gastos, con fecha, kilómetros y detalle.
- Gastos y total histórico en pesos uruguayos (UYU). No convierte otras monedas.
- Alertas por fecha, kilometraje o ambos: aparece «Servicio pendiente» cuando se alcanza cualquiera de los dos límites.
- Exportación e importación de copias JSON con los datos de ambos vehículos.
- Instalación en Android como aplicación, con icono y ventana propia.

**Las alertas se muestran dentro de la aplicación al abrirla. No hay notificaciones con la aplicación cerrada ni lectura automática del odómetro.** Actualizá los kilómetros manualmente. Los intervalos de servicio los definís vos siguiendo el manual del vehículo o las indicaciones de tu mecánico; la app no inventa recomendaciones específicas para estos motores.

## 2. Archivos del proyecto

La carpeta `Mis-autos` contiene:

```text
index.html             Pantalla principal
styles.css             Diseño
app.js                 Registros, alertas y copias
manifest.webmanifest   Configuración de instalación
sw.js                  Archivos disponibles sin conexión
icons/                 Iconos de la aplicación
package.json           Comandos de ayuda (sin dependencias)
tests/                 Pruebas de validación de copias
README.md              Esta guía
```

Se utiliza HTML, CSS y JavaScript sin bibliotecas externas, fuentes remotas ni herramientas de compilación. No hay que ejecutar `npm install`.

## 3. Probar en una computadora (opcional)

Podés pasar directamente al paso 4 si preferís abrirla desde tu celular.

1. Descargá el archivo ZIP entregado y extraelo. O, cuando los archivos estén guardados en GitHub, usá **Code → Download ZIP** y extraelo.
2. Instalá **Python 3** desde su sitio oficial, `https://www.python.org/downloads/`. En Windows, marcá la opción para agregar Python a PATH si el instalador la ofrece.
3. Abrí la carpeta que contiene `index.html`. En Windows podés escribir `cmd` en la barra de dirección del Explorador y presionar Enter. En macOS/Linux abrí una terminal en esa carpeta.
4. Escribí este comando y presioná Enter:

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

   En Windows, si `python3` no se reconoce, usá:

   ```sh
   py -m http.server 8000 --bind 127.0.0.1
   ```

5. Dejá esa ventana abierta. En Chrome de esa misma computadora, escribí `http://localhost:8000` en la barra de dirección.
6. Esperá a ver **Disponible sin conexión en este dispositivo** al pie de la página.
7. Para detener el servidor, volvé a la ventana de comandos y presioná **Ctrl + C**.

Si ya tenés Node.js y Python 3, `npm start` es otra forma de iniciar el servidor. Node.js no es necesario para usar la app.

No abras `index.html` con doble clic: la instalación y el modo sin conexión necesitan un servidor. La dirección local de tu computadora tampoco sirve para instalar en el teléfono. Para Android, seguí los pasos de HTTPS a continuación.

## 4. Obtener una dirección segura para Android

Una opción es **GitHub Pages**, que publica los archivos de la app por HTTPS. La publicación todavía no fue realizada por esta tarea; crear los archivos aquí no los sube automáticamente a GitHub.

1. Si descargaste el ZIP entregado, extraelo primero.
2. Entrá a GitHub con tu cuenta y abrí el repositorio `adrianIA-2026/Mis-autos`.
3. Si todavía ves solo el README original, elegí **Add file → Upload files**. Arrastrá el contenido de la carpeta extraída, incluida la carpeta `icons`. `index.html` debe quedar en la raíz del repositorio, no dentro de otra carpeta. No subas el ZIP cerrado ni copias de seguridad con datos personales.
4. Elegí **Commit changes** para guardar los archivos en la rama `main`. Si los archivos ya están en `main`, no hace falta subirlos otra vez.
5. Abrí **Settings → Pages** del repositorio. Necesitás permisos de administración para configurar Pages.
6. En **Build and deployment**, seleccioná **Deploy from a branch**. Elegí la rama **main**, la carpeta **/ (root)** y pulsá **Save**.
7. Esperá a que GitHub termine el despliegue. En la misma sección Pages aparecerá la dirección publicada. Debería ser `https://adrianIA-2026.github.io/Mis-autos/`; usá la dirección que GitHub confirme, no la dirección del repositorio.
8. Abrí esa dirección y verificá que aparece Mis Autos.

La disponibilidad de Pages en repositorios privados depende del plan de GitHub. Si no aparece la opción, consultá la disponibilidad de tu plan o usá otro alojamiento estático con HTTPS. No hagas público el repositorio sin decidirlo antes: el código publicado puede ser visible para otras personas. Los registros de mantenimiento permanecen en tu navegador siempre que no subas copias JSON al repositorio.

## 5. Instalar en Android

1. Con el celular conectado a Internet, abrí **Google Chrome**.
2. Escribí la dirección HTTPS publicada en el paso anterior.
3. Esperá a ver **Disponible sin conexión en este dispositivo**. Si no aparece, recargá con conexión y revisá el mensaje del pie de página.
4. Pulsá **Instalar aplicación** si aparece dentro de la app. Si no aparece, abrí el menú **⋮** de Chrome y buscá **Agregar a la pantalla principal → Instalar** o **Instalar aplicación**. El texto varía según la versión de Android y Chrome.
5. Confirmá la instalación. Abrí **Mis Autos** desde su nuevo icono.
6. Activá modo avión y volvé a abrirla para comprobar que funciona sin Internet. Restaurá la conexión cuando termines la prueba.

No hace falta Play Store ni descargar un APK. La primera carga y las actualizaciones necesitan conexión; registrar y consultar mantenimientos después de preparar el modo sin conexión no la necesitan. Si se borran los datos del navegador, será necesario abrir la dirección con Internet nuevamente e importar una copia.

## 6. Primer uso

1. Tocá **JAC J2** o **Citroën Xsara**.
2. Pulsá **Actualizar kilometraje**, escribí el valor real del tablero y guardá. No se permite reducir el kilometraje actual desde este formulario.
3. Pulsá **Agregar registro**. Elegí el tipo, la fecha, el kilometraje del servicio, el importe en UYU y un detalle opcional. Usá fechas de hoy o anteriores. Se permiten servicios históricos con menos kilómetros que el actual; si tienen más, el odómetro de la app se actualiza.
4. Pulsá **Crear alerta**. Por ejemplo, escribí «Cambio de aceite y filtro» e indicá los kilómetros o la fecha acordados con tu mecánico. Podés poner ambos.
5. Cuando hagas el servicio, agregá su registro, quitá la alerta anterior y creá la siguiente. No se repiten automáticamente.
6. Podés usar el filtro para mostrar solo aceite, filtros, reparaciones u otros gastos. El total sigue mostrando todos los gastos del vehículo.
7. Para corregir un registro, eliminá el equivocado y crealo nuevamente. Eliminar un registro no reduce automáticamente el odómetro. Una eliminación requiere confirmación.

## 7. Copias de seguridad: muy importante

**La instalación no constituye una copia de seguridad.** El navegador o Android pueden eliminar almacenamiento local. Borrar datos del sitio, usar otro navegador o cambiar de dirección web puede hacer que no veas los registros anteriores. Cada dirección y navegador mantiene su propia base local. No uses modo incógnito para guardar tus datos habituales.

### Exportar

1. Tocá **Exportar copia**.
2. Chrome descargará un archivo como `mis-autos-2026-11-02.json` (con la fecha de la exportación).
3. Buscalo en **Archivos → Descargas** del celular.
4. Guardá otra copia fuera del teléfono, por ejemplo en tu computadora o almacenamiento personal. Contiene los datos de ambos autos: kilometrajes, registros, gastos, notas y alertas.

Exportá después de cargar información importante, antes de importar otra copia, antes de cambiar de teléfono y antes de borrar datos del navegador. El archivo no está cifrado; guardalo donde solo accedan las personas que vos elijas.

### Importar o cambiar de celular

1. Transferí el archivo JSON al celular nuevo.
2. Instalá o abrí Mis Autos desde la misma dirección publicada.
3. Tocá **Importar copia** y elegí el JSON.
4. Revisá el aviso y confirmá. **Se reemplazan todos los datos de ambos autos; no se mezclan con los actuales.**
5. Verificá ambos vehículos. Los archivos inválidos se rechazan sin modificar los datos actuales.

## 8. Comprobación rápida

Antes de usarla con tus datos reales, probá con un registro de ejemplo y después eliminalo:

1. Elegí un auto, cargá un gasto y verificá el importe del total.
2. Cambiá de vehículo: el registro no debe aparecer en el otro.
3. Creá una alerta con el kilometraje actual: debe indicar **Servicio pendiente**.
4. Exportá una copia.
5. Cerrá y volvé a abrir la app: los datos deben seguir allí.
6. En modo avión, agregá otro registro, cerrá y volvé a abrir: también debe conservarse.
7. Importá la copia del punto 4 y confirmá: debe restaurarse el estado de esa copia.

Validación realizada en el entorno de desarrollo: cuatro pruebas del formato de copias y una prueba funcional en Chromium con pantalla de 390 × 844, registros, aislamiento entre vehículos, alertas, exportación/importación, rechazo de copia inválida, persistencia y lectura/escritura sin conexión. La instalación en un Android físico y la publicación en GitHub Pages quedan por comprobar siguiendo esta guía.

## 9. Ayuda

- **No aparece Instalar:** usá Chrome con la dirección HTTPS de la app, no la página del repositorio ni un archivo descargado. Comprobá también si ya está instalada. El botón depende del navegador.
- **No funciona sin Internet:** abrila con conexión hasta ver el mensaje de disponibilidad. No borres datos del sitio después. Si cambiaste de dirección, abrila nuevamente en la nueva dirección e importá tu copia.
- **No se guarda:** puede estar lleno o bloqueado el almacenamiento. Exportá los datos que puedas conservar y revisá el espacio y los permisos de Chrome. No borres datos antes de exportar.
- **No aparecen mis registros:** verificá que abriste el mismo navegador, perfil y dirección donde los cargaste. Buscá tu última copia para importarla.
- **Hay una versión nueva:** conectate, abrí la app y luego cerrá todas sus ventanas y volvé a abrirla. Las actualizaciones de la app no deben borrar tus registros, pero conviene exportar antes.

### Para futuras modificaciones técnicas

No hay compilación. Para ejecutar las pruebas de validación con Node.js 18 o posterior: `node --test tests/app.test.cjs` (o `npm test`). Los cambios de archivos de la aplicación deben acompañarse de una nueva versión del nombre de caché en `sw.js`, para renovar la copia sin conexión. Mantené el identificador de almacenamiento y la compatibilidad de las copias, o implementá una migración explícita.
