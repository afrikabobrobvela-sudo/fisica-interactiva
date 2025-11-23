/* js/simulacion_mcu.js */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mcuCanvas');
    if (!canvas) return; // Seguridad por si no carga

    const ctx = canvas.getContext('2d');
    
    // Variables del estado
    const state = {
        r: 2.0,      // Radio (m)
        w: 1.0,      // Omega (rad/s)
        angle: 0,
        lastTime: 0
    };

    // Referencias UI
    const ui = {
        radius: document.getElementById('range-r'),
        omega: document.getElementById('range-w'),
        lblR: document.getElementById('val-r'),
        lblW: document.getElementById('val-w'),
        outV: document.getElementById('out-v'),
        outAc: document.getElementById('out-ac'),
        outT: document.getElementById('out-t')
    };

    // Listeners
    ui.radius.addEventListener('input', (e) => {
        state.r = parseFloat(e.target.value);
        ui.lblR.textContent = state.r.toFixed(1) + ' m';
        updateData();
    });

    ui.omega.addEventListener('input', (e) => {
        state.w = parseFloat(e.target.value);
        ui.lblW.textContent = state.w.toFixed(1) + ' rad/s';
        updateData();
    });

    // Ajuste de tamaño
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function updateData() {
        const v = state.w * state.r;
        const ac = (state.w ** 2) * state.r;
        const T = (2 * Math.PI) / state.w;

        ui.outV.textContent = v.toFixed(2) + ' m/s';
        ui.outAc.textContent = ac.toFixed(2) + ' m/s²';
        ui.outT.textContent = T.toFixed(2) + ' s';
    }

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
        
        // Escala: Max radio (4m) = 40% del menor lado del canvas
        const scale = (Math.min(canvas.width, canvas.height) * 0.4) / 4.0;
        const rPx = state.r * scale;

        // Trayectoria
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
        ctx.stroke();

        // Posición Partícula
        const x = cx + rPx * Math.cos(state.angle);
        const y = cy + rPx * Math.sin(state.angle);

        // Radio Vector
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Partícula
        ctx.beginPath();
        ctx.fillStyle = '#3b82f6';
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Vector Velocidad (Tangente)
        const vx = -Math.sin(state.angle) * 40;
        const vy = Math.cos(state.angle) * 40;
        drawArrow(ctx, x, y, vx, vy, '#f59e0b');
    }

    function drawArrow(ctx, x, y, dx, dy, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
    }

    updateData();
    requestAnimationFrame(loop);
});