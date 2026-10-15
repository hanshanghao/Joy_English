/* ==========================================================================
   JOY ENGLISH · FLOATING TEACHING TOOLS
   Geometry Box  ·  Dice (1 or 2)  ·  Timer
   --------------------------------------------------------------------------
   HOW TO USE IN ANY LESSON PAGE
   Add ONE line anywhere before </body>:

       <script src="https://hanshanghao.github.io/Joy_English/teaching-tools.js" defer></script>

   (If the lesson lives in the repo root you can simply use src="teaching-tools.js".)

   It auto-injects a floating 🧰 button in the bottom-right corner. The button
   gently dims to ~28% opacity after 3 seconds of no interaction, then wakes
   on hover / tap / click — it is NEVER hidden. Opening the panel keeps it lit.

   No external assets: dice and shapes are CSS, the timer chime is generated
   in-browser with the Web Audio API, so it works fully offline.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__joyTeachingTools) return;   // inject only once per page
  window.__joyTeachingTools = true;

  /* ======================= STYLES ======================= */
  var css = `
  #tt-root, #tt-root *{box-sizing:border-box}
  #tt-launch{
    position:fixed; right:18px; bottom:18px; z-index:9998;
    width:58px; height:58px; border-radius:50%; border:0; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:26px; color:#fff;
    background:linear-gradient(140deg,#7c5cff,#ff2d95 72%);
    box-shadow:0 14px 30px rgba(124,92,255,.45),inset 0 1px 0 rgba(255,255,255,.55);
    transition:opacity .45s ease, transform .3s cubic-bezier(.16,1,.3,1);
    -webkit-tap-highlight-color:transparent; touch-action:manipulation;
  }
  #tt-launch:hover{transform:translateY(-3px) scale(1.06)}
  #tt-launch.tt-dim{opacity:.28}
  #tt-launch.tt-open{background:linear-gradient(140deg,#ff2d95,#7c5cff)}
  #tt-launch .tt-dot{
    position:absolute; top:-1px; right:-1px; width:15px; height:15px; border-radius:50%;
    background:#2ee6a6; box-shadow:0 0 10px #2ee6a6; border:2px solid #fff;
  }
  #tt-launch .tt-lbl{
    position:absolute; right:66px; white-space:nowrap; font:700 12px/1 "Space Grotesk",system-ui,sans-serif;
    color:#fff; background:rgba(44,35,86,.9); padding:7px 10px; border-radius:10px;
    opacity:0; transform:translateX(6px); pointer-events:none; transition:.25s;
  }
  #tt-launch:hover .tt-lbl{opacity:1; transform:none}

  #tt-panel{
    position:fixed; right:18px; bottom:88px; z-index:9999;
    width:min(370px, calc(100vw - 24px));
    max-height:min(80vh, 660px);
    display:none; flex-direction:column; overflow:hidden;
    border-radius:22px;
    font-family:"Space Grotesk",system-ui,-apple-system,"Segoe UI",sans-serif; color:#2c2356;
    background:rgba(255,255,255,.94);
    backdrop-filter:blur(22px) saturate(170%); -webkit-backdrop-filter:blur(22px) saturate(170%);
    border:1.5px solid rgba(255,255,255,.95);
    box-shadow:0 30px 70px rgba(90,60,170,.34);
  }
  #tt-panel.tt-show{display:flex; animation:ttPop .3s cubic-bezier(.16,1,.3,1)}
  @keyframes ttPop{from{opacity:0; transform:translateY(16px) scale(.95)} to{opacity:1; transform:none}}

  #tt-panel .tt-head{
    display:flex; align-items:center; gap:10px; padding:13px 14px 12px 16px;
    background:linear-gradient(120deg,#7c5cff,#ff2d95); color:#fff;
  }
  #tt-panel .tt-head b{font-family:"Baloo 2",cursive,sans-serif; font-size:16.5px; font-weight:800; letter-spacing:.2px}
  #tt-panel .tt-head .tt-x{
    margin-left:auto; width:30px; height:30px; border-radius:50%; border:0; cursor:pointer;
    background:rgba(255,255,255,.24); color:#fff; font-size:16px; font-weight:800; line-height:1;
  }
  #tt-panel .tt-head .tt-x:hover{background:rgba(255,255,255,.42)}

  #tt-panel .tt-tabs{display:flex; gap:6px; padding:10px 12px 0}
  #tt-panel .tt-tab{
    flex:1; border:1.5px solid rgba(124,92,255,.22); background:rgba(255,255,255,.7);
    color:#5b5393; border-radius:12px; padding:8px 4px; cursor:pointer;
    font:700 12.5px/1 inherit; transition:.2s;
  }
  #tt-panel .tt-tab:hover{border-color:#ff7ac6; color:#ff2d95}
  #tt-panel .tt-tab.tt-on{background:linear-gradient(100deg,#ff7ac6,#a05cff); color:#fff; border-color:transparent; box-shadow:0 8px 18px rgba(160,92,255,.35)}

  #tt-panel .tt-body{padding:14px; overflow:auto}
  #tt-panel .tt-sec{display:none}
  #tt-panel .tt-sec.tt-on{display:block; animation:ttFade .3s ease}
  @keyframes ttFade{from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none}}

  #tt-panel .tt-hint{font-size:12px; color:#7a73b3; font-weight:600; margin:0 0 10px}

  /* ---- geometry box ---- */
  .tt-shapebar{display:flex; flex-wrap:wrap; gap:7px; margin-bottom:10px}
  .tt-shapebtn{
    width:38px; height:38px; border-radius:11px; border:1.5px solid rgba(124,92,255,.25);
    background:rgba(255,255,255,.85); cursor:pointer; font-size:18px; line-height:1; color:#463b86;
    display:grid; place-items:center; transition:.2s;
  }
  .tt-shapebtn:hover{transform:translateY(-2px); border-color:#ff7ac6; color:#ff2d95; box-shadow:0 8px 16px rgba(255,120,198,.28)}
  .tt-stage{
    position:relative; width:100%; height:250px; border-radius:16px; overflow:hidden;
    border:1.5px dashed rgba(124,92,255,.35); touch-action:none;
    background:
      linear-gradient(rgba(124,92,255,.08) 1px,transparent 1px),
      linear-gradient(90deg,rgba(124,92,255,.08) 1px,transparent 1px),
      rgba(255,255,255,.6);
    background-size:32px 32px;
  }
  .tt-shape{position:absolute; cursor:grab; touch-action:none; filter:drop-shadow(0 6px 10px rgba(90,60,170,.22))}
  .tt-shape:active{cursor:grabbing}
  .tt-s-circle{border-radius:50%}
  .tt-s-square{border-radius:6px}
  .tt-s-rect{border-radius:6px}
  .tt-s-triangle{clip-path:polygon(50% 0,100% 100%,0 100%)}
  .tt-s-diamond{border-radius:6px; transform:rotate(45deg)}
  .tt-s-star{clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
  .tt-s-heart{clip-path:polygon(50% 100%,0 45%,0 24%,15% 7%,33% 7%,50% 24%,67% 7%,85% 7%,100% 24%,100% 45%)}
  .tt-row{display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:12px}
  .tt-btn{
    border:0; cursor:pointer; border-radius:12px; padding:10px 15px; color:#fff;
    font:800 13px/1 inherit; background:linear-gradient(100deg,#7c5cff,#a05cff);
    box-shadow:0 10px 20px rgba(124,92,255,.34); transition:transform .2s;
  }
  .tt-btn:hover{transform:translateY(-2px)}
  .tt-btn.tt-ghost{background:rgba(255,255,255,.85); color:#463b86; border:1.5px solid rgba(124,92,255,.25); box-shadow:none}
  .tt-btn.tt-pink{background:linear-gradient(100deg,#ff7ac6,#ff2d95)}

  /* ---- dice ---- */
  .tt-dice-row{display:flex; gap:16px; justify-content:center; align-items:center; min-height:104px; margin:8px 0 6px}
  .tt-die{
    width:88px; height:88px; border-radius:18px; background:#fff; border:3px solid #7c5cff;
    display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr);
    gap:5px; padding:11px; box-shadow:0 12px 24px rgba(90,60,170,.24);
    transition:transform .2s;
  }
  .tt-die.tt-rolling{animation:ttRoll .45s ease-in-out}
  @keyframes ttRoll{0%{transform:rotate(0) scale(1)}40%{transform:rotate(-18deg) scale(1.12)}75%{transform:rotate(14deg) scale(.96)}100%{transform:rotate(0) scale(1)}}
  .tt-die i{display:block; border-radius:50%; background:transparent}
  .tt-die i.on{background:#2b2160; box-shadow:inset 0 -2px 3px rgba(255,255,255,.4)}
  .tt-total{text-align:center; font-family:"Baloo 2",cursive,sans-serif; font-weight:800; font-size:26px; color:#7c5cff; min-height:32px}
  .tt-seg{display:inline-flex; border:1.5px solid rgba(124,92,255,.25); border-radius:999px; overflow:hidden}
  .tt-seg button{border:0; background:#fff; color:#5b5393; cursor:pointer; padding:8px 16px; font:800 13px/1 inherit}
  .tt-seg button.tt-on{background:linear-gradient(100deg,#ff7ac6,#a05cff); color:#fff}

  /* ---- timer ---- */
  .tt-clock{
    text-align:center; font-family:"JetBrains Mono",ui-monospace,monospace; font-weight:700;
    font-size:52px; letter-spacing:2px; color:#2b2160; margin:6px 0 4px; font-variant-numeric:tabular-nums;
  }
  .tt-clock.tt-warn{color:#ff2d95}
  .tt-clock.tt-done{color:#ff2d95; animation:ttBlink .6s steps(1) infinite}
  @keyframes ttBlink{50%{opacity:.25}}
  #tt-panel .tt-presets{display:flex; gap:7px; justify-content:center; flex-wrap:wrap; margin:10px 0}
  #tt-panel .tt-preset{border:1.5px solid rgba(124,92,255,.25); background:rgba(255,255,255,.8); color:#5b5393;
    border-radius:999px; padding:7px 14px; cursor:pointer; font:800 12.5px/1 inherit}
  #tt-panel .tt-preset:hover{border-color:#ff7ac6; color:#ff2d95}

  @media (max-width:520px){
    #tt-launch{width:52px;height:52px;font-size:23px;right:12px;bottom:12px}
    #tt-panel{right:12px;bottom:74px}
  }
  `;
  var styleEl = document.createElement("style");
  styleEl.id = "tt-style";
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ======================= MARKUP ======================= */
  var root = document.createElement("div");
  root.id = "tt-root";
  root.innerHTML = `
    <button id="tt-launch" type="button" aria-label="Teaching tools" title="Teaching tools">
      <span aria-hidden="true">🧰</span><span class="tt-dot" aria-hidden="true"></span>
      <span class="tt-lbl">Teaching tools</span>
    </button>

    <div id="tt-panel" role="dialog" aria-label="Teaching tools panel" aria-hidden="true">
      <div class="tt-head"><span aria-hidden="true">🧰</span><b>Teaching Tools</b>
        <button class="tt-x" type="button" aria-label="Close tools">✕</button></div>

      <div class="tt-tabs">
        <button class="tt-tab tt-on" data-tt="geo" type="button">📐 Geometry</button>
        <button class="tt-tab" data-tt="dice" type="button">🎲 Dice</button>
        <button class="tt-tab" data-tt="timer" type="button">⏱️ Timer</button>
      </div>

      <div class="tt-body">
        <!-- geometry box -->
        <div class="tt-sec tt-on" data-sec="geo">
          <p class="tt-hint">Tap a shape to drop it on the board, then drag it anywhere.</p>
          <div class="tt-shapebar" id="tt-shapebar"></div>
          <div class="tt-stage" id="tt-stage"></div>
          <div class="tt-row">
            <button class="tt-btn tt-ghost" id="tt-undo" type="button">↩ Undo</button>
            <button class="tt-btn tt-pink" id="tt-clear" type="button">🧹 Clear board</button>
          </div>
        </div>

        <!-- dice -->
        <div class="tt-sec" data-sec="dice">
          <p class="tt-hint">Choose one or two dice, then roll. Great for counting and number talk.</p>
          <div class="tt-seg" id="tt-seg" role="group" aria-label="Number of dice">
            <button data-n="1" class="tt-on" type="button">1 die</button>
            <button data-n="2" type="button">2 dice</button>
          </div>
          <div class="tt-dice-row" id="tt-dice-row"></div>
          <div class="tt-total" id="tt-total"></div>
          <div class="tt-row" style="justify-content:center">
            <button class="tt-btn" id="tt-roll" type="button">🎲 Roll</button>
          </div>
        </div>

        <!-- timer -->
        <div class="tt-sec" data-sec="timer">
          <p class="tt-hint">Pick a quick preset or set your own, then start the countdown.</p>
          <div class="tt-clock" id="tt-clock">01:00</div>
          <div class="tt-presets" id="tt-presets"></div>
          <div class="tt-row" style="justify-content:center">
            <button class="tt-btn" id="tt-start" type="button">▶ Start</button>
            <button class="tt-btn tt-ghost" id="tt-reset" type="button">↺ Reset</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  /* ======================= ELEMENTS ======================= */
  var $ = function (s, c) { return (c || root).querySelector(s); };
  var launch = $("#tt-launch", root);
  var panel = $("#tt-panel", root);

  /* ======================= AUTO-DIM (never hides) ======================= */
  var dimTimer = null;
  function bright() { launch.classList.remove("tt-dim"); }
  function scheduleDim() {
    clearTimeout(dimTimer);
    dimTimer = setTimeout(function () {
      if (!panel.classList.contains("tt-show")) launch.classList.add("tt-dim");
    }, 3000);
  }
  function wake() { bright(); scheduleDim(); }

  ["pointerenter", "touchstart", "focus", "mousemove"].forEach(function (ev) {
    launch.addEventListener(ev, wake, { passive: true });
  });
  launch.addEventListener("mouseleave", scheduleDim);
  scheduleDim();

  /* ======================= OPEN / CLOSE + TABS ======================= */
  function openPanel() {
    panel.classList.add("tt-show");
    panel.setAttribute("aria-hidden", "false");
    launch.classList.add("tt-open");
    bright();
    clearTimeout(dimTimer);
    var x = $(".tt-x", panel); if (x) x.focus();
  }
  function closePanel() {
    panel.classList.remove("tt-show");
    panel.setAttribute("aria-hidden", "true");
    launch.classList.remove("tt-open");
    scheduleDim();
  }
  launch.addEventListener("click", function (e) {
    e.stopPropagation();
    if (panel.classList.contains("tt-show")) closePanel(); else openPanel();
  });
  $(".tt-x", panel).addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("tt-show")) closePanel();
  });

  panel.querySelectorAll(".tt-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-tt");
      panel.querySelectorAll(".tt-tab").forEach(function (t) { t.classList.toggle("tt-on", t === tab); });
      panel.querySelectorAll(".tt-sec").forEach(function (s) { s.classList.toggle("tt-on", s.getAttribute("data-sec") === key); });
    });
  });

  /* ======================= GEOMETRY BOX ======================= */
  var SHAPES = [
    { id: "circle", label: "●", cls: "tt-s-circle", w: 56, h: 56 },
    { id: "square", label: "■", cls: "tt-s-square", w: 56, h: 56 },
    { id: "rect", label: "▬", cls: "tt-s-rect", w: 88, h: 48 },
    { id: "triangle", label: "▲", cls: "tt-s-triangle", w: 60, h: 54 },
    { id: "diamond", label: "◆", cls: "tt-s-diamond", w: 50, h: 50 },
    { id: "star", label: "★", cls: "tt-s-star", w: 60, h: 60 },
    { id: "heart", label: "♥", cls: "tt-s-heart", w: 58, h: 54 }
  ];
  var COLORS = ["#ff6b00", "#ff2d95", "#7c5cff", "#00b8d4", "#2ee6a6", "#ffb703"];
  var colorI = 0;
  var stage = $("#tt-stage", root);
  var bar = $("#tt-shapebar", root);

  SHAPES.forEach(function (s) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tt-shapebtn";
    b.textContent = s.label;
    b.title = s.id;
    b.addEventListener("click", function () { addShape(s); });
    bar.appendChild(b);
  });

  function addShape(def) {
    var el = document.createElement("div");
    el.className = "tt-shape " + def.cls;
    el.style.width = def.w + "px";
    el.style.height = def.h + "px";
    el.style.background = COLORS[colorI++ % COLORS.length];
    var maxX = Math.max(0, stage.clientWidth - def.w);
    var maxY = Math.max(0, stage.clientHeight - def.h);
    el.style.left = Math.round(Math.random() * maxX) + "px";
    el.style.top = Math.round(Math.random() * maxY) + "px";
    makeDraggable(el);
    stage.appendChild(el);
  }

  function makeDraggable(el) {
    var sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    el.addEventListener("pointerdown", function (e) {
      dragging = true; el.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.left) || 0; oy = parseFloat(el.style.top) || 0;
      el.style.cursor = "grabbing";
      e.preventDefault();
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var nx = ox + (e.clientX - sx);
      var ny = oy + (e.clientY - sy);
      nx = Math.max(0, Math.min(stage.clientWidth - el.offsetWidth, nx));
      ny = Math.max(0, Math.min(stage.clientHeight - el.offsetHeight, ny));
      el.style.left = nx + "px";
      el.style.top = ny + "px";
    });
    function end(e) {
      dragging = false; el.style.cursor = "grab";
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  $("#tt-undo", root).addEventListener("click", function () {
    if (stage.lastElementChild) stage.removeChild(stage.lastElementChild);
  });
  $("#tt-clear", root).addEventListener("click", function () { stage.innerHTML = ""; });

  /* ======================= DICE ======================= */
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  var diceCount = 1, rolling = false;
  var diceRow = $("#tt-dice-row", root);
  var totalEl = $("#tt-total", root);

  function makeDie() {
    var d = document.createElement("div");
    d.className = "tt-die";
    for (var i = 0; i < 9; i++) d.appendChild(document.createElement("i"));
    return d;
  }
  function paintDie(die, value) {
    var on = PIPS[value] || [];
    var cells = die.children;
    for (var i = 0; i < cells.length; i++) cells[i].classList.toggle("on", on.indexOf(i) > -1);
    die.setAttribute("data-value", value);
  }
  function buildDice() {
    diceRow.innerHTML = "";
    for (var i = 0; i < diceCount; i++) { var d = makeDie(); paintDie(d, 1 + Math.floor(Math.random() * 6)); diceRow.appendChild(d); }
    updateTotal();
  }
  function updateTotal() {
    if (diceCount < 2) { totalEl.textContent = ""; return; }
    var t = 0, ds = diceRow.children;
    for (var i = 0; i < ds.length; i++) t += parseInt(ds[i].getAttribute("data-value"), 10) || 0;
    totalEl.textContent = "Total: " + t;
  }
  $("#tt-seg", root).addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diceCount = parseInt(b.getAttribute("data-n"), 10);
    $("#tt-seg", root).querySelectorAll("button").forEach(function (x) { x.classList.toggle("tt-on", x === b); });
    buildDice();
  });
  $("#tt-roll", root).addEventListener("click", function () {
    if (rolling) return;
    rolling = true;
    var ds = diceRow.children, n = 0;
    for (var i = 0; i < ds.length; i++) { ds[i].classList.remove("tt-rolling"); void ds[i].offsetWidth; ds[i].classList.add("tt-rolling"); }
    var iv = setInterval(function () {
      for (var i = 0; i < ds.length; i++) paintDie(ds[i], 1 + Math.floor(Math.random() * 6));
      if (++n >= 8) {
        clearInterval(iv);
        for (var j = 0; j < ds.length; j++) paintDie(ds[j], 1 + Math.floor(Math.random() * 6));
        updateTotal(); rolling = false;
      }
    }, 70);
  });
  buildDice();

  /* ======================= TIMER ======================= */
  var clock = $("#tt-clock", root);
  var startBtn = $("#tt-start", root);
  var totalMs = 60 * 1000, remainMs = totalMs, tick = null, running = false, endAt = 0;
  var PRESETS = [1, 3, 5, 10];
  var presetBox = $("#tt-presets", root);

  PRESETS.forEach(function (m) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tt-preset"; b.textContent = m + " min";
    b.addEventListener("click", function () { setTime(m * 60 * 1000); });
    presetBox.appendChild(b);
  });

  function fmt(ms) {
    if (ms < 0) ms = 0;
    var s = Math.ceil(ms / 1000);
    var m = Math.floor(s / 60); s = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function paintClock() {
    clock.textContent = fmt(remainMs);
    clock.classList.toggle("tt-warn", remainMs <= 10000 && remainMs > 0 && running);
    clock.classList.toggle("tt-done", remainMs <= 0);
  }
  function setTime(ms) {
    stopTimer();
    totalMs = ms; remainMs = ms; running = false;
    startBtn.textContent = "▶ Start";
    clock.classList.remove("tt-done");
    paintClock();
  }
  function stopTimer() { if (tick) { clearInterval(tick); tick = null; } }
  function startTimer() {
    if (running) return;
    if (remainMs <= 0) remainMs = totalMs;
    running = true; endAt = Date.now() + remainMs;
    startBtn.textContent = "⏸ Pause";
    tick = setInterval(function () {
      remainMs = endAt - Date.now();
      if (remainMs <= 0) { remainMs = 0; paintClock(); finish(); return; }
      paintClock();
    }, 200);
  }
  function finish() {
    stopTimer(); running = false; startBtn.textContent = "▶ Start";
    clock.textContent = fmt(0); clock.classList.add("tt-done");
    chime();
    launch.classList.remove("tt-dim"); scheduleDim();
  }
  function toggleTimer() { if (running) { stopTimer(); running = false; remainMs = endAt - Date.now(); startBtn.textContent = "▶ Start"; paintClock(); } else { startTimer(); } }

  startBtn.addEventListener("click", toggleTimer);
  $("#tt-reset", root).addEventListener("click", function () { setTime(totalMs); });
  setTime(totalMs);

  /* ---- chime (Web Audio, no assets) ---- */
  var actx = null;
  function chime() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      actx = actx || new AC();
      if (actx.state === "suspended" && actx.resume) actx.resume();
      for (var i = 0; i < 3; i++) {
        (function (i) {
          var t = actx.currentTime + i * 0.28;
          var o = actx.createOscillator(), g = actx.createGain();
          o.type = "sine"; o.frequency.value = i === 2 ? 1180 : 880;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
          o.connect(g); g.connect(actx.destination);
          o.start(t); o.stop(t + 0.26);
        })(i);
      }
    } catch (e) {}
  }
})();
