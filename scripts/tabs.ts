//FIXME
import {switch_mode, TERMINAL_STATE} from "./terminal";

let active_tab: string;

export function open_tab(tab_link, tab_content) {
    const tab_contents = document.getElementsByClassName('tab-content');
    for (const content of tab_contents as HTMLCollectionOf<HTMLDivElement>) content.style.display = 'none';

    const tab_links = document.getElementsByClassName('tab-link');
    for (const link of tab_links as HTMLCollectionOf<HTMLButtonElement>) link.classList.remove('active');

    document.getElementById(tab_content).style.display = 'flex';
    const link = document.getElementById(tab_link);
    link.classList.add('active');

    active_tab = tab_content;
    switch_mode(TERMINAL_STATE[link.getAttribute('name')]);
}

document.getElementById('tab-links').onclick = (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('tab-link')) {
        const tab_contents = document.getElementById('tab-contents');
        const header = document.getElementById('header');
        open_tab(target.id, target.id.replace('tab', 'content'));

        if (target.classList.contains('collapsing')) {
            tab_contents.style.display = 'none';
            header.style.height = 'auto';
        } else {
            //TODO: revise later alongside with layouting
            tab_contents.style.display = '';
            header.style.height = '';
        }
    }
};
