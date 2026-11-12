// Share card (canvas -> PNG) + WhatsApp / Web Share helpers.
import { PALETTE } from './config.js';
import { tr } from './i18n.js';
export function fmtTime(s) { const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
export function renderCard({ title, line1, line2, line3, url }) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, '#1B1F3B'); g.addColorStop(0.55, '#7A1E1E'); g.addColorStop(1, '#D9A441'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
  x.save(); x.translate(540, 760); for (let i = 0; i < 7; i++) { x.strokeStyle = `rgba(244,201,93,${0.5 - i * 0.06})`; x.lineWidth = 4; x.setLineDash([30, 20]); x.beginPath(); x.ellipse(0, 0, 120 + i * 65, (120 + i * 65) * 0.45, 0, 0, Math.PI * 2); x.stroke(); } x.restore();
  x.fillStyle = 'rgba(255,140,60,0.9)'; x.beginPath(); x.arc(540, 420, 110, 0, Math.PI * 2); x.fill();
  x.textAlign = 'center'; x.fillStyle = PALETTE.bone; x.font = 'bold 44px "Rozha One", "Mukta", serif'; x.fillText('चक्रव्यूह', 540, 120); x.font = '28px serif'; x.fillStyle = PALETTE.gold; x.fillText('Rewriting the Epic', 540, 165);
  x.font = 'bold 64px "Rozha One", "Mukta", serif'; x.fillStyle = '#fff'; x.fillText(title, 540, 980);
  x.font = '38px "Mukta", sans-serif'; x.fillStyle = PALETTE.bone; x.fillText(line1, 540, 1060); x.fillText(line2, 540, 1115); x.fillStyle = PALETTE.gold; x.font = '32px serif'; x.fillText(line3, 540, 1180);
  x.font = '26px monospace'; x.fillStyle = 'rgba(255,255,255,0.8)'; x.fillText(url.replace(/^https?:\/\//, ''), 540, 1290);
  return c;
}
export async function shareCard(canvas, text, url) {
  text = tr(text);
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = blob ? new File([blob], 'chakravyooh.png', { type: 'image/png' }) : null;
  if (navigator.share && file && navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text, url }); return 'shared'; } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; } }
  if (navigator.share) { try { await navigator.share({ text: text + ' ' + url }); return 'shared'; } catch (e) { } }
  window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener'); return 'wa';
}
export function downloadCard(canvas) { const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'chakravyooh.png'; a.click(); }
export function whatsappLink(text) { return 'https://wa.me/?text=' + encodeURIComponent(tr(text)); }
