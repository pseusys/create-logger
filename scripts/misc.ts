document.addEventListener('copy', (event) => {
    const str = document.getSelection().toString();
    const refined = str.replace(/\r?\n|\r/g, "").replace(/\u00a0/g, " ");
    event.clipboardData.setData('text/plain', refined);
    event.preventDefault();
});
