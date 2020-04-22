import * as fs from 'fs';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { QorusProjectEditInfo } from '../QorusProjectEditInfo';
import { ClassConnections, GENERATED_TEXT } from './ClassConnections';
import { InterfaceCreator } from './InterfaceCreator';
import { serviceTemplates } from './service_constants';


export const classConnectionsCodeChanges = async (file, code_info: QorusProjectCodeInfo, data, orig_data, iface_kind) => {
    const edit_info: QorusProjectEditInfo = code_info.edit_info;
    let edit_data;
    let lines;
    let method_names;
    let trigger_names;

    const mixed_data = {
        'class-name': data['class-name'],
        'base-class-name': data['base-class-name'],
        'class-connections': orig_data['class-connections']
    };

    const writeFile = lines => fs.writeFileSync(file, lines.join('\n') + '\n');

    // remove original class connections code
    if (Object.keys(orig_data['class-connections'] || {}).length) {
        edit_data = await edit_info.setFileInfo(file, mixed_data);
        lines = removeClassConnectionsCode(edit_data);
        lines = cleanup(lines);
        writeFile(lines);

        ({ trigger_names: method_names } = edit_data);
    }

    // add new class connections code
    if (Object.keys(data['class-connections'] || {}).length) {
        const class_connections = new ClassConnections({ ...data, iface_kind }, code_info, data.lang);
        let { triggers: trigger_names, trigger_code, connections_extra_class } = class_connections.code();

        edit_data = await edit_info.setFileInfo(file, data, false);
        let { lines, line_shift } = insertMemberDeclaration(class_connections, edit_data);
        ({ lines, trigger_names } = insertTriggerCode(trigger_names, trigger_code, edit_data, lines, line_shift));
        let extra_class_code_lines = connections_extra_class.split(/\r?\n/);
        extra_class_code_lines.pop();
        lines = [ ...lines, ...extra_class_code_lines ];

        lines = cleanup(lines);
        writeFile(lines);
    }

    let methods_to_add = [];
    method_names.forEach(method_name => {
        if (!trigger_names.contains(method_name)) {
            methods_to_add.push(method_name);
        }
    });
    if (methods_to_add.length) {
        edit_data = await edit_info.setFileInfo(file, mixed_data);
        lines = addMethods(methods_to_add, edit_data, orig_data.lang || 'qore');
        writeFile(lines);
    }
};

const insertMemberDeclaration = (class_connections, edit_data) => {
    const { text_lines, private_member_block_loc } = edit_data;
    let lines = [ ...text_lines ];
    let line_shift = 0;

    const end_line_no = private_member_block_loc.end_line - 1;
    const end_line = lines[end_line_no];
    // if the closing '}' of the private declaration block is not on a separate line move it to the next line
    if (!end_line.match(/^\s*\}\s*$/)) {
        const end_column = private_member_block_loc.end_column - 2;
        const end_line_1 = end_line.substr(0, end_column);
        const end_line_2 = ' '.repeat(end_column) + end_line.substr(end_column);
        lines.splice(end_line_no, 1, end_line_1, end_line_2);
        line_shift++;
    }

    const member_decl_code_lines = class_connections.memberDeclCode().split(/\r?\n/);
    member_decl_code_lines.pop();
    lines.splice(end_line_no + line_shift, 0, ...member_decl_code_lines);
    line_shift += member_decl_code_lines.length;

    return { lines, line_shift };
};

const insertTriggerCode = (trigger_names, trigger_code, edit_data, lines, line_shift) => {
    if (!trigger_code) {
        return lines;
    }

    const { last_class_line } = edit_data;
    const trigger_code_lines = trigger_code.split(/\r?\n/);
    trigger_code_lines.pop();
    lines.splice(last_class_line + line_shift, 0, ...trigger_code_lines);
    line_shift += trigger_code_lines.length;

    return { lines, trigger_names };
};

const removeClassConnectionsCode = edit_data => {
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

const addMethods = (method_names, edit_data, lang) => {
    const { text_lines, class_def_range } = edit_data;

    const lines = InterfaceCreator.addClassMethods(
        [ ... text_lines ],
        method_names,
        class_def_range,
        serviceTemplates(lang).method_template,
        lang
    );

    lines.unshift('');
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
            generated_lines.push(line);
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
