(function () {
  'use strict';

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const shuffle = (items) => {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const icon = (name) => `<svg class="ico" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        return false;
      }
      return true;
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        return false;
      }
      return true;
    }
  };

  const KEYS = {
    teams: 'tj5u13-teams',
    sound: 'tj5u13-sound',
    rate: 'tj5u13-rate',
    voice: 'tj5u13-voice',
    voiceStyle: 'tj5u13-voice-style',
    textbook: 'tj5u13-textbook',
    answers: 'tj5u13-answers',
    motion: 'tj5u13-motion',
    practice: 'tj5u13-practice',
    bank: 'tj5u13-puzzle-bank',
    studentMax: 'tj5u13-student-max'
  };

  const TEAM_COLOURS = ['#7c5cff', '#ff4fb0', '#ffc93c', '#00b8d4'];
  const TAB_NAMES = ['Lesson Plan', 'Dialogue', 'Vocabulary', 'Patterns', 'Listen, Look & Say', 'Listen, Point & Say', 'Puzzles & Write', 'Games', 'Review Quiz'];

  const VOCAB = [
    { word: 'bored', ipa: '/bɔːd/', tag: 'Feeling', tagClass: '', example: 'The giant is bored. He has nothing to do.', alt: 'A bored child at a desk' },
    { word: 'excited', ipa: '/ɪkˈsaɪtɪd/', tag: 'Feeling', tagClass: '', example: 'The girl is excited about the party.', alt: 'An excited child celebrating' },
    { word: 'poor', ipa: '/pʊə/', tag: 'Money', tagClass: 'money', example: 'The boy is poor. He has no money.', alt: 'A poor person with an empty wallet' },
    { word: 'rich', ipa: '/rɪtʃ/', tag: 'Money', tagClass: 'money', example: 'The man is rich. He has lots of gold.', alt: 'A rich person with gold coins' }
  ];

  const ART_PATHS = {
    illustrated: (item) => `assets/img/svg/vocab-${item.word}.svg`,
    photo: (item) => `assets/img/photos/photo-${item.word}.jpg`,
    textbook: (item) => `assets/reference/vocab-${item.word}-textbook.jpg`
  };
  const ART_LABELS = { illustrated: 'Illustrated', photo: 'Licensed photo', textbook: 'Textbook · private' };

  const DIALOGUE = [
    { spk: 'giant', name: 'Giant', line: "I'm bored. Give me my magic hen!", img: 'assets/img/svg/char-giant.svg', gender: 'male', rate: 0.92, group: 'Group A' },
    { spk: 'giantess', name: 'Giantess', line: 'Here you are.', img: 'assets/img/svg/char-giantess.svg', gender: 'female', rate: 0.98, group: 'Group B' },
    { spk: 'jack', name: 'Jack', line: "That's my father's magic hen!", img: 'assets/img/svg/char-jack.svg', gender: 'male', rate: 1.02, group: 'Group C' },
    { spk: 'friend', name: 'Friend', line: 'What can it do?', img: 'assets/img/svg/char-friend.svg', gender: 'female', rate: 1, group: 'Group D' },
    { spk: 'hen', name: 'Magic Hen', line: 'It can lay golden eggs.', img: 'assets/img/svg/magic-hen.svg', gender: 'female', rate: 1.04, group: 'Whole class' }
  ];

  const OPPOSITES = { bored: 'excited', excited: 'bored', poor: 'rich', rich: 'poor' };

  const LOOK_SCENES = {
    bored: { caption: 'I am bored.', badge: 'I am bored.', alt: 'A bored boy sitting at a desk with nothing to do.' },
    excited: { caption: 'I am excited.', badge: 'I am excited.', alt: 'A girl jumping with excitement.' },
    poor: { caption: 'He is poor.', badge: 'He is poor.', alt: 'A poor boy showing empty pockets.' },
    rich: { caption: 'She is rich.', badge: 'She is rich.', alt: 'A rich woman beside a chest of gold.' }
  };

  const EXTRA_SENTENCES = ['I am excited.', 'He is rich.', 'She is poor.', 'He is bored.', 'She is excited.', 'I am poor.'];

  const DEFAULT_BANK = [
    { sentence: 'I am bored.', clue: 'You have nothing to do. Make a sentence with "I" and "bored".' },
    { sentence: 'I am excited.', clue: 'You are going to a theme park. Make a sentence with "I" and "excited".' },
    { sentence: 'He is poor.', clue: 'The boy has no money. Make a sentence with "He" and "poor".' },
    { sentence: 'She is rich.', clue: 'The woman has a big house and a gold car. Make a sentence with "She" and "rich".' },
    { sentence: 'He is bored.', clue: 'The giant has nothing to do. Make a sentence with "He" and "bored".' },
    { sentence: 'She is excited.', clue: 'The girl is going to a party. Make a sentence with "She" and "excited".' },
    { sentence: 'He is rich.', clue: 'The man has lots of gold coins. Make a sentence with "He" and "rich".' },
    { sentence: 'She is poor.', clue: 'The girl has no money for new clothes. Make a sentence with "She" and "poor".' },
    { sentence: 'I am poor.', clue: 'You have an empty pocket. Make a sentence with "I" and "poor".' },
    { sentence: 'I am rich.', clue: 'You have a chest of gold. Make a sentence with "I" and "rich".' },
    { sentence: 'He is excited.', clue: 'The boy is watching his favourite team. Make a sentence with "He" and "excited".' },
    { sentence: 'She is bored.', clue: 'The girl has nothing to do on a rainy day. Make a sentence with "She" and "bored".' }
  ];

  const QUIZ = [
    { q: 'Which word means you have nothing to do?', options: ['bored', 'excited', 'rich', 'poor'], answer: 'bored' },
    { q: 'Which word is the opposite of bored?', options: ['excited', 'poor', 'rich', 'bored'], answer: 'excited' },
    { q: 'Which word means having a lot of money?', options: ['rich', 'poor', 'bored', 'excited'], answer: 'rich' },
    { q: 'Which word is the opposite of rich?', options: ['poor', 'excited', 'bored', 'rich'], answer: 'poor' },
    { q: 'Choose the correct sentence.', options: ['I am bored.', 'I is bored.', 'I are bored.', 'I be bored.'], answer: 'I am bored.' },
    { q: 'Choose the correct sentence.', options: ['He is poor.', 'He am poor.', 'He are poor.', 'He be poor.'], answer: 'He is poor.' },
    { q: 'Choose the correct sentence.', options: ['She is rich.', 'She am rich.', 'She are rich.', 'She be rich.'], answer: 'She is rich.' },
    { q: "Complete the giant's line: 'I'm bored. Give me my ___!'", options: ['magic hen', 'golden egg', 'crown', 'cake'], answer: 'magic hen' },
    { q: 'What can the magic hen do?', options: ['It can lay golden eggs.', 'It can fly to the moon.', 'It can cook cake.', 'It can sing a song.'], answer: 'It can lay golden eggs.' },
    { q: "Who says: 'That's my father's magic hen!'?", options: ['Jack', 'The giant', 'The giantess', 'The friend'], answer: 'Jack' },
    { q: 'Complete the sentence: She ___ excited.', options: ['is', 'am', 'are', 'be'], answer: 'is' },
    { q: 'Which word rhymes with tour?', options: ['poor', 'bored', 'rich', 'excited'], answer: 'poor' }
  ];

  const savedTeams = store.get(KEYS.teams, null);
  const savedPractice = store.get(KEYS.practice, {});
  const savedBank = store.get(KEYS.bank, null);

  const state = {
    tab: 0,
    sound: store.get(KEYS.sound, true) !== false,
    rate: clamp(Number(store.get(KEYS.rate, 0.9)) || 0.9, 0.6, 1.15),
    voiceURI: store.get(KEYS.voice, 'auto') || 'auto',
    voiceStyle: store.get(KEYS.voiceStyle, 'female') === 'male' ? 'male' : 'female',
    textbook: store.get(KEYS.textbook, false) === true,
    answers: store.get(KEYS.answers, false) === true,
    motion: store.get(KEYS.motion, false) === true,
    teams: Array.isArray(savedTeams) && savedTeams.length === 4
      ? savedTeams.map((team, index) => ({ name: String(team.name || `Team ${index + 1}`), score: Math.max(0, Number(team.score) || 0) }))
      : [0, 1, 2, 3].map((index) => ({ name: `Team ${index + 1}`, score: 0 })),
    practiced: savedPractice && typeof savedPractice === 'object' ? savedPractice : {},
    hiddenWords: new Set(),
    vocabArt: 'illustrated',
    dialogueScene: 1,
    roleActive: false,
    roleIndex: -1,
    wheelBusy: false,
    wheelResult: '',
    spellWord: VOCAB[Math.floor(Math.random() * VOCAB.length)].word,
    oppSelected: null,
    machineHistory: [],
    flip: { subject: 'He', adjective: 'bored', answered: false, score: 0 },
    look: { adjective: 'bored', art: 'illustrated' },
    point: { mode: 'teacher', art: 'illustrated', target: 'bored', team: 0, timeLeft: 15, total: 15, timerId: null, timerDone: false },
    puzzle: { mode: 'auto', index: 0, bank: [], current: null, slots: [], tiles: [], autoSpoken: false, solved: false },
    relay: { total: 90, left: 90, running: false, timerId: null },
    quiz: { index: 0, score: 0, answered: false, options: [] },
    story: { index: 0, complete: false, order: [] },
    memory: { cards: [], first: null, locks: false, matched: 0, turn: 0 },
    student: { max: clamp(Number(store.get(KEYS.studentMax, 30)) || 30, 1, 60), pool: [], noRepeat: true },
    timer: { total: 3000, left: 3000, running: false, timerId: null, label: 'Full lesson' }
  };

  let voices = [];
  let speechRun = 0;

  state.puzzle.bank = Array.isArray(savedBank) && savedBank.length >= 1
    ? savedBank.filter((item) => item && typeof item.sentence === 'string' && typeof item.clue === 'string' && item.sentence.trim()).map((item) => ({ sentence: item.sentence.trim(), clue: item.clue.trim() }))
    : DEFAULT_BANK.map((item) => ({ ...item }));

  function saveTeams() {
    store.set(KEYS.teams, state.teams);
  }

  function savePractice() {
    store.set(KEYS.practice, state.practiced);
  }

  function showToast(message, duration) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), duration || 2400);
  }

  function burstConfetti(count) {
    const total = count || 48;
    const colours = ['#ffc93c', '#ff4fb0', '#7c5cff', '#00b8d4', '#36b37e', '#ff8a8a'];
    for (let i = 0; i < total; i += 1) {
      const piece = document.createElement('i');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.width = `${5 + Math.random() * 7}px`;
      piece.style.height = `${8 + Math.random() * 10}px`;
      piece.style.background = colours[Math.floor(Math.random() * colours.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
      piece.style.animationDelay = `${Math.random() * 0.25}s`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3800);
    }
  }
  function voiceGender(voice) {
    const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    if (/female|woman|libby|sonia|hazel|kate|serena|emma|amelie|maisie|aria|jenny|michelle|susan|samantha|victoria|karen|moira|tessa|fiona/.test(name)) return 'female';
    if (/male|man|ryan|thomas|daniel|george|arthur|oliver|guy|brian|alex|fred|james|tom/.test(name)) return 'male';
    return '';
  }

  function isNaturalVoice(voice) {
    return /google uk english|online \(natural\)|natural|neural/i.test(`${voice.name} ${voice.voiceURI}`);
  }

  function voiceQuality(voice) {
    const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    let score = 0;
    if (/^en[-_]GB/i.test(voice.lang)) score += 100;
    if (/google uk english/.test(name)) score += 70;
    if (/online \(natural\)|natural|neural/.test(name)) score += 55;
    if (/libby|sonia|ryan|thomas|maisie|aria|guy|jenny|neerja|emily/.test(name)) score += 35;
    if (!voice.localService) score += 15;
    if (/desktop|compact/.test(name)) score -= 20;
    if (/microsoft (hazel|george|susan)|microsoft david|microsoft zira/.test(name)) score -= 15;
    return score;
  }

  function rankedVoices(pool, gender) {
    const matches = gender ? pool.filter((voice) => voiceGender(voice) === gender) : [];
    return (matches.length ? matches : pool).slice().sort((a, b) => voiceQuality(b) - voiceQuality(a));
  }

  function getVoice(options) {
    const opts = options || {};
    if (opts.voice) return opts.voice;
    if (state.voiceURI !== 'auto') {
      const selected = voices.find((voice) => voice.voiceURI === state.voiceURI);
      if (selected) return selected;
    }
    const british = voices.filter((voice) => /^en[-_]GB/i.test(voice.lang));
    const english = voices.filter((voice) => /^en[-_]/i.test(voice.lang));
    const pool = british.length ? british : english;
    if (!pool.length) return voices[0] || null;
    const gender = opts.gender || (opts.speaker && opts.speaker.gender) || state.voiceStyle;
    return rankedVoices(pool, gender)[0] || null;
  }

  function makeUtterance(text, options) {
    const opts = options || {};
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoice(opts);
    if (voice) utterance.voice = voice;
    utterance.lang = voice && voice.lang ? voice.lang : 'en-GB';
    const speakerRate = opts.speaker && opts.speaker.rate ? opts.speaker.rate : 1;
    utterance.pitch = 1;
    utterance.rate = clamp((opts.slow ? state.rate * 0.72 : state.rate) * speakerRate, 0.55, 1.25);
    utterance.volume = 1;
    return utterance;
  }

  function queueSpeech(items, done) {
    if (!('speechSynthesis' in window)) {
      showToast('This browser does not support speech. You can still use every visual activity.');
      if (done) done();
      return;
    }
    speechRun += 1;
    const run = speechRun;
    window.speechSynthesis.cancel();
    if (!state.sound || !items || !items.length) {
      if (done) done();
      return;
    }
    items.forEach((item, index) => {
      const utterance = makeUtterance(item.text, item);
      utterance.onstart = () => {
        if (run !== speechRun) return;
        if (item.onstart) item.onstart();
      };
      const finish = () => {
        if (run !== speechRun) return;
        if (item.onend) item.onend();
        if (index === items.length - 1 && done) done();
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    });
  }

  function speakText(text, options) {
    const opts = options || {};
    queueSpeech([{ text, slow: opts.slow, speaker: opts.speaker, voice: opts.voice, gender: opts.gender, onstart: opts.onstart, onend: opts.onend }], opts.onend);
  }

  function spellText(word, slow) {
    const letters = word.split('').join(', ');
    speakText(`${letters}. ${word}.`, { slow: slow !== false });
  }

  function stopSpeech() {
    speechRun += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function updateVoiceStyleUi() {
    const naturalMode = state.voiceURI === 'auto';
    $$('#voiceStylePills [data-voice-style]').forEach((button) => {
      const on = naturalMode && button.dataset.voiceStyle === state.voiceStyle;
      button.classList.toggle('on', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function updateVoiceInfo() {
    const info = $('#voiceInfo');
    if (!info) return;
    if (!('speechSynthesis' in window)) {
      info.textContent = 'This browser does not support speech synthesis.';
      return;
    }
    const chosen = getVoice();
    if (!chosen) {
      info.textContent = 'British voices are still loading. If none appear, check the browser voice settings.';
      return;
    }
    const british = /^en[-_]GB/i.test(chosen.lang) ? ' (British English)' : '';
    if (state.voiceURI !== 'auto') {
      info.textContent = `Custom voice: ${chosen.name}${british}.`;
      return;
    }
    const style = state.voiceStyle === 'male' ? 'Friendly male' : 'Friendly female';
    const actualGender = voiceGender(chosen);
    if (actualGender && actualGender !== state.voiceStyle) {
      info.textContent = `No ${state.voiceStyle} British voice is available, so this browser is using ${chosen.name}${british}.`;
      return;
    }
    info.textContent = isNaturalVoice(chosen)
      ? `${style} voice: ${chosen.name}${british}.`
      : `${style} voice: ${chosen.name}${british}. For a warmer tone, enable online voices in Chrome or Edge.`;
  }

  function setVoiceStyle(style) {
    state.voiceStyle = style === 'male' ? 'male' : 'female';
    state.voiceURI = 'auto';
    store.set(KEYS.voiceStyle, state.voiceStyle);
    store.set(KEYS.voice, 'auto');
    const select = $('#voiceSelect');
    if (select) select.value = 'auto';
    updateVoiceStyleUi();
    updateVoiceInfo();
  }

  function refreshVoices() {
    const select = $('#voiceSelect');
    if (!('speechSynthesis' in window)) {
      if (select) select.innerHTML = '<option value="auto">Speech not supported</option>';
      updateVoiceInfo();
      return;
    }
    voices = window.speechSynthesis.getVoices();
    const previous = state.voiceURI;
    const english = voices.filter((voice) => /^en[-_]/i.test(voice.lang));
    const british = english.filter((voice) => /^en[-_]GB/i.test(voice.lang));
    const list = (british.length ? british : english).slice().sort((a, b) => {
      const quality = voiceQuality(b) - voiceQuality(a);
      return quality || a.name.localeCompare(b.name);
    });
    if (select) {
      let html = '<option value="auto">Auto - best friendly British voice</option>';
      list.forEach((voice) => {
        const tags = [];
        if (/^en[-_]GB/i.test(voice.lang)) tags.push('UK');
        if (isNaturalVoice(voice)) tags.push('natural');
        html += `<option value="${esc(voice.voiceURI)}">${esc(voice.name)}${tags.length ? ` · ${tags.join(' · ')}` : ''}</option>`;
      });
      select.innerHTML = html;
      if (previous !== 'auto' && list.some((voice) => voice.voiceURI === previous)) {
        select.value = previous;
      } else {
        state.voiceURI = 'auto';
        select.value = 'auto';
      }
    }
    updateVoiceStyleUi();
    updateVoiceInfo();
  }

  function setSound(on) {
    state.sound = Boolean(on);
    store.set(KEYS.sound, state.sound);
    const soundBtn = $('#soundBtn');
    if (soundBtn) {
      soundBtn.classList.toggle('off', !state.sound);
      soundBtn.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
      soundBtn.setAttribute('aria-label', state.sound ? 'Turn sound off' : 'Turn sound on');
      const use = $('#soundIco use');
      if (use) use.setAttribute('href', state.sound ? '#i-sound-on' : '#i-sound-off');
    }
    const mini = $('#globalSoundSwitch');
    if (mini) {
      mini.classList.toggle('on', state.sound);
      mini.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
    }
    if (!state.sound) stopSpeech();
  }

  function setRate(value) {
    state.rate = clamp(Number(value) / 100, 0.6, 1.15);
    store.set(KEYS.rate, state.rate);
    const slider = $('#rateSlider');
    if (slider) slider.value = String(Math.round(state.rate * 100));
    const output = $('#rateValue');
    if (output) output.textContent = state.rate.toFixed(2);
  }

  function setTextbook(on, silent) {
    state.textbook = Boolean(on);
    store.set(KEYS.textbook, state.textbook);
    document.body.classList.toggle('textbook-mode', state.textbook);
    const stageSwitch = $('#classroomModeSwitch');
    if (stageSwitch) stageSwitch.checked = state.textbook;
    const drawerSwitch = $('#textbookSwitch');
    if (drawerSwitch) {
      drawerSwitch.classList.toggle('on', state.textbook);
      drawerSwitch.setAttribute('aria-pressed', state.textbook ? 'true' : 'false');
    }
    if (state.textbook && !silent) showToast('Private classroom artwork is on. Do not publish this mode.');
  }

  function setAnswers(on) {
    state.answers = Boolean(on);
    store.set(KEYS.answers, state.answers);
    document.body.classList.toggle('show-answers', state.answers);
    const toggle = $('#showAnswersSwitch');
    if (toggle) {
      toggle.classList.toggle('on', state.answers);
      toggle.setAttribute('aria-pressed', state.answers ? 'true' : 'false');
    }
  }

  function setMotion(on) {
    state.motion = Boolean(on);
    store.set(KEYS.motion, state.motion);
    document.body.classList.toggle('reduce-motion', state.motion);
    const toggle = $('#motionSwitch');
    if (toggle) {
      toggle.classList.toggle('on', state.motion);
      toggle.setAttribute('aria-pressed', state.motion ? 'true' : 'false');
    }
  }

  function goTab(index, scroll) {
    const target = clamp(Number(index), 0, TAB_NAMES.length - 1);
    const previous = state.tab;
    state.tab = target;
    if (previous === 5 && target !== 5) stopPointTimer();
    $$('.ntab').forEach((tab) => tab.classList.toggle('on', Number(tab.dataset.tab) === target));
    $$('.tabpan').forEach((panel) => panel.classList.toggle('on', panel.id === `tab-${target}`));
    const chip = $('#nowChip');
    if (chip) chip.textContent = TAB_NAMES[target];
    const activity = $('#drawerActivity');
    if (activity) activity.textContent = `Now: ${TAB_NAMES[target]}`;
    if (scroll !== false) window.scrollTo({ top: 0, behavior: state.motion ? 'auto' : 'smooth' });
    if (target === 6) maybePuzzleAutoSound();
    if (target === 5) updateActiveTeamBoxes();
    updateFooterNav();
  }

  function updateFooterNav() {
    const target = state.tab;
    const last = TAB_NAMES.length - 1;
    $$('[data-footer-tab]').forEach((button) => {
      const on = Number(button.dataset.footerTab) === target;
      button.classList.toggle('on', on);
      if (on) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const now = $('#endNow');
    if (now) now.textContent = `${target + 1} of ${TAB_NAMES.length} \u00b7 ${TAB_NAMES[target]}`;
    const stepLabel = $('#endStepLabel');
    if (stepLabel) stepLabel.textContent = `Section ${target + 1} of ${TAB_NAMES.length}`;
    const bar = $('#endBar');
    if (bar) bar.style.width = `${((target + 1) / TAB_NAMES.length) * 100}%`;
    const prev = $('#footPrevBtn');
    if (prev) {
      prev.disabled = target === 0;
      prev.title = target === 0 ? 'Start of lesson' : `Previous: ${TAB_NAMES[target - 1]}`;
      const label = $('#footPrevName');
      if (label) label.textContent = target === 0 ? 'Start of lesson' : TAB_NAMES[target - 1];
    }
    const next = $('#footNextBtn');
    if (next) {
      next.disabled = target === last;
      next.title = target === last ? 'End of lesson' : `Next: ${TAB_NAMES[target + 1]}`;
      const label = $('#footNextName');
      if (label) label.textContent = target === last ? 'End of lesson' : TAB_NAMES[target + 1];
    }
  }

  function updatePageChrome() {
    const progress = $('#prog');
    if (progress) {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      progress.style.width = `${max > 0 ? clamp((root.scrollTop / max) * 100, 0, 100) : 0}%`;
    }
    const fabs = $('#lessonFabs');
    if (fabs) {
      const footer = $('.lesson-end');
      const footerNear = footer ? footer.getBoundingClientRect().top < window.innerHeight * .75 : false;
      fabs.classList.toggle('show', window.scrollY > 360 && !footerNear);
    }
  }

  function buildSky() {
    const sky = $('#sky');
    if (!sky) return;
    const art = ['magic-hen.svg', 'golden-egg.svg', 'gold-coin.svg', 'gold-crown.svg', 'gold-feather.svg'];
    for (let i = 0; i < 9; i += 1) {
      const flyer = document.createElement('div');
      flyer.className = `flyer${i % 4 === 0 ? ' spin' : ''}`;
      flyer.style.setProperty('--x', `${5 + Math.random() * 88}%`);
      flyer.style.setProperty('--y', `${6 + Math.random() * 80}%`);
      flyer.style.setProperty('--w', `${22 + Math.random() * 38}px`);
      flyer.style.setProperty('--o', `${0.16 + Math.random() * 0.26}`);
      flyer.style.setProperty('--t', `${38 + Math.random() * 34}s`);
      flyer.style.setProperty('--dl', `${-Math.random() * 40}s`);
      flyer.style.setProperty('--kf', i % 3 === 0 ? 'flyAcrossR' : 'flyAcross');
      flyer.innerHTML = `<img src="assets/img/svg/${art[i % art.length]}" alt="">`;
      sky.appendChild(flyer);
    }
  }

  function openLightbox(src, caption) {
    const lightbox = $('#lightbox');
    const image = $('#lbImg');
    const cap = $('#lbCap');
    if (!lightbox || !image) return;
    image.src = src;
    image.alt = caption || 'Textbook reference';
    if (cap) cap.textContent = caption || '';
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = $('#lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
  }

  function renderScoreboards() {
    $$('.score-grid').forEach((container) => {
      container.innerHTML = state.teams.map((team, index) => `
        <div class="score-box" data-score-team="${index}">
          <div class="sb-name">${esc(team.name)}</div>
          <div class="sb-score">${team.score}</div>
          <div class="sb-btns">
            <button type="button" data-team-dec="${index}" aria-label="Remove one point from ${esc(team.name)}">&minus;</button>
            <button type="button" data-team-inc="${index}" aria-label="Add one point to ${esc(team.name)}">+</button>
          </div>
        </div>`).join('');
    });
    syncTeamSelects();
    renderDrawerTeams();
    updateActiveTeamBoxes();
  }

  function syncTeamSelects() {
    ['#pointTeamSel', '#puzzleTeamSel', '#quizTeamSel'].map((selector) => $(selector)).filter(Boolean).forEach((select) => {
      const current = select.value;
      select.innerHTML = state.teams.map((team, index) => `<option value="${index}">${esc(team.name)}</option>`).join('');
      select.value = current && Number(current) < 4 ? current : '0';
    });
    updateTeamSelectState();
  }

  function updateTeamSelectState() {
    const pointSelect = $('#pointTeamSel');
    if (pointSelect) state.point.team = Number(pointSelect.value) || 0;
    const memoryTurn = $('#memoryTurn');
    if (memoryTurn) memoryTurn.textContent = state.teams[state.memory.turn].name;
    const quizBadge = $('#quizTeamBadge');
    const quizSelect = $('#quizTeamSel');
    if (quizBadge && quizSelect) quizBadge.textContent = state.teams[Number(quizSelect.value)].name;
    updateActiveTeamBoxes();
  }

  function updateActiveTeamBoxes() {
    const pointTeam = Number($('#pointTeamSel') && $('#pointTeamSel').value) || 0;
    const puzzleTeam = Number($('#puzzleTeamSel') && $('#puzzleTeamSel').value) || 0;
    const quizTeam = Number($('#quizTeamSel') && $('#quizTeamSel').value) || 0;
    $$('.score-grid').forEach((container) => {
      let active = -1;
      if (container.closest('#tab-5')) active = pointTeam;
      if (container.closest('#tab-6')) active = puzzleTeam;
      if (container.closest('#tab-8')) active = quizTeam;
      $$('.score-box', container).forEach((box) => box.classList.toggle('active', Number(box.dataset.scoreTeam) === active));
    });
  }

  function awardTeam(index, points) {
    const team = state.teams[index];
    if (!team) return;
    team.score = Math.max(0, team.score + (points === undefined ? 1 : points));
    saveTeams();
    renderScoreboards();
    showToast(`${team.name}: ${team.score} point${team.score === 1 ? '' : 's'}`);
  }

  function renderDrawerTeams() {
    const list = $('#drawerTeams');
    if (!list) return;
    list.innerHTML = state.teams.map((team, index) => `
      <div class="team-row" data-team-row="${index}">
        <span class="tr-dot" style="background:${TEAM_COLOURS[index]}"></span>
        <input type="text" value="${esc(team.name)}" data-team-name="${index}" aria-label="Team ${index + 1} name">
        <span class="tr-score" data-team-score="${index}">${team.score}</span>
        <button type="button" data-dteam-dec="${index}" aria-label="Remove one point from ${esc(team.name)}">&minus;</button>
        <button type="button" data-dteam-inc="${index}" aria-label="Add one point to ${esc(team.name)}">+</button>
      </div>`).join('');
  }

  function updateTeamNamesInScoreboards() {
    $$('.score-grid').forEach((container) => {
      $$('.score-box', container).forEach((box, index) => {
        const name = $('.sb-name', box);
        if (name && state.teams[index]) name.textContent = state.teams[index].name;
      });
    });
    syncTeamSelects();
  }
  function renderDialogueScript() {
    const container = $('#dialogueScript');
    if (!container) return;
    container.innerHTML = DIALOGUE.map((line, index) => `
      <button type="button" class="dlg-line spk-${line.spk}" data-dlg-index="${index}">
        <span class="avatar"><img src="${line.img}" alt=""></span>
        <span class="dl-body">
          <span class="dl-spk">${esc(line.name)}</span>
          <span class="dl-text">${esc(line.line)}</span>
        </span>
        <span class="dl-side">${icon('volume')}</span>
      </button>`).join('');
  }

  function showBubble(name, text) {
    const bubble = $('#stageBubble');
    const bubbleName = $('#bubbleName');
    const bubbleLine = $('#bubbleLine');
    if (!bubble || !bubbleName || !bubbleLine) return;
    bubbleName.textContent = name;
    bubbleLine.textContent = text;
    bubble.classList.add('show');
  }

  function hideBubble() {
    const bubble = $('#stageBubble');
    if (bubble) bubble.classList.remove('show');
  }

  function clearSpeaking() {
    $$('.actor.speaking, .dlg-line.speaking, .pattern-cell.speaking').forEach((element) => element.classList.remove('speaking'));
  }

  function setScene(scene, announce) {
    state.dialogueScene = scene;
    const stageLabel = $('#stageSceneLabel');
    const badge = $('#sceneBadge');
    const scene1 = $('#scene1Btn');
    const scene2 = $('#scene2Btn');
    const showFirst = scene === 1;
    const actorMap = { giant: showFirst, giantess: showFirst, hen: true, jack: !showFirst, friend: !showFirst };
    Object.entries(actorMap).forEach(([speaker, visible]) => {
      const actor = $(`.actor[data-speaker="${speaker}"]`);
      if (actor) actor.classList.toggle('hidden', !visible);
    });
    const egg = $('#eggHolder');
    if (egg) egg.classList.remove('show');
    if (stageLabel) stageLabel.textContent = scene === 1 ? 'Scene 1 · The giant wants his hen' : 'Scene 2 · Jack recognises the hen';
    if (badge) badge.textContent = `Scene ${scene}`;
    if (scene1) scene1.classList.toggle('on', scene === 1);
    if (scene2) scene2.classList.toggle('on', scene === 2);
    if (announce !== false) {
      hideBubble();
      clearSpeaking();
    }
  }

  function showEgg() {
    const egg = $('#eggHolder');
    if (egg) egg.classList.add('show');
  }

  function playDialogueLine(index) {
    const line = DIALOGUE[index];
    if (!line) return;
    if ((line.spk === 'jack' || line.spk === 'friend') && state.dialogueScene !== 2) setScene(2, false);
    const actor = $(`.actor[data-speaker="${line.spk}"]`);
    clearSpeaking();
    if (actor) actor.classList.add('speaking');
    showBubble(line.name, line.line);
    if (!state.sound) {
      if (line.spk === 'hen') showEgg();
      setTimeout(() => {
        if (actor) actor.classList.remove('speaking');
      }, 1200);
      return;
    }
    queueSpeech([{
      text: line.line,
      speaker: line,
      onstart: () => {
        if (actor) actor.classList.add('speaking');
        if (line.spk === 'hen') showEgg();
      },
      onend: () => {
        if (actor) actor.classList.remove('speaking');
      }
    }]);
  }

  function playAllDialogue() {
    if (!state.sound) {
      showToast('Turn the sound on to hear the dialogue.');
      return;
    }
    setScene(1, false);
    state.roleActive = false;
    const items = DIALOGUE.map((line) => ({
      text: line.line,
      speaker: line,
      onstart: () => {
        clearSpeaking();
        if ((line.spk === 'jack' || line.spk === 'friend') && state.dialogueScene !== 2) setScene(2, false);
        const actor = $(`.actor[data-speaker="${line.spk}"]`);
        if (actor) actor.classList.add('speaking');
        showBubble(line.name, line.line);
        if (line.spk === 'hen') showEgg();
      },
      onend: () => {
        const actor = $(`.actor[data-speaker="${line.spk}"]`);
        if (actor && line.spk !== 'hen') actor.classList.remove('speaking');
      }
    }));
    queueSpeech(items, () => {
      clearSpeaking();
      showEgg();
    });
  }

  function hideAllLines(roleMode) {
    $$('#dialogueScript .dl-text').forEach((text) => text.classList.add('role-hidden'));
    if (roleMode) state.roleActive = true;
  }

  function showAllLines() {
    $$('#dialogueScript .dl-text').forEach((text) => text.classList.remove('role-hidden'));
    state.roleActive = false;
    $$('#dialogueScript .dlg-line.speaking').forEach((line) => line.classList.remove('speaking'));
  }

  function nextRoleLine() {
    if (!state.roleActive) {
      state.roleActive = true;
      hideAllLines(true);
    }
    state.roleIndex = (state.roleIndex + 1) % DIALOGUE.length;
    $$('#dialogueScript .dlg-line').forEach((line) => line.classList.remove('speaking'));
    const active = $(`#dialogueScript .dlg-line[data-dlg-index="${state.roleIndex}"]`);
    if (active) {
      active.classList.add('speaking');
      active.scrollIntoView({ block: 'nearest', behavior: state.motion ? 'auto' : 'smooth' });
    }
    const line = DIALOGUE[state.roleIndex];
    showBubble(`${line.group} · ${line.name}`, 'Your turn. Say the line in character.');
  }

  function revealRoleLine() {
    if (state.roleIndex < 0) nextRoleLine();
    const line = DIALOGUE[state.roleIndex];
    const active = $(`#dialogueScript .dlg-line[data-dlg-index="${state.roleIndex}"]`);
    if (active) {
      const text = $('.dl-text', active);
      if (text) text.classList.remove('role-hidden');
    }
    if (line) showBubble(line.name, line.line);
  }

  function renderVocabGrid() {
    const grid = $('#vocabGrid');
    if (!grid) return;
    grid.innerHTML = VOCAB.map((item) => {
      const count = Number(state.practiced[item.word]) || 0;
      const art = ART_PATHS[state.vocabArt](item);
      const hidden = state.hiddenWords.has(item.word);
      return `
        <article class="vocab-card${hidden ? ' hide-word' : ''}${count >= 3 ? ' done' : ''}" data-vocab="${item.word}">
          <div class="vc-art">
            <img src="${art}" alt="${esc(item.alt)}" loading="lazy">
            <span class="art-label">${esc(ART_LABELS[state.vocabArt])}</span>
          </div>
          <div class="vc-body">
            <div class="vc-word">${esc(item.word)}</div>
            <div class="vc-ipa">${esc(item.ipa)}</div>
            <span class="vc-tag ${item.tagClass}">${esc(item.tag)}</span>
            <div class="vc-example">${esc(item.example)}</div>
            <div class="small vc-repeat-count" style="margin-top:6px">${count} / 3 practice repetitions</div>
            <div class="vc-actions">
              <button class="btn sm purple" type="button" data-vsay="${item.word}" aria-label="Hear ${item.word}">${icon('volume')}Say</button>
              <button class="btn sm ghost" type="button" data-vslow="${item.word}" aria-label="Hear ${item.word} slowly">${icon('slow')}Slow</button>
              <button class="btn sm blue" type="button" data-vspell="${item.word}" aria-label="Spell ${item.word}">${icon('keyboard')}Spell</button>
              <button class="btn sm gold" type="button" data-vrepeat="${item.word}" aria-label="Practise ${item.word} three times">${icon('plus')}3 times</button>
            </div>
            <div class="letters">${item.word.split('').map((letter) => `<span>${esc(letter)}</span>`).join('')}</div>
          </div>
        </article>`;
    }).join('');
    updateVocabStatus();
  }

  function updateVocabStatus() {
    const done = VOCAB.filter((item) => (Number(state.practiced[item.word]) || 0) >= 3).length;
    const status = $('#vocabStatus');
    if (status) status.textContent = `${done} of 4 words practised three times`;
    VOCAB.forEach((item) => {
      const card = $(`.vocab-card[data-vocab="${item.word}"]`);
      if (!card) return;
      const count = Number(state.practiced[item.word]) || 0;
      card.classList.toggle('done', count >= 3);
      const label = $('.vc-repeat-count', card);
      if (label) label.textContent = `${count} / 3 practice repetitions`;
    });
  }

  function practiseWord(word) {
    if (!VOCAB.some((item) => item.word === word)) return;
    state.practiced[word] = clamp((Number(state.practiced[word]) || 0) + 1, 0, 3);
    savePractice();
    updateVocabStatus();
    speakText(`${word}. ${word}. ${word}.`, { slow: false });
    if ((Number(state.practiced[word]) || 0) >= 3) showToast(`${word} practised three times.`);
  }

  function spinWheel() {
    if (state.wheelBusy) return;
    const wheel = $('#wheel');
    const result = $('#wheelResult');
    if (!wheel) return;
    state.wheelBusy = true;
    if (result) result.textContent = 'Spinning...';
    const index = Math.floor(Math.random() * VOCAB.length);
    const word = VOCAB[index].word;
    const targetAngles = [0, 270, 180, 90];
    const current = Number(wheel.dataset.rotation) || 0;
    const turns = 5 + Math.floor(Math.random() * 3);
    const next = current + turns * 360 + ((targetAngles[index] - (current % 360) + 360) % 360);
    wheel.dataset.rotation = String(next);
    wheel.style.transform = `rotate(${next}deg)`;
    setTimeout(() => {
      state.wheelBusy = false;
      state.wheelResult = word;
      if (result) result.textContent = word;
      const say = $('#spinSayBtn');
      const spell = $('#spinSpellBtn');
      if (say) say.disabled = false;
      if (spell) spell.disabled = false;
      burstConfetti(12);
    }, 4200);
  }

  function newSpellWord() {
    const options = VOCAB.map((item) => item.word).filter((word) => word !== state.spellWord);
    state.spellWord = options[Math.floor(Math.random() * options.length)] || 'bored';
    const input = $('#spellInput');
    if (input) input.value = '';
    const feedback = $('#spellFeedback');
    if (feedback) {
      feedback.textContent = 'Listen, then type the word.';
      feedback.className = 'feedback';
    }
  }

  function checkSpelling() {
    const input = $('#spellInput');
    const feedback = $('#spellFeedback');
    if (!input || !feedback) return;
    const answer = input.value.trim().toLowerCase();
    if (!answer) {
      feedback.textContent = 'Type a word first.';
      feedback.className = 'feedback bad';
      return;
    }
    if (answer === state.spellWord) {
      feedback.textContent = `Correct: ${state.spellWord}.`;
      feedback.className = 'feedback good';
      burstConfetti(16);
    } else {
      feedback.textContent = `Not quite. Listen again and check the spelling of ${state.spellWord}.`;
      feedback.className = 'feedback bad';
    }
  }

  function handleOppositeClick(button) {
    if (!button || button.classList.contains('matched')) return;
    const side = button.closest('#oppLeft') ? 'left' : 'right';
    const feedback = $('#oppFeedback');
    if (!state.oppSelected) {
      state.oppSelected = { value: button.dataset.pair, side, element: button };
      button.classList.add('sel');
      if (feedback) {
        feedback.textContent = 'Now choose its opposite.';
        feedback.className = 'feedback';
      }
      return;
    }
    if (state.oppSelected.element === button) {
      button.classList.remove('sel');
      state.oppSelected = null;
      return;
    }
    if (state.oppSelected.side === side) {
      state.oppSelected.element.classList.remove('sel');
      state.oppSelected = { value: button.dataset.pair, side, element: button };
      button.classList.add('sel');
      return;
    }
    if (OPPOSITES[state.oppSelected.value] === button.dataset.pair) {
      state.oppSelected.element.classList.remove('sel');
      state.oppSelected.element.classList.add('matched');
      button.classList.add('matched');
      state.oppSelected = null;
      if (feedback) {
        feedback.textContent = 'Correct opposite.';
        feedback.className = 'feedback good';
      }
      if ($$('#oppLeft .opp-item.matched').length === 2) {
        if (feedback) feedback.textContent = 'All four opposites matched.';
        burstConfetti(20);
      }
    } else {
      const previous = state.oppSelected.element;
      state.oppSelected = null;
      previous.classList.remove('sel');
      button.classList.add('wrong');
      if (feedback) {
        feedback.textContent = 'Not the opposite. Try again.';
        feedback.className = 'feedback bad';
      }
      setTimeout(() => button.classList.remove('wrong'), 450);
    }
  }
  function updateMachinePreview() {
    const subject = $('#subjSel');
    const be = $('#beSel');
    const adjective = $('#adjSel');
    const text = $('#machineText');
    if (!subject || !be || !adjective || !text) return;
    text.innerHTML = `<span class="subj">${esc(subject.value)}</span> <span class="be">${esc(be.value)}</span> <span class="adj">${esc(adjective.value)}</span>.`;
  }

  function syncBeVerb() {
    const subject = $('#subjSel');
    const be = $('#beSel');
    const help = $('#agreementHelp');
    if (!subject || !be || !help) return;
    if (help.checked) be.value = subject.value === 'I' ? 'am' : 'is';
    updateMachinePreview();
  }

  function buildMachineSentence() {
    const subject = $('#subjSel');
    const be = $('#beSel');
    const adjective = $('#adjSel');
    const feedback = $('#machineFeedback');
    const machine = $('#sentenceMachine');
    if (!subject || !be || !adjective || !feedback || !machine) return;
    const expected = subject.value === 'I' ? 'am' : 'is';
    const sentence = `${subject.value} ${be.value} ${adjective.value}.`;
    updateMachinePreview();
    if (be.value !== expected) {
      machine.classList.remove('wrong');
      void machine.offsetWidth;
      machine.classList.add('wrong');
      feedback.textContent = `Try again. ${subject.value} goes with ${expected}.`;
      feedback.className = 'feedback bad';
      return;
    }
    feedback.textContent = `Correct: ${sentence}`;
    feedback.className = 'feedback good';
    state.machineHistory.unshift(sentence);
    state.machineHistory = state.machineHistory.slice(0, 4);
    const history = $('#machineHistory');
    if (history) history.textContent = state.machineHistory.join(' · ');
    speakText(sentence);
  }

  function newFlipQuestion() {
    const subjects = ['He', 'She'];
    state.flip.subject = subjects[Math.floor(Math.random() * subjects.length)];
    state.flip.adjective = VOCAB[Math.floor(Math.random() * VOCAB.length)].word;
    state.flip.answered = false;
    const prompt = $('#flipPrompt');
    if (prompt) prompt.innerHTML = `Change <strong>I am ${esc(state.flip.adjective)}.</strong> to ${state.flip.subject === 'He' ? 'a boy' : 'a girl'}.`;
    const correct = `${state.flip.subject} is ${state.flip.adjective}.`;
    const otherSubject = state.flip.subject === 'He' ? 'She' : 'He';
    const options = shuffle([correct, `${state.flip.subject} am ${state.flip.adjective}.`, `${otherSubject} is ${state.flip.adjective}.`]);
    const container = $('#flipOptions');
    if (container) {
      container.innerHTML = options.map((option) => `<button type="button" class="opt" data-flip-opt="${esc(option)}" data-correct="${option === correct ? '1' : '0'}">${esc(option)}</button>`).join('');
    }
    const feedback = $('#flipFeedback');
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'feedback';
    }
  }

  function handleFlipAnswer(button) {
    if (!button || state.flip.answered) return;
    state.flip.answered = true;
    const correct = button.dataset.correct === '1';
    const feedback = $('#flipFeedback');
    $$('#flipOptions .opt').forEach((option) => {
      option.disabled = true;
      if (option.dataset.correct === '1') option.classList.add('correct');
    });
    if (correct) {
      state.flip.score += 1;
      button.classList.add('correct');
      if (feedback) {
        feedback.textContent = 'Correct. He and She use is.';
        feedback.className = 'feedback good';
      }
      burstConfetti(10);
    } else {
      button.classList.add('wrong');
      if (feedback) {
        feedback.textContent = `Not quite. The answer is ${state.flip.subject} is ${state.flip.adjective}.`;
        feedback.className = 'feedback bad';
      }
    }
    const score = $('#flipScore');
    if (score) score.textContent = `${state.flip.score} correct`;
  }

  function renderExtraSentences() {
    const container = $('#extraSentences');
    if (!container) return;
    container.innerHTML = EXTRA_SENTENCES.map((sentence) => `
      <div class="extra-sentence">
        <span class="es-text">${esc(sentence)}</span>
        <span class="es-tag">Teacher-created</span>
        <button class="btn xs blue" type="button" data-say="${esc(sentence)}">${icon('volume')}Hear</button>
      </div>`).join('');
  }

  function renderLookScene() {
    const scene = LOOK_SCENES[state.look.adjective];
    const item = VOCAB.find((entry) => entry.word === state.look.adjective);
    if (!scene || !item) return;
    const image = $('#lookSceneImg');
    if (image) {
      image.src = ART_PATHS[state.look.art](item);
      image.alt = scene.alt;
    }
    const caption = $('#lookSceneCaption');
    if (caption) caption.textContent = scene.caption;
    const badge = $('#lookSceneBadge');
    if (badge) badge.textContent = scene.badge;
    const sentence = $('#lookSentence');
    if (sentence) {
      sentence.innerHTML = scene.caption.split(' ').map((word, index) => `<button type="button" class="hidden-word" data-look-word="${index}">${esc(word)}</button>`).join('');
    }
    $$('#lookArtPills button').forEach((button) => button.classList.toggle('on', button.dataset.art === state.look.art));
    $$('.look-extra').forEach((button) => button.classList.toggle('on', button.dataset.adj === state.look.adjective));
    const feedback = $('#lookFeedback');
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'feedback';
    }
  }

  function setLookAdjective(adjective) {
    if (!LOOK_SCENES[adjective]) return;
    state.look.adjective = adjective;
    renderLookScene();
  }

  function renderRepeatCount() {
    const number = $('#repeatCount');
    const track = $('#repeatTrack');
    const count = Number(renderRepeatCount.count) || 0;
    if (number) number.textContent = String(count);
    if (track) track.innerHTML = Array.from({ length: 5 }, (_, index) => `<i class="${index < Math.min(count, 5) ? 'on' : ''}"></i>`).join('');
  }

  function updateLookSentenceCover(covered) {
    $$('#lookSentence .hidden-word').forEach((word) => word.classList.toggle('covered', covered));
  }

  function renderPointGrid() {
    const grid = $('#pointGrid');
    if (!grid) return;
    grid.innerHTML = VOCAB.map((item) => {
      const art = ART_PATHS[state.point.art](item);
      return `
        <button class="point-card${state.point.mode === 'audio' ? ' audio-hidden' : ''}" type="button" data-point-card="${item.word}" aria-label="Choose ${state.point.mode === 'audio' ? 'this picture' : item.word}">
          <img src="${art}" alt="${esc(item.alt)}" loading="lazy">
          <span class="pc-name"><span>${esc(item.word)}</span>${icon('volume')}</span>
        </button>`;
    }).join('');
  }

  function renderPointStatus() {
    const status = $('#pointStatus');
    if (!status) return;
    const team = state.teams[state.point.team];
    if (state.point.mode === 'teacher') {
      status.innerHTML = `
        <span>Teacher-selected mode. Target: ${esc(state.point.target || 'choose a word')}</span>
        <small>Choose a word chip or tap Hear word, then students point to the picture.</small>
        <div class="word-chips">${VOCAB.map((item) => `<button type="button" class="word-chip${state.point.target === item.word ? ' on' : ''}" data-point-word="${item.word}">${item.word}</button>`).join('')}</div>`;
    } else if (state.point.mode === 'random') {
      status.innerHTML = '<span>Random mode.</span><small>Tap Next or Hear word to choose a new hidden target, then students point.</small>';
    } else if (state.point.mode === 'audio') {
      status.innerHTML = '<span>Audio-only mode.</span><small>The labels are hidden. Students must listen and point.</small>';
    } else {
      status.innerHTML = `<span>Team timed mode · ${esc(team.name)}</span><small>15 seconds per question. A correct point earns one team point.</small>`;
    }
  }

  function renderPointTimer() {
    const ring = $('#pointTimer');
    if (!ring) return;
    const seconds = Math.max(0, Math.ceil(state.point.timeLeft));
    const percent = state.point.total ? (state.point.timeLeft / state.point.total) * 100 : 0;
    ring.style.setProperty('--p', `${clamp(percent, 0, 100)}%`);
    const label = $('span', ring);
    if (label) label.textContent = state.point.mode === 'team' ? String(seconds) : '--';
    ring.classList.toggle('warn', state.point.mode === 'team' && state.point.timeLeft <= 5 && state.point.timeLeft > 0);
  }

  function stopPointTimer() {
    if (state.point.timerId) clearInterval(state.point.timerId);
    state.point.timerId = null;
  }

  function startPointTimer() {
    stopPointTimer();
    if (state.point.mode !== 'team') {
      state.point.timeLeft = state.point.total;
      state.point.timerDone = false;
      renderPointTimer();
      return;
    }
    state.point.timeLeft = state.point.total;
    state.point.timerDone = false;
    renderPointTimer();
    state.point.timerId = setInterval(() => {
      state.point.timeLeft = Math.max(0, state.point.timeLeft - 0.1);
      renderPointTimer();
      if (state.point.timeLeft <= 0) {
        stopPointTimer();
        state.point.timerDone = true;
        const feedback = $('#pointFeedback');
        if (feedback) feedback.textContent = 'Time is up.';
        showToast('Time is up. Tap Next for a new word.');
      }
    }, 100);
  }

  function nextPointTarget() {
    const words = VOCAB.map((item) => item.word);
    let pool = words.filter((word) => word !== state.point.target);
    if (!pool.length) pool = words;
    state.point.target = pool[Math.floor(Math.random() * pool.length)];
    state.point.timerDone = false;
    renderPointStatus();
    renderPointTimer();
    startPointTimer();
    const feedback = $('#pointFeedback');
    if (feedback) feedback.textContent = `Ready${state.point.mode === 'audio' ? '' : ` · ${state.point.target}`}`;
  }

  function setPointMode(mode) {
    state.point.mode = mode;
    $$('#pointModePills button').forEach((button) => button.classList.toggle('on', button.dataset.mode === mode));
    renderPointGrid();
    renderPointStatus();
    if (mode === 'team') startPointTimer();
    else {
      stopPointTimer();
      state.point.timeLeft = state.point.total;
      state.point.timerDone = false;
      renderPointTimer();
    }
    updateActiveTeamBoxes();
  }

  function handlePointCard(button) {
    if (!button) return;
    const word = button.dataset.pointCard;
    const feedback = $('#pointFeedback');
    if (state.point.mode === 'team' && state.point.timerDone) {
      if (feedback) feedback.textContent = 'Time is up. Tap Next.';
      return;
    }
    if (word === state.point.target) {
      button.classList.add('correct');
      stopPointTimer();
      if (feedback) feedback.textContent = `Correct · ${word}`;
      if (state.point.mode === 'team') awardTeam(state.point.team, 1);
      burstConfetti(14);
      speakText(word);
    } else {
      button.classList.add('wrong');
      if (feedback) feedback.textContent = 'Try again. Listen carefully.';
      setTimeout(() => button.classList.remove('wrong'), 450);
    }
  }
  function populateBankEditor() {
    const textarea = $('#bankTextarea');
    if (!textarea) return;
    textarea.value = state.puzzle.bank.map((item) => `${item.sentence} | ${item.clue}`).join('\n');
    const status = $('#bankStatus');
    if (status) status.textContent = `${state.puzzle.bank.length} practice sentences loaded. Not official textbook items.`;
  }

  function tokenise(sentence) {
    return sentence.trim().split(/\s+/).filter(Boolean);
  }

  function loadPuzzle(index, speakAuto) {
    const bank = state.puzzle.bank;
    if (!bank.length) return;
    state.puzzle.index = ((Number(index) || 0) % bank.length + bank.length) % bank.length;
    state.puzzle.current = bank[state.puzzle.index];
    const tokens = tokenise(state.puzzle.current.sentence);
    state.puzzle.tiles = shuffle(tokens.map((text, tileIndex) => ({ id: `t${tileIndex}`, text })));
    state.puzzle.slots = Array(tokens.length).fill(null);
    state.puzzle.autoSpoken = false;
    state.puzzle.solved = false;
    const number = $('#puzzleNumber');
    const total = $('#puzzleTotal');
    const clue = $('#puzzleClue');
    if (number) number.textContent = String(state.puzzle.index + 1);
    if (total) total.textContent = String(bank.length);
    if (clue) clue.textContent = state.puzzle.current.clue;
    const answer = $('#puzzleAnswer');
    if (answer) {
      answer.textContent = state.puzzle.current.sentence;
      answer.classList.remove('show');
    }
    const feedback = $('#puzzleFeedback');
    if (feedback) feedback.textContent = '';
    renderPuzzle();
    populateQuickBank();
    if (speakAuto !== false) maybePuzzleAutoSound();
  }

  function renderPuzzle() {
    const slots = $('#puzzleSlots');
    const bank = $('#puzzleBank');
    if (!slots || !bank) return;
    slots.innerHTML = state.puzzle.slots.map((tile, index) => `
      <button type="button" class="puzzle-slot${tile ? ' filled' : ''}" data-slot="${index}" ${tile ? `draggable="true" data-tile-id="${tile.id}"` : ''} aria-label="${tile ? `Remove ${esc(tile.text)}` : `Empty slot ${index + 1}`}">
        ${tile ? `<span class="num">${index + 1}</span><span>${esc(tile.text)}</span>` : ''}
      </button>`).join('');
    const used = new Set(state.puzzle.slots.filter(Boolean).map((tile) => tile.id));
    bank.innerHTML = state.puzzle.tiles.filter((tile) => !used.has(tile.id)).map((tile) => `
      <button type="button" class="word-tile" draggable="true" data-tile="${tile.id}">${esc(tile.text)}</button>`).join('');
  }

  function placePuzzleTile(tileId, targetIndex) {
    const tile = state.puzzle.tiles.find((item) => item.id === tileId);
    if (!tile) return;
    const sourceIndex = state.puzzle.slots.findIndex((item) => item && item.id === tileId);
    if (sourceIndex === targetIndex) return;
    const displaced = state.puzzle.slots[targetIndex];
    state.puzzle.slots[targetIndex] = tile;
    if (sourceIndex >= 0) state.puzzle.slots[sourceIndex] = displaced || null;
    state.puzzle.solved = false;
    renderPuzzle();
  }

  function removePuzzleTile(slotIndex) {
    if (state.puzzle.slots[slotIndex]) {
      state.puzzle.slots[slotIndex] = null;
      state.puzzle.solved = false;
      renderPuzzle();
    }
  }

  function resetPuzzleTiles() {
    state.puzzle.slots = Array(state.puzzle.slots.length).fill(null);
    state.puzzle.tiles = shuffle(state.puzzle.tiles);
    state.puzzle.solved = false;
    renderPuzzle();
    const feedback = $('#puzzleFeedback');
    if (feedback) feedback.textContent = '';
  }

  function checkPuzzle() {
    const feedback = $('#puzzleFeedback');
    const value = state.puzzle.slots.map((tile) => (tile ? tile.text : '')).join(' ');
    if (value === state.puzzle.current.sentence) {
      if (feedback) feedback.textContent = state.puzzle.solved ? 'Already correct. Read it aloud together.' : 'Correct. Read the sentence aloud together.';
      if (!state.puzzle.solved) {
        state.puzzle.solved = true;
        burstConfetti(24);
        const awardToggle = $('#puzzleAutoAward');
        const teamSelect = $('#puzzleTeamSel');
        if (awardToggle && awardToggle.checked && teamSelect) awardTeam(Number(teamSelect.value) || 0, 1);
      }
    } else if (feedback) {
      feedback.textContent = state.puzzle.slots.some((tile) => !tile)
        ? 'Every slot needs a word. Try again.'
        : 'Not yet. Check the word order and the be-verb.';
      const slots = $('#puzzleSlots');
      if (slots) {
        slots.classList.add('over');
        setTimeout(() => slots.classList.remove('over'), 500);
      }
    }
  }

  function showPuzzleAnswer() {
    const answer = $('#puzzleAnswer');
    if (!answer) return;
    answer.textContent = state.puzzle.current.sentence;
    answer.classList.add('show');
    speakText(state.puzzle.current.sentence);
  }

  function nextPuzzle() {
    if (state.puzzle.mode === 'random') {
      let index = state.puzzle.index;
      while (state.puzzle.bank.length > 1 && index === state.puzzle.index) index = Math.floor(Math.random() * state.puzzle.bank.length);
      loadPuzzle(index);
    } else {
      loadPuzzle(state.puzzle.index + 1);
    }
  }

  function maybePuzzleAutoSound() {
    if (state.tab !== 6 || state.puzzle.mode !== 'auto' || !state.puzzle.current || state.puzzle.autoSpoken) return;
    state.puzzle.autoSpoken = true;
    if (!state.sound) return;
    setTimeout(() => {
      if (state.tab === 6 && state.puzzle.mode === 'auto') speakText(state.puzzle.current.clue);
    }, 300);
  }

  function populateQuickBank() {
    const container = $('#puzzleQuickBank');
    if (!container) return;
    container.innerHTML = state.puzzle.bank.map((item) => `
      <div class="extra-sentence">
        <span class="es-text">${esc(item.sentence)}</span>
        <button class="btn xs blue" type="button" data-say="${esc(item.sentence)}">${icon('volume')}Hear</button>
      </div>`).join('');
  }

  function applyBank() {
    const textarea = $('#bankTextarea');
    const feedback = $('#bankStatus');
    if (!textarea) return;
    const parsed = textarea.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const pieces = line.split('|');
      if (pieces.length < 2) return null;
      const sentence = pieces.shift().trim();
      const clue = pieces.join('|').trim();
      if (!sentence || !clue) return null;
      return { sentence, clue };
    }).filter(Boolean);
    if (!parsed.length) {
      if (feedback) feedback.textContent = 'No valid lines found. Use sentence | clue on each line.';
      return;
    }
    state.puzzle.bank = parsed;
    store.set(KEYS.bank, parsed);
    populateBankEditor();
    loadPuzzle(0);
    if (feedback) feedback.textContent = `${parsed.length} practice sentences saved in this browser.`;
    showToast('Practice bank updated.');
  }

  function restoreBank() {
    state.puzzle.bank = DEFAULT_BANK.map((item) => ({ ...item }));
    store.set(KEYS.bank, state.puzzle.bank);
    populateBankEditor();
    loadPuzzle(0);
    const status = $('#bankStatus');
    if (status) status.textContent = 'Default practice bank restored.';
    showToast('Default bank restored.');
  }

  function updateRelayClock() {
    const clock = $('#relayClock');
    if (clock) {
      clock.textContent = formatTime(state.relay.left);
      clock.classList.toggle('warn', state.relay.left <= 10 && state.relay.left > 0);
    }
    $$('#relayPresets button').forEach((button) => button.classList.toggle('on', Number(button.dataset.sec) === state.relay.total));
  }

  function startRelay() {
    if (state.relay.running || state.relay.left <= 0) return;
    state.relay.running = true;
    state.relay.timerId = setInterval(() => {
      state.relay.left = Math.max(0, state.relay.left - 1);
      updateRelayClock();
      if (state.relay.left === 0) {
        clearInterval(state.relay.timerId);
        state.relay.timerId = null;
        state.relay.running = false;
        showToast('Writing Relay time is up. Ask each team to read its sentence.');
      }
    }, 1000);
  }

  function pauseRelay() {
    if (state.relay.timerId) clearInterval(state.relay.timerId);
    state.relay.timerId = null;
    state.relay.running = false;
  }

  function resetRelay(seconds) {
    pauseRelay();
    state.relay.left = seconds || state.relay.total;
    updateRelayClock();
  }
  function resetStoryGame() {
    state.story.index = 0;
    state.story.complete = false;
    state.story.order = shuffle(DIALOGUE.map((line, index) => ({ ...line, original: index })));
    renderStoryGame();
  }

  function renderStoryGame() {
    const choices = $('#storyChoices');
    const build = $('#storyBuild');
    if (!choices || !build) return;
    const selected = new Set(DIALOGUE.slice(0, state.story.index).map((line, index) => index));
    choices.innerHTML = state.story.order.map((line) => `
      <button type="button" class="story-choice${selected.has(line.original) ? ' used' : ''}" data-story-line="${line.original}" ${selected.has(line.original) ? 'disabled' : ''}>
        <span class="so-spk">${esc(line.name)}</span>
        <span>${esc(line.line)}</span>
      </button>`).join('');
    const chosen = DIALOGUE.slice(0, state.story.index);
    build.innerHTML = chosen.length
      ? chosen.map((line, index) => `<div class="sb-line"><span class="n">${index + 1}</span><span class="sp">${esc(line.name)}</span><span>${esc(line.line)}</span></div>`).join('')
      : '<div class="small">The correct lines will appear here.</div>';
    const count = $('#storyOrderCount');
    if (count) count.textContent = `${state.story.index} / ${DIALOGUE.length}`;
    const play = $('#storyPlayBtn');
    if (play) play.disabled = !state.story.complete;
  }

  function chooseStoryLine(original) {
    if (state.story.complete) return;
    const feedback = $('#storyFeedback');
    if (original === state.story.index) {
      state.story.index += 1;
      if (feedback) {
        feedback.textContent = 'Correct order.';
        feedback.className = 'feedback good';
      }
      if (state.story.index >= DIALOGUE.length) {
        state.story.complete = true;
        if (feedback) feedback.textContent = 'Story complete. Read it together, then play it.';
        burstConfetti(18);
      }
      renderStoryGame();
      speakText(DIALOGUE[original].line, { speaker: DIALOGUE[original] });
    } else if (feedback) {
      feedback.textContent = state.story.index === 0 ? 'Start with the first speaker.' : `That line comes later. What happens after ${DIALOGUE[state.story.index - 1].name} speaks?`;
      feedback.className = 'feedback bad';
    }
  }

  function playCompletedStory() {
    if (!state.story.complete) return;
    queueSpeech(DIALOGUE.map((line) => ({ text: line.line, speaker: line })));
  }

  function resetMemoryGame() {
    const cards = [];
    VOCAB.forEach((item, index) => {
      cards.push({ id: `w${index}`, pair: index, type: 'word', word: item.word, text: item.word });
      cards.push({ id: `a${index}`, pair: index, type: 'art', word: item.word, text: item.alt });
    });
    state.memory.cards = shuffle(cards).map((card) => ({ ...card, flipped: false, matched: false }));
    state.memory.first = null;
    state.memory.locks = false;
    state.memory.matched = 0;
    state.memory.turn = 0;
    renderMemoryGame();
    updateMemoryTurn();
  }

  function renderMemoryGame() {
    const grid = $('#memoryGrid');
    if (!grid) return;
    grid.innerHTML = state.memory.cards.map((card) => `
      <button type="button" class="mem-card${card.flipped || card.matched ? ' flipped' : ''}${card.matched ? ' matched' : ''}" data-memory-card="${card.id}" aria-label="${card.flipped || card.matched ? esc(card.text) : 'Hidden card'}">
        <span class="mem-inner">
          <span class="mem-face mem-back"><img class="hen-mark" src="assets/img/svg/magic-hen.svg" alt=""></span>
          <span class="mem-face mem-front">
            ${card.type === 'word'
              ? `<span class="mem-word">${esc(card.text)}</span>`
              : `<img src="${ART_PATHS[state.vocabArt](VOCAB[card.pair])}" alt="${esc(card.text)}">`}
          </span>
        </span>
      </button>`).join('');
    const status = $('#memoryStatus');
    if (status) status.textContent = `Find 4 pairs. ${state.memory.matched} matches.`;
  }

  function updateMemoryTurn() {
    const badge = $('#memoryTurn');
    if (!badge) return;
    badge.textContent = state.teams[state.memory.turn].name;
    badge.style.background = TEAM_COLOURS[state.memory.turn];
    badge.style.color = state.memory.turn === 2 ? '#3a2600' : '#fff';
    const select = $('#memoryTeamSel');
    if (select) select.value = String(state.memory.turn);
    const feedback = $('#memoryFeedback');
    if (feedback && !feedback.textContent) feedback.textContent = `${state.teams[state.memory.turn].name}, choose two cards.`;
  }

  function flipMemoryCard(button) {
    if (!button || state.memory.locks) return;
    const card = state.memory.cards.find((item) => item.id === button.dataset.memoryCard);
    if (!card || card.flipped || card.matched) return;
    card.flipped = true;
    const feedback = $('#memoryFeedback');
    speakText(card.type === 'word' ? card.word : card.alt);
    renderMemoryGame();
    if (!state.memory.first) {
      state.memory.first = card;
      if (feedback) feedback.textContent = 'Now choose a matching card.';
      return;
    }
    const first = state.memory.first;
    if (first.id === card.id) return;
    state.memory.locks = true;
    if (first.pair === card.pair) {
      first.matched = true;
      card.matched = true;
      state.memory.first = null;
      state.memory.matched += 1;
      state.memory.locks = false;
      awardTeam(state.memory.turn, 1);
      if (feedback) {
        feedback.textContent = `Match: ${card.word}. Team point!`;
        feedback.className = 'feedback good';
      }
      renderMemoryGame();
      burstConfetti(14);
      if (state.memory.matched >= VOCAB.length) {
        if (feedback) feedback.textContent = 'All four pairs found. Well done!';
        burstConfetti(36);
      }
    } else {
      if (feedback) {
        feedback.textContent = 'Not a pair. Try to remember where they are.';
        feedback.className = 'feedback bad';
      }
      setTimeout(() => {
        first.flipped = false;
        card.flipped = false;
        state.memory.first = null;
        state.memory.locks = false;
        state.memory.turn = (state.memory.turn + 1) % state.teams.length;
        renderMemoryGame();
        updateMemoryTurn();
      }, 950);
    }
  }

  function resetQuiz() {
    state.quiz.index = 0;
    state.quiz.score = 0;
    state.quiz.answered = false;
    state.quiz.options = [];
    const result = $('#quizResult');
    if (result) result.classList.remove('show');
    const shell = $('.quiz-shell');
    if (shell) shell.classList.remove('done');
    renderQuiz();
  }

  function renderQuiz() {
    const question = $('#quizQuestion');
    const options = $('#quizOptions');
    if (!question || !options) return;
    const item = QUIZ[state.quiz.index];
    if (!item) return;
    state.quiz.options = state.quiz.options.length ? state.quiz.options : shuffle(item.options);
    question.textContent = item.q;
    const letters = ['A', 'B', 'C', 'D'];
    options.innerHTML = state.quiz.options.map((option, index) => `
      <button type="button" class="quiz-opt${option === item.answer ? ' is-answer' : ''}" data-quiz-option="${esc(option)}">
        <span class="qo-letter">${letters[index]}</span>
        <span>${esc(option)}</span>
      </button>`).join('');
    const count = $('#quizCount');
    if (count) count.textContent = `${state.quiz.index + 1} / ${QUIZ.length}`;
    const progress = $('#quizProgress');
    if (progress) progress.style.width = `${(state.quiz.index / QUIZ.length) * 100}%`;
    const next = $('#quizNextBtn');
    if (next) {
      next.disabled = true;
      next.innerHTML = state.quiz.index === QUIZ.length - 1 ? `Finish${icon('check')}` : `Next${icon('next')}`;
    }
    const feedback = $('#quizFeedback');
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'feedback';
    }
    const teamSelect = $('#quizTeamSel');
    if (teamSelect) {
      const badge = $('#quizTeamBadge');
      if (badge) badge.textContent = state.teams[Number(teamSelect.value) || 0].name;
    }
  }

  function answerQuiz(button) {
    if (!button || state.quiz.answered) return;
    state.quiz.answered = true;
    const item = QUIZ[state.quiz.index];
    const chosen = button.dataset.quizOption;
    const correct = chosen === item.answer;
    const feedback = $('#quizFeedback');
    $$('#quizOptions .quiz-opt').forEach((option) => {
      option.disabled = true;
      if (option.dataset.quizOption === item.answer) option.classList.add('correct');
    });
    if (correct) {
      state.quiz.score += 1;
      button.classList.add('correct');
      if (feedback) {
        feedback.textContent = 'Correct!';
        feedback.className = 'feedback good';
      }
      const teamSelect = $('#quizTeamSel');
      if (teamSelect) awardTeam(Number(teamSelect.value) || 0, 1);
      burstConfetti(12);
    } else {
      button.classList.add('wrong');
      if (feedback) {
        feedback.textContent = `Not quite. The answer is ${item.answer}`;
        feedback.className = 'feedback bad';
      }
    }
    const next = $('#quizNextBtn');
    if (next) next.disabled = false;
  }

  function nextQuizQuestion() {
    if (!state.quiz.answered) return;
    if (state.quiz.index >= QUIZ.length - 1) {
      finishQuiz();
      return;
    }
    state.quiz.index += 1;
    state.quiz.answered = false;
    state.quiz.options = [];
    renderQuiz();
  }

  function finishQuiz() {
    const result = $('#quizResult');
    const score = $('#quizScore');
    const message = $('#quizMsg');
    const percent = Math.round((state.quiz.score / QUIZ.length) * 100);
    if (score) score.textContent = `${state.quiz.score} / ${QUIZ.length}`;
    if (message) {
      message.textContent = percent >= 90 ? 'Excellent work!' : percent >= 70 ? 'Good job. Review the tricky words.' : 'Keep practising the four words and the am/is pattern.';
    }
    if (result) result.classList.add('show');
    const shell = $('.quiz-shell');
    if (shell) shell.classList.add('done');
    burstConfetti(48);
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.ceil(Number(seconds) || 0));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    const text = formatTime(state.timer.left);
    const drawer = $('#drawerTimer');
    const dock = $('#dockTimer');
    if (drawer) drawer.textContent = text;
    if (dock) dock.textContent = text;
    const phase = $('#timerPhase');
    if (phase) phase.textContent = state.timer.label;
  }

  function setLessonTimer(minutes, label) {
    pauseLessonTimer();
    state.timer.total = Math.max(60, (Number(minutes) || 50) * 60);
    state.timer.left = state.timer.total;
    state.timer.label = label || `${Number(minutes) || 50} minute timer`;
    updateTimerDisplay();
  }

  function startLessonTimer() {
    if (state.timer.running || state.timer.left <= 0) return;
    state.timer.running = true;
    state.timer.timerId = setInterval(() => {
      state.timer.left = Math.max(0, state.timer.left - 1);
      updateTimerDisplay();
      if (state.timer.left === 0) {
        pauseLessonTimer();
        showToast('Lesson timer finished.');
        burstConfetti(24);
      }
    }, 1000);
  }

  function pauseLessonTimer() {
    if (state.timer.timerId) clearInterval(state.timer.timerId);
    state.timer.timerId = null;
    state.timer.running = false;
  }

  function resetLessonTimer() {
    pauseLessonTimer();
    state.timer.left = state.timer.total;
    updateTimerDisplay();
  }

  function openDrawer() {
    const drawer = $('#teacherDrawer');
    const backdrop = $('#drawerBackdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.add('open');
    backdrop.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const drawer = $('#teacherDrawer');
    const backdrop = $('#drawerBackdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateStudentPoolInfo() {
    const info = $('#studentPoolInfo');
    if (info) info.textContent = state.student.pool.length
      ? `Pool: ${state.student.pool.length} student${state.student.pool.length === 1 ? '' : 's'} still to pick`
      : `Pool empty. It will reset to 1-${state.student.max}.`;
  }

  function resetStudentPool() {
    state.student.pool = Array.from({ length: state.student.max }, (_, index) => index + 1);
    updateStudentPoolInfo();
  }

  function pickStudent(targetId) {
    if (!state.student.pool.length) resetStudentPool();
    let number;
    if (state.student.noRepeat) {
      const index = Math.floor(Math.random() * state.student.pool.length);
      number = state.student.pool.splice(index, 1)[0];
    } else {
      number = Math.floor(Math.random() * state.student.max) + 1;
    }
    const result = $('#randomResult');
    if (result) result.textContent = String(number);
    if (targetId) {
      const target = $(`#${targetId}`);
      if (target) target.textContent = `Student ${number}`;
    }
    updateStudentPoolInfo();
    if (targetId) showToast(`Student ${number}`);
    return number;
  }

  function updateRelayUi() {
    updateRelayClock();
    const start = $('#relayStartBtn');
    if (start) start.textContent = state.relay.running ? 'Running' : 'Start';
  }

  function openQuizTeamBadge() {
    const select = $('#quizTeamSel');
    if (!select) return;
    const badge = $('#quizTeamBadge');
    if (badge) badge.textContent = state.teams[Number(select.value) || 0].name;
    updateActiveTeamBoxes();
  }
  function initAudio() {
    refreshVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
    const select = $('#voiceSelect');
    if (select) {
      select.addEventListener('change', () => {
        state.voiceURI = select.value || 'auto';
        store.set(KEYS.voice, state.voiceURI);
        updateVoiceStyleUi();
        updateVoiceInfo();
      });
    }
    $$('#voiceStylePills [data-voice-style]').forEach((button) => {
      button.addEventListener('click', () => setVoiceStyle(button.dataset.voiceStyle));
    });
    const rate = $('#rateSlider');
    if (rate) rate.addEventListener('input', () => setRate(rate.value));
    const female = $('#testFemaleBtn');
    if (female) female.addEventListener('click', () => {
      setVoiceStyle('female');
      speakText("Hello. Welcome to The Magic Hen. Let's learn together.", { gender: 'female' });
    });
    const male = $('#testMaleBtn');
    if (male) male.addEventListener('click', () => {
      setVoiceStyle('male');
      speakText("Hello. Welcome to The Magic Hen. Let's learn together.", { gender: 'male' });
    });
    const stop = $('#stopSpeechBtn');
    if (stop) stop.addEventListener('click', stopSpeech);
    const sound = $('#soundBtn');
    if (sound) sound.addEventListener('click', () => setSound(!state.sound));
    const mini = $('#globalSoundSwitch');
    if (mini) mini.addEventListener('click', () => setSound(!state.sound));
  }

  function initShell() {
    $$('.ntab').forEach((tab) => tab.addEventListener('click', () => goTab(Number(tab.dataset.tab))));
    $$('[data-go]').forEach((element) => element.addEventListener('click', () => goTab(Number(element.dataset.go))));
    $$('[data-footer-tab]').forEach((button) => button.addEventListener('click', () => goTab(Number(button.dataset.footerTab))));
    const footerPrev = $('#footPrevBtn');
    if (footerPrev) footerPrev.addEventListener('click', () => goTab(state.tab - 1));
    const footerNext = $('#footNextBtn');
    if (footerNext) footerNext.addEventListener('click', () => goTab(state.tab + 1));
    $$('#endTopBtn, #fabTopBtn').forEach((button) => button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: state.motion ? 'auto' : 'smooth' });
    }));
    window.addEventListener('scroll', updatePageChrome, { passive: true });
    window.addEventListener('resize', updatePageChrome);
    updatePageChrome();
    $$('[data-lb]').forEach((element) => element.addEventListener('click', () => openLightbox(element.dataset.lb, element.dataset.cap)));
    const lightbox = $('#lightbox');
    if (lightbox) {
      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox || event.target.closest('[data-lb-close]')) closeLightbox();
      });
    }
    document.addEventListener('click', (event) => {
      const say = event.target.closest('[data-say]');
      if (say) speakText(say.dataset.say);
    });
    document.addEventListener('click', (event) => {
      const inc = event.target.closest('[data-team-inc]');
      if (inc) {
        awardTeam(Number(inc.dataset.teamInc), 1);
        return;
      }
      const dec = event.target.closest('[data-team-dec]');
      if (dec) {
        awardTeam(Number(dec.dataset.teamDec), -1);
        return;
      }
      const dInc = event.target.closest('[data-dteam-inc]');
      if (dInc) {
        awardTeam(Number(dInc.dataset.dteamInc), 1);
        return;
      }
      const dDec = event.target.closest('[data-dteam-dec]');
      if (dDec) awardTeam(Number(dDec.dataset.dteamDec), -1);
    });
    const drawerTeams = $('#drawerTeams');
    if (drawerTeams) {
      drawerTeams.addEventListener('input', (event) => {
        const input = event.target.closest('[data-team-name]');
        if (!input) return;
        const index = Number(input.dataset.teamName);
        if (state.teams[index]) {
          state.teams[index].name = input.value.trim() || `Team ${index + 1}`;
          saveTeams();
          updateTeamNamesInScoreboards();
        }
      });
    }
    const resetTeams = () => {
      state.teams.forEach((team, index) => {
        team.score = 0;
        team.name = `Team ${index + 1}`;
      });
      saveTeams();
      renderScoreboards();
      showToast('Team scores reset.');
    };
    const drawerReset = $('#drawerResetTeams');
    if (drawerReset) drawerReset.addEventListener('click', resetTeams);
    const gamesReset = $('#gamesResetScoresBtn');
    if (gamesReset) gamesReset.addEventListener('click', resetTeams);
    const open = () => openDrawer();
    ['#teacherBtn', '#dockTeacherBtn'].map((id) => $(id)).filter(Boolean).forEach((button) => button.addEventListener('click', open));
    const dockTimer = $('#dockTimerBtn');
    if (dockTimer) dockTimer.addEventListener('click', openDrawer);
    const close = $('#drawerClose');
    if (close) close.addEventListener('click', closeDrawer);
    const backdrop = $('#drawerBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDrawer();
        closeLightbox();
      }
    });
    renderScoreboards();
  }

  function initTeacher() {
    const start = $('#timerStartBtn');
    if (start) start.addEventListener('click', startLessonTimer);
    const pause = $('#timerPauseBtn');
    if (pause) pause.addEventListener('click', pauseLessonTimer);
    const reset = $('#timerResetBtn');
    if (reset) reset.addEventListener('click', resetLessonTimer);
    const presets = $('.preset-row');
    if (presets) {
      presets.addEventListener('click', (event) => {
        const button = event.target.closest('[data-min]');
        if (!button) return;
        setLessonTimer(Number(button.dataset.min), `${button.dataset.min} minute timer`);
        $$('.preset-row button').forEach((item) => item.classList.toggle('on', item === button));
      });
    }
    const max = $('#studentMax');
    if (max) {
      max.addEventListener('change', () => {
        state.student.max = clamp(Number(max.value) || 30, 1, 60);
        max.value = String(state.student.max);
        store.set(KEYS.studentMax, state.student.max);
        resetStudentPool();
      });
    }
    const pick = $('#pickStudentBtn');
    if (pick) pick.addEventListener('click', () => pickStudent());
    const resetPool = $('#resetStudentsBtn');
    if (resetPool) resetPool.addEventListener('click', () => {
      resetStudentPool();
      const result = $('#randomResult');
      if (result) result.textContent = '--';
      showToast('Student pool reset.');
    });
    const noRepeat = $('#noRepeatSwitch');
    if (noRepeat) {
      noRepeat.checked = state.student.noRepeat;
      noRepeat.addEventListener('change', () => {
        state.student.noRepeat = noRepeat.checked;
        if (!state.student.noRepeat) resetStudentPool();
      });
    }
    const answers = $('#showAnswersSwitch');
    if (answers) answers.addEventListener('click', () => setAnswers(!state.answers));
    const textbook = $('#textbookSwitch');
    if (textbook) textbook.addEventListener('click', () => setTextbook(!state.textbook));
    const motion = $('#motionSwitch');
    if (motion) motion.addEventListener('click', () => setMotion(!state.motion));
    const full = $('#drawerFullscreenBtn');
    if (full) {
      full.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      });
    }
    const resetEverything = $('#resetEverythingBtn');
    if (resetEverything) {
      resetEverything.addEventListener('click', () => {
        if (!window.confirm('Reset all team scores and classroom games? This does not erase settings or the custom puzzle bank.')) return;
        state.teams.forEach((team, index) => {
          team.score = 0;
          team.name = `Team ${index + 1}`;
        });
        saveTeams();
        state.practiced = {};
        savePractice();
        state.hiddenWords.clear();
        state.flip.score = 0;
        state.story.complete = false;
        state.quiz.score = 0;
        state.quiz.index = 0;
        state.quiz.answered = false;
        state.quiz.options = [];
        resetStoryGame();
        resetMemoryGame();
        resetQuiz();
        loadPuzzle(0, false);
        renderVocabGrid();
        renderScoreboards();
        pauseLessonTimer();
        setLessonTimer(50, 'Full lesson');
        showToast('Classroom games reset.');
      });
    }
    const print = $('#printGuideBtn');
    if (print) print.addEventListener('click', () => window.print());
    const prev = $('#drawerPrevBtn');
    if (prev) prev.addEventListener('click', () => goTab(state.tab - 1));
    const next = $('#drawerNextBtn');
    if (next) next.addEventListener('click', () => goTab(state.tab + 1));
    setLessonTimer(50, 'Full lesson');
    resetStudentPool();
    updateRelayUi();
  }

  function initDialogue() {
    renderDialogueScript();
    setScene(1, false);
    const scene1 = $('#scene1Btn');
    if (scene1) scene1.addEventListener('click', () => {
      setScene(1);
      state.roleActive = false;
      showAllLines();
    });
    const scene2 = $('#scene2Btn');
    if (scene2) scene2.addEventListener('click', () => {
      setScene(2);
      state.roleActive = false;
      showAllLines();
    });
    const playAll = $('#playAllBtn');
    if (playAll) playAll.addEventListener('click', playAllDialogue);
    const stop = $('#stopAudioBtn');
    if (stop) stop.addEventListener('click', () => {
      stopSpeech();
      hideBubble();
      clearSpeaking();
    });
    const roleplay = $('#roleplayBtn');
    if (roleplay) roleplay.addEventListener('click', () => {
      state.roleActive = true;
      state.roleIndex = -1;
      hideAllLines(true);
      showToast('Role-play mode. The lines are hidden.');
    });
    const startRole = $('#startRoleplayBtn');
    if (startRole) startRole.addEventListener('click', () => {
      state.roleActive = true;
      state.roleIndex = -1;
      hideAllLines(true);
      nextRoleLine();
    });
    const nextRole = $('#nextRoleBtn');
    if (nextRole) nextRole.addEventListener('click', nextRoleLine);
    const revealRole = $('#revealRoleBtn');
    if (revealRole) revealRole.addEventListener('click', revealRoleLine);
    const showLines = $('#showAllLinesBtn');
    if (showLines) showLines.addEventListener('click', showAllLines);
    const hideLines = $('#hideAllLinesBtn');
    if (hideLines) hideLines.addEventListener('click', () => hideAllLines(true));
    const script = $('#dialogueScript');
    if (script) script.addEventListener('click', (event) => {
      const line = event.target.closest('[data-dlg-index]');
      if (line) playDialogueLine(Number(line.dataset.dlgIndex));
    });
    $$('.actor[data-speaker]').forEach((actor) => actor.addEventListener('click', () => {
      const index = DIALOGUE.findIndex((line) => line.spk === actor.dataset.speaker);
      if (index >= 0) playDialogueLine(index);
    }));
    const textbookMode = $('#classroomModeSwitch');
    if (textbookMode) {
      textbookMode.checked = state.textbook;
      textbookMode.addEventListener('change', () => setTextbook(textbookMode.checked));
    }
  }

  function initVocab() {
    renderVocabGrid();
    $$('#vocabArtPills button').forEach((button) => button.addEventListener('click', () => {
      state.vocabArt = button.dataset.art;
      $$('#vocabArtPills button').forEach((item) => item.classList.toggle('on', item === button));
      renderVocabGrid();
      renderMemoryGame();
    }));
    const grid = $('#vocabGrid');
    if (grid) {
      grid.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
          if (button.dataset.vsay) speakText(button.dataset.vsay);
          if (button.dataset.vslow) speakText(button.dataset.vslow, { slow: true });
          if (button.dataset.vspell) spellText(button.dataset.vspell);
          if (button.dataset.vrepeat) practiseWord(button.dataset.vrepeat);
          return;
        }
        const card = event.target.closest('[data-vocab]');
        if (card) speakText(card.dataset.vocab);
      });
    }
    const hide = $('#hideWordsBtn');
    if (hide) hide.addEventListener('click', () => {
      VOCAB.forEach((item) => state.hiddenWords.add(item.word));
      renderVocabGrid();
    });
    const reveal = $('#revealWordsBtn');
    if (reveal) reveal.addEventListener('click', () => {
      state.hiddenWords.clear();
      renderVocabGrid();
    });
    const resetMarks = $('#resetWordMarksBtn');
    if (resetMarks) resetMarks.addEventListener('click', () => {
      state.practiced = {};
      savePractice();
      renderVocabGrid();
    });
    const practice = $('#practiceModePills');
    if (practice) practice.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) return;
      $$('#practiceModePills button').forEach((item) => item.classList.toggle('on', item === button));
      const text = $('#practiceText');
      if (text) text.innerHTML = `<strong>${button.textContent.trim()} practice:</strong> say each word three times. Tap a card for audio, then use "Say it 3 times" when the group is ready.`;
    });
    const spin = $('#spinBtn');
    if (spin) spin.addEventListener('click', spinWheel);
    const spinSay = $('#spinSayBtn');
    if (spinSay) spinSay.addEventListener('click', () => {
      if (state.wheelResult) speakText(state.wheelResult);
    });
    const spinSpell = $('#spinSpellBtn');
    if (spinSpell) spinSpell.addEventListener('click', () => {
      if (state.wheelResult) spellText(state.wheelResult);
    });
    const spellHear = $('#spellHearBtn');
    if (spellHear) spellHear.addEventListener('click', () => speakText(state.spellWord));
    const spellSlow = $('#spellSlowBtn');
    if (spellSlow) spellSlow.addEventListener('click', () => speakText(state.spellWord, { slow: true }));
    const spell = $('#spellSpellBtn');
    if (spell) spell.addEventListener('click', () => spellText(state.spellWord));
    const check = $('#spellCheckBtn');
    if (check) check.addEventListener('click', checkSpelling);
    const nextWord = $('#spellNextBtn');
    if (nextWord) nextWord.addEventListener('click', () => {
      newSpellWord();
      speakText(state.spellWord);
    });
    const input = $('#spellInput');
    if (input) input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') checkSpelling();
    });
    const opp = $('.opp-grid');
    if (opp) opp.addEventListener('click', (event) => handleOppositeClick(event.target.closest('[data-pair]')));
  }

  function initPatterns() {
    ['#subjSel', '#beSel', '#adjSel'].map((id) => $(id)).filter(Boolean).forEach((select) => {
      select.addEventListener('change', () => {
        if (select.id === 'subjSel') syncBeVerb();
        else updateMachinePreview();
      });
    });
    const help = $('#agreementHelp');
    if (help) help.addEventListener('change', syncBeVerb);
    const build = $('#buildSentenceBtn');
    if (build) build.addEventListener('click', buildMachineSentence);
    const next = $('#flipNextBtn');
    if (next) next.addEventListener('click', newFlipQuestion);
    const flip = $('#flipOptions');
    if (flip) flip.addEventListener('click', (event) => handleFlipAnswer(event.target.closest('[data-flip-opt]')));
    renderExtraSentences();
    updateMachinePreview();
    newFlipQuestion();
  }

  function initListen() {
    renderLookScene();
    renderRepeatCount();
    const say = $('#lookSayBtn');
    if (say) say.addEventListener('click', () => speakText(LOOK_SCENES[state.look.adjective].caption));
    const slow = $('#lookSlowBtn');
    if (slow) slow.addEventListener('click', () => speakText(LOOK_SCENES[state.look.adjective].caption, { slow: true }));
    const again = $('#lookLookBtn');
    if (again) again.addEventListener('click', () => {
      updateLookSentenceCover(false);
      const scene = $('.scene-card');
      if (scene && !state.motion) {
        scene.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 650, easing: 'ease-in-out' });
      }
    });
    const hide = $('#lookHideBtn');
    if (hide) hide.addEventListener('click', () => updateLookSentenceCover(true));
    const reveal = $('#lookRevealBtn');
    if (reveal) reveal.addEventListener('click', () => updateLookSentenceCover(false));
    const sentence = $('#lookSentence');
    if (sentence) sentence.addEventListener('click', (event) => {
      const word = event.target.closest('[data-look-word]');
      if (word) speakText(word.textContent);
    });
    const opts = $('#lookAdjectiveOpts');
    if (opts) opts.addEventListener('click', (event) => {
      const button = event.target.closest('[data-adj]');
      if (!button) return;
      const feedback = $('#lookFeedback');
      if (button.dataset.adj === state.look.adjective) {
        button.classList.add('correct');
        if (feedback) {
          feedback.textContent = `${state.look.adjective} is the adjective.`;
          feedback.className = 'feedback good';
        }
        burstConfetti(8);
      } else {
        button.classList.add('wrong');
        if (feedback) {
          feedback.textContent = 'Look at the scene label. Which feeling word do you see?';
          feedback.className = 'feedback bad';
        }
        setTimeout(() => button.classList.remove('wrong'), 450);
      }
    });
    $$('#lookArtPills [data-art]').forEach((button) => button.addEventListener('click', () => {
      state.look.art = button.dataset.art;
      renderLookScene();
    }));
    $$('.look-extra').forEach((button) => button.addEventListener('click', () => setLookAdjective(button.dataset.adj)));
    const resetScene = $('#lookResetSceneBtn');
    if (resetScene) resetScene.addEventListener('click', () => setLookAdjective('bored'));
    const add = $('#repeatAddBtn');
    if (add) add.addEventListener('click', () => {
      renderRepeatCount.count = Math.min(5, (Number(renderRepeatCount.count) || 0) + 1);
      renderRepeatCount();
    });
    const resetRepeat = $('#repeatResetBtn');
    if (resetRepeat) resetRepeat.addEventListener('click', () => {
      renderRepeatCount.count = 0;
      renderRepeatCount();
    });
    const random = $('#lookRandomBtn');
    if (random) random.addEventListener('click', () => pickStudent('lookRandomOut'));
    const steps = $('#lookSteps');
    if (steps) steps.addEventListener('change', () => {
      if ($$('#lookSteps input').every((box) => box.checked)) burstConfetti(12);
    });
  }

  function initPoint() {
    renderPointGrid();
    renderPointStatus();
    renderPointTimer();
    $$('#pointArtPills [data-art]').forEach((button) => button.addEventListener('click', () => {
      state.point.art = button.dataset.art;
      $$('#pointArtPills button').forEach((item) => item.classList.toggle('on', item === button));
      renderPointGrid();
    }));
    $$('#pointModePills [data-mode]').forEach((button) => button.addEventListener('click', () => setPointMode(button.dataset.mode)));
    const team = $('#pointTeamSel');
    if (team) team.addEventListener('change', () => {
      state.point.team = Number(team.value) || 0;
      renderPointStatus();
      updateActiveTeamBoxes();
    });
    const play = $('#pointPlayBtn');
    if (play) play.addEventListener('click', () => speakText(state.point.target));
    const replay = $('#pointReplayBtn');
    if (replay) replay.addEventListener('click', () => speakText(state.point.target));
    const next = $('#pointNextBtn');
    if (next) next.addEventListener('click', nextPointTarget);
    const grid = $('#pointGrid');
    if (grid) grid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-point-card]');
      if (card) handlePointCard(card);
    });
    const status = $('#pointStatus');
    if (status) status.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-point-word]');
      if (!chip) return;
      state.point.target = chip.dataset.pointWord;
      renderPointStatus();
      speakText(state.point.target);
      startPointTimer();
    });
  }
  function initPuzzle() {
    populateBankEditor();
    loadPuzzle(0, false);
    $$('#puzzleModePills [data-mode]').forEach((button) => button.addEventListener('click', () => {
      state.puzzle.mode = button.dataset.mode;
      $$('#puzzleModePills button').forEach((item) => item.classList.toggle('on', item === button));
      if (state.puzzle.mode === 'random') showToast('Random mode: use Next for a random practice sentence.');
      if (state.puzzle.mode === 'sequential') showToast('Sequential mode: questions follow the bank order.');
      maybePuzzleAutoSound();
    }));
    const toggle = $('#bankToggleBtn');
    if (toggle) toggle.addEventListener('click', () => {
      const editor = $('#bankEditor');
      if (editor) editor.classList.toggle('open');
    });
    const playClue = $('#puzzlePlayClueBtn');
    if (playClue) playClue.addEventListener('click', () => {
      if (state.puzzle.current) speakText(state.puzzle.current.clue);
    });
    const slowClue = $('#puzzleSlowClueBtn');
    if (slowClue) slowClue.addEventListener('click', () => {
      if (state.puzzle.current) speakText(state.puzzle.current.clue, { slow: true });
    });
    const slots = $('#puzzleSlots');
    if (slots) {
      slots.addEventListener('click', (event) => {
        const slot = event.target.closest('[data-slot]');
        if (slot) removePuzzleTile(Number(slot.dataset.slot));
      });
      slots.addEventListener('dragover', (event) => {
        const slot = event.target.closest('.puzzle-slot');
        if (!slot) return;
        event.preventDefault();
        slot.classList.add('drag-over');
      });
      slots.addEventListener('dragleave', (event) => {
        const slot = event.target.closest('.puzzle-slot');
        if (slot) slot.classList.remove('drag-over');
      });
      slots.addEventListener('drop', (event) => {
        const slot = event.target.closest('.puzzle-slot');
        if (!slot) return;
        event.preventDefault();
        slot.classList.remove('drag-over');
        const id = event.dataTransfer.getData('text/plain');
        if (id) placePuzzleTile(id, Number(slot.dataset.slot));
      });
    }
    const bank = $('#puzzleBank');
    if (bank) {
      bank.addEventListener('click', (event) => {
        const tile = event.target.closest('[data-tile]');
        if (!tile) return;
        const empty = state.puzzle.slots.indexOf(null);
        if (empty < 0) {
          showToast('All slots are full. Tap a word in the sentence to remove it.');
          return;
        }
        placePuzzleTile(tile.dataset.tile, empty);
      });
      bank.addEventListener('dragstart', (event) => {
        const tile = event.target.closest('[data-tile]');
        if (!tile) return;
        event.dataTransfer.setData('text/plain', tile.dataset.tile);
        event.dataTransfer.effectAllowed = 'move';
      });
    }
    if (slots) {
      slots.addEventListener('dragstart', (event) => {
        const tile = event.target.closest('[data-tile-id]');
        if (!tile) return;
        event.dataTransfer.setData('text/plain', tile.dataset.tileId);
        event.dataTransfer.effectAllowed = 'move';
      });
    }
    const check = $('#puzzleCheckBtn');
    if (check) check.addEventListener('click', checkPuzzle);
    const answer = $('#puzzleAnswerBtn');
    if (answer) answer.addEventListener('click', showPuzzleAnswer);
    const reset = $('#puzzleResetBtn');
    if (reset) reset.addEventListener('click', resetPuzzleTiles);
    const next = $('#puzzleNextBtn');
    if (next) next.addEventListener('click', nextPuzzle);
    const team = $('#puzzleTeamSel');
    if (team) team.addEventListener('change', updateActiveTeamBoxes);
    const student = $('#callStudentBtn');
    if (student) student.addEventListener('click', () => pickStudent('puzzleCallOut'));
    const apply = $('#bankApplyBtn');
    if (apply) apply.addEventListener('click', applyBank);
    const restore = $('#bankRestoreBtn');
    if (restore) restore.addEventListener('click', restoreBank);
    const start = $('#relayStartBtn');
    if (start) {
      start.addEventListener('click', () => {
        if (state.relay.running) pauseRelay();
        else startRelay();
        updateRelayUi();
      });
    }
    const pause = $('#relayPauseBtn');
    if (pause) pause.addEventListener('click', () => {
      pauseRelay();
      updateRelayUi();
    });
    const resetRelayBtn = $('#relayResetBtn');
    if (resetRelayBtn) resetRelayBtn.addEventListener('click', () => {
      resetRelay(state.relay.total);
      updateRelayUi();
    });
    const presets = $('#relayPresets');
    if (presets) {
      presets.addEventListener('click', (event) => {
        const button = event.target.closest('[data-sec]');
        if (!button) return;
        state.relay.total = Number(button.dataset.sec) || 90;
        resetRelay(state.relay.total);
        updateRelayUi();
      });
    }
    updateRelayUi();
  }

  function initGames() {
    resetStoryGame();
    resetMemoryGame();
    const storyReset = $('#storyResetBtn');
    if (storyReset) storyReset.addEventListener('click', resetStoryGame);
    const storyPlay = $('#storyPlayBtn');
    if (storyPlay) storyPlay.addEventListener('click', playCompletedStory);
    const storyChoices = $('#storyChoices');
    if (storyChoices) storyChoices.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-story-line]');
      if (choice) chooseStoryLine(Number(choice.dataset.storyLine));
    });
    const memoryReset = $('#memoryResetBtn');
    if (memoryReset) memoryReset.addEventListener('click', resetMemoryGame);
    const memoryGrid = $('#memoryGrid');
    if (memoryGrid) memoryGrid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-memory-card]');
      if (card) flipMemoryCard(card);
    });
  }

  function initQuiz() {
    resetQuiz();
    const hear = $('#quizHearBtn');
    if (hear) hear.addEventListener('click', () => {
      const item = QUIZ[state.quiz.index];
      if (item) speakText(item.q);
    });
    const next = $('#quizNextBtn');
    if (next) next.addEventListener('click', nextQuizQuestion);
    const restart = $('#quizRestartBtn');
    if (restart) restart.addEventListener('click', resetQuiz);
    const again = $('#quizAgainBtn');
    if (again) again.addEventListener('click', resetQuiz);
    const options = $('#quizOptions');
    if (options) options.addEventListener('click', (event) => {
      const option = event.target.closest('[data-quiz-option]');
      if (option) answerQuiz(option);
    });
    const team = $('#quizTeamSel');
    if (team) team.addEventListener('change', openQuizTeamBadge);
  }

  function init() {
    setSound(state.sound);
    setRate(state.rate * 100);
    setTextbook(state.textbook, true);
    setAnswers(state.answers);
    setMotion(state.motion);
    buildSky();
    initAudio();
    initShell();
    initTeacher();
    initDialogue();
    initVocab();
    initPatterns();
    initListen();
    initPoint();
    initPuzzle();
    initGames();
    initQuiz();
    goTab(0, false);
  }

  init();
})();

