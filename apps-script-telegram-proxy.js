// Google Apps Script — Telegram Proxy لتسجيل أعطال الكاميرات
// Deploy as Web App: Execute as Me / Access: Anyone

const TELEGRAM_TOKEN = '9152078762:AAFfZ126lytbpDsMuogaybinXGyCEztkoIA';
const TELEGRAM_CHAT_ID = '46937619';
const SECRET_KEY = 'gw_0888b6b6666f2a724';

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.key === SECRET_KEY && e.parameter.test === '1') {
      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
        method: 'post',
        payload: { chat_id: TELEGRAM_CHAT_ID, text: '✅ اختبار الوسيط ناجح — الاتصال بين الفورم وتيليجرام شغال' },
        muteHttpExceptions: true
      });
      return ContentService.createTextOutput('ok - test sent');
    }
  } catch (err) {}
  return ContentService.createTextOutput('ok');
}

function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.key !== SECRET_KEY) {
      return ContentService.createTextOutput('forbidden');
    }

    const p = e.parameter;
    const text = [
      '🚨 بلاغ عطل جديد',
      '🏢 رقم المؤسسة: ' + (p.org || '—'),
      '🗂️ القطاع: ' + (p.sector || '—'),
      '🏠 المحطة: ' + (p.site || '—'),
      '👮 مسؤول الأمن: ' + (p.officer || '—'),
      '🔧 العطل: ' + (p.fault || '—'),
      '📷 الصورة: ' + (p.noImage === '1' ? 'بدون صورة' : 'مرفقة'),
      '🕒 التوقيت: ' + new Date().toLocaleString('ar-EG')
    ].join('\n');

    if (p.image_base64) {
      const blob = Utilities.newBlob(Utilities.base64Decode(p.image_base64), 'image/jpeg', 'kart-zeyara.jpg');
      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendPhoto', {
        method: 'post',
        payload: {
          chat_id: TELEGRAM_CHAT_ID,
          caption: text,
          photo: blob
        },
        muteHttpExceptions: true
      });
    } else {
      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
        method: 'post',
        payload: {
          chat_id: TELEGRAM_CHAT_ID,
          text: text
        },
        muteHttpExceptions: true
      });
    }

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}
