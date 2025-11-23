/* js/simulacion_caida.js */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('caidaCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const els = {
        planet: document.getElementById('sel-planet'),
        height: document.getElementById('range-h'),
        lblH: document.getElementById('val-h'),
        btn: document.getElementById('btn-action'),
        btnReset: document.getElementById('btn-reset'),
        outT: document.getElementById('out-t'),
        outY: document.getElementById('out-y'),
        outV: document.getElementById('out-v')
    };

    let state = {
        g: 9.81, h0: 50, y: 50, v: 0, t: 0,
        running: false, finished: false, lastTime: 0
    };

    // Configuración inicial
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        if(!state.running && !state.finished) draw(); // Redibujar estático
    }
    window.addEventListener('resize', resize);
    resize();

    // Listeners
    els.height.addEventListener('input', (e) => {
        if(state.running) return;
        state.h0 = parseFloat(e.target.value);
        state.y = state.h0;
        els.lblH.textContent = state.h0 + ' m';
        draw();
    });

    els.planet.addEventListener('change', (e) => {
        state.g = parseFloat(e.target.value);
    });

    els.btn.addEventListener('click', () => {
        if(!state.running && !state.finished) {
            state.running = true;
            state.lastTime = performance.now();
            els.btn.disabled = true;
            requestAnimationFrame(loop);
        }
    });

    els.btnReset.addEventListener('click', reset);

    function reset() {
        state.running = false;
        state.finished = false;
        state.t = 0; state.v = 0;
        state.y = state.h0;
        els.btn.disabled = false;
        updateUI();
        draw();
    }

    function loop(timestamp) {
        if(!state.running) return;
        
        const dt = (timestamp - state.lastTime) / 1000;
        state.lastTime = timestamp;

        state.v += state.g * dt;
        state.y -= state.v * dt;
        state.t += dt;

        if(state.y <= 0) {
            state.y = 0;
            state.running = false;
            state.finished = true;
        }

        updateUI();
        draw();

        if(state.running) requestAnimationFrame(loop);
    }

    function updateUI() {
        els.outT.textContent = state.t.toFixed(2) + ' s';
        els.outY.textContent = state.y.toFixed(2) + ' m';
        els.outV.textContent = state.v.toFixed(2) + ' m/s';
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar suelo
        const groundH = 40;
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, canvas.height - groundH, canvas.width, groundH);

        // Escala visual
        const drawH = canvas.height - groundH - 20; 
        const scale = drawH / state.h0; // Píxeles por metro basado en altura inicial
        
        // Objeto
        const cx = canvas.width / 2;
        const cy = (canvas.height - groundH) - (state.y * scale);
        
        // Línea guía
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.setLineDash([5,5]);
        ctx.moveTo(cx, canvas.height - groundH);
        ctx.lineTo(cx, (canvas.height - groundH) - (state.h0 * scale));
        ctx.stroke();
        ctx.setLineDash([]);

        // Bola
        ctx.beginPath();
        ctx.fillStyle = '#ef4444';
        ctx.arc(cx, cy, 10, 0, Math.PI*2);
        ctx.fill();
    }
});