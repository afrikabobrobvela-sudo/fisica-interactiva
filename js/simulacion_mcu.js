/* js/simulacion_mcu.js */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mcuCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Variables de estado
    const state = {
        r: 2.0,
        w: 1.0,
        angle: 0,
        lastTime: 0
    };

    // Referencias DOM
    const ui = {
        inR: document.getElementById('range-r'),
        inW: document.getElementById('range-w'),
        lblR: document.getElementById('val-r'),
        lblW: document.getElementById('val-w'),
        outV: document.getElementById('out-v'),
        outAc: document.getElementById('out-ac'),
        outT: document.getElementById('out-t')
    };

    // Eventos
    ui.inR.addEventListener('input', (e) => {
        state.r = parseFloat(e.target.value);
        ui.lblR.textContent = state.r.toFixed(1) + ' m';
        updateMath();
    });

    ui.inW.addEventListener('input', (e) => {
        state.w = parseFloat(e.target.value);
        ui.lblW.textContent = state.w.toFixed(1) + ' rad/s';
        updateMath();
    });

    // Ajuste Canvas
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Cálculos
    function updateMath() {
        const v = state.w * state.r;
        const ac = (state.w ** 2) * state.r;
        const T = (2 * Math.PI) / state.w;

        ui.outV.textContent = v.toFixed(2) + ' m/s';
        ui.outAc.textContent = ac.toFixed(2) + ' m/s²';
        ui.outT.textContent = T.toFixed(2) + ' s';
    }

    // Animación
    function loop(timestamp) {
        if (!state.lastTime) state.lastTime = timestamp;
        const dt = (timestamp - state.lastTime) / 1000;
        state.lastTime = timestamp;

        state.angle += state.w * dt;
        draw();
        requestAnimationFrame(loop);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        // Escala dinámica (max 4m ocupa el 40% del espacio)
        const scale = (Math.min(canvas.width, canvas.height) * 0.4) / 4.0;
        const rPx = state.r * scale;

        // Trayectoria
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 2;
        ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
        ctx.stroke();

        // Partícula
        const x = cx + rPx * Math.cos(state.angle);
        const y = cy + rPx * Math.sin(state.angle);

        // Radio (línea punteada)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.setLineDash([4, 4]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bola
        ctx.beginPath();
        ctx.fillStyle = '#3b82f6';
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Vector Velocidad (Tangente - Naranja)
        const vx = -Math.sin(state.angle) * 40;
        const vy = Math.cos(state.angle) * 40;
        drawArrow(ctx, x, y, vx, vy, '#f59e0b');

        // Vector Aceleración (Centrípeta - Rojo)
        const ax = -Math.cos(state.angle) * 30;
        const ay = -Math.sin(state.angle) * 30;
        drawArrow(ctx, x, y, ax, ay, '#ef4444');
    }

    function drawArrow(ctx, x, y, dx, dy, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
    }

    updateMath();
    requestAnimationFrame(loop);
});