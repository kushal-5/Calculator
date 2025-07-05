let input = document.getElementById('inputBox');
let buttons = document.querySelectorAll('button');

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
    } else if(key.toLowerCase() === 'c') { // Press 'C' for AC
        handleInput('AC');
    }
});

// Function to handle input
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
    } else {
        string += value;
        input.value = string;
    }
}
