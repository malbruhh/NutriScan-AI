// CONFIGURATION
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = ".llama32"; // Or "gemma:2b" or "phi3.5"

// SYSTEM PROMPT (The "Brain" Instructions)
const SYSTEM_PROMPT = `
You are a Nutrition API. 
1. Analyze the user's food description. 
2. Estimate the serving size if vague.
3. Return a JSON object ONLY. No conversational text.
4. Your JSON must look like this:
{
  "reasoning": "Brief explanation of how you calculated the macros.",
  "food_name": "Short name of meal",
  "calories": integer,
  "protein": integer_grams,
  "carbs": integer_grams,
  "fats": integer_grams,
  "grade": "A/B/C/D/F" (Based on nutritional density)
}
`;

async function analyzeFood() {
    const input = document.getElementById('userInput').value;
    const btn = document.getElementById('scanBtn');
    const status = document.getElementById('statusMsg');
    const resultArea = document.getElementById('resultsArea');

    if (!input.trim()) return;

    // UI: Loading State
    btn.disabled = true;
    btn.innerHTML = `<span class="thinking-pulse w-3 h-3 bg-white rounded-full inline-block mr-2"></span> AI is Thinking...`;
    status.innerText = "Connecting to Local Neural Network...";
    status.classList.remove('hidden', 'text-red-400');
    
    try {
        // 1. Send Request to Local Ollama
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: input }
                ],
                stream: false, // Wait for full response
                format: "json" // Force JSON mode (supported in newer Ollama versions)
            })
        });

        if (!response.ok) 
            throw new Error("Ollama is not running. Run 'ollama serve' in terminal.");

        const data = await response.json();
        
        // 2. Parse the AI Response
        // Note: Sometimes models output text before JSON, but 'format: json' helps prevent this.
        const aiContent = JSON.parse(data.message.content);

        // 3. Update UI
        displayResult(aiContent);
        resultArea.classList.remove('hidden');

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
    // Update Big Cards
    document.getElementById('calVal').innerText = data.calories;
    document.getElementById('aiThought').innerText = `"${data.reasoning}"`;
    
    // Color code the Grade
    const gradeEl = document.getElementById('gradeVal');
    gradeEl.innerText = data.grade;
    gradeEl.className = `text-3xl font-bold ${getGradeColor(data.grade)}`;

    // Add to Log List
    const logList = document.getElementById('foodLog');
    const li = document.createElement('li');
    li.className = "bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center text-sm";
    li.innerHTML = `
        <span>${data.food_name}</span>
        <span class="text-blue-400 font-mono">${data.calories} kcal</span>
    `;
    logList.prepend(li);
}

function getGradeColor(grade) {
    if (grade === 'A') return 'text-emerald-400';
    if (grade === 'B') return 'text-lime-400';
    if (grade === 'C') return 'text-yellow-400';
    if (grade === 'D') return 'text-orange-400';
    return 'text-red-500'; // F
}