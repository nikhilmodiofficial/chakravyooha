// Input: keyboard (WASD/arrows + J K L Space U) and touch (virtual stick + buttons). Produces a frame "intent".
export class Input {
  constructor(canvas) {
    this.canvas = canvas; this.keys = new Set(); this.mouse = { x: 0, y: 0, active: false, t: 0 };
    this.touch = { stick: null, stickId: null, buttons: {} };
    this.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    this.pressed = new Set(); // edge-triggered this frame
    this._bind();
  }
  _bind() {
    window.addEventListener('keydown', e => { if (e.repeat) return; const k = this._norm(e.key); this.keys.add(k); this.pressed.add(k); if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault(); });
    window.addEventListener('keyup', e => this.keys.delete(this._norm(e.key)));
    window.addEventListener('blur', () => this.keys.clear());
    this.canvas.addEventListener('mousemove', e => { const r = this.canvas.getBoundingClientRect(); this.mouse.x = (e.clientX - r.left) / r.width; this.mouse.y = (e.clientY - r.top) / r.height; this.mouse.active = true; this.mouse.t = performance.now(); });
    this.canvas.addEventListener('mousedown', e => { if (e.button === 0) { this.keys.add('mouse0'); this.pressed.add('mouse0'); } if (e.button === 2) { this.keys.add('mouse2'); this.pressed.add('mouse2'); } });
    window.addEventListener('mouseup', e => { if (e.button === 0) this.keys.delete('mouse0'); if (e.button === 2) this.keys.delete('mouse2'); });
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    // touch stick on canvas (left 45%)
    const ts = e => { for (const t of e.changedTouches) { const r = this.canvas.getBoundingClientRect(); const x = t.clientX - r.left, y = t.clientY - r.top; if (x < r.width * 0.5 && this.touch.stickId === null) { this.touch.stickId = t.identifier; this.touch.stick = { ox: x, oy: y, x, y }; } } e.preventDefault(); };
    const tm = e => { for (const t of e.changedTouches) if (t.identifier === this.touch.stickId) { const r = this.canvas.getBoundingClientRect(); this.touch.stick.x = t.clientX - r.left; this.touch.stick.y = t.clientY - r.top; } e.preventDefault(); };
    const te = e => { for (const t of e.changedTouches) if (t.identifier === this.touch.stickId) { this.touch.stickId = null; this.touch.stick = null; } };
    this.canvas.addEventListener('touchstart', ts, { passive: false }); this.canvas.addEventListener('touchmove', tm, { passive: false });
    this.canvas.addEventListener('touchend', te); this.canvas.addEventListener('touchcancel', te);
  }
  bindButton(el, name) {
    const down = e => { e.preventDefault(); this.touch.buttons[name] = true; this.pressed.add('btn_' + name); el.classList.add('down'); };
    const up = e => { e.preventDefault(); this.touch.buttons[name] = false; el.classList.remove('down'); };
    el.addEventListener('touchstart', down, { passive: false }); el.addEventListener('touchend', up); el.addEventListener('touchcancel', up);
    el.addEventListener('mousedown', down); el.addEventListener('mouseup', up); el.addEventListener('mouseleave', up);
  }
  _norm(k) { return k.length === 1 ? k.toLowerCase() : k.toLowerCase(); }
  held(k) { return this.keys.has(k); }
  btn(n) { return !!this.touch.buttons[n]; }
  // intent for one frame
  read() {
    let mx = 0, my = 0;
    if (this.held('a') || this.held('arrowleft')) mx -= 1; if (this.held('d') || this.held('arrowright')) mx += 1;
    if (this.held('w') || this.held('arrowup')) my -= 1; if (this.held('s') || this.held('arrowdown')) my += 1;
    if (this.touch.stick) { const dx = this.touch.stick.x - this.touch.stick.ox, dy = this.touch.stick.y - this.touch.stick.oy, d = Math.hypot(dx, dy); if (d > 8) { const m = Math.min(1, d / 60); mx = dx / d * m; my = dy / d * m; } }
    const l = Math.hypot(mx, my); if (l > 1) { mx /= l; my /= l; }
    const intent = {
      mx, my,
      sword: this.pressed.has('j') || this.pressed.has('mouse0') || this.pressed.has('btn_sword'),
      bowHeld: this.held('k') || this.held('mouse2') || this.btn('bow'),
      bowPressed: this.pressed.has('k') || this.pressed.has('mouse2') || this.pressed.has('btn_bow'),
      gada: this.pressed.has('l') || this.pressed.has('btn_gada'),
      dodge: this.pressed.has(' ') || this.pressed.has('shift') || this.pressed.has('btn_dodge'),
      astra: this.pressed.has('u') || this.pressed.has('btn_astra'),
      pause: this.pressed.has('escape') || this.pressed.has('p'),
      any: this.pressed.size > 0,
      mouseFresh: this.mouse.active && (performance.now() - this.mouse.t < 2500) && !this.isTouch
    };
    this.pressed.clear(); return intent;
  }
}
