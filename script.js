let input = document.getElementById('inputBox');
let themeToggle = document.getElementById('themeToggle');
let copyBtn = document.getElementById('copyBtn');
let clearHistoryBtn = document.getElementById('clearHistoryBtn');
let historyList = document.getElementById('historyList');

const THEME_KEY = 'calc_theme_v1';
const HISTORY_KEY = 'calc_history_v1';

let expression = "";
let memory = 0;

// Initialize theme from storage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersLight = savedTheme === 'light';
    if (prefersLight) {
        document.body.classList.add('light');
        if (themeToggle) themeToggle.checked = true;
    }
    // Load history
    const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    renderHistory(savedHistory);
});

// Theme toggle persistence
if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light');
        localStorage.setItem(THEME_KEY, document.body.classList.contains('light') ? 'light' : 'dark');
    });
}

// Copy to clipboard
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(input.value || '');
            const prev = copyBtn.textContent;
            copyBtn.textContent = '✓';
            setTimeout(() => { copyBtn.textContent = prev; }, 800);
        } catch {}
    });
}

// Scoped button listeners (only calculator keys inside rows)
let keyButtons = document.querySelectorAll('.calculator .row .button');
Array.from(keyButtons).forEach(button => {
    button.addEventListener('click', (e) => {
        handleInput(e.target.innerHTML);
    });
});

// Memory buttons
let memButtons = document.querySelectorAll('.memory-row .button');
Array.from(memButtons).forEach(button => {
    button.addEventListener('click', (e) => {
        handleMemory(e.target.innerHTML);
    });
});

// History clear
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
        renderHistory([]);
    });
}

// Keyboard events
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((key >= '0' && key <= '9') || key === '.' || key === '%') {
        handleInput(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
        handleInput(key);
    } else if (key === 'Enter' || key === '=') {
        handleInput('=');
        e.preventDefault();
    } else if (key === 'Backspace') {
        handleInput('DEL');
    } else if (key.toLowerCase() === 'c') {
        handleInput('AC');
    }
});

function currentNumberSegment(expr) {
    const match = expr.match(/([\d.]+)$/);
    return match ? match[1] : '';
}

function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

function sanitizeAppend(expr, value) {
    if (value === '.') {
        const seg = currentNumberSegment(expr);
        if (seg.includes('.')) return expr; // prevent multiple decimals in a segment
    }
    if (isOperator(value)) {
        if (expr === '' && value !== '-') return expr; // disallow starting with operator except minus
        const last = expr.slice(-1);
        if (isOperator(last)) {
            // replace last operator
            return expr.slice(0, -1) + value;
        }
    }
    return expr + value;
}

function tryEvaluate(expr) {
    // Trim trailing operators or decimal
    let clean = expr.replace(/[+\-*/.]+$/, '');
    if (clean === '') return null;
    try {
        // eslint-disable-next-line no-eval
        const result = eval(clean);
        if (result === Infinity || Number.isNaN(result)) return null;
        return String(result);
    } catch {
        return null;
    }
}

function pushHistory(entry) {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    list.push(entry);
    const trimmed = list.slice(-20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    renderHistory(trimmed);
}

function renderHistory(items) {
    if (!historyList) return;
    historyList.innerHTML = '';
    items.forEach(({ expr, result }, idx) => {
        const li = document.createElement('li');
        li.textContent = `${expr} = ${result}`;
        li.title = 'Click to reuse result';
        li.addEventListener('click', () => {
            expression = String(result);
            input.value = expression;
        });
        historyList.appendChild(li);
    });
}

// Handle calculator input
function handleInput(value) {
    if (value === '='){
        const result = tryEvaluate(expression);
        if (result !== null) {
            pushHistory({ expr: expression, result });
            expression = result;
            input.value = expression;
        } else {
            input.value = 'Error';
            expression = '';
        }
    } else if (value === 'AC'){
        expression = '';
        input.value = expression;
    } else if (value === 'DEL'){
        expression = expression.substring(0, expression.length - 1);
        input.value = expression;
    } else if (value === '+/-'){
        if (expression){
            expression = expression.startsWith('-') ? expression.slice(1) : '-' + expression;
            input.value = expression;
        }
    } else if (value === 'x²'){
        const result = tryEvaluate(`${expression}*${expression}`);
        if (result !== null) { expression = result; input.value = expression; } else { input.value = 'Error'; expression = ''; }
    } else if (value === '√'){
        const val = tryEvaluate(expression);
        if (val !== null) {
            const num = Number(val);
            if (num < 0) { input.value = 'Error'; expression = ''; return; }
            expression = String(Math.sqrt(num));
            input.value = expression;
        } else { input.value = 'Error'; expression = ''; }
    } else if (value === '%'){
        const val = tryEvaluate(expression);
        if (val !== null) { expression = String(Number(val) / 100); input.value = expression; } else { input.value = 'Error'; expression = ''; }
    } else if (value === '(' || value === ')'){
        expression = sanitizeAppend(expression, value);
        input.value = expression;
    } else {
        expression = sanitizeAppend(expression, value);
        input.value = expression;
    }
}

function handleMemory(label) {
    if (label === 'MC') { memory = 0; return; }
    if (label === 'MR') { expression = String(memory); input.value = expression; return; }
    const val = tryEvaluate(expression);
    const num = val !== null ? Number(val) : 0;
    if (label === 'M+') { memory += num; }
    if (label === 'M-') { memory -= num; }
}
