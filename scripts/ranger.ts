interface Ranger extends Range {
    collapsing?: HTMLSpanElement;

    start?: HTMLSpanElement;
    start_offset?: number;
    start_node_offset?: number;

    end?: HTMLSpanElement;
    end_offset?: number;
    end_node_offset?: number;

    invalidate();
}



let save: Ranger;

export function get_save (): Ranger {
    return save;
}

export function set_save (range: Range) {
    //save = range;
}

export function saved (): boolean {
    return !(save == null);
}
