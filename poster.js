/**
 * Poster Mode Logic
 * Encapsulated to avoid conflicts with main app.js
 */

const PosterApp = {
    config: {
        calories: {
            max: 950,
            color: '#3b82f6',
            sets: {
                low: ['trapLow', 0, 200],
                med: ['tri', 150, 400, 600],
                high: ['trapHigh', 500, 700]
            }
        },
        sugar: {
            max: 50,
            color: '#ef4444',
            sets: {
                low: ['trapLow', 0, 10],
                med: ['tri', 8, 18, 30],
                high: ['trapHigh', 25, 40]
            }
        },
        protein: {
            max: 60,
            color: '#9333ea',
            sets: {
                low: ['trapLow', 0, 12],
                med: ['tri', 10, 22, 35],
                high: ['trapHigh', 28, 45]
            }
        },
        fat: {
            max: 60,
            color: '#f97316',
            sets: {
                low: ['trapLow', 0, 10],
                med: ['tri', 8, 18, 30],
                high: ['trapHigh', 25, 40]
            }
        },
        output: {
            junk: 10,
            notHealthy: 35,
            moderate: 55,
            healthy: 75,
            veryHealthy: 95
        }
    },

    ruleBase: [
        { cond: { sugar: 'high' }, res: 'junk', text: "IF Sugar is High → THEN Junk Food" },
        { cond: { fat: 'high', protein: 'low' }, res: 'junk', text: "IF Fat High AND Protein Low → THEN Junk Food" },
        { cond: { calories: 'high', fat: 'high' }, res: 'junk', text: "IF Calories High AND Fat High → THEN Junk Food" },
        { cond: { calories: 'high', sugar: 'med', protein: 'low' }, res: 'junk', text: "IF High Cal + Med Sugar + Low Protein → THEN Junk Food" },
        { cond: { sugar: 'med', fat: 'high' }, res: 'junk', text: "IF Med Sugar + High Fat → THEN Junk Food" },
        { cond: { calories: 'high', protein: 'low' }, res: 'notHealthy', text: "IF High Cal + Low Protein → THEN Not Healthy" },
        { cond: { sugar: 'med', protein: 'low' }, res: 'notHealthy', text: "IF Med Sugar + Low Protein → THEN Not Healthy" },
        { cond: { fat: 'high', protein: 'low' }, res: 'notHealthy', text: "IF High Fat + Low Protein → THEN Not Healthy" },
        { cond: { calories: 'med', fat: 'high', protein: 'low' }, res: 'notHealthy', text: "IF Med Cal + High Fat + Low Protein → THEN Not Healthy" },
        { cond: { sugar: 'med', fat: 'med', protein: 'low' }, res: 'notHealthy', text: "IF Med Sugar/Fat + Low Protein → THEN Not Healthy" },
        { cond: { calories: 'low', protein: 'low', fat: 'low', sugar: 'low' }, res: 'notHealthy', text: "IF Insufficient Nutrients → THEN Not Healthy" },
        { cond: { calories: 'med', protein: 'med', sugar: 'med' }, res: 'moderate', text: "IF All Moderate → THEN Moderate" },
        { cond: { calories: 'med', fat: 'med', protein: 'med' }, res: 'moderate', text: "IF Balanced Moderate Macros → THEN Moderate" },
        { cond: { fat: 'med', protein: 'med', sugar: 'low' }, res: 'moderate', text: "IF Med Fat/Protein + Low Sugar → THEN Moderate" },
        { cond: { calories: 'high', protein: 'high', sugar: 'low' }, res: 'moderate', text: "IF High Cal/Protein + Low Sugar → THEN Moderate" },
        { cond: { fat: 'high', protein: 'med', sugar: 'low' }, res: 'moderate', text: "IF High Fat + Med Protein + Low Sugar → THEN Moderate" },
        { cond: { calories: 'low', sugar: 'low' }, res: 'healthy', text: "IF Low Cal + Low Sugar → THEN Healthy" },
        { cond: { protein: 'med', sugar: 'low', fat: 'low' }, res: 'healthy', text: "IF Med Protein + Low Sugar/Fat → THEN Healthy" },
        { cond: { calories: 'med', protein: 'med', sugar: 'low' }, res: 'healthy', text: "IF Med Cal/Protein + Low Sugar → THEN Healthy" },
        { cond: { protein: 'high', sugar: 'low', calories: 'low' }, res: 'healthy', text: "IF High Protein + Low Sugar + Low Cal → THEN Healthy" },
        { cond: { protein: 'high', sugar: 'low', calories: 'med' }, res: 'healthy', text: "IF High Protein + Low Sugar + Med Cal → THEN Healthy" },
        { cond: { fat: 'high', protein: 'high', sugar: 'low' }, res: 'healthy', text: "IF High Fat/Protein + Low Sugar → THEN Healthy" },
        { cond: { fat: 'med', protein: 'high', sugar: 'low' }, res: 'healthy', text: "IF Med Fat + High Protein + Low Sugar → THEN Healthy" },
        { cond: { protein: 'high', sugar: 'low', fat: 'low' }, res: 'veryHealthy', text: "IF High Protein + Low Sugar/Fat → THEN Very Healthy" },
        { cond: { calories: 'low', protein: 'high', sugar: 'low' }, res: 'veryHealthy', text: "IF Low Cal + High Protein + Low Sugar → THEN Very Healthy" },
        { cond: { protein: 'high', calories: 'med', sugar: 'low', fat: 'low' }, res: 'veryHealthy', text: "IF High Protein + Med Cal + Low Sugar/Fat → THEN Very Healthy" },
        { cond: { calories: 'low', protein: 'med', sugar: 'low', fat: 'low' }, res: 'veryHealthy', text: "IF Low Cal + Med Protein + Low Sugar/Fat → THEN Very Healthy" }
    ],

    MF: {
        trapLow: (x, peak, high) => x <= peak ? 1 : (x >= high ? 0 : (high - x) / (high - peak)),
        tri: (x, low, peak, high) => x <= low || x >= high ? 0 : (x <= peak ? (x - low) / (peak - low) : (high - x) / (high - peak)),
        trapHigh: (x, low, peak) => x <= low ? 0 : (x >= peak ? 1 : (x - low) / (peak - low))
    },

    getVal: function (x, set) {
        return this.MF[set[0]](x, ...set.slice(1));
    },

    // --- Modal Removed ---


    // --- Tooltip ---
    tooltip: null,
    tTitle: null,
    tBody: null,
    tViz: null,

    initTooltip: function () {
        this.tooltip = document.getElementById('poster-logic-tooltip');
        this.tTitle = document.getElementById('poster-tooltip-title');
        this.tBody = document.getElementById('poster-tooltip-body');
        this.tViz = document.getElementById('poster-tooltip-viz');
    },

    showTooltip: function (e, type, data) {
        if (!this.tooltip) this.initTooltip();
        if (!this.tooltip) return;

        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = 'translateY(0)';
        this.updateTooltipPos(e);

        // Default: Show visualization container
        if (this.tViz) this.tViz.style.display = 'block';

        if (type === 'ui-input') {
            this.tTitle.innerText = "Step 1: Data Acquisition & Processing";
            this.tBody.innerHTML = `
                <div class="space-y-2">
                    <p><strong>Input:</strong> Scan an image or type a food description.</p>
                    <p><strong>Process (Backend):</strong> 
                       <ul class="list-disc pl-4 space-y-1">
                           <li>Images converted to <strong>base64</strong> and sent via <strong>POST</strong>.</li>
                           <li>Data processed by <strong>FastAPI backend</strong> at /analyze.</li>
                           <li>AI model extracts <strong>macronutrients + total calories</strong>.</li>
                           <li>Results parsed into frontend for fuzzy assessment.</li>
                       </ul>
                    </p>
                </div>`;
            this.tViz.innerHTML = `
            <div class="relative w-full h-full bg-[#0c0d1a]">
                <img src="screenshot.png" 
                     alt="Live Input UI Screenshot" 
                     class="w-full h-full object-cover opacity-50"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="hidden w-full h-full flex items-center justify-center text-slate-600 text-[10px] uppercase tracking-widest text-center px-6 bg-slate-900/80">
                    [ screenshot.png ]
                </div>
                <div class="poster-ui-input-highlight" style="top: 25%; left: 22%; width: 46%; height: 40%;"></div>
            </div>`;
        } else if (type === 'fuzzification') {
            this.tTitle.innerText = "Step 2: Linguistic Fuzzification";
            this.tBody.innerText = "Converts crisp numbers into linguistic degrees of membership (μ) using Membership Functions. Trapezoidal functions handle extreme ranges (Low/High), while Triangular functions manage the overlapping 'Medium' categories, allowing for non-binary logic transitions.";
            this.tViz.style.display = 'none';
        } else if (type === 'rules') {
            this.tTitle.innerText = "Step 3: Inference Engine";
            this.tBody.innerText = "The system evaluates 27 expert rules. Since our rules use AND (e.g., High Sugar AND Low Protein), the FIS uses Math.min() to find the firing strength (α). It selects the 'weakest link' membership as the rule weight.";
            this.tViz.innerHTML = `<div class="flex items-center justify-center h-full text-emerald-400 font-mono text-lg">α = MIN(μ₁, μ₂, μ₃)</div>`;
        } else if (type === 'aggregation') {
            this.tTitle.innerText = "Step 4: Sugeno Singletons";
            this.tBody.innerHTML = `
                <div class="space-y-2">
                    <p>Unlike Mamdani models, Sugeno uses <strong>Singletons (Fixed Points)</strong>. Every rule maps to a constant value:</p>
                    <p>Junk (10), Not Healthy (35), Moderate (55), Healthy (75), or Very Healthy (95).</p>
                </div>`;
            this.tViz.innerHTML = `
            <div class="relative w-full h-full bg-[#0c0d1a]">
                <img src="screenshot2.png" 
                     alt="Aggregation UI Screenshot" 
                     class="w-full h-full object-cover"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="hidden w-full h-full flex items-center justify-center text-slate-600 text-[10px] uppercase tracking-widest text-center px-6 bg-slate-900/80">
                    [ screenshot2.png ]
                </div>
            </div>`;
        } else if (type === 'final-score') {
            this.tTitle.innerText = "Step 5: Weighted Average Score";
            this.tBody.innerHTML = `
                <p>The final "Food Grade" is the mathematical balance of all active rules:</p>
                <p class="font-mono mt-2 text-emerald-400 text-center">Score = Σ(αi × Zi) / Σαi</p>
                <ul class="list-disc pl-4 mt-2 space-y-1">
                    <li>α = Rule weight from Step 3</li>
                    <li>Z = Singleton point from Step 4</li>
                </ul>`;
            this.tViz.style.display = 'none';
        } else if (type === 'mu') {
            this.tTitle.innerText = "Membership Value (μ)";
            this.tBody.innerText = `Linguistic degree of '${data.val}' in category '${data.cat}'. Value of 1.0 means perfect membership.`;
            this.tViz.innerHTML = `<svg width="120" height="60" viewBox="0 0 120 60"><polyline points="10,50 60,10 110,50" fill="none" stroke="#9333ea" stroke-width="2"/><circle cx="60" cy="10" r="3" fill="#ef4444"/><text x="45" y="25" fill="#f8fafc" font-size="8">μ=${data.mu}</text></svg>`;
        }
    },

    updateTooltipPos: function (e) {
        if (!this.tooltip) return;

        const tooltipWidth = 420; // Fixed width from CSS
        const gap = 20;
        const verticalGap = 15;
        const viewportHeight = window.innerHeight;
        // Ensure we have a height, defaulting if not yet rendered/measured
        const tooltipHeight = this.tooltip.offsetHeight || 350;

        // Horizontal: Always Left of cursor
        let left = e.clientX - tooltipWidth - gap;
        if (left < 10) left = 10;

        // Vertical: Strict Midpoint Logic
        // If cursor is in the top half of the screen -> Show BELOW
        // If cursor is in the bottom half of the screen -> Show ABOVE
        const midPoint = viewportHeight / 2;
        let top;

        if (e.clientY < midPoint) {
            // Top half: Position below cursor
            top = e.clientY + verticalGap;
        } else {
            // Bottom half: Position above cursor
            top = e.clientY - tooltipHeight - verticalGap;
        }

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    },

    hideTooltip: function () {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
            this.tooltip.style.transform = 'translateY(10px)';
        }
    },

    // --- Rendering Logic ---
    createSVGGraph: function (id, label, val, cfg) {
        const width = 240, height = 80;
        const container = document.getElementById(`poster-graph-${id}`);
        if (!container) return;

        container.innerHTML = `<div class="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">${label}</div>`;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("width", "100%"); svg.setAttribute("height", height);
        const colors = { low: '#60a5fa', med: '#34d399', high: '#f87171' };
        let debugHTML = [];

        Object.entries(cfg.sets).forEach(([name, params]) => {
            const curvePts = [];
            for (let i = 0; i <= width; i += 2) {
                const xVal = (i / width) * cfg.max;
                const y = height - (this.getVal(xVal, params) * height * 0.8);
                curvePts.push(`${i},${y}`);
            }
            const fillPts = [`0,${height}`, ...curvePts, `${width},${height}`];
            const polyFill = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polyFill.setAttribute("points", fillPts.join(" ")); polyFill.setAttribute("fill", colors[name] + "20");
            svg.appendChild(polyFill);
            const polyStroke = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            polyStroke.setAttribute("points", curvePts.join(" ")); polyStroke.setAttribute("fill", "none");
            polyStroke.setAttribute("stroke", colors[name]); polyStroke.setAttribute("stroke-width", "1.5");
            svg.appendChild(polyStroke);

            const mu = this.getVal(val, params).toFixed(2);
            // Use global PosterApp reference in inline event handlers
            debugHTML.push(`<span class="explainable underline decoration-dotted" onmouseenter="PosterApp.showTooltip(event, 'mu', {mu: '${mu}', cat: '${name}', val: '${val}'})" onmouseleave="PosterApp.hideTooltip()" onmousemove="PosterApp.updateTooltipPos(event)" style="color:${colors[name]}">μ:${mu}</span>`);
        });

        const lineX = (val / cfg.max) * width;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", lineX); line.setAttribute("y1", 0); line.setAttribute("x2", lineX); line.setAttribute("y2", height);
        line.setAttribute("stroke", "#94a3b8"); line.setAttribute("stroke-width", "1"); line.setAttribute("stroke-dasharray", "3,3");
        svg.appendChild(line);
        container.appendChild(svg);
        const stats = document.createElement("div");
        stats.className = "flex justify-between text-[9px] font-mono mt-2 pt-2 border-t border-slate-700";
        stats.innerHTML = debugHTML.join(" | ");
        container.appendChild(stats);
    },

    calculate: function () {
        const cVal = document.getElementById('poster-input-calories').value;
        const sVal = document.getElementById('poster-input-sugar').value;
        const pVal = document.getElementById('poster-input-protein').value;
        const fVal = document.getElementById('poster-input-fat').value;

        const inputs = {
            calories: parseFloat(cVal),
            sugar: parseFloat(sVal),
            protein: parseFloat(pVal),
            fat: parseFloat(fVal)
        };

        document.getElementById('poster-label-calories').innerText = `${inputs.calories} kcal`;
        document.getElementById('poster-label-sugar').innerText = `${inputs.sugar} g`;
        document.getElementById('poster-label-protein').innerText = `${inputs.protein} g`;
        document.getElementById('poster-label-fat').innerText = `${inputs.fat} g`;

        Object.keys(inputs).forEach(k => this.createSVGGraph(k, k.charAt(0).toUpperCase() + k.slice(1), inputs[k], this.config[k]));

        let sumWZi = 0, sumW = 0, activeRules = [];
        const container = document.getElementById('poster-rule-container');
        if (!container) return;
        container.innerHTML = '';

        this.ruleBase.forEach((rule, i) => {
            const strengths = Object.entries(rule.cond).map(([k, lvl]) => this.getVal(inputs[k], this.config[k].sets[lvl]));
            const alpha = Math.min(...strengths);
            const Zi = this.config.output[rule.res];
            if (alpha > 0) {
                sumWZi += alpha * Zi; sumW += alpha;
                activeRules.push({ id: i + 1, alpha, Zi, res: rule.res });
            }
            const div = document.createElement("div");
            div.className = `poster-rule-item p-3 text-[11px] flex items-center justify-between ${alpha > 0 ? 'rule-active' : 'opacity-30'}`;
            div.innerHTML = `<div class="flex-grow"><span class="font-bold text-slate-500 mr-2">R${i + 1}</span>${rule.text}</div>
                            <div class="math-font text-slate-400 text-right">α = ${alpha.toFixed(2)} → Z = ${Zi}</div>`;
            container.appendChild(div);
        });

        const finalScore = sumW === 0 ? 50 : sumWZi / sumW;
        document.getElementById('poster-final-output').innerText = finalScore.toFixed(2);
        document.getElementById('poster-wa-formula').innerText = `Score = (${sumWZi.toFixed(2)}) / (${sumW.toFixed(2)}) = ${finalScore.toFixed(2)}`;
        this.drawSugenoAggregation(activeRules);
        this.drawWeightedAverage(finalScore);
    },

    drawSugenoAggregation: function (activeRules) {
        const container = document.getElementById('poster-graph-aggregation');
        if (!container) return;
        container.innerHTML = '';
        const width = 400, height = 220;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("width", "100%"); svg.setAttribute("height", height);
        const colors = { junk: '#f87171', notHealthy: '#fb923c', moderate: '#facc15', healthy: '#4ade80', veryHealthy: '#10b981' };
        const base = document.createElementNS("http://www.w3.org/2000/svg", "line");
        base.setAttribute("x1", 0); base.setAttribute("y1", height - 30); base.setAttribute("x2", width); base.setAttribute("y2", height - 30);
        base.setAttribute("stroke", "#334155"); svg.appendChild(base);

        Object.entries(this.config.output).forEach(([name, val]) => {
            const x = (val / 100) * width;
            const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("x", x); txt.setAttribute("y", height - 10);
            txt.setAttribute("text-anchor", "middle"); txt.setAttribute("class", "singleton-label uppercase");
            txt.textContent = `${name.replace(/([A-Z])/g, ' $1').trim()} (${val})`;
            svg.appendChild(txt);
        });

        activeRules.forEach(r => {
            const x = (r.Zi / 100) * width + (Math.random() * 10 - 5);
            const h = r.alpha * (height - 60);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x); line.setAttribute("y1", height - 30);
            line.setAttribute("x2", x); line.setAttribute("y2", height - 30 - h);
            line.setAttribute("stroke", colors[r.res]); line.setAttribute("stroke-width", "4");
            line.setAttribute("stroke-linecap", "round");
            svg.appendChild(line);
        });
        container.appendChild(svg);
    },

    drawWeightedAverage: function (score) {
        const container = document.getElementById('poster-graph-wa');
        if (!container) return;
        container.innerHTML = '';
        const width = 400, height = 150;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%");
        const base = document.createElementNS("http://www.w3.org/2000/svg", "line");
        base.setAttribute("x1", 0); base.setAttribute("y1", height / 2); base.setAttribute("x2", width); base.setAttribute("y2", height / 2);
        base.setAttribute("stroke", "#1e293b"); base.setAttribute("stroke-width", "20");
        svg.appendChild(base);

        const finalOutputEl = document.getElementById('poster-final-output');
        const categoryEl = document.getElementById('poster-category-label');
        let category = "Junk Food", colorClass = "text-red-400";

        if (score >= 85) { category = "Very Healthy"; colorClass = "text-emerald-400"; }
        else if (score >= 65) { category = "Healthy"; colorClass = "text-green-400"; }
        else if (score >= 45) { category = "Moderate"; colorClass = "text-yellow-400"; }
        else if (score >= 25) { category = "Not Healthy"; colorClass = "text-orange-400"; }
        else { category = "Junk Food"; colorClass = "text-red-400"; }

        finalOutputEl.className = "text-4xl font-black explainable " + colorClass;
        categoryEl.innerText = category;
        categoryEl.className = "text-sm font-bold uppercase tracking-widest mt-1 " + colorClass;

        const lx = (score / 100) * width;
        const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line2.setAttribute("x1", lx); line2.setAttribute("y1", 0); line2.setAttribute("x2", lx); line2.setAttribute("y2", height);
        line2.setAttribute("stroke", "#a855f7"); line2.setAttribute("stroke-width", "4");
        svg.appendChild(line2);
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", lx); dot.setAttribute("cy", height / 2); dot.setAttribute("r", "6");
        dot.setAttribute("fill", "#a855f7");
        svg.appendChild(dot);
        container.appendChild(svg);
    },

    init: function () {
        if (this._initialized) return;
        this._initialized = true;

        // Attach listeners to range inputs
        const inputs = [
            'poster-input-calories',
            'poster-input-sugar',
            'poster-input-protein',
            'poster-input-fat'
        ];

        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.calculate());
            }
        });

        // Initial calculation
        this.calculate();
    }
};

// Expose to window for inline event handlers
window.PosterApp = PosterApp;
