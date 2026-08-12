/**
 * FinTech Trust - Corporate Blue & Gold Web3 & Gaming Platform JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initAviatorSimulator();
  initCodeSandbox();
  initPaymentFlowVisualizer();
  initStatsCounter();
  initMobileMenu();
  initFaqAccordion();
});

/* ==========================================
 * 1. REAL-TIME AVIATOR CANVAS SIMULATOR
 * ========================================== */
function initAviatorSimulator() {
  const canvas = document.getElementById('aviatorCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Resize canvas to parent container
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height || 340;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // State variables
  let gameState = 'IDLE'; // 'IDLE', 'RUNNING', 'CRASHED', 'CASHOUT'
  let multiplier = 1.00;
  let targetCrash = 3.85;
  let animationFrameId = null;
  let startTime = 0;

  let betAmount = 100; // ETB
  let autoCashout = 2.00;
  let cashedOutAt = null;
  let playerBalance = 25000.00; // ETB

  // UI Elements
  const multiplierEl = document.getElementById('aviatorMultiplier');
  const statusBadgeEl = document.getElementById('aviatorStatusBadge');
  const betBtn = document.getElementById('aviatorBetBtn');
  const betAmountInput = document.getElementById('betAmountInput');
  const balanceEl = document.getElementById('userBalance');
  const telemetryList = document.getElementById('aviatorTelemetry');
  const quickBetBtns = document.querySelectorAll('.quick-bet-btn');

  // Quick Bet presets
  quickBetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-val'));
      betAmountInput.value = val;
      betAmount = val;
    });
  });

  betAmountInput.addEventListener('change', (e) => {
    betAmount = Math.max(10, parseFloat(e.target.value) || 10);
  });

  // Action Button (Bet / Cashout)
  betBtn.addEventListener('click', () => {
    if (gameState === 'IDLE' || gameState === 'CRASHED') {
      startFlight();
    } else if (gameState === 'RUNNING') {
      cashout();
    }
  });

  function startFlight() {
    if (playerBalance < betAmount) {
      alert('Insufficient ETB Balance in Sandbox Wallet!');
      return;
    }

    playerBalance -= betAmount;
    updateBalanceUI();

    gameState = 'RUNNING';
    multiplier = 1.00;
    cashedOutAt = null;
    
    // Random crash point (weighted towards 1.5x - 8.0x)
    targetCrash = (1.1 + Math.pow(Math.random(), 2.2) * 12).toFixed(2);

    betBtn.innerText = 'CASHOUT (ETB ' + (betAmount * 1.00).toFixed(2) + ')';
    betBtn.className = 'w-full py-4 rounded-xl btn-purple text-lg uppercase tracking-wider font-extrabold shadow-lg transition duration-200';
    
    statusBadgeEl.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-[#C084FC] inline-block animate-ping mr-2"></span> IN FLIGHT';
    statusBadgeEl.className = 'px-3 py-1 text-xs font-bold rounded-full bg-[#9D4EDD]/20 text-[#C084FC] border border-[#9D4EDD]/40 flex items-center';

    startTime = performance.now();
    animateFrame(performance.now());
  }

  function cashout() {
    if (gameState !== 'RUNNING') return;
    
    gameState = 'CASHOUT';
    cashedOutAt = multiplier;
    const winAmount = betAmount * cashedOutAt;
    playerBalance += winAmount;
    updateBalanceUI();

    betBtn.innerText = 'BET PLACED (WIN: ' + winAmount.toFixed(2) + ' ETB)';
    betBtn.className = 'w-full py-4 rounded-xl btn-gold text-lg uppercase tracking-wider font-extrabold shadow-lg opacity-90 cursor-not-allowed text-[#090412]';
    
    statusBadgeEl.innerHTML = 'CASHOUT @ ' + cashedOutAt.toFixed(2) + 'x';
    statusBadgeEl.className = 'px-3 py-1 text-xs font-bold rounded-full bg-[#F5C227]/20 text-[#F5C227] border border-[#F5C227]/50 flex items-center';

    addTelemetryLog('CASHOUT', cashedOutAt, winAmount);
  }

  function crash() {
    gameState = 'CRASHED';
    cancelAnimationFrame(animationFrameId);

    multiplierEl.innerText = multiplier.toFixed(2) + 'x';
    multiplierEl.className = 'text-5xl md:text-7xl font-extrabold text-[#F5C227] text-glow-gold tracking-tight font-mono';

    statusBadgeEl.innerHTML = 'FLEW AWAY @ ' + multiplier.toFixed(2) + 'x';
    statusBadgeEl.className = 'px-3 py-1 text-xs font-bold rounded-full bg-[#F5C227]/20 text-[#F5C227] border border-[#F5C227]/40 flex items-center';

    betBtn.innerText = 'PLACE BET FOR NEXT ROUND';
    betBtn.className = 'w-full py-4 rounded-xl btn-gold text-lg uppercase tracking-wider font-extrabold shadow-lg text-[#090412]';

    if (!cashedOutAt) {
      addTelemetryLog('CRASH', multiplier, 0);
    }
  }

  function updateBalanceUI() {
    if (balanceEl) {
      balanceEl.innerText = playerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' ETB';
    }
  }

  function addTelemetryLog(type, mult, payout) {
    if (!telemetryList) return;
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between text-xs py-2 border-b border-white/5 font-mono animate-fade-in';
    
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const userHash = 'fintech_' + Math.random().toString(36).substring(2, 7);

    if (type === 'CASHOUT') {
      row.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#F5C227]"></span>
          <span class="text-white/70">${userHash}</span>
        </div>
        <span class="font-bold text-[#F5C227]">${mult.toFixed(2)}x</span>
        <span class="text-[#C084FC] font-bold">+${payout.toFixed(2)} ETB</span>
        <span class="text-white/40 text-[10px]">${timeStr}</span>
      `;
    } else {
      row.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#C084FC]"></span>
          <span class="text-white/70">${userHash}</span>
        </div>
        <span class="font-bold text-[#C084FC]">${mult.toFixed(2)}x</span>
        <span class="text-white/40">CRASHED</span>
        <span class="text-white/40 text-[10px]">${timeStr}</span>
      `;
    }

    telemetryList.insertBefore(row, telemetryList.firstChild);
    if (telemetryList.children.length > 7) {
      telemetryList.removeChild(telemetryList.lastChild);
    }
  }

  function drawBackgroundGrid() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep Dark Purple gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#150B27');
    bgGrad.addColorStop(1, '#090412');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Purple grid lines
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.08)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function animateFrame(now) {
    if (gameState !== 'RUNNING' && gameState !== 'CASHOUT') return;

    const elapsed = (now - startTime) / 1000; // seconds
    multiplier = 1.00 + Math.pow(elapsed * 0.85, 1.8);

    if (multiplier >= targetCrash) {
      multiplier = parseFloat(targetCrash);
      crash();
      drawFlightPath(1.0); // full path
      return;
    }

    // Auto cashout check
    if (gameState === 'RUNNING' && autoCashout > 1.0 && multiplier >= autoCashout) {
      cashout();
    }

    // Update UI elements
    multiplierEl.innerText = multiplier.toFixed(2) + 'x';
    multiplierEl.className = 'text-5xl md:text-7xl font-extrabold text-[#F5C227] text-glow-gold tracking-tight font-mono';

    if (gameState === 'RUNNING') {
      betBtn.innerText = 'CASHOUT (ETB ' + (betAmount * multiplier).toFixed(2) + ')';
    }

    drawFlightPath(Math.min((multiplier - 1) / (targetCrash - 1 || 1), 1.0));

    animationFrameId = requestAnimationFrame(animateFrame);
  }

  function drawFlightPath(progress) {
    drawBackgroundGrid();

    const w = canvas.width;
    const h = canvas.height;

    const paddingLeft = 40;
    const paddingBottom = 40;
    const graphWidth = w - paddingLeft - 40;
    const graphHeight = h - paddingBottom - 40;

    // Exponential Curve coordinates
    const curX = paddingLeft + graphWidth * Math.min(progress, 0.92);
    const curveYFactor = Math.pow(Math.min(progress, 0.92), 1.6);
    const curY = (h - paddingBottom) - graphHeight * curveYFactor;

    // Draw Glow Area under Curve
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(paddingLeft, h - paddingBottom);
    
    // Draw Bezier flight curve
    const cpX = paddingLeft + (curX - paddingLeft) * 0.6;
    const cpY = h - paddingBottom;
    ctx.quadraticCurveTo(cpX, cpY, curX, curY);

    ctx.lineTo(curX, h - paddingBottom);
    ctx.closePath();

    const fillGrad = ctx.createLinearGradient(0, curY, 0, h - paddingBottom);
    if (gameState === 'CRASHED') {
      fillGrad.addColorStop(0, 'rgba(245, 194, 39, 0.35)');
      fillGrad.addColorStop(1, 'rgba(245, 194, 39, 0.0)');
    } else {
      fillGrad.addColorStop(0, 'rgba(245, 194, 39, 0.4)');
      fillGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.2)');
      fillGrad.addColorStop(1, 'rgba(9, 4, 18, 0.0)');
    }
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    // Draw Main Curved Stroke Line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(paddingLeft, h - paddingBottom);
    ctx.quadraticCurveTo(cpX, cpY, curX, curY);

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F5C227';
    ctx.shadowColor = 'rgba(245, 194, 39, 0.85)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Draw Metallic Gold Jet Node at head of curve
    ctx.save();
    ctx.translate(curX, curY);
    
    // Calculate angle of tangent
    const dx = curX - cpX;
    const dy = curY - cpY;
    const angle = Math.atan2(dy, dx);
    ctx.rotate(angle);

    // Draw Metallic Gold Jet SVG shape
    ctx.fillStyle = '#F5C227';
    ctx.shadowColor = '#F5C227';
    ctx.shadowBlur = 20;

    // Aircraft body
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-12, -9);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 9);
    ctx.closePath();
    ctx.fill();

    // Purple thruster flame
    ctx.fillStyle = '#C084FC';
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(-16 - Math.random() * 6, 0);
    ctx.lineTo(-6, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Initial draw idle background
  drawBackgroundGrid();
}

/* ==========================================
 * 2. INTERACTIVE CODE SANDBOX & API TESTER
 * ========================================== */
function initCodeSandbox() {
  const tabs = document.querySelectorAll('.code-tab');
  const codeBlock = document.getElementById('codeDisplay');
  const runBtn = document.getElementById('runApiBtn');
  const responseBlock = document.getElementById('apiResponseDisplay');

  const codeExamples = {
    curl: `curl -X POST "https://api.whitelabelgaming.com/v1/platform/bets/place" \\
  -H "Authorization: Bearer sec_live_fintech_99f8a32b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "operator_id": "op_fintech_bet_01",
    "player_id": "usr_eth_9841",
    "currency": "ETB",
    "amount": 250.00,
    "game_code": "CRASH_ETHIOPIA_V1",
    "telebirr_auth_token": "tb_sess_88301a"
  }'`,

    js: `import { WhiteLabelPlatformAPI } from '@whitelabel/sdk';

const platform = new WhiteLabelPlatformAPI({
  apiKey: process.env.FINTECH_API_KEY,
  environment: 'production',
  region: 'af-east-addis-1'
});

// Place Bet with Telebirr Direct Settlement
const bet = await platform.bets.placeBet({
  playerId: 'usr_eth_9841',
  amountETB: 250.00,
  autoCashout: 2.50,
  paymentGateway: 'TELEBIRR_DIRECT'
});

console.log('Bet Confirmed:', bet.transactionId, bet.provablyFairHash);`,

    python: `from whitelabel_gaming import PlatformClient

client = PlatformClient(api_key="sec_live_fintech_99f8a32b")

# Initiate Sub-50ms Bet Session
response = client.bets.create_bet(
    player_id="usr_eth_9841",
    amount_etb=250.00,
    currency="ETB",
    telebirr_msisdn="+251911223344"
)

print(f"Status: {response.status} | Seed Hash: {response.provably_fair_hash}")`,

    php: `<?php
require_once 'vendor/autoload.php';

$platform = new \\WhiteLabel\\GamingApi('sec_live_fintech_99f8a32b');

$betResponse = $platform->bets()->placeBet([
    'player_id' => 'usr_eth_9841',
    'amount' => 250.00,
    'currency' => 'ETB',
    'callback_url' => 'https://operator.et/api/webhooks/payout'
]);

echo "Txn ID: " . $betResponse->txn_id;`
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('border-[#F5C227]', 'text-[#F5C227]', 'bg-white/5');
        t.classList.add('border-transparent', 'text-white/60');
      });
      tab.classList.remove('border-transparent', 'text-white/60');
      tab.classList.add('border-[#F5C227]', 'text-[#F5C227]', 'bg-white/5');

      const lang = tab.getAttribute('data-lang');
      if (codeBlock && codeExamples[lang]) {
        codeBlock.textContent = codeExamples[lang];
      }
    });
  });

  if (runBtn && responseBlock) {
    runBtn.addEventListener('click', () => {
      runBtn.innerText = 'EXECUTING API REQUEST...';
      runBtn.disabled = true;

      setTimeout(() => {
        const txnId = 'ETB_TXN_' + Math.floor(10000000 + Math.random() * 90000000);
        const hash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');

        const responseObj = {
          status: 200,
          success: true,
          message: "White Label Platform Bet & Settlement Confirmed",
          data: {
            transaction_id: txnId,
            operator: "FinTech Trust Node #01",
            player_id: "usr_eth_9841",
            amount_placed: "250.00 ETB",
            telebirr_reference: "TB_PAY_" + Math.floor(100000 + Math.random()*900000),
            latency_ms: 14.2,
            provably_fair: {
              server_seed_hash: hash,
              client_seed: "fintech_trust_seed_2026",
              nonce: Math.floor(Math.random() * 1000)
            },
            timestamp: new Date().toISOString()
          }
        };

        responseBlock.textContent = JSON.stringify(responseObj, null, 2);
        runBtn.innerText = 'RUN LIVE REQUEST (200 OK)';
        runBtn.disabled = false;
      }, 450);
    });
  }
}

/* ==========================================
 * 3. TELEBIRR PAYMENT FLOW VISUALIZER
 * ========================================== */
function initPaymentFlowVisualizer() {
  const steps = document.querySelectorAll('.flow-step-card');
  const detailsBox = document.getElementById('flowStepDetails');

  const stepDetailsData = [
    {
      title: "Step 1: Player Bet Trigger",
      badge: "LATENCY: 4ms",
      desc: "User taps 'Place Bet' or 'Start Platform' on your branded gaming site. Request is signed instantly with RS256 JWT key."
    },
    {
      title: "Step 2: Platform Gateway Processing",
      badge: "LATENCY: 12ms",
      desc: "Our cloud infrastructure authenticates the token, verifies RTP compliance rules, and routes payout reservation directly to Telebirr API."
    },
    {
      title: "Step 3: Telebirr & CBE Direct Settlement",
      badge: "LATENCY: 18ms",
      desc: "Automated instant payout push via Telebirr USSD/SuperApp gateway. Winnings land directly in player's wallet in < 50ms."
    },
    {
      title: "Step 4: Cryptographic Compliance Audit",
      badge: "REAL-TIME LOGGING",
      desc: "Cryptographic SHA-256 seed proof logged to Ethiopian Regulatory Board audit feed for 100% legal compliance and transparency."
    }
  ];

  steps.forEach((stepCard, idx) => {
    stepCard.addEventListener('click', () => {
      steps.forEach(s => {
        s.classList.remove('border-[#F5C227]', 'bg-[#F5C227]/10');
        s.classList.add('border-white/10', 'bg-white/5');
      });
      stepCard.classList.remove('border-white/10', 'bg-white/5');
      stepCard.classList.add('border-[#F5C227]', 'bg-[#F5C227]/10');

      if (detailsBox && stepDetailsData[idx]) {
        detailsBox.innerHTML = `
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-lg font-bold text-white">${stepDetailsData[idx].title}</h4>
            <span class="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5C227]/20 text-[#F5C227] rounded-full border border-[#F5C227]/40">${stepDetailsData[idx].badge}</span>
          </div>
          <p class="text-sm text-slate-300 leading-relaxed">${stepDetailsData[idx].desc}</p>
        `;
      }
    });
  });
}

/* ==========================================
 * 4. LIVE STATS COUNTER & TICKERS
 * ========================================== */
function initStatsCounter() {
  const reqPerSecEl = document.getElementById('statRequestsSec');
  const uptimeEl = document.getElementById('statUptime');

  if (reqPerSecEl) {
    setInterval(() => {
      const base = 4820;
      const variation = Math.floor(Math.random() * 350) - 175;
      reqPerSecEl.innerText = (base + variation).toLocaleString() + ' req/s';
    }, 2000);
  }
}

/* ==========================================
 * 5. MOBILE NAVIGATION MENU TOGGLE
 * ========================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileNav');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

/* ==========================================
 * 6. FAQ ACCORDION INTERACTIVITY
 * ========================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach((item, index) => {
    const header = item.querySelector('.faq-header');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    
    if (!header || !answer) return;
    
    // Open the first item by default for better initial presentation
    if (index === 0) {
      answer.classList.remove('hidden');
      if (icon) icon.innerHTML = '<i class="fa-solid fa-minus text-[#C084FC]"></i>';
      item.classList.add('border-[#9D4EDD]/40', 'bg-[#150B27]');
    }

    header.addEventListener('click', () => {
      const isOpen = !answer.classList.contains('hidden');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        const otherAnswer = otherItem.querySelector('.faq-answer');
        const otherIcon = otherItem.querySelector('.faq-icon');
        if (otherAnswer) otherAnswer.classList.add('hidden');
        if (otherIcon) otherIcon.innerHTML = '<i class="fa-solid fa-plus text-slate-400"></i>';
        otherItem.classList.remove('border-[#9D4EDD]/40', 'bg-[#150B27]');
      });

      // Toggle current item
      if (!isOpen) {
        answer.classList.remove('hidden');
        if (icon) icon.innerHTML = '<i class="fa-solid fa-minus text-[#C084FC]"></i>';
        item.classList.add('border-[#9D4EDD]/40', 'bg-[#150B27]');
      }
    });
  });
}

/* ==========================================
 * HERO CAROUSEL / SLIDER CONTROLLER
 * ========================================== */
function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const dots = document.querySelectorAll('.hero-dot');

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;

  function updateSlider(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.remove('w-2.5', 'bg-white/20');
        dot.classList.add('w-8', 'bg-[#F5C227]');
      } else {
        dot.classList.remove('w-8', 'bg-[#F5C227]');
        dot.classList.add('w-2.5', 'bg-white/20');
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateSlider(currentIndex + 1);
    }, 6000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateSlider(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateSlider(currentIndex + 1);
      startAutoplay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      updateSlider(index);
      startAutoplay();
    });
  });

  slider.parentElement.addEventListener('mouseenter', stopAutoplay);
  slider.parentElement.addEventListener('mouseleave', startAutoplay);

  updateSlider(0);
  startAutoplay();
}
