const API_URL = "http://localhost:8000/analyze"; 

// --- State Management ---
let targets = { cals: 2000, p: 150, c: 200, f: 65 };
let current = { cals: 0, p: 0, c: 0, f: 0 };
let history = [];
let chartInstance = null; // Fuzzy Graph
let donutChartInstance = null; // Calorie Donut
let lastScore = 50; 
let lastDeleted = null;
let currentImageBase64 = null; 

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initDonutChart(); // Initialize the donut UI
    updateDashboard(); 
    
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) scanBtn.addEventListener('click', analyzeFood);

    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                analyzeFood(); 
            }
        });
    }

    const imgInput = document.getElementById('imageInput');
    if (imgInput) imgInput.addEventListener('change', handleImageSelect);
});

// --- Image Handling ---
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        currentImageBase64 = e.target.result;
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('previewImg');
        previewImg.src = currentImageBase64;
        previewContainer.classList.remove('hidden');
        previewContainer.classList.add('flex');
    };
    reader.readAsDataURL(file);
}

window.clearImage = function() {
    currentImageBase64 = null;
    document.getElementById('imageInput').value = ""; 
    const container = document.getElementById('imagePreviewContainer');
    container.classList.add('hidden');
    container.classList.remove('flex');
};

// --- Core API Analysis ---
async function analyzeFood() {
    const input = document.getElementById('userInput').value;
    const btn = document.getElementById('scanBtn');
    const status = document.getElementById('statusMsg');

    if (!input.trim() && !currentImageBase64) return;

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
    status.classList.remove('hidden');
    
    try {
        const payload = { text: input, image: currentImageBase64 };
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload) 
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Server Error");
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : [data];
        
        items.forEach(item => {
            history.unshift(item);
            current.cals += item.calories || 0;
            current.p += item.protein || 0;
            current.c += item.carbs || 0;
            current.f += item.fats || 0;
            
            const fuzzyRes = calculateFuzzyHealth(item.calories, item.protein, item.fats, item.carbs);
            lastScore = fuzzyRes.score;
        });

        renderHistory();
        updateDashboard();
        updateChart(); 
        
        clearImage();
        document.getElementById('userInput').value = ''; 

        lastDeleted = null;
        const undoBtn = document.getElementById('undoBtn');
        if(undoBtn) undoBtn.classList.add('hidden');

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i><span>Analyze</span>`;
        status.classList.add('hidden');
    }
}

// --- UI Rendering ---
function renderHistory() {
    const list = document.getElementById('foodLog');
    const countEl = document.getElementById('itemCount');
    
    list.innerHTML = '';
    countEl.innerText = `${history.length} items`;

    history.forEach((item, index) => {
        const fuzzy = calculateFuzzyHealth(item.calories, item.protein, item.fats, item.carbs);
        
        const li = document.createElement('li');
        li.className = "bg-white p-4 rounded-2xl border border-green-100 shadow-sm fade-in group relative hover:shadow-md transition-all";
        li.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <i class="fa-solid fa-plus text-green-500 text-xs"></i>
                        <span class="font-bold text-gray-800 capitalize text-base">${item.food_name}</span>
                        <span class="badge-cal px-2 py-0.5 rounded text-[11px] font-mono font-bold ml-1">${item.calories} kcal</span>
                    </div>
                    <span class="text-[10px] uppercase font-bold tracking-wider ml-5 mt-1 block w-fit text-${fuzzy.colorName}-600 bg-${fuzzy.colorName}-100 px-2 py-0.5 rounded-md">${fuzzy.category}</span>
                </div>
                <button onclick="deleteItem(${index})" class="text-gray-300 hover:text-red-500 transition px-2">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="flex gap-2 text-xs pl-5 overflow-x-auto no-scrollbar">
                <span class="badge-p px-2 py-1 rounded-lg font-mono font-medium">${item.protein}g P</span>
                <span class="badge-c px-2 py-1 rounded-lg font-mono font-medium">${item.carbs}g C</span>
                <span class="badge-f px-2 py-1 rounded-lg font-mono font-medium">${item.fats}g F</span>
            </div>
        `;
        list.appendChild(li);
    });
}

window.deleteItem = function(index) {
    const item = history[index];
    lastDeleted = { item: item, index: index };
    current.cals -= item.calories;
    current.p -= item.protein;
    current.c -= item.carbs;
    current.f -= item.fats;
    history.splice(index, 1);
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) undoBtn.classList.remove('hidden');
    renderHistory();
    updateDashboard();
};

window.undoDelete = function() {
    if (!lastDeleted) return;
    const { item, index } = lastDeleted;
    current.cals += item.calories;
    current.p += item.protein;
    current.c += item.carbs;
    current.f += item.fats;
    history.splice(index, 0, item);
    lastDeleted = null;
    document.getElementById('undoBtn').classList.add('hidden');
    renderHistory();
    updateDashboard();
};

function initDonutChart() {
    const ctx = document.getElementById('calorieDonut').getContext('2d');
    donutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat', 'Remaining'],
            datasets: [{
                data: [0, 0, 0, targets.cals],
                backgroundColor: ['#EF4444', '#3B82F6', '#EAB308', '#E5E7EB'],
                borderWidth: 0,
                hoverOffset: 4,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            }
        }
    });
}

function updateDashboard() {
    const consumed = Math.round(current.cals);
    const pCals = Math.round(current.p * 4);
    const cCals = Math.round(current.c * 4);
    const fCals = Math.round(current.f * 9);
    
    // We calculate remaining by subtracting consumed from target
    const remaining = Math.max(0, targets.cals - consumed);

    // Update Text
    document.getElementById('displayCals').innerText = consumed;
    document.getElementById('targetCals').innerText = targets.cals;
    document.getElementById('displayP').innerText = Math.round(current.p);
    document.getElementById('displayC').innerText = Math.round(current.c);
    document.getElementById('displayF').innerText = Math.round(current.f);
    
    // Update Donut Center Text: "xx/xx"
    document.getElementById('calFraction').innerText = `${consumed}/${targets.cals}`;

    // Update Donut Chart Data
    if (donutChartInstance) {
        donutChartInstance.data.datasets[0].data = [pCals, cCals, fCals, remaining];
        donutChartInstance.update();
    }

    // Update Progress Bars (Right side)
    const calcPct = (val, target) => Math.min(100, Math.max(0, (val / target) * 100)) + '%';
    document.getElementById('barP').style.width = calcPct(current.p, targets.p);
    document.getElementById('barC').style.width = calcPct(current.c, targets.c);
    document.getElementById('barF').style.width = calcPct(current.f, targets.f);
}

// --- Fuzzy Logic Engine ---
function calculateFuzzyHealth(calories=0, protein=0, fats=0, carbs=0) {
    const tri = (val, low, peak, high) => {
        if (val <= low || val >= high) return 0;
        if (val === peak) return 1;
        if (val < peak) return (val - low) / (peak - low);
        return (high - val) / (high - peak);
    };
    const trapLow = (val, peak, high) => (val <= peak ? 1 : val >= high ? 0 : (high - val) / (high - peak));
    const trapHigh = (val, low, peak) => (val >= peak ? 1 : val <= low ? 0 : (val - low) / (peak - low));

    const f = {
        calories: { low: trapLow(calories, 150, 400), med: tri(calories, 300, 500, 700), high: trapHigh(calories, 600, 800) },
        protein: { low: trapLow(protein, 5, 10), med: tri(protein, 5, 15, 25), high: trapHigh(protein, 20, 30) },
        fats: { low: trapLow(fats, 5, 10), med: tri(fats, 5, 15, 25), high: trapHigh(fats, 20, 30) },
        carbs: { low: trapLow(carbs, 20, 40), med: tri(carbs, 30, 60, 90), high: trapHigh(carbs, 80, 100) }
    };

    let rs = { veryHealthy: 0, healthy: 0, notHealthy: 0, junk: 0 };
    rs.veryHealthy = Math.max(rs.veryHealthy, Math.min(f.protein.high, f.fats.low));
    rs.healthy = Math.max(rs.healthy, Math.min(f.protein.med, f.carbs.med, f.fats.med));
    rs.junk = Math.max(rs.junk, Math.min(f.fats.high, f.carbs.high));
    rs.notHealthy = Math.max(rs.notHealthy, 0.1); 

    const num = (rs.veryHealthy * 90) + (rs.healthy * 65) + (rs.notHealthy * 35) + (rs.junk * 15);
    const den = rs.veryHealthy + rs.healthy + rs.notHealthy + rs.junk;
    const score = den === 0 ? 50 : num / den;

    if (score >= 80) return { score, category: "Very Healthy", colorName: "emerald" };
    if (score >= 60) return { score, category: "Healthy", colorName: "green" };
    if (score >= 35) return { score, category: "Not Healthy", colorName: "orange" };
    return { score, category: "Junk Food", colorName: "red" };
}

// --- Chart Visuals ---
window.toggleGraphModal = function() {
    const modal = document.getElementById('graphModal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        if (!chartInstance) initChart();
    } else {
        modal.classList.add('hidden');
    }
};

function initChart() {
    const ctx = document.getElementById('fuzzyChart').getContext('2d');
    const labels = Array.from({length: 101}, (_, i) => i);
    const junkData = labels.map(x => (x <= 15 ? 1 : x >= 35 ? 0 : (35 - x) / 20));
    const notHealthyData = labels.map(x => (x <= 15 || x >= 55 ? 0 : x <= 35 ? (x - 15) / 20 : (55 - x) / 20));
    const healthyData = labels.map(x => (x <= 35 || x >= 85 ? 0 : x <= 60 ? (x - 35) / 25 : (85 - x) / 25));
    const veryHealthyData = labels.map(x => (x <= 60 ? 0 : x >= 85 ? 1 : (x - 60) / 25));

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Junk', data: junkData, borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, pointRadius: 0 },
                { label: 'Not Healthy', data: notHealthyData, borderColor: '#F97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', fill: true, pointRadius: 0 },
                { label: 'Healthy', data: healthyData, borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.1)', fill: true, pointRadius: 0 },
                { label: 'Very Healthy', data: veryHealthyData, borderColor: '#15803D', backgroundColor: 'rgba(21, 128, 61, 0.1)', fill: true, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { display: false, max: 1.1 },
                x: { title: { display: true, text: 'Health Score (0-100)' } }
            },
            plugins: { legend: { display: false } }
        },
        plugins: [{
            id: 'cursor',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                const x = chart.scales.x.getPixelForValue(lastScore);
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#000';
                ctx.setLineDash([5, 3]);
                ctx.stroke();
                ctx.restore();
            }
        }]
    });
}

function updateChart() {
    if (chartInstance) chartInstance.update();
}

window.toggleEditMode = function() {
    const view = document.getElementById('trackerView');
    const edit = document.getElementById('trackerEdit');
    edit.classList.toggle('hidden');
    view.classList.toggle('hidden');
};
window.saveProfile = function() {
    targets.cals = parseInt(document.getElementById('editTotal').value) || 2000;
    updateDashboard();
    window.toggleEditMode();
};