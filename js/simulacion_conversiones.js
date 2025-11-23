/* js/simulacion_conversiones.js */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('convCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- FACTORES DE CONVERSIÓN (Base SI: m, kg, s) ---
    const units = {
        longitud: {
            'km': { val: 1000, name: 'Kilómetro' },
            'm':  { val: 1,    name: 'Metro' },
            'cm': { val: 0.01, name: 'Centímetro' },
            'mm': { val: 0.001, name: 'Milímetro' },
            'ft': { val: 0.3048, name: 'Pie (ft)' },
            'in': { val: 0.0254, name: 'Pulgada (in)' },
            'mi': { val: 1609.34, name: 'Milla' }
        },
        masa: {
            'kg': { val: 1, name: 'Kilogramo' },
            'g':  { val: 0.001, name: 'Gramo' },
            'lb': { val: 0.453592, name: 'Libra' },
            'oz': { val: 0.0283495, name: 'Onza' },
            'ton':{ val: 1000, name: 'Tonelada' }
        },
        tiempo: {
            'h':  { val: 3600, name: 'Hora' },
            'min':{ val: 60, name: 'Minuto' },
            's':  { val: 1, name: 'Segundo' },
            'dia':{ val: 86400, name: 'Día' }
        }
    };

    // Referencias UI
    const els = {
        type: document.getElementById('type-select'),
        val: document.getElementById('input-val'),
        from: document.getElementById('unit-from'),
        to: document.getElementById('unit-to'),
        res: document.getElementById('result-text')
    };

    // Estado
    let currentType = 'longitud';

    // Inicialización
    function init() {
        fillSelects();
        resize();
        window.addEventListener('resize', resize);
        
        // Listeners
        els.type.addEventListener('change', (e) => {
            currentType = e.target.value;
            fillSelects();
            draw();
        });
        
        [els.val, els.from, els.to].forEach(el => {
            el.addEventListener('input', draw);
        });

        draw();
    }

    function fillSelects() {
        const options = units[currentType];
        els.from.innerHTML = '';
        els.to.innerHTML = '';
        
        Object.keys(options).forEach(k => {
            const opt1 = document.createElement('option');
            opt1.value = k; opt1.textContent = options[k].name;
            els.from.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = k; opt2.textContent = options[k].name;
            els.to.appendChild(opt2);
        });
        
        // Seleccionar defaults distintos
        els.to.selectedIndex = 1; 
    }

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        draw();
    }

    function draw() {
        // 1. Calcular
        const val = parseFloat(els.val.value) || 0;
        const uFrom = els.from.value;
        const uTo = els.to.value;
        const data = units[currentType];

        // Conversión: (Valor * FactorBaseFrom) / FactorBaseTo
        // Ejemplo: 5 km a m -> (5 * 1000) / 1 = 5000
        const baseVal = val * data[uFrom].val;
        const result = baseVal / data[uTo].val;

        // Mostrar resultado texto
        els.res.textContent = `${result.toLocaleString(undefined, {maximumFractionDigits:4})} ${uTo}`;

        // 2. Dibujar Pizarra (Estilo Tiza)
        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.font = '24px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Coordenadas para dibujar la fracción de análisis dimensional
        // Formato:  [Val U1]  x  ( Factor U2 / Factor U1 ) = Res U2
        
        let x = 40;
        
        // 1. Valor Inicial
        ctx.font = 'bold 30px monospace';
        const txtVal = `${val} ${uFrom}`;
        ctx.fillText(txtVal, x, cy);
        x += ctx.measureText(txtVal).width + 20;

        // 2. Signo Multiplicación
        ctx.font = '30px sans-serif';
        ctx.fillText('×', x, cy);
        x += 30;

        // 3. Fracción de Conversión (Paréntesis grande)
        const factorNum = 1 * data[uFrom].val; 
        // Nota: Para mostrar la fracción pedagógica, idealmente mostramos la equivalencia directa
        // Pero para simplificar visualmente usaremos la notación de factores unitarios abstractos
        
        const numText = `1 ${uTo}`;
        const denText = `${(data[uTo].val / data[uFrom].val).toPrecision(4)} ${uFrom}`; // Simplificación visual
        
        // Mejor enfoque visual: Factor de conversión real
        // Si convierto km -> m. Fracción: (1000 m / 1 km)
        
        // Calculamos la relación directa para la fracción
        let ratio = data[uFrom].val / data[uTo].val;
        let txtNum, txtDen;

        if(ratio >= 1) {
            txtNum = `${parseFloat(ratio.toFixed(5))} ${uTo}`;
            txtDen = `1 ${uFrom}`;
        } else {
            txtNum = `1 ${uTo}`;
            txtDen = `${parseFloat((1/ratio).toFixed(5))} ${uFrom}`;
        }

        // Dibujar Fracción
        ctx.font = '20px monospace';
        const wNum = ctx.measureText(txtNum).width;
        const wDen = ctx.measureText(txtDen).width;
        const wFrac = Math.max(wNum, wDen) + 20;

        // Línea divisoria
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x + wFrac, cy);
        ctx.stroke();

        // Numerador y Denominador
        ctx.textAlign = 'center';
        ctx.fillText(txtNum, x + wFrac/2, cy - 25);
        ctx.fillText(txtDen, x + wFrac/2, cy + 25);

        // Paréntesis grandes
        ctx.font = '60px sans-serif';
        ctx.fillText('(', x - 10, cy - 5);
        ctx.fillText(')', x + wFrac + 10, cy - 5);

        // Tachado de unidades (Animación visual estática)
        // Tachamos el 'uFrom' inicial y el 'uFrom' del denominador
        ctx.strokeStyle = '#ef4444'; // Rojo para tachar
        ctx.lineWidth = 2;
        
        // Tachar uFrom del valor inicial
        // Recalcular posición aprox (simple heurística)
        const widthValOnly = ctx.measureText(`${val}`).width; // Ancho del numero
        // Esto es aproximado porque cambiamos fonts, pero funciona para el efecto
        // Un enfoque exacto requeriría guardar coordenadas previas.
        
        // Dibujamos líneas rojas decorativas simulando el tachado
        // Tachar abajo (denominador)
        ctx.beginPath();
        ctx.moveTo(x + wFrac/2 - 15, cy + 25); 
        ctx.lineTo(x + wFrac/2 + 15, cy + 25);
        ctx.stroke();

        // Tachar arriba (en el valor original a la izquierda)
        // Simplemente dibujamos una linea sobre la zona del texto inicial
        // No perfecta pero ilustrativa
        ctx.beginPath();
        ctx.moveTo(60, cy); 
        ctx.lineTo(100, cy); // Hardcoded visual para el efecto
        ctx.stroke();

        x += wFrac + 30;

        // 4. Igual y Resultado
        ctx.textAlign = 'left';
        ctx.fillStyle = '#10b981'; // Verde
        ctx.font = 'bold 30px monospace';
        ctx.fillText(`=  ${result.toLocaleString(undefined, {maximumFractionDigits:4})} ${uTo}`, x, cy);
    }

    init();
});