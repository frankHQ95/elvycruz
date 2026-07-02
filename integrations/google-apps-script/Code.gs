/**
 * Finanzas con Visión — Captura de Leads
 * --------------------------------------
 * Recibe los datos del formulario de la landing y los guarda en este Google Sheet.
 * Además envía un correo de aviso por cada prospecto nuevo (para responder rápido).
 *
 * Cómo usarlo: ver INSTRUCCIONES.md (en esta misma carpeta).
 */

// ============ CONFIGURACIÓN (edita estas 3 líneas) ============
const SHEET_NAME   = 'Leads';                  // nombre de la pestaña donde se guardan
const NOTIFY_EMAIL = 'elvi.cruzdom@gmail.com'; // correo que recibe el aviso ('' = sin aviso)
const SHARED_SECRET = '';                      // opcional: token anti-spam (déjalo vacío si no lo usas)
// =============================================================

function doPost(e) {
  try {
    var data = parseBody(e);

    // Validación opcional anti-spam
    if (SHARED_SECRET && data.token !== SHARED_SECRET) {
      return json({ ok: false, error: 'unauthorized' });
    }

    var fecha = new Date();
    var sheet = getSheet();
    sheet.appendRow([
      fecha,
      data.nombre   || '',
      data.whatsapp || '',
      data.servicio || '',
      data.origen   || '',
      'Nuevo'                       // columna de estatus para que Elvia dé seguimiento
    ]);

    notify(data, fecha);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Permite probar el endpoint abriéndolo en el navegador
function doGet() {
  return json({ ok: true, msg: 'Endpoint de leads activo ✅' });
}

function parseBody(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (x) {}
  }
  return (e && e.parameter) ? e.parameter : {};
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Fecha', 'Nombre', 'WhatsApp', 'Servicio', 'Origen', 'Estatus']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify(data, fecha) {
  if (!NOTIFY_EMAIL) return;
  var tel = String(data.whatsapp || '').replace(/\D/g, '');
  var asunto = '🟢 Nuevo prospecto: ' + (data.nombre || 'Sin nombre');
  var cuerpo =
    'Tienes un nuevo prospecto desde tu página web:\n\n' +
    'Nombre:   ' + (data.nombre   || '-') + '\n' +
    'WhatsApp: ' + (data.whatsapp || '-') + '\n' +
    'Interés:  ' + (data.servicio || '-') + '\n' +
    'Origen:   ' + (data.origen   || '-') + '\n' +
    'Fecha:    ' + fecha.toLocaleString('es-MX') + '\n\n' +
    '➡️ Escríbele ahora: https://wa.me/52' + tel;
  MailApp.sendEmail(NOTIFY_EMAIL, asunto, cuerpo);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
