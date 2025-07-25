
// ALU Animation with binary trails
(function animateALU() {
  const canvas = document.getElementById("aluCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1000;
  canvas.height = 400;

  let t = 0;
  const ops = ["ADD", "SUB", "AND", "XOR"];
  let currentOp = 0;

  function rand4bit() {
    return Math.floor(Math.random() * 16);
  }

  function drawWire(x1, y1, x2, y2, color = "#00ffee") {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawGlassBox(x, y, w, h, label) {
    ctx.fillStyle = "rgba(0, 255, 204, 0.07)";
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffcc";
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#00ffcc";
    ctx.fillText(label, x + 10, y + 20);
  }

  function drawALUFrame(A, B, op, result) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = 500, cy = 200;

    // Input Binary
    ctx.fillStyle = "#00ffee";
    ctx.font = "18px monospace";
    ctx.fillText("A = " + A.toString(2).padStart(4, '0'), 60, 80);
    ctx.fillText("B = " + B.toString(2).padStart(4, '0'), 60, 320);

    // Input Wires
    drawWire(130, 80, cx - 120, cy - 60);
    drawWire(130, 320, cx - 120, cy + 60);

    // ALU Glass Box
    drawGlassBox(cx - 120, cy - 70, 240, 140, "ALU");

    // ALU Operation LEDs
    ops.forEach((o, i) => {
      ctx.fillStyle = o === op ? "#00ffcc" : "#004444";
      ctx.fillRect(cx - 100 + i * 55, cy + 60, 40, 25);
      ctx.strokeStyle = "#00ffaa";
      ctx.strokeRect(cx - 100 + i * 55, cy + 60, 40, 25);
      ctx.fillStyle = "#101820";
      ctx.fillText(o, cx - 93 + i * 55, cy + 78);
    });

    // Output Result
    drawWire(cx + 120, cy, 860, cy);
    ctx.fillStyle = "#00ffaa";
    ctx.fillText("OUT = " + result.toString(2).padStart(4, '0'), 880, cy + 5);

    // Data Pulses
    const pulseX = 130 + (t % 100) * 4;
    ctx.beginPath();
    ctx.arc(pulseX, 80, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff00cc";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pulseX, 320, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#00ccff";
    ctx.fill();
  }

  function update() {
    const A = rand4bit();
    const B = rand4bit();
    const op = ops[currentOp % ops.length];
    let result;

    switch (op) {
      case "ADD": result = A + B; break;
      case "SUB": result = A - B; break;
      case "AND": result = A & B; break;
      case "XOR": result = A ^ B; break;
    }

    drawALUFrame(A, B, op, result);
    currentOp++;
  }

  setInterval(() => {
    update();
  }, 1000);

  setInterval(() => {
    t++;
    drawALUFrame(rand4bit(), rand4bit(), ops[currentOp % ops.length], 0);
  }, 70);
})();


// Sequence Detector with trail
(function () {
  const canvas = document.getElementById('seqCanvas');
  const ctx = canvas.getContext('2d');
  fitCanvas(canvas, 900, 280);

  const states = ['S0', 'S1', 'S2', 'S3', 'Match'];
  const transitions = {
    S0: { 1: 'S1', 0: 'S0' },
    S1: { 0: 'S2', 1: 'S1' },
    S2: { 1: 'S3', 0: 'S0' },
    S3: { 0: 'Match', 1: 'S1' },
    Match: { 0: 'S0', 1: 'S1' }
  };

  let bitStream = [];
  let currentState = 'S0';
  let tick = 0;

  const statePos = {
    S0: { x: 100, y: 140 },
    S1: { x: 250, y: 80 },
    S2: { x: 400, y: 140 },
    S3: { x: 550, y: 80 },
    Match: { x: 700, y: 140 }
  };

  function drawState(name, x, y, active = false) {
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fillStyle = active ? '#00ffcc' : '#111';
    ctx.strokeStyle = active ? '#00ffcc' : '#666';
    ctx.lineWidth = active ? 3 : 1.5;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(name, x - 25, y + 8);
  }

  function drawArrow(from, to, label) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    const offsetX = Math.cos(angle) * 40;
    const offsetY = Math.sin(angle) * 40;

    ctx.beginPath();
    ctx.moveTo(from.x + offsetX, from.y + offsetY);
    ctx.lineTo(to.x - offsetX, to.y - offsetY);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arrowhead
    const arrowX = to.x - offsetX;
    const arrowY = to.y - offsetY;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 6 * Math.cos(angle - 0.3), arrowY - 6 * Math.sin(angle - 0.3));
    ctx.lineTo(arrowX - 6 * Math.cos(angle + 0.3), arrowY - 6 * Math.sin(angle + 0.3));
    ctx.closePath();
    ctx.fillStyle = '#00ffcc';
    ctx.fill();

    // Label
    ctx.fillStyle = '#00ffcc';
    ctx.font = '12px monospace';
    ctx.fillText(label, from.x + dx / 2 - 10, from.y + dy / 2 - 5);
  }

  function drawFSM() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all states
    for (const s in statePos) {
      drawState(s, statePos[s].x, statePos[s].y, s === currentState);
    }

    // Draw arrows with labels (only important ones)
    drawArrow(statePos.S0, statePos.S0, '0');
    drawArrow(statePos.S0, statePos.S1, '1');
    drawArrow(statePos.S1, statePos.S1, '1');
    drawArrow(statePos.S1, statePos.S2, '0');
    drawArrow(statePos.S2, statePos.S0, '0');
    drawArrow(statePos.S2, statePos.S3, '1');
    drawArrow(statePos.S3, statePos.Match, '0');
    drawArrow(statePos.S3, statePos.S1, '1');
    drawArrow(statePos.Match, statePos.S0, '0');
    drawArrow(statePos.Match, statePos.S1, '1');

    // Bit stream display
    ctx.font = "18px monospace";
    ctx.fillStyle = "#00ffcc";
    ctx.fillText("Input Bit Stream:", 30, 250);
    for (let i = 0; i < bitStream.length; i++) {
      const bit = bitStream[i];
      ctx.fillStyle = i === bitStream.length - 1 ? "#ff00cc" : "#00ffcc";
      ctx.fillText(bit, 220 + i * 30, 250);
    }

    // Current input
    ctx.fillStyle = "#00ffcc";
    ctx.fillText("Current State: " + currentState, 600, 30);
  }

  function nextStep() {
    const bit = Math.round(Math.random());
    bitStream.push(bit);
    if (bitStream.length > 15) bitStream.shift();

    currentState = transitions[currentState][bit];
    drawFSM();
  }

  setInterval(nextStep, 800);
})();


// Traffic Light Controller
(function () {
  const canvas = document.getElementById('trafficCanvas');
  const ctx = canvas.getContext('2d');
  fitCanvas(canvas, 900, 300);

  const states = ['RED', 'GREEN', 'YELLOW'];
  const colors = ['#ff3b3b', '#4eff4e', '#fcd12a'];
  let current = 0;
  let timer = 0;

  const statePositions = [
    { x: 200, y: 150 },
    { x: 450, y: 150 },
    { x: 700, y: 150 },
  ];

  function drawStateBox(state, color, x, y, isActive) {
    ctx.strokeStyle = isActive ? '#00ffcc' : '#555';
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.fillStyle = '#111';
    ctx.fillRect(x - 80, y - 40, 160, 80);
    ctx.strokeRect(x - 80, y - 40, 160, 80);

    ctx.font = "18px monospace";
    ctx.fillStyle = isActive ? color : '#888';
    ctx.fillText(state, x - 25, y);

    // Timer info
    if (isActive) {
      ctx.font = "14px monospace";
      ctx.fillStyle = '#00ffcc';
      ctx.fillText(`Timer: ${timer.toString(2).padStart(4, '0')}`, x - 45, y + 30);
    }
  }

  function drawArrow(from, to) {
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x + 80, from.y);
    ctx.lineTo(to.x - 80, to.y);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(to.x - 85, to.y - 5);
    ctx.lineTo(to.x - 80, to.y);
    ctx.lineTo(to.x - 85, to.y + 5);
    ctx.fillStyle = '#00ffcc';
    ctx.fill();
  }

  function drawFSM() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "20px monospace";
    ctx.fillStyle = "#00ffcc";
    ctx.fillText("FSM: Traffic Light Controller", 300, 40);

    // Draw all states
    for (let i = 0; i < states.length; i++) {
      drawStateBox(states[i], colors[i], statePositions[i].x, statePositions[i].y, i === current);
    }

    // Draw arrows
    drawArrow(statePositions[0], statePositions[1]);
    drawArrow(statePositions[1], statePositions[2]);
    drawArrow(statePositions[2], statePositions[0]);

    // Display next state
    ctx.font = "16px monospace";
    ctx.fillStyle = "#00ffcc";
    const nextState = states[(current + 1) % 3];
    ctx.fillText(`Next State: ${nextState}`, 380, 260);
  }

  setInterval(() => {
    timer = 0;
    current = (current + 1) % 3;
  }, 3000);

  setInterval(() => {
    timer++;
    drawFSM();
  }, 300);
})();



// UART Animation
(function () {
  const canvas = document.getElementById("uartCanvas");
  const ctx = canvas.getContext("2d");
  fitCanvas(canvas, 1000, 350);

  const baudInterval = 800;
  const txData = [0, 1, 1, 0, 0, 1, 1, 0]; // 8-bit data
  const frame = [0, ...txData, 1]; // Start bit + data + stop
  let bitPtr = 0;
  let pulseX = 200;

  function drawBlock(x, y, w, h, label) {
    ctx.fillStyle = "#0f0f0f";
    ctx.strokeStyle = "#00ffaa";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 16px monospace";
    ctx.fillText(label, x + 10, y + h / 2 + 5);
  }

  function drawWirePath() {
    ctx.strokeStyle = "#00ffaa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 130);
    ctx.lineTo(800, 130);
    ctx.stroke();
    ctx.fillStyle = "#00ffaa";
    ctx.font = "14px monospace";
    ctx.fillText("TX → RX Wire", 470, 120);
  }

  function drawShiftRegister(bits) {
    ctx.font = "14px monospace";
    for (let i = 0; i < bits.length; i++) {
      ctx.strokeStyle = "#00ccff";
      ctx.strokeRect(120 + i * 35, 85, 30, 30);
      ctx.fillStyle = "#101820";
      ctx.fillRect(120 + i * 35, 85, 30, 30);
      ctx.fillStyle = "#00ffaa";
      ctx.fillText(bits[i], 130 + i * 35, 105);
    }

    ctx.fillStyle = "#00ccff";
    ctx.fillText("TX Shift Register", 120, 75);
  }

  function drawBaudClock() {
    ctx.beginPath();
    const startX = 150, y = 240, w = 50;
    for (let i = 0; i < 10; i++) {
      ctx.moveTo(startX + i * w, y);
      ctx.lineTo(startX + i * w + w / 2, y - 20);
      ctx.lineTo(startX + i * w + w, y);
    }
    ctx.strokeStyle = "#ff00cc";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ff00cc";
    ctx.font = "12px monospace";
    ctx.fillText("Baud Clock", 60, y - 5);
  }

  function drawDataWaveform(bits) {
    const startX = 150;
    const y = 300;
    const w = 50;

    ctx.beginPath();
    ctx.moveTo(startX, bits[0] ? y - 20 : y + 20);
    for (let i = 0; i < bits.length; i++) {
      const bit = bits[i];
      ctx.lineTo(startX + i * w, bit ? y - 20 : y + 20);
      ctx.lineTo(startX + (i + 1) * w, bit ? y - 20 : y + 20);
    }
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00ffcc";
    ctx.font = "12px monospace";
    ctx.fillText("TXD Waveform", 60, y + 5);
  }

  function drawPulse(bit) {
    ctx.beginPath();
    ctx.arc(pulseX, 130, 8, 0, 2 * Math.PI);
    ctx.fillStyle = bit ? "#00ffaa" : "#ff0055";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.fillText(bit, pulseX - 4, 134);
  }

  function draw() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBlock(100, 70, 180, 60, "TX MODULE");
    drawBlock(800, 70, 180, 60, "RX MODULE");
    drawWirePath();
    drawBaudClock();
    drawDataWaveform(frame);
    drawShiftRegister(frame.slice(bitPtr));

    drawPulse(frame[bitPtr]);
  }

  function step() {
    draw();
    pulseX += 20;

    if (pulseX >= 800) {
      pulseX = 200;
      bitPtr = (bitPtr + 1) % frame.length;
    }

    requestAnimationFrame(step);
  }

  step();
})();




(function() {
  const canvas = document.getElementById('riscvCanvas');
  const ctx = canvas.getContext('2d');

  const pipeline = ['IF', 'ID', 'EX', 'MEM', 'WB'];
  const stagePositions = pipeline.map((_, i) => 100 + i * 150);
  const stageY = 160;
  const blocks = [];

  const instructions = [
    { text: 'LW x1, 0(x2)', binary: '00000000001000010000000010000011' },
    { text: 'ADD x3, x1, x4', binary: '00000000010000001000000110110011' },
    { text: 'SUB x5, x3, x6', binary: '01000000110000011000001000110011' },
    { text: 'SW x5, 4(x2)', binary: '00000001010000010010001000100011' },
    { text: 'BEQ x1, x5, label', binary: '00000000010100001110000001100011' }
  ];

  function createInstructionBlock(index) {
    return {
      instr: instructions[index % instructions.length],
      stageIndex: 0,
      x: stagePositions[0] - 120,
      y: stageY - 35,
      progress: 0,
      color: `hsl(${(index * 60) % 360}, 100%, 50%)`
    };
  }

  // Add initial instruction
  let cycle = 0;
  const maxBlocks = 10;
  setInterval(() => {
    if (blocks.length < maxBlocks) {
      blocks.push(createInstructionBlock(cycle));
    }
    cycle++;
  }, 1800);

  function drawStageBoxes() {
    for (let i = 0; i < pipeline.length; i++) {
      const x = stagePositions[i];
      ctx.fillStyle = 'rgba(0, 255, 204, 0.1)';
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 60, stageY - 50, 120, 100);
      ctx.font = '20px monospace';
      ctx.fillStyle = '#00ffcc';
      ctx.fillText(pipeline[i], x - 25, stageY + 75);
    }
  }

  function drawInstruction(block) {
    const { x, y, instr, color, stageIndex } = block;

    // Main box
    ctx.fillStyle = color + '40';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillRect(x, y, 120, 60);
    ctx.strokeRect(x, y, 120, 60);

    // Instruction text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(instr.text, x + 10, y + 25);

    // Binary
    ctx.fillStyle = '#aaffee';
    ctx.font = '10px monospace';
    ctx.fillText(instr.binary, x + 5, y + 45);
  }

  function updateBlocks() {
    blocks.forEach(block => {
      if (block.progress < 1) {
        block.progress += 0.015;
        block.x = stagePositions[block.stageIndex] - 60 + 160 * block.progress;
      } else {
        if (block.stageIndex < pipeline.length - 1) {
          block.stageIndex++;
          block.progress = 0;
        }
      }
    });
  }

  function drawDataLines() {
    ctx.lineWidth = 1.5;
    for (let i = 0; i < pipeline.length - 1; i++) {
      const x1 = stagePositions[i] + 60;
      const x2 = stagePositions[i + 1] - 60;
      const y = stageY + 5;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = '#00ffee';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ffee';
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function drawRegisterFile() {
    const x = 50;
    const y = 30;
    ctx.fillStyle = 'rgba(0, 255, 204, 0.05)';
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 120, 80);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#00ffaa';
    ctx.fillText('Register File', x + 10, y + 20);
    ctx.fillText('x1: 0xAB', x + 10, y + 40);
    ctx.fillText('x2: 0x10', x + 10, y + 55);
    ctx.fillText('x3: 0x22', x + 10, y + 70);
  }

  function drawALUBox() {
    const x = stagePositions[2] - 70;
    const y = stageY - 130;
    ctx.strokeStyle = '#ffaa00';
    ctx.fillStyle = 'rgba(255, 170, 0, 0.05)';
    ctx.strokeRect(x, y, 100, 50);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('ALU Unit', x + 10, y + 20);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRegisterFile();
    drawALUBox();
    drawStageBoxes();
    drawDataLines();

    blocks.forEach(drawInstruction);
    updateBlocks();

    requestAnimationFrame(animate);
  }

  animate();
})();

// Active nav highlighting on scroll
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav a");

  function onScroll() {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (scrollY >= sectionTop) current = section.getAttribute("id");
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", onScroll);
});
// Decryption animation on scroll into About section
function decryptText(element, finalText, speed = 30) {
  const chars = '01';
  let output = '';
  let i = 0;

  const interval = setInterval(() => {
    output = '';
    for (let j = 0; j < finalText.length; j++) {
      output += j < i ? finalText[j] : chars[Math.floor(Math.random() * chars.length)];
    }
    element.textContent = output;
    i++;
    if (i > finalText.length) clearInterval(interval);
  }, speed);
}

function observeAboutSection() {
  const aboutSection = document.getElementById('about');
  const targets = document.querySelectorAll('#about [data-text]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        targets.forEach((el, i) => {
          const realText = el.getAttribute('data-text');
          setTimeout(() => decryptText(el, realText, 20), i * 1200);
        });
      }
    });
  }, { threshold: 0.6 });

  observer.observe(aboutSection);
}

window.addEventListener('DOMContentLoaded', observeAboutSection);
// Silicon board animation on About section
(function () {
  const canvas = document.getElementById('aboutCircuitCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const nodes = [];
  const numNodes = 80;

  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 1,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3
    });
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.strokeStyle = `rgba(0, 255, 204, ${1 - dist / 100})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(node => {
      node.x += node.dx;
      node.y += node.dy;

      if (node.x < 0 || node.x > canvas.width) node.dx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.dy *= -1;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#00ffcc";
      ctx.fill();
    });

    drawConnections();
    requestAnimationFrame(animate);
  }

  animate();
})();
// Background animation for Projects section
(function () {
  const canvas = document.getElementById('projectsBgCanvas');
  const ctx = canvas.getContext('2d');
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const lines = [];
  for (let i = 0; i < 100; i++) {
    lines.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 0.5 + 0.3,
    });
  }

  function animate() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1;
    lines.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x + l.length, l.y);
      ctx.stroke();
      l.x += l.speed;
      if (l.x > canvas.width) l.x = -l.length;
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// Popup data
const projectData = {
  alu: {
    title: "Arithmetic Logic Unit (ALU)",
    desc: "Performs arithmetic and logic ops on 4-bit inputs. Built in Verilog.",
    code: "screenshots/alu_code.png",
    waveform: "screenshots/alu_waveform.png",
    github: "https://github.com/Aditya1265/verilog-4bit-alu.git"
  },
  sequence: {
    title: "Sequence Detector (1010)",
    desc: "FSM to detect 1010 pattern using Mealy machine.",
    code: "screenshots/seq_code.png",
    waveform: "screenshots/seq_waveform.png",
    github: "https://github.com/Aditya1265/verilog-sequence-detector.git"
  },
  traffic: {
    title: "Traffic Light Controller",
    desc: "State machine for R-Y-G light sequence based on timer logic.",
    code: "screenshots/traffic_code.png",
    waveform: "screenshots/traffic_waveform.png",
    github: "https://github.com/Aditya1265/advance-traffic-controller.git"
  },
  uart: {
    title: "UART Protocol",
    desc: "Implements TX/RX with start/stop and baud rate. Verilog based.",
    code: "screenshots/uart_code.png",
    waveform: "screenshots/uart_waveform.png",
    github: "https://github.com/Aditya1265/Universl-Asyncronous-Transmitter-Reciver.git"
  },
  riscv: {
    title: "RISC-V CPU",
    desc: "Single-cycle CPU with IF-ID-EX-MEM-WB pipelining.",
    code: "screenshots/riscv_code.png",
    waveform: "screenshots/riscv_waveform.png",
    github: "https://github.com/Aditya1265/riscv.git"
  }
};

// Handle card click
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.getAttribute('data-project');
    const popup = document.getElementById('projectPopup');
    const codeImg = document.getElementById('popupCode');
    const waveImg = document.getElementById('popupWaveform');
    const linkWrap = document.getElementById("popupLink");
    const gitBtn = document.getElementById("popupGitHub");

    // Show popup
    popup.style.display = 'block';
    document.getElementById('popupTitle').textContent = projectData[key].title;
    document.getElementById('popupDesc').textContent = projectData[key].desc;

    // Hide all first
    codeImg.classList.remove("show");
    waveImg.classList.remove("show");
    linkWrap.classList.remove("show");

    // Set content
    codeImg.src = projectData[key].code;
    waveImg.src = projectData[key].waveform;
    gitBtn.href = projectData[key].github;

    // Animate
    setTimeout(() => codeImg.classList.add("show"), 300);
    setTimeout(() => waveImg.classList.add("show"), 600);
    setTimeout(() => linkWrap.classList.add("show"), 900);
  });
});

function fitCanvas(canvas, width = 900, height = 300) {
  canvas.width = width;
  canvas.height = height;
}


// Close popup
function closeProject() {
  const popup = document.getElementById('projectPopup');
  popup.style.display = 'none';
  document.getElementById('popupCode').classList.remove("show");
  document.getElementById('popupWaveform').classList.remove("show");
  document.getElementById('popupLink').classList.remove("show");
}

const canvas = document.getElementById("aluCanvas");
fitCanvas(canvas);
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 300;

let t = 0;
const operations = ["ADD", "SUB", "AND", "XOR"];
let currentOp = 0;


function drawWire(x1, y1, x2, y2, color = "#00ffee") {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawALU() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const A = Math.floor(Math.random() * 16);
  const B = Math.floor(Math.random() * 16);
  const op = operations[currentOp % operations.length];
  let result = 0;

  switch (op) {
    case "ADD": result = A + B; break;
    case "SUB": result = A - B; break;
    case "AND": result = A & B; break;
    case "XOR": result = A ^ B; break;
  }

  const cx = 450, cy = 150;

  // Inputs
  ctx.fillStyle = "#00ffee";
  ctx.font = "18px monospace";
  ctx.fillText("A = " + A.toString(2).padStart(4, '0'), 60, 80);
  ctx.fillText("B = " + B.toString(2).padStart(4, '0'), 60, 220);

  drawWire(130, 80, cx - 100, cy - 40);   // Wire A
  drawWire(130, 220, cx - 100, cy + 40);  // Wire B

  // ALU box
  ctx.strokeStyle = "#00ffaa";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(cx - 100, cy - 60, 200, 120);

  ctx.fillStyle = "#00ffaa";
  ctx.font = "bold 22px monospace";
  ctx.fillText("ALU", cx - 25, cy);

  // Operations
  operations.forEach((o, i) => {
    ctx.fillStyle = o === op ? "#00ffcc" : "#006666";
    ctx.fillText(o, cx - 60 + i * 60, cy + 40);
  });

  // Output wire and result
  drawWire(cx + 100, cy, 780, cy);
  ctx.fillStyle = "#00ffaa";
  ctx.fillText("OUT = " + result.toString(2).padStart(4, '0'), 790, cy + 5);

  // Floating pulses
  const pulseX = 130 + (t % 100) * 4;
  ctx.beginPath();
  ctx.arc(pulseX, 80, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ff00cc";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pulseX, 220, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#00ccff";
  ctx.fill();

  t++;
  if (t % 60 === 0) currentOp++;
}

setInterval(drawALU, 70);



