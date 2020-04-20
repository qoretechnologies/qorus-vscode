import * as fs from 'fs';
import { QorusProjectEditInfo } from '../QorusProjectEditInfo';
import { InterfaceCreator } from './InterfaceCreator';
import { serviceTemplates } from './service_constants';
import { GENERATED_TEXT } from './ClassConnections';


export const classConnectionsCodeChanges = async (file, edit_info: QorusProjectEditInfo, data, orig_data) => {
    let edit_data;
    let lines;

    // remove original class connections code
    if (Object.keys(orig_data['class-connections'] || {}).length) {
        edit_data = await edit_info.setFileInfo(file, orig_data);
        lines = removeClassConnectionsCode(edit_data);
        fs.writeFileSync(file, lines.join('\n') + '\n');

        const { trigger_names } = edit_data;
        edit_data = await edit_info.setFileInfo(file, orig_data);
        lines = addTriggers(trigger_names, edit_data, orig_data.lang || 'qore');
        lines = cleanup(lines);
        fs.writeFileSync(file, lines.join('\n') + '\n');
    }

    // add new class connections code
    if (Object.keys(data['class-connections'] || {}).length) {
        edit_data = await edit_info.setFileInfo(file, orig_data);
    }
};

const removeClassConnectionsCode = (edit_data) => {
    const {
        text_lines,
        class_connections_class_loc,
        class_connections_member_declaration_loc,
        trigger_locs,
    } = edit_data;

    let locs = [];
    [class_connections_class_loc, class_connections_member_declaration_loc].forEach(loc => {
        if (loc) {
            locs.push(loc);
        }
    });
    locs = [ ...locs, ... trigger_locs || [] ];

    return removeRanges([...text_lines], locs);
};

const removeRanges = (lines, locs) => {
    const sorted_locs = sortLocs(locs).reverse();
    sorted_locs.forEach(loc => {
        lines = removeRange(lines, loc);
    });

    return lines;
};

const removeRange = (orig_lines, loc) => {
    let lines = [];

    for (let i = 0; i < loc.start_line - 1; i++) {
        lines.push(orig_lines[i]);
    }
    if (loc.start_line === loc.end_line) {
        let line = orig_lines[loc.start_line - 1];
        line = line.substr(0, loc.start_column - 1) + line.substr(loc.end_column);
        if (line.match(/\S/)) {
            lines.push(line);
        }
    } else {
        let line_a = orig_lines[loc.start_line - 1];
        let line_b = orig_lines[loc.end_line - 1];
        line_a = line_a.substr(0, loc.start_column - 1);
        line_b = line_b.substr(loc.end_column);
        [line_a, line_b].forEach(line => {
            if (line.match(/\S/)) {
                lines.push(line);
            }
        });
    }
    for (let i = loc.end_line; i < orig_lines.length; i++) {
        lines.push(orig_lines[i]);
    }

    return lines;
};

const sortLocs = locs => locs.sort((a, b) => {
    if (a.start_line < b.start_line) {
        return -1;
    }
    if (a.start_line > b.start_line) {
        return 1;
    }
    if (a.start_column < b.start_column) {
        return -1;
    }
    if (a.start_column > b.start_column) {
        return 1;
    }
    return 0;
});

const addTriggers = (trigger_names, edit_data, lang) => {
    const { text_lines, class_def_range } = edit_data;

    const lines = InterfaceCreator.addClassMethods(
        [ ... text_lines ],
        trigger_names,
        class_def_range,
        serviceTemplates(lang).method_template,
        lang
    );

    return lines;
};

const cleanup = dirty_lines => {
    const isGeneratedBegin = line => line.indexOf(GENERATED_TEXT.begin) > -1;
    const isGeneratedEnd = line => line.indexOf(GENERATED_TEXT.end) > -1;

    // 1. trim ending whitespaces of each line
    // 2. remove sections of generated code (between BEGIN and END) with only empty lines inside
    // 3 .remove GENERATED END lines with no matching GENERATED BEGIN line
    // 4. reduce double empty lines (replace tripple newlines with double newlines)
    // 5. remove empty lines at the end
    let generated_lines = [];
    let is_generated_empty;
    let is_inside_generated = false;
    let is_previous_empty = false;

    let lines = [];
    let line;
    while ((line = dirty_lines.shift()) !== undefined) {
        line = line.trimEnd(); // 1.
        if (isGeneratedBegin(line)) {
            generated_lines.push(line);
            is_generated_empty = true;
            is_inside_generated = true;
        } else if (isGeneratedEnd(line)) {
            if (!is_inside_generated) {
                continue; // 3.
            }
            generated_lines.push(line);
            if (!is_generated_empty) {
                lines = [...lines, ...generated_lines];
            }
            generated_lines = [];
            is_inside_generated = false;
        } else if (is_inside_generated) {
            is_generated_empty = is_generated_empty && line === '';
        } else {
            const is_empty = line === '';
            if (!is_empty || !is_previous_empty) {
                lines.push(line);
            }
            is_previous_empty = is_empty;
        }
    }

    // 5.
    while (lines[lines.length-1] === '') {
        lines.pop();
    }

    return lines;
};
