// CONFIGURATION
// Now we point to YOUR Python server, not Ollama directly
const API_URL = "http://localhost:8000/analyze"; 

async function analyzeFood() {
    const input = document.getElementById('userInput').value;
    const btn = document.getElementById('scanBtn');
    const status = document.getElementById('statusMsg');
    const resultArea = document.getElementById('resultsArea');

    if (!input.trim()) return;

    // UI: Loading State
    btn.disabled = true;
    btn.innerHTML = `<span class="thinking-pulse w-3 h-3 bg-white rounded-full inline-block mr-2"></span> Processing...`;
    status.innerText = "Sending to Tracking Server...";
    status.classList.remove('hidden', 'text-red-400');
    
    try {
        // 1. Send Request to OUR FastAPI Backend
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: input }) 
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Server Error");
        }

        const data = await response.json();
        
        // 2. Update UI (Data is already clean JSON)
        displayResult(data);
        resultArea.classList.remove('hidden');
        status.classList.add('hidden');

    } catch (error) {
        console.error(error);
        status.innerText = "Error: " + error.message;
        status.classList.add('text-red-400');
    } finally {
        // Reset UI
        btn.disabled = false;
        btn.innerHTML = `<span>Scan Calories</span>`;
    }
}

function displayResult(data) {
    document.getElementById('calVal').innerText = data.calories;
    // Map reasoning_summary if present, or use a default text
    document.getElementById('aiThought').innerText = `"${data.reasoning_summary || 'Analysis Complete'}"`;
    
    const gradeEl = document.getElementById('gradeVal');
    gradeEl.innerText = data.grade;
    gradeEl.className = `text-3xl font-bold ${getGradeColor(data.grade)}`;

    const logList = document.getElementById('foodLog');
    const li = document.createElement('li');
    li.className = "bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center text-sm";
    li.innerHTML = `
        <span>${data.food_name}</span>
        <div class="text-right">
            <span class="text-blue-400 font-mono block">${data.calories} kcal</span>
            <span class="text-xs text-slate-500">P:${data.protein}g C:${data.carbs}g F:${data.fats}g</span>
        </div>
    `;
    logList.prepend(li);
}

function getGradeColor(grade) {
    if (!grade) return 'text-slate-400';
    if (grade.startsWith('A')) return 'text-emerald-400';
    if (grade.startsWith('B')) return 'text-lime-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    if (grade.startsWith('D')) return 'text-orange-400';
    return 'text-red-500'; // F
}
/*

### How to Run This

1.  **Start Ollama:**
    Run `ollama serve` (or just ensure the app is open).

2.  **Start the Backend (Python):**
    Open a terminal in the `backend` folder and run:
    ```bash
    uvicorn server:app --reload
*/