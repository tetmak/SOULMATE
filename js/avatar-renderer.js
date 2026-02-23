/**
 * NUMERAEL — Avatar Renderer
 * SVG-based human face with Canvas overlay for real-time animation.
 * Designed for easy asset swapping — replace SVG paths without refactoring.
 *
 * Exports: window.AvatarRenderer
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION — Change these to swap avatar assets
  // ═══════════════════════════════════════════════════════════
  var CONFIG = {
    size: 200,
    idleBreathAmplitude: 1.5,
    idleBreathSpeed: 0.0015,
    blinkIntervalMin: 2000,
    blinkIntervalMax: 6000,
    blinkDuration: 150,
    headSwayAmplitude: 2,
    headSwaySpeed: 0.002,
    mouthOpenMax: 8,
    skinTone: '#c8a882',
    skinShadow: '#b8956e',
    hairColor: '#2c1810',
    eyeColor: '#3d2b1f',
    lipColor: '#b87070',
    bgColor: 'transparent'
  };

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  var state = {
    canvas: null,
    ctx: null,
    animFrame: null,
    running: false,
    // Animation params
    time: 0,
    lastTime: 0,
    blinkState: 0,       // 0 = open, 1 = closing, 2 = closed, 3 = opening
    blinkTimer: 0,
    nextBlink: 3000,
    mouthOpen: 0,        // 0-1 normalized
    targetMouthOpen: 0,
    headOffsetX: 0,
    headOffsetY: 0,
    isSpeaking: false,
    breathPhase: 0
  };

  // ═══════════════════════════════════════════════════════════
  // CANVAS CREATION
  // ═══════════════════════════════════════════════════════════
  function createCanvas(container) {
    var canvas = document.createElement('canvas');
    canvas.width = CONFIG.size * 2;  // 2x for retina
    canvas.height = CONFIG.size * 2;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.borderRadius = '50%';
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    if (container) {
      container.appendChild(canvas);
    }
    return canvas;
  }

  // ═══════════════════════════════════════════════════════════
  // DRAWING FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  function drawFace(ctx, cx, cy, scale, breathOffset) {
    var s = scale;

    // Head shape (oval)
    ctx.save();
    ctx.translate(cx + state.headOffsetX, cy + state.headOffsetY + breathOffset);

    // Head shadow
    ctx.beginPath();
    ctx.ellipse(0, 2 * s, 62 * s, 76 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(0, 0, 60 * s, 74 * s, 0, 0, Math.PI * 2);
    var headGrad = ctx.createRadialGradient(-10 * s, -15 * s, 10 * s, 0, 0, 74 * s);
    headGrad.addColorStop(0, CONFIG.skinTone);
    headGrad.addColorStop(1, CONFIG.skinShadow);
    ctx.fillStyle = headGrad;
    ctx.fill();

    // Hair
    drawHair(ctx, s);

    // Eyes
    drawEyes(ctx, s);

    // Nose
    drawNose(ctx, s);

    // Mouth
    drawMouth(ctx, s);

    // Eyebrows
    drawEyebrows(ctx, s);

    ctx.restore();
  }

  function drawHair(ctx, s) {
    ctx.save();
    ctx.fillStyle = CONFIG.hairColor;

    // Top hair mass
    ctx.beginPath();
    ctx.ellipse(0, -52 * s, 64 * s, 32 * s, 0, Math.PI, 0);
    ctx.quadraticCurveTo(64 * s, -30 * s, 58 * s, -10 * s);
    ctx.quadraticCurveTo(50 * s, -40 * s, 0, -48 * s);
    ctx.quadraticCurveTo(-50 * s, -40 * s, -58 * s, -10 * s);
    ctx.quadraticCurveTo(-64 * s, -30 * s, -64 * s, -52 * s);
    ctx.closePath();
    ctx.fill();

    // Side hair left
    ctx.beginPath();
    ctx.moveTo(-58 * s, -10 * s);
    ctx.quadraticCurveTo(-66 * s, 10 * s, -60 * s, 20 * s);
    ctx.quadraticCurveTo(-58 * s, 10 * s, -56 * s, -5 * s);
    ctx.closePath();
    ctx.fill();

    // Side hair right
    ctx.beginPath();
    ctx.moveTo(58 * s, -10 * s);
    ctx.quadraticCurveTo(66 * s, 10 * s, 60 * s, 20 * s);
    ctx.quadraticCurveTo(58 * s, 10 * s, 56 * s, -5 * s);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawEyes(ctx, s) {
    var eyeY = -8 * s;
    var eyeSpacing = 22 * s;
    var eyeW = 12 * s;
    var eyeH = 7 * s;

    // Blink factor: 0 = open, 1 = closed
    var blinkFactor = 0;
    if (state.blinkState === 1) {
      blinkFactor = state.blinkTimer / (CONFIG.blinkDuration / 2);
    } else if (state.blinkState === 2) {
      blinkFactor = 1;
    } else if (state.blinkState === 3) {
      blinkFactor = 1 - (state.blinkTimer / (CONFIG.blinkDuration / 2));
    }
    blinkFactor = Math.max(0, Math.min(1, blinkFactor));

    var actualEyeH = eyeH * (1 - blinkFactor * 0.9);

    // Left eye
    drawSingleEye(ctx, -eyeSpacing, eyeY, eyeW, actualEyeH, s, blinkFactor);
    // Right eye
    drawSingleEye(ctx, eyeSpacing, eyeY, eyeW, actualEyeH, s, blinkFactor);
  }

  function drawSingleEye(ctx, x, y, w, h, s, blinkFactor) {
    // Eye white
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f0eb';
    ctx.fill();

    if (blinkFactor < 0.7) {
      // Iris
      var irisR = 5.5 * s * (1 - blinkFactor * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, irisR, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.eyeColor;
      ctx.fill();

      // Pupil
      var pupilR = 2.5 * s * (1 - blinkFactor * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, pupilR, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0a';
      ctx.fill();

      // Eye highlight
      ctx.beginPath();
      ctx.arc(x - 2 * s, y - 2 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();
    }

    // Eyelid line (upper)
    ctx.beginPath();
    ctx.ellipse(x, y - h * 0.1, w + 1 * s, h + 1 * s, 0, Math.PI + 0.2, -0.2);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1 * s;
    ctx.stroke();
  }

  function drawEyebrows(ctx, s) {
    var browY = -22 * s;
    var browSpacing = 22 * s;

    // Slight raise when speaking
    var speakRaise = state.isSpeaking ? -1.5 * s : 0;

    ctx.lineWidth = 2.5 * s;
    ctx.lineCap = 'round';
    ctx.strokeStyle = CONFIG.hairColor;

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(-browSpacing - 10 * s, browY + 2 * s + speakRaise);
    ctx.quadraticCurveTo(-browSpacing, browY - 2 * s + speakRaise, -browSpacing + 10 * s, browY + 1 * s + speakRaise);
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(browSpacing - 10 * s, browY + 1 * s + speakRaise);
    ctx.quadraticCurveTo(browSpacing, browY - 2 * s + speakRaise, browSpacing + 10 * s, browY + 2 * s + speakRaise);
    ctx.stroke();
  }

  function drawNose(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -2 * s);
    ctx.quadraticCurveTo(5 * s, 10 * s, 0, 14 * s);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Nostril hints
    ctx.beginPath();
    ctx.arc(-4 * s, 13 * s, 2 * s, 0, Math.PI * 2);
    ctx.arc(4 * s, 13 * s, 2 * s, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fill();
  }

  function drawMouth(ctx, s) {
    var mouthY = 28 * s;
    var mouthW = 16 * s;
    var openAmount = state.mouthOpen * CONFIG.mouthOpenMax * s;

    if (openAmount > 0.5 * s) {
      // Open mouth
      ctx.beginPath();
      ctx.ellipse(0, mouthY + openAmount * 0.3, mouthW * (0.6 + state.mouthOpen * 0.4), openAmount * 0.8 + 2 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4a2020';
      ctx.fill();

      // Upper lip
      ctx.beginPath();
      ctx.moveTo(-mouthW * 0.7, mouthY);
      ctx.quadraticCurveTo(-mouthW * 0.2, mouthY - 3 * s, 0, mouthY - 1 * s);
      ctx.quadraticCurveTo(mouthW * 0.2, mouthY - 3 * s, mouthW * 0.7, mouthY);
      ctx.strokeStyle = CONFIG.lipColor;
      ctx.lineWidth = 2 * s;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Lower lip
      ctx.beginPath();
      ctx.moveTo(-mouthW * 0.6, mouthY + openAmount * 0.6);
      ctx.quadraticCurveTo(0, mouthY + openAmount + 3 * s, mouthW * 0.6, mouthY + openAmount * 0.6);
      ctx.strokeStyle = CONFIG.lipColor;
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();
    } else {
      // Closed mouth — neutral expression (slight natural curve)
      ctx.beginPath();
      ctx.moveTo(-mouthW * 0.7, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 2 * s, mouthW * 0.7, mouthY);
      ctx.strokeStyle = CONFIG.lipColor;
      ctx.lineWidth = 2 * s;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ANIMATION LOOP
  // ═══════════════════════════════════════════════════════════

  function updateBlink(dt) {
    state.blinkTimer += dt;

    if (state.blinkState === 0) {
      // Waiting to blink
      state.nextBlink -= dt;
      if (state.nextBlink <= 0) {
        state.blinkState = 1;
        state.blinkTimer = 0;
        state.nextBlink = CONFIG.blinkIntervalMin + Math.random() * (CONFIG.blinkIntervalMax - CONFIG.blinkIntervalMin);
      }
    } else if (state.blinkState === 1) {
      // Closing
      if (state.blinkTimer >= CONFIG.blinkDuration / 2) {
        state.blinkState = 2;
        state.blinkTimer = 0;
      }
    } else if (state.blinkState === 2) {
      // Closed
      if (state.blinkTimer >= 40) {
        state.blinkState = 3;
        state.blinkTimer = 0;
      }
    } else if (state.blinkState === 3) {
      // Opening
      if (state.blinkTimer >= CONFIG.blinkDuration / 2) {
        state.blinkState = 0;
        state.blinkTimer = 0;
      }
    }
  }

  function updateMouth(dt) {
    // Smooth interpolation toward target
    var speed = 0.012 * dt;
    state.mouthOpen += (state.targetMouthOpen - state.mouthOpen) * Math.min(speed, 1);
  }

  function updateHead(dt) {
    if (state.isSpeaking) {
      // Subtle head movement during speech
      state.headOffsetX = Math.sin(state.time * CONFIG.headSwaySpeed * 1.3) * CONFIG.headSwayAmplitude * 1.2;
      state.headOffsetY = Math.cos(state.time * CONFIG.headSwaySpeed * 0.9) * CONFIG.headSwayAmplitude * 0.6;
    } else {
      // Very subtle idle sway
      state.headOffsetX = Math.sin(state.time * CONFIG.headSwaySpeed * 0.3) * CONFIG.headSwayAmplitude * 0.3;
      state.headOffsetY = 0;
    }
  }

  function render(timestamp) {
    if (!state.running) return;

    var dt = timestamp - state.lastTime;
    if (dt > 100) dt = 16; // cap dt on tab switch
    state.lastTime = timestamp;
    state.time += dt;

    updateBlink(dt);
    updateMouth(dt);
    updateHead(dt);

    var ctx = state.ctx;
    var w = state.canvas.width;
    var h = state.canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var scale = w / CONFIG.size * 0.4;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background circle
    if (CONFIG.bgColor !== 'transparent') {
      ctx.beginPath();
      ctx.arc(cx, cy, w / 2, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.bgColor;
      ctx.fill();
    }

    // Breathing offset
    state.breathPhase = Math.sin(state.time * CONFIG.idleBreathSpeed) * CONFIG.idleBreathAmplitude * scale;

    // Draw the face
    drawFace(ctx, cx, cy + 10 * scale, scale, state.breathPhase);

    state.animFrame = requestAnimationFrame(render);
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════

  function start(container) {
    if (state.running) return state.canvas;
    createCanvas(container);
    state.running = true;
    state.lastTime = performance.now();
    state.animFrame = requestAnimationFrame(render);
    return state.canvas;
  }

  function stop() {
    state.running = false;
    if (state.animFrame) {
      cancelAnimationFrame(state.animFrame);
      state.animFrame = null;
    }
  }

  function setSpeaking(isSpeaking) {
    state.isSpeaking = isSpeaking;
    if (!isSpeaking) {
      state.targetMouthOpen = 0;
    }
  }

  function setMouthOpen(value) {
    // value: 0-1
    state.targetMouthOpen = Math.max(0, Math.min(1, value));
  }

  function getCanvas() {
    return state.canvas;
  }

  function updateConfig(overrides) {
    for (var key in overrides) {
      if (CONFIG.hasOwnProperty(key)) {
        CONFIG[key] = overrides[key];
      }
    }
  }

  function isRunning() {
    return state.running;
  }

  // ─── Export ───
  window.AvatarRenderer = {
    start: start,
    stop: stop,
    setSpeaking: setSpeaking,
    setMouthOpen: setMouthOpen,
    getCanvas: getCanvas,
    updateConfig: updateConfig,
    isRunning: isRunning
  };

})();
