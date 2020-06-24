import * as fs from 'fs';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { QorusProjectEditInfo } from '../QorusProjectEditInfo';
import { ClassConnectionsCreate, GENERATED_TEXT, indent } from './ClassConnectionsCreate';
import { InterfaceCreator } from './InterfaceCreator';
import { QoreTextDocument, qoreTextDocument } from '../QoreTextDocument';
import { simple_method_template } from './common_constants';
import { triggers } from './standard_methods';
import { sortRanges, capitalize } from '../qorus_utils';


export class ClassConnectionsEdit {
    private file: string;
    private lang: string;
    private iface_kind: string;
    private class_connections: ClassConnectionsCreate;

    doChanges = async (
        file: string,
        code_info: QorusProjectCodeInfo,
        new_data: any,
        orig_data: any,
        iface_kind: string,
        imports: string[]) =>
    {
        Object.assign(this, {file, iface_kind});

        const edit_info: QorusProjectEditInfo = code_info.edit_info;
        let edit_data: any;
        let lines: string[];
        let method_names: string[];
        let trigger_names: string[];
        let more_imports: string[] = [];

        const had_class_connections = Object.keys(orig_data?.['class-connections'] || {}).length > 0;
        const has_class_connections = Object.keys(new_data?.['class-connections'] || {}).length > 0;

        const data = {
            ...new_data,
            iface_kind
        };

        const mixed_data = {
            ...data,
            'class-connections': orig_data?.['class-connections']
        };

        this.lang = data.lang || 'qore';

        const setFileInfo = async (params = data) => {
            return await edit_info.setFileInfo(file, params);
        };

        const writeFile = lines => fs.writeFileSync(file, lines.join('\n') + '\n');

        // remove original class connections code
        if (had_class_connections) {
            edit_data = await setFileInfo(mixed_data);
            if (iface_kind === 'step') {
                trigger_names = triggers(code_info, {iface_kind, 'base-class-name': orig_data['base-class-name']});
            }
            lines = this.removeClassConnectionsCode(edit_data, trigger_names);
            lines = this.cleanup(lines);
            writeFile(lines);

            if (iface_kind === 'step') {
                method_names = trigger_names;
            } else {
                ({ class_connections_trigger_names: method_names } = edit_data);
            }

            edit_data = await setFileInfo();
            if (edit_data.is_private_member_block_empty) {
                lines = this.deleteEmptyPrivateMemberBlock(edit_data);
                lines = this.cleanup(lines);
                writeFile(lines);
            }
        }

        // add new class connections code
        if (has_class_connections) {
            this.class_connections = new ClassConnectionsCreate({ ...data }, code_info, this.lang);
            let { imports: cc_imports, triggers, trigger_code, connections_extra_class } = this.class_connections.code();
            more_imports = cc_imports;
            trigger_names = triggers;

            edit_data = await setFileInfo();
            lines = this.removeMethods(trigger_names, edit_data);
            lines = this.cleanup(lines);
            writeFile(lines);

            edit_data = await setFileInfo();

            let line_shift;
            ({ lines, line_shift } = this[`insertMemberDeclaration${capitalize(this.lang)}`](edit_data));
            if (this.lang === 'java' && edit_data.constructor_range) {
                ({ lines, line_shift } = this.insertMemberInitJava(edit_data, lines, line_shift));
            }
            lines = this.insertTriggerCode(trigger_code, edit_data, lines, line_shift);
            let extra_class_code_lines = connections_extra_class.split(/\r?\n/);
            extra_class_code_lines.pop();
            lines = [ ...lines, ...extra_class_code_lines ];

            lines = this.cleanup(lines);
            writeFile(lines);
        }

        if (iface_kind === 'step' && !has_class_connections) {
            edit_data = await setFileInfo();
            let { text_lines: lines, class_def_range } = edit_data;
            const mandatory_step_methods = InterfaceCreator.mandatoryStepMethodsCode(
                code_info,
                data['base-class-name'],
                this.lang
            );

            const end = class_def_range.end;
            const lines_before = lines.splice(0, end.line);
            const line = lines.splice(0, 1)[0] || '';
            const line_before = line.substr(0, end.character - 1);
            const line_after = line.substr(end.character - 1);
            const lines_after = lines;

            let new_code = line_before + mandatory_step_methods;
            const new_code_lines = new_code.split(/\r?\n/);
            if (new_code_lines[new_code_lines.length - 1] === '') {
                new_code_lines.pop();
            }

            if (lines_before.length && lines_before[lines_before.length - 1] !== '' &&
                new_code_lines.length && new_code_lines[0] !== '')
            {
                new_code_lines.unshift('');
            }

            lines = [
                ...lines_before,
                ...new_code_lines,
                line_after,
                ...lines_after
            ];

            writeFile(lines);
        } else {
            let methods_to_add = [];
            (method_names || []).forEach(method_name => {
                if (!trigger_names?.includes(method_name)) {
                    methods_to_add.push(method_name);
                }
            });
            if (methods_to_add?.length) {
                edit_data = await setFileInfo(mixed_data);
                lines = this.addMethods(methods_to_add, edit_data);
                lines = this.cleanup(lines);
                writeFile(lines);
            }
        }

        if (this.lang === 'java') {
            lines = this.fixJavaImports([ ...imports, ...more_imports ]);
            writeFile(lines);
        }

        edit_data = await setFileInfo();
        if (this.lang === 'python' && !edit_data.is_class_empty) {
            lines = this.possiblyRemoveUselessPass(edit_data);
            if (lines) {
                lines = this.cleanup(lines);
                writeFile(lines);
                edit_data = await setFileInfo();
            }
        }

        lines = this.possiblyRemoveFirstEmptyLine(edit_data);
        if (lines) {
            writeFile(lines);
        }
    }

    private insertMemberInitJava = (edit_data, lines, line_shift) => {
        const { constructor_range } = edit_data;

        const member_initialization_code_lines = this.class_connections.memberInitCodeJava().split(/\r?\n/);
        member_initialization_code_lines.pop();

        const constructor_end_line = constructor_range.end.line;
        const end_line = lines[constructor_end_line];
        // if the closing '}' of the constructor is not on a separate line move it to the next line
        if (!end_line.match(/^\s*\}\s*$/)) {
            const end_character = constructor_range.end.character - 1;
            const end_line_1 = end_line.substr(0, end_character);
            const end_line_2 = ' '.repeat(end_character) + end_line.substr(end_character);
            lines.splice(constructor_end_line, 1, end_line_1, end_line_2);
            line_shift++;
        }

        lines.splice(constructor_end_line + line_shift, 0, ...member_initialization_code_lines);
        line_shift += member_initialization_code_lines.length;

        return { lines, line_shift };
    }

    protected insertMemberDeclarationQore = edit_data => {
        const {
            text_lines,
            private_member_block_range,
            last_class_line,
            last_base_class_range,
        } = edit_data;
        let lines = [ ...text_lines ];
        let line_shift = 0;

        const member_decl_code: string = this.class_connections.memberDeclAndInitCodeQore();
        let member_decl_code_lines = member_decl_code.split(/\r?\n/);
        member_decl_code_lines.pop();

        if (private_member_block_range) {
            const private_member_block_end_line = private_member_block_range.end.line;
            const end_line = lines[private_member_block_end_line];
            // if the closing '}' of the private declaration block is not on a separate line move it to the next line
            if (!end_line.match(/^\s*\}\s*$/)) {
                const end_character = private_member_block_range.end.character - 1;
                const end_line_1 = end_line.substr(0, end_character);
                const end_line_2 = ' '.repeat(end_character) + end_line.substr(end_character);
                lines.splice(private_member_block_end_line, 1, end_line_1, end_line_2);
                line_shift++;
            }

            lines.splice(private_member_block_end_line + line_shift, 0, ...member_decl_code_lines);
            line_shift += member_decl_code_lines.length;
        } else {
            let target_line: number; // line where to insert the private member block
            // make sure that there is nothing after the opening '{' of the main class
            const class_decl_line_rest = lines[last_base_class_range.end.line].substr(last_base_class_range.end.character);
            // find the line with the '{'
            if (class_decl_line_rest.match(/^\s*\{\s*$/)) {
                target_line = last_base_class_range.end.line + 1;
            } else {
                for (let i = last_base_class_range.end.line; i < last_class_line; i++) {
                    if (lines[i]?.match(/^\s*\{/)) {
                        if (lines[i].match(/^\s*\{\s*$/)) {
                            target_line = i;
                        } else {
                            const pos = lines[i].indexOf('{');
                            const extra_line = ' '.repeat(pos + 1) + lines[i].substr(pos + 1);
                            lines[i] = lines[i].substr(0, pos + 1);
                            lines.splice(i, 0, extra_line);
                            target_line = i + 1;
                            line_shift++;
                        }
                        break;
                    }
                }
            }

            lines.splice(target_line, 0, `${indent}private {`, `${indent}}` , '');
            line_shift += 3;

            lines.splice(target_line + 1, 0, ...member_decl_code_lines);
            line_shift += member_decl_code_lines.length;
        }

        return { lines, line_shift };
    }

    protected insertMemberDeclarationPython = edit_data => {
        const {
            text_lines,
            constructor_range,
            class_def_range,
        } = edit_data;

        let lines = [ ...text_lines ];
        let member_decl_code: string;
        let target_line: number; // line after which to insert the member_decl_code

        if (constructor_range) {
            member_decl_code = this.class_connections.memberDeclAndInitCodePython();
            target_line = constructor_range.start.line;
        } else {
            member_decl_code = this.class_connections.memberDeclAndInitAllCodePython() + '\n';
            target_line = class_def_range.start.line;
        }

        let member_decl_code_lines = member_decl_code.split(/\r?\n/);
        member_decl_code_lines.pop();

        lines.splice(target_line + 1, 0, ...member_decl_code_lines);
        const line_shift = member_decl_code_lines.length;

        return { lines, line_shift };
    }

    protected insertMemberDeclarationJava = edit_data => {
        const {
            text_lines,
            last_class_line,
            last_base_class_range,
            constructor_range
        } = edit_data;
        let lines = [ ...text_lines ];
        let line_shift = 0;

        const member_decl_code: string = constructor_range !== undefined
            ? this.class_connections.memberDeclCodeJava()
            : this.class_connections.memberDeclAndInitAllCodeJava();

        let member_decl_code_lines = member_decl_code.split(/\r?\n/);
        member_decl_code_lines.pop();

        let target_line: number; // line where to insert the member_decl_code
        // make sure that there is nothing after the opening '{' of the main class
        const class_decl_line_rest = lines[last_base_class_range.end.line].substr(last_base_class_range.end.character);
        // find the line with the '{'
        if (class_decl_line_rest.match(/^\s*\{\s*$/)) {
            target_line = last_base_class_range.end.line + 1;
        } else {
            for (let i = last_base_class_range.end.line; i < last_class_line; i++) {
                if (lines[i]?.match(/^\s*\{/)) {
                    if (lines[i].match(/^\s*\{\s*$/)) {
                        target_line = i;
                    } else {
                        const pos = lines[i].indexOf('{');
                        const extra_line = ' '.repeat(pos + 1) + lines[i].substr(pos + 1);
                        lines[i] = lines[i].substr(0, pos + 1);
                        lines.splice(i, 0, extra_line);
                        target_line = i + 1;
                        line_shift++;
                    }
                    break;
                }
            }
        }

        lines.splice(target_line, 0, ...member_decl_code_lines);
        line_shift += member_decl_code_lines.length;

        return { lines, line_shift };
    }

    private insertTriggerCode = (trigger_code, edit_data, lines, line_shift) => {
        if (!trigger_code) {
            return lines ;
        }

        const { last_class_line } = edit_data;
        const trigger_code_lines = trigger_code.split(/\r?\n/);
        trigger_code_lines.pop();
        lines.splice(last_class_line + line_shift, 0, ...trigger_code_lines);
        line_shift += trigger_code_lines.length;

        return lines;
    }

    private removeClassConnectionsCode = (edit_data, trigger_names) => {
        const {
            text_lines,
            class_def_range,
            class_connections_class_range,
            class_connections_member_declaration_range,
            class_connections_member_initialization_range,
            class_connections_trigger_ranges,
            method_decl_ranges = {},
            constructor_range,
            is_constructor_empty,
        } = edit_data;

        let ranges = [class_connections_class_range];

        if (is_constructor_empty) {
            ranges.push(constructor_range);
        } else if (this.lang !== 'java') {
            ranges.push(class_connections_member_initialization_range);
        }

        if (this.lang !== 'python' || !is_constructor_empty) {
            ranges.push(class_connections_member_declaration_range);
        }

        ranges = ranges.filter(range => range !== undefined);

        if (this.iface_kind === 'step' && trigger_names) {
            Object.keys(method_decl_ranges).forEach(method_name => {
                if (trigger_names.includes(method_name)) {
                    ranges.push(method_decl_ranges[method_name]);
                }
            });
        } else {
            ranges = [ ...ranges, ... class_connections_trigger_ranges || [] ];
        }

        let lines = this.removeRanges([...text_lines], ranges);
        if (this.lang === 'python') {
            lines.splice(class_def_range.start.line + 1, 0, `${indent}pass`);
        }
        return lines;
    }

    private removeRanges = (lines, ranges) => {
        const sorted_ranges = sortRanges(ranges).reverse();
        sorted_ranges.forEach(range => {
            lines = this.removeRange(lines, range);
        });

        return lines;
    }

    private removeRange = (orig_lines, range) => {
        let lines = [];

        for (let i = 0; i < range.start.line; i++) {
            lines.push(orig_lines[i]);
        }
        if (range.start.line === range.end.line) {
            let line = orig_lines[range.start.line];
            line = line.substr(0, range.start.character) + line.substr(range.end.character + 1);
            if (line.match(/\S/)) {
                lines.push(line);
            }
        } else {
            let line_a = orig_lines[range.start.line] || '';
            let line_b = orig_lines[range.end.line] || '';
            line_a = line_a.substr(0, range.start.character);
            if (line_b) {
                line_b = ' '.repeat(range.end.character + 1) + line_b.substr(range.end.character + 1);
            }
            [line_a, line_b].forEach(line => {
                if (line.match(/\S/)) {
                    lines.push(line);
                }
            });
        }
        for (let i = range.end.line + 1; i < orig_lines.length; i++) {
            lines.push(orig_lines[i]);
        }

        return lines;
    }

    private addMethods = (method_names, edit_data) => {
        const { text_lines, class_def_range } = edit_data;

        const lines = InterfaceCreator.addClassMethods(
            [ ... text_lines ],
            method_names,
            class_def_range,
            simple_method_template[this.lang],
            this.lang
        );

        return lines;
    }

    private removeMethods = (method_names, edit_data) => {
        const { text_lines, class_def_range, method_decl_ranges } = edit_data;

        const lines = InterfaceCreator.removeClassMethods(
            [ ... text_lines ],
            method_names,
            method_decl_ranges
        );

        if (this.lang === 'python') {
            lines.splice(class_def_range.start.line + 1, 0, `${indent}pass`);
        }

        return lines;
    }

    private deleteEmptyPrivateMemberBlock = edit_data => {
        const { text_lines, private_member_block_range: block } = edit_data;
        let lines = [];

        for (let i = 0; i < block.start.line; i++) {
            lines.push(text_lines[i]);
        }

        lines.push(text_lines[block.start.line].substr(0, block.start.character));
        lines.push(text_lines[block.end.line].substr(block.end.character));
        if (text_lines[block.end.line + 1].match(/\S/)) {
            lines.push(text_lines[block.end.line + 1]);
        }
        for (let i = block.end.line + 2; i < text_lines.length; i++) {
            lines.push(text_lines[i]);
        }

        return lines;
    }

    private cleanup = dirty_lines => {
        const isGeneratedBegin = line => line.indexOf(GENERATED_TEXT.begin) > -1;
        const isGeneratedEnd = line => line.indexOf(GENERATED_TEXT.end) > -1;

        // 1. trim ending whitespaces of each line
        // 2. remove sections of generated code (between BEGIN and END) with only empty lines inside
        // 3 .remove GENERATED END lines with no matching GENERATED BEGIN line
        // 4. reduce double empty lines
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
                is_previous_empty = false;
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
    }

    private fixJavaImports = imports => {
        const doc: QoreTextDocument = qoreTextDocument(this.file);
        let lines = doc.text.split(/\r?\n/);

        while (lines[lines.length-1] === '') {
            lines.pop();
        }

        let package_line;
        if (lines[0].startsWith('package ')) {
            package_line = lines[0];
            lines.shift();
        }

        while (lines[0] === '' || lines[0].startsWith('import ')) {
            lines.shift();
        }

        lines.unshift('');
        imports.reverse().forEach(imp => {
            lines.unshift(imp);
        });
        if (package_line) {
            lines.unshift('');
            lines.unshift(package_line);
        }

        return lines;
    }

    private possiblyRemoveFirstEmptyLine = edit_data => {
        const { text_lines: lines, class_name_range, last_class_line, last_base_class_range } = edit_data;

        // if lang is python then the first line is the one after the class declaration line
        // otherwise the first line is the line after the line with the opening '{'
        let first_line;

        if (this.lang === 'python') {
            first_line = class_name_range.end.line + 1;
        } else {
            const class_decl_line_rest = last_base_class_range
                ? lines[last_base_class_range.end.line].substr(last_base_class_range.end.character)
                : lines[class_name_range.end.line].substr(class_name_range.end.character);

            if (class_decl_line_rest.match(/^\s*\{\s*$/)) {
                first_line = last_base_class_range.end.line + 1;
            } else {
                for (let i = last_base_class_range.end.line; i < last_class_line; i++) {
                    if (lines[i]?.match(/^\s*\{/)) {
                        if (lines[i].match(/^\s*\{\s*$/)) {
                            first_line = i + 1;
                        } else {
                            const pos = lines[i].indexOf('{');
                            const extra_line = ' '.repeat(pos + 1) + lines[i].substr(pos + 1);
                            lines[i] = lines[i].substr(0, pos + 1);
                            lines.splice(i, 0, extra_line);
                            first_line = i + 2;
                        }
                        break;
                    }
                }
            }
        }

        if (first_line && lines[first_line] == '') {
            lines.splice(first_line, 1);
            return lines;
        }
        return undefined;
    }

    private possiblyRemoveUselessPass = edit_data => {
        const { text_lines: lines, class_def_range } = edit_data;
        let any_removed = false;
        const to_remove = `${indent}pass`;
        for (let i = class_def_range.end.line - 1; i > class_def_range.start.line; i--) {
            if (lines[i] && lines[i].startsWith(to_remove)) {
                lines.splice(i, 1);
                any_removed = true;
            }
        }
        return any_removed ? lines : undefined;
    }
}
