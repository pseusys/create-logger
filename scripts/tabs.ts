import get = Reflect.get;

function open_tab(tab_link, tab_content) {
    const tab_contents = document.getElementsByClassName('tab-content');
    for (const content of tab_contents as HTMLCollectionOf<HTMLElement>) content.style.display = 'none';

    const tab_links = document.getElementsByClassName('tab-link');
    for (const link of tab_links as HTMLCollectionOf<HTMLElement>) link.classList.remove('active');

    document.getElementById(tab_content).style.display = 'flex';
    document.getElementById(tab_link).classList.add('active');
}

document.getElementById('tab-links').addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('tab-link'))
        open_tab(target.id, target.id.replace('tab', 'content'));
});





document.getElementById('apply').addEventListener('click', event => {
    const selectionParent = document.getSelection().getRangeAt(0).commonAncestorContainer;
    if (((selectionParent.nodeType == Node.ELEMENT_NODE)
        && ((selectionParent as HTMLElement).classList.contains('line-content')))
        || (selectionParent.parentElement.nodeName == 'SPAN')) change({type: FormattingType.BLINKING, value: true});
});
