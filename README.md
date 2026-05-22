# Comité de Productores Cristo Rey

Primera versión offline-first de la app administrativa del comité. Está hecha como PWA sin dependencias externas y también incluye un proyecto Android nativo con WebView para compilar desde Android Studio.

## Cómo probar

Con Node instalado:

```powershell
node server.mjs
```

En este entorno de Codex, si el alias `node` de Windows está bloqueado:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.mjs
```

Luego abrir:

```text
http://localhost:4173
```

## Qué incluye

- Panel principal con deuda general, préstamos activos, mora, caja, ingresos, egresos y margen financiero estimado.
- Socios con alta, búsqueda, estado financiero e historial vinculado.
- Deuda general del comité con calendario de cuotas y registro de pagos.
- Calculadora de cuotas con cuota fija, interés simple, interés sobre saldo, solo interés y cuota manual.
- Préstamos a socios con simulación, aprobación, cuotas, pagos parciales y mora.
- Calendario diario, semanal y mensual.
- Morosos con registro de gestión de cobranza.
- Servicios de maquinaria con combustible, mantenimiento, cobro y utilidad.
- Productos, stock mínimo, ventas al contado, parcial o fiadas.
- Caja y movimientos de ingresos/egresos.
- Reportes financieros, préstamos, deuda general, maquinaria, ventas y margen.
- Backup local JSON y restauración desde archivo.
- Manifest y service worker para uso offline.

## Datos locales

La app guarda todo en `localStorage` del navegador bajo la clave:

```text
cristo_rey_state_v1
```

El backup sugerido se descarga con este formato:

```text
backup_cristo_rey_YYYY_MM_DD.json
```

## Compilar como app Android

El proyecto ya incluye:

- `settings.gradle`
- `build.gradle`
- `gradlew.bat`
- `gradle/wrapper/gradle-wrapper.jar`
- Módulo Android en `app/`
- App web empaquetada en `app/src/main/assets/www`

Pasos:

1. Abrir Android Studio.
2. Elegir `Open`.
3. Seleccionar esta carpeta completa:

```text
C:\Users\LUIS-ING\OneDrive\Documentos\Cristo Rey
```

4. Esperar el `Gradle Sync`.
5. Si Android Studio pide instalar `Android SDK Platform 35`, aceptar.
6. Para probar en teléfono o emulador: `Run > Run 'app'`.
7. Para generar APK: `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

El paquete Android es:

```text
py.org.cristorey.comite
```

La pantalla nativa carga:

```text
file:///android_asset/www/index.html
```

## Sincronizar cambios web con Android

Si se modifica `app.js`, `styles.css`, `index.html`, el manifest o el icono, ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File tools\sync-web-to-android.ps1
```

Eso copia los archivos actualizados a `app/src/main/assets/www`, que es lo que Android Studio empaqueta dentro del APK.

## Backup en Android

En navegador, el backup se descarga como archivo JSON. En Android, el botón de backup usa código nativo y guarda el archivo en la carpeta de documentos privada de la app, dentro de `backups`.

Ejemplo:

```text
backup_cristo_rey_2026_05_22.json
```

## Alternativa Capacitor

Para convertir esta base en APK/AAB con Capacitor:

```powershell
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Comité Cristo Rey" "py.org.cristorey.comite" --web-dir .
npx cap add android
npx cap open android
```

Desde Android Studio se puede compilar el APK. La app ya está pensada para funcionar sin internet; la sincronización en la nube puede agregarse después.
