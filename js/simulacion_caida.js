/* js/simulacion_caida.js */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('caidaCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const ui = {
        planet: document.getElementById('sel-planet'),
        hRange: document.getElementById('range-h'),
        hLabel: document.getElementById('val-h'),
        btnStart: document.getElementById('btn-action'),
        btnReset: document.getElementById('btn-reset'),
        outT: document.getElementById('out-t'),
        outY: document.getElementById('out-y'),
        outV: document.getElementById('out-v')
    };

    let state = {
        g: 9.81,
        h0: 50,
        y: 50,
        v: 0,
        t: 0,
        running: false,
        finished: false,
        lastTime: 0
    };

    // Resize
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        if(!state.running) draw();
    }
    window.addEventListener('resize', resize);
    resize();

    // Inputs
    ui.hRange.addEventListener('input', (e) => {
        if(state.running) return;
        state.h0 = parseFloat(e.target.value);
        state.y = state.h0;
        ui.hLabel.textContent = state.h0 + ' m';
        draw();
    });

    ui.planet.addEventListener('change', (e) => {
        state.g = parseFloat(e.target.value);
    });

    ui.btnStart.addEventListener('click', () => {
        if(!state.running && !state.finished) {
            state.running = true;
            state.lastTime = performance.now();
            ui.btnStart.textContent = "Cayendo...";
            ui.btnStart.disabled = true;
            ui.hRange.disabled = true;
            requestAnimationFrame(loop);
        }
    });

    ui.btnReset.addEventListener('click', () => {
        state.running = false;
        state.finished = false;
        state.t = 0;
        state.v = 0;
        state.y = state.h0;
        ui.btnStart.textContent = "Soltar Objeto";
        ui.btnStart.disabled = false;
        ui.hRange.disabled = false;
        updateUI();
        draw();
    });

    function loop(timestamp) {
        if(!state.running) return;

        const dt = (timestamp - state.lastTime) / 1000;
        state.lastTime = timestamp;

        // Física
        state.v += state.g * dt;
        state.y -= state.v * dt;
        state.t += dt;

        // Colisión suelo
        if(state.y <= 0) {
            state.y = 0;
            state.running = false;
            state.finished = true;
            ui.btnStart.textContent = "Terminado";
        }

        updateUI();
        draw();

        if(state.running) requestAnimationFrame(loop);
    }

    function updateUI() {
        ui.outT.textContent = state.t.toFixed(2) + ' s';
        ui.outY.textContent = state.y.toFixed(2) + ' m';
        ui.outV.textContent = state.v.toFixed(2) + ' m/s';
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Suelo
        const groundH = 40;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, canvas.height - groundH, canvas.width, groundH);

        // Escala
        const drawH = canvas.height - groundH - 30;
        const scale = drawH / state.h0;
        
        const cx = canvas.width / 2;
        const cy = (canvas.height - groundH) - (state.y * scale);

        // Guía
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.setLineDash([5,5]);
        ctx.moveTo(cx, canvas.height - groundH);
        ctx.lineTo(cx, (canvas.height - groundH) - (state.h0 * scale));
        ctx.stroke();
        ctx.setLineDash([]);

        // Objeto
        ctx.beginPath();
        ctx.fillStyle = '#ef4444';
        ctx.arc(cx, cy, 12, 0, Math.PI*2);
        ctx.fill();
    }
});