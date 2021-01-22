/*
terminal_container.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        new_line();
    }
});
*/

const terminal = document.getElementById('terminal');

function choose_line (line) {
    const line_number = line.firstElementChild;
    const line_content = line.lastElementChild;

    const line_contents = document.getElementsByClassName('line-content');
    for (const content of line_contents) {
        content.setAttribute('contenteditable', 'false');
        for (const span of content.children) span.setAttribute('contenteditable', 'false');
    }

    const line_numbers = document.getElementsByClassName('line-number');
    for (const number of line_numbers) number.classList.remove('chosen');

    line_content.setAttribute('contenteditable', 'true');
    for (const child of line_content.children) child.setAttribute('contenteditable', 'true');
    line_number.classList.add('chosen');

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(line_content);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function create_line () {
    const line = document.createElement('div');
    line.classList.add('line');

    const line_number = document.createElement('div');
    line_number.classList.add('line-number');
    line_number.innerHTML = String(document.getElementsByClassName('line').length);

    const line_content = document.createElement('div');
    line_content.classList.add('line-content');
    line_content.appendChild(document.createElement('span'));

    line.append(line_number, line_content);
    return line;
}

terminal.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (!target.parentElement.classList.contains('line')) return;
    if (target.id === 'line-adder') choose_line(terminal.insertBefore(create_line(), target.parentElement));
    else if (target.classList.contains('line-number')) choose_line(target.parentElement);
});
