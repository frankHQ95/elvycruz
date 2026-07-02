# Conectar el formulario a Google Sheets (captura de leads)

Esta guía hace que **cada persona que llene el formulario** de la página quede guardada
automáticamente en una hoja de cálculo de Google, y que Elvia reciba un **correo de aviso**
para responder rápido. Es gratis y no necesita servidor.

> **Importante (para entrega a cliente):** todo esto debe crearse **en la cuenta de Google
> de Elvia** (no en la del desarrollador). Así ella es la dueña de los datos de sus
> prospectos y recibe los avisos. El desarrollador puede hacerlo por ella en una
> videollamada/handoff, o seguir estos pasos con su cuenta.

---

## Paso 1 — Crear la hoja de cálculo
1. Entra a <https://sheets.google.com> (con la cuenta de Elvia) y crea una **hoja nueva**.
2. Nómbrala, por ejemplo, **"Leads – Finanzas con Visión"**.

## Paso 2 — Abrir el editor de Apps Script
1. En la hoja, menú **Extensiones → Apps Script**.
2. Borra el código de ejemplo que aparece.
3. Copia y pega **todo** el contenido de `Code.gs` (este folder).
4. En la parte de arriba del código, ajusta:
   - `NOTIFY_EMAIL` → el correo donde Elvia quiere recibir el aviso de cada prospecto.
5. Guarda con el ícono 💾 (o `Ctrl/Cmd + S`).

## Paso 3 — Publicar como aplicación web
1. Botón **Implementar → Nueva implementación**.
2. En el engrane ⚙️ elige **Aplicación web**.
3. Configura:
   - **Descripción:** Captura de leads
   - **Ejecutar como:** *Yo* (la cuenta de Elvia)
   - **Quién tiene acceso:** **Cualquier usuario**  ← imprescindible para que la página pueda enviar
4. Clic en **Implementar**.
5. Google pedirá **autorizar permisos** → Aceptar (entra con la cuenta de Elvia; si sale
   "Google no verificó la app", elige *Configuración avanzada → Ir a (nombre) → Permitir*).
6. Copia la **URL de la aplicación web** (termina en `/exec`). Esa es la clave.

## Paso 4 — Conectar la URL en la página
En el código de la página, pega esa URL en la constante `LEAD_ENDPOINT`, en **dos archivos**:
- `js/index/index.js`
- `js/shared/vsl.js`

```js
const LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfyc.../exec';
```

(Lo puede hacer el desarrollador. Es lo único que se toca en el código.)

## Paso 5 — Probar
1. Abre la página, llena el formulario y envía.
2. Revisa que aparezca una fila nueva en la hoja **Leads** y que llegue el correo de aviso.

---

## ¿Cómo lo usa Elvia en su día a día?
- Abre su Google Sheet y ve **todos los prospectos** (fecha, nombre, WhatsApp, servicio).
- Usa la columna **Estatus** para marcar: *Nuevo → Contactado → Agendado → Cliente*.
- Cada prospecto le llega también por **correo** con un botón directo a WhatsApp.
- Puede abrir la hoja desde el celular con la app de Google Sheets.

## Notas
- Si en el futuro hay mucho spam, activa `SHARED_SECRET` (un código secreto) en el script
  y pásalo también desde la página.
- Para cambiar el correo de aviso, solo edita `NOTIFY_EMAIL` y vuelve a **Implementar →
  Administrar implementaciones → editar → Nueva versión**.
- **Aviso de privacidad:** como se recaban datos personales, conviene publicar un Aviso de
  Privacidad (Ley Federal de Protección de Datos, México) y enlazarlo junto al formulario.
