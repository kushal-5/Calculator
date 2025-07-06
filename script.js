let input = document.getElementById('inputBox');
let buttons = document.querySelectorAll('button');
let themeToggle = document.getElementById('themeToggle');

let string = "";
let arr = Array.from(buttons);

// Button click events
arr.forEach(button => {
    button.addEventListener('click', (e) => {
        handleInput(e.target.innerHTML);
    });
});

// Keyboard events
document.addEventListener('keydown', (e) => {
    const key = e.key;

    if((key >= '0' && key <= '9') || key === '.' || key === '%') {
        handleInput(key);
    } else if(key === '+' || key === '-' || key === '*' || key === '/') {
        handleInput(key);
    } else if(key === 'Enter') {
        handleInput('=');
    } else if(key === 'Backspace') {
        handleInput('DEL');
    } else if(key.toLowerCase() === 'c') {
        handleInput('AC');
    }
});

// Theme toggle
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light');
});

// Handle calculator input
function handleInput(value) {
    if(value === '='){
        try {
            string = eval(string);
            input.value = string;
        } catch {
            input.value = "Error";
            string = "";
        }
    } else if(value === 'AC'){
        string = "";
        input.value = string;
    } else if(value === 'DEL'){
        string = string.substring(0, string.length - 1);
        input.value = string;
    } else if(value === '+/-'){
        if(string){
            string = string.startsWith('-') ? string.slice(1) : '-' + string;
            input.value = string;
        }
    } else if(value === 'x²'){
        try {
            string = String(eval(string + "*" + string));
            input.value = string;
        } catch {
            input.value = "Error";
            string = "";
        }
    } else if(value === '√'){
        try {
            string = String(Math.sqrt(eval(string)));
            input.value = string;
        } catch {
            input.value = "Error";
            string = "";
        }
    } else if(value === '%'){
        try {
            string = String(eval(string) / 100);
            input.value = string;
        } catch {
            input.value = "Error";
            string = "";
        }
    } else {
        string += value;
        input.value = string;
    }
}
