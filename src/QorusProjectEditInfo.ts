import * as vscode from 'vscode';
import { t } from 'ttag';

import { QorusJavaParser }  from './QorusJavaParser';
import { loc2range, javaLoc2range, QoreTextDocument, qoreTextDocument } from './QoreTextDocument';
import { qore_vscode } from './qore_vscode';
import * as msg from './qorus_message';
import { CONN_CALL_METHOD, GENERATED_TEXT } from './qorus_creator/ClassConnections';

export class QorusProjectEditInfo {
    private edit_info: any = {};
    getInfo = file => this.edit_info[file]

    private addTextLines = (file: string, contents: string) => {
        if (!this.edit_info[file]) {
            this.edit_info[file] = {};
        }

        let lines = contents.split(/\r?\n/);
        while (lines[0] === '') {
            lines.shift();
        }
        while (lines[lines.length-1] === '') {
            lines.pop();
        }

        this.edit_info[file].text_lines = lines;
    }

    private addMethodInfo = (
        file: string,
        method_name: string,
        decl_range: any,
        name_range: any) =>
    {
        if (!this.edit_info[file]) {
            this.edit_info[file] = {};
        }
        if (!this.edit_info[file].method_decl_ranges) {
            this.edit_info[file].method_decl_ranges = {};
            this.edit_info[file].method_name_ranges = {};
        }
        this.edit_info[file].method_decl_ranges[method_name] = decl_range;
        this.edit_info[file].method_name_ranges[method_name] = name_range;
    }

    private static isQoreSymbolClass = (symbol: any): boolean =>
        symbol.nodetype === 1 &&
        symbol.kind === 1

    static isQoreSymbolExpectedClass = (symbol: any, class_name?: string): boolean =>
        class_name &&
        symbol.nodetype === 1 &&
        symbol.kind === 1 &&
        class_name === symbol.name?.name

    static isJavaSymbolExpectedClass = (parsed_class: any, class_name?: string): boolean =>
        class_name && class_name === parsed_class.name.identifier

    static isQoreDeclPublicMethod = (decl: any): boolean => {
        if (decl.nodetype !== 1 || decl.kind !== 4) { // declaration && function
            return false;
        }

        if (decl.modifiers.indexOf('private') > -1) {
            return false;
        }

        return true;
    }

    static isJavaDeclPublicMethod = (parsed_method: any): boolean =>
        !parsed_method.modifiers || parsed_method.modifiers.some(({name}) => name === 'public')

    private addClassInfo = (file: string, symbol: any, base_class_name?: string) => {
        const class_def_range: vscode.Range = loc2range(symbol.loc);
        const class_name_range: vscode.Range = loc2range(symbol.name.loc, 'class ');

        const num_inherited = (symbol.inherits || []).length;
        const base_class_names = (symbol.inherits || []).map(inherited => inherited.name.name);

        const addClass = (main_base_class_ord: number = -1) => {
            if (!this.edit_info[file]) {
                this.edit_info[file] = {};
            }
            Object.assign(this.edit_info[file], {
                class_def_range,
                class_name_range,
                main_base_class_name_range: main_base_class_ord === -1
                    ? undefined
                    : loc2range(symbol.inherits[main_base_class_ord].name.loc),
                first_base_class_line: num_inherited > 0
                    ? loc2range(symbol.inherits[0].name.loc).start.line
                    : undefined,
                last_base_class_range: num_inherited > 0
                    ? loc2range(symbol.inherits[symbol.inherits.length-1].loc)
                    : undefined,
                last_class_line: loc2range(symbol.loc).end.line,
                base_class_names,
                main_base_class_ord
            });
        };

        if (num_inherited > 0) {
            if (base_class_name) {
                const index = symbol.inherits.findIndex(inherited =>
                    inherited.name && inherited.name.name === base_class_name);

                if (index > -1) {
                    addClass(index);
                } else {
                    msg.error(t`SrcAndYamlBaseClassMismatch ${base_class_name} ${file}`);
                    addClass();
                }
            } else {
                addClass();
            }
        } else {
            if (base_class_name) {
                msg.error(t`SrcAndYamlBaseClassMismatch ${base_class_name} ${file}`);
            }
            addClass();
        }
    }

    private addJavaClassInfo = (file: string, parsed_class: any, base_class_name?: string) => {
        const class_def_range: vscode.Range = javaLoc2range(parsed_class.loc);
        const class_name_range: vscode.Range = javaLoc2range(parsed_class.name.loc);

        const addClass = (main_base_class_ord: number = -1) => {
            if (!this.edit_info[file]) {
                this.edit_info[file] = {};
            }
            Object.assign(this.edit_info[file], {
                class_def_range,
                class_name_range,
                main_base_class_name_range: main_base_class_ord === -1
                    ? undefined
                    : javaLoc2range(parsed_class.superclass.name.loc),
                first_base_class_line: parsed_class.superclass
                    ? parsed_class.superclass.loc.startLine - 1
                    : undefined,
                last_base_class_range: parsed_class.superclass
                    ? javaLoc2range(parsed_class.superclass.loc, ' extends')
                    : undefined,
                last_class_line: class_def_range.end.line,
                base_class_names: base_class_name ? [base_class_name] : [],
                main_base_class_ord
            });
        };

        if (parsed_class.superclass) {
            if (base_class_name) {
                if (parsed_class.superclass.name.identifier === base_class_name) {
                    addClass(0);
                } else {
                    msg.error(t`SrcAndYamlBaseClassMismatch ${base_class_name} ${file}`);
                    addClass();
                }
            } else {
                addClass();
            }
        } else {
            if (base_class_name) {
                msg.error(t`SrcAndYamlBaseClassMismatch ${base_class_name} ${file}`);
            }
            addClass();
        }
    }

    setFileInfo(file: string, data: any, add_class_connections_info: boolean = false): Promise<any> {
        switch (data.lang) {
            case 'java': return this.setJavaFileInfo(file, data, true);
            default:     return this.setQoreFileInfo(file, data, add_class_connections_info);
        }
    }

    private setQoreFileInfo(file: string, data: any, add_class_connections_info: boolean = false): Promise<any> {
        this.edit_info[file] = undefined;

        const {
            iface_kind = data.type,
            'class-name': class_name,
            'base-class-name': base_class_name,
            'class-connections': class_connections
        } = data;

        if (!iface_kind) {
            return Promise.resolve();
        }

        const doc: QoreTextDocument = qoreTextDocument(file);
        this.addTextLines(file, doc.text);

        const addClassConnectionClass = symbols => {
            let has_the_method = false;

            const class_connection_names = Object.keys(class_connections);
            for (const symbol of symbols) {
                if (QorusProjectEditInfo.isQoreSymbolExpectedClass(symbol, class_name) ||
                    !QorusProjectEditInfo.isQoreSymbolClass(symbol))
                {
                    continue;
                }

                const decls = symbol.declarations;
                for (const decl of decls) {
                    if (!QorusProjectEditInfo.isQoreDeclPublicMethod(decl)) {
                        continue;
                    }
                    const method_name = decl.name?.name;
                    has_the_method = has_the_method || method_name === CONN_CALL_METHOD;
                    if (has_the_method && class_connection_names.includes(method_name)) {
                        this.edit_info[file].class_connections_class_range = loc2range(symbol.loc);
                        this.edit_info[file].class_connections_class_name = symbol.name?.name;
                    }
                }
            }
        };

        const maybeAddClassConnectionMemberDeclaration = decl => {
            if (decl.nodetype !== 1 || decl.kind !== 7) { // declaration && member group
                return;
            }

            for (const member of decl.members || []) {
                if (member.target?.declaration?.typeName?.name === this.edit_info[file].class_connections_class_name) {
                    this.edit_info[file].class_connections_member_name = member.target.declaration.name?.name;
                    this.edit_info[file].class_connections_member_declaration_range = loc2range(member.loc);
                    return;
                }
            }
        };

        const maybeAddPrivateMemberBlock = decl => {
            if (decl.nodetype !== 1 || decl.kind !== 7) { // declaration && member group
                return;
            }

            if (decl.modifiers.indexOf('private') > -1) {
                this.edit_info[file].private_member_block_range = loc2range(decl.loc);
                if (!decl.members?.length) {
                    this.edit_info[file].is_private_member_block_empty = true;
                }
            }
        };

        const maybeAddTriggerStatements = decl => {
            if (decl.nodetype !== 1 || decl.kind !== 4 || !decl.body?.statements?.length) { // declaration && function
                return;
            }

            for (const statement of decl.body.statements) {
                const var_name = statement.retval?.target?.variable?.name?.name ||
                                 statement.expression?.target?.variable?.name?.name;

                if (var_name && var_name === this.edit_info[file].class_connections_member_name &&
                    !(this.edit_info[file].class_connections_trigger_names || []).includes(decl.name?.name) )
                {
                    this.edit_info[file].class_connections_trigger_ranges = [
                        ... this.edit_info[file].class_connections_trigger_ranges || [],
                        loc2range(decl.loc)
                    ];
                    this.edit_info[file].class_connections_trigger_names = [
                        ... this.edit_info[file].class_connections_trigger_names || [],
                        decl.name?.name
                    ];
                }
            }
        };

        const maybeAddClassMethodInfo = (file: string, decl: any) => {
            if (!QorusProjectEditInfo.isQoreDeclPublicMethod(decl)) {
                return;
            }
            const method_name = decl.name.name;
            const decl_range = loc2range(decl.loc);
            const name_range = loc2range(decl.name.loc);

            this.addMethodInfo(file, method_name, decl_range, name_range);
        };

        return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
            if (add_class_connections_info && class_connections) {
                addClassConnectionClass(symbols);
            }
            symbols.forEach(symbol => {
                if (!QorusProjectEditInfo.isQoreSymbolExpectedClass(symbol, class_name)) {
                    return;
                }

                this.addClassInfo(file, symbol, base_class_name);

                for (const decl of symbol.declarations || []) {
                    if (add_class_connections_info && this.edit_info[file].class_connections_class_name) {
                        maybeAddClassConnectionMemberDeclaration(decl);
                        maybeAddTriggerStatements(decl);
                    } else {
                        maybeAddPrivateMemberBlock(decl);
                    }

                    maybeAddClassMethodInfo(file, decl);
                }
            });
            return Promise.resolve(this.edit_info[file]);
        });
    }

    private setJavaFileInfo(file: string, data: any, add_class_connections_info: boolean = false): Promise<any> {
        this.edit_info[file] = undefined;

        const {
            iface_kind = data.type,
            'class-name': class_name,
            'base-class-name': base_class_name,
            'class-connections': class_connections
        } = data;

        let expected_trigger_names = [];
        Object.keys(class_connections || {}).forEach(connection => {
            class_connections[connection].forEach(connector => {
                if (connector.trigger) {
                    expected_trigger_names.push(connector.trigger);
                }
            });
        });

        if (!iface_kind) {
            return Promise.resolve();
        }

        const doc: QoreTextDocument = qoreTextDocument(file);
        this.addTextLines(file, doc.text);

        const addClassConnectionClass = parsed_classes => {
            let has_the_method = false;

            const class_connection_names = Object.keys(class_connections);
            for (const parsed_class of parsed_classes) {
                if (QorusProjectEditInfo.isJavaSymbolExpectedClass(parsed_class, class_name)) {
                    continue;
                }

                const methods = parsed_class.body.methods;
                for (const method of methods) {
                    if (!QorusProjectEditInfo.isJavaDeclPublicMethod(method)) {
                        continue;
                    }

                    let method_name = method.name.identifier;

                    has_the_method = has_the_method || method_name === CONN_CALL_METHOD;

                    if (has_the_method && class_connection_names.includes(method_name)) {
                        this.edit_info[file].class_connections_class_range = javaLoc2range(parsed_class.loc);
                        this.edit_info[file].class_connections_class_name = parsed_class.name.identifier;
                        break;
                    }
                }
            }
        }

        const maybeAddClassConnectionMemberDeclaration = decl => {
            if (decl.type.identifier !== this.edit_info[file].class_connections_class_name) {
                return;
            }

            if (decl.variables?.length !== 1) {
                return;
            }

            this.edit_info[file].class_connections_member_name = decl.variables[0].name.identifier;
            this.edit_info[file].class_connections_member_declaration_range = javaLoc2range(decl.loc);
        };

        const maybeAddConstructorInfo = parsed_constructor => {
            const constructor_range = javaLoc2range(parsed_constructor.loc);

            // does the constructor contain something more then possibly
            // the member initialization command?
            let constructor_lines = [];
            constructor_lines.push(this.edit_info[file].text_lines[constructor_range.start.line]
                .substr(constructor_range.start.character));
            for (let i = constructor_range.start.line + 1; i < constructor_range.end.line; i++) {
                constructor_lines.push(this.edit_info[file].text_lines[i]);
            }
            constructor_lines.push(this.edit_info[file].text_lines[constructor_range.end.line]
                .substr(0, constructor_range.end.character));

            // remove lines between the comments GENERATED BEGIN/END (including those lines)
            let remaining_constructor_lines = [];
            let is_generated = false;
            constructor_lines.forEach(line => {
                if(line.indexOf(GENERATED_TEXT.begin) > -1) {
                    is_generated = true;
                    return;
                }
                if(line.indexOf(GENERATED_TEXT.end) > -1) {
                    is_generated = false;
                    return;
                }
                if (!is_generated) {
                    remaining_constructor_lines.push(line);
                }
            });

            // join the lines and remove the expected constructor signature parts
            const remaining_constructor_code = remaining_constructor_lines.join(' ')
                .replace(class_name, '')
                .replace('(', '')
                .replace(')', '')
                .replace('throws', '')
                .replace('Throwable', '')
                .replace('{', '')
                .replace('}', '');

            const is_constructor_empty = !remaining_constructor_code.match(/\S/);

            // does the declaration text contain the command (count with the possibility that its
            // alignment may be untidy - e.g. not on its own one line)
            // "<classConnectionMember> = new <ClassConnectionClass>();" ?
            // if yes take range of only this command (not the range of all the parsed_constructor)

            const class_connections_class_name = this.edit_info[file].class_connections_class_name;
            const class_connections_member_name = this.edit_info[file].class_connections_member_name;

            for (let i = constructor_range.start.line; i <= constructor_range.end.line; i++) {
                const start_pos = this.edit_info[file].text_lines[i].indexOf(class_connections_member_name);
                if (start_pos === -1) {
                    continue;
                }

                for (let ii = i; ii <= constructor_range.end.line; ii++) {
                    const class_name_start_pos = this.edit_info[file].text_lines[i].indexOf(class_connections_class_name);
                    if (class_name_start_pos === -1) {
                        continue;
                    }

                    // posssibly the searched command string
                    // "<classConnectionMember> = new <ClassConnectionClass>"
                    // - but without the ending "();"
                    let possibly_the_command_string;

                    if (i === ii) {
                         possibly_the_command_string = this.edit_info[file].text_lines[i]
                             .substring(start_pos, class_name_start_pos + class_connections_class_name.length);

                    } else {
                        possibly_the_command_string = this.edit_info[file].text_lines[i].substr(start_pos);
                        for (let iii = i + 1; iii < ii; iii++) {
                             possibly_the_command_string = this.edit_info[file].text_lines[iii];
                        }
                        possibly_the_command_string += this.edit_info[file].text_lines[ii]
                            .substr(0, class_name_start_pos + class_connections_class_name.length);
                    }

                    // remove the expected parts of the command and if nothing is left let's suppose
                    // it really is the command (but still without the "();" part)

                    const rest = possibly_the_command_string
                        .replace(class_connections_member_name, '')
                        .replace(class_connections_class_name, '')
                        .replace('=', '')
                        .replace('new', '');

                    if (rest.match(/\S/)) {
                        // no, something non-white is left so it's not the command
                        continue;
                    }

                    // ok, so find the "();" to find the end of the range

                    // first examine the part of the line after the class_connections_class_name
                    const line_rest = this.edit_info[file].text_lines[ii]
                        .substr(class_name_start_pos + class_connections_class_name.length);
                    if (line_rest.match(/^\s*\(\s*\)\s*;/)) {
                        const semicolon_relative_pos = line_rest.indexOf(';');
                        this.edit_info[file].constructor_range = constructor_range;
                        if (is_constructor_empty) {
                            this.edit_info[file].is_constructor_empty = true;
                        }
                        this.edit_info[file].class_connections_member_initialization_range = {
                            start: {
                                line: i,
                                character: start_pos
                            },
                            end: {
                                line: ii,
                                character: class_name_start_pos + class_connections_class_name.length + semicolon_relative_pos
                            }
                        };
                        return;
                    } else {
                        // examine the following lines
                        for (let iii = ii + 1; iii <= constructor_range.end.line; iii++) {
                            if (!this.edit_info[file].text_lines[iii].match(/$\s*\(\s*\)\s*;/)) {
                                continue;
                            }

                            const semicolon_pos = line_rest.indexOf(';');
                            this.edit_info[file].constructor_range = constructor_range;
                            if (is_constructor_empty) {
                                this.edit_info[file].is_constructor_empty = true;
                            }
                            this.edit_info[file].class_connections_member_initialization_range = {
                                start: {
                                    line: i,
                                    character: start_pos
                                },
                                end: {
                                    line: iii,
                                    character: semicolon_pos
                                }
                            };
                            return;
                        }
                    }
                }
            }
        };

        const maybeAddTriggerStatements = parsed_method => {
            if (!expected_trigger_names.includes(parsed_method.name.identifier)) {
                return;
            }

            this.edit_info[file].class_connections_trigger_ranges = [
                ... this.edit_info[file].class_connections_trigger_ranges || [],
                javaLoc2range(parsed_method.loc)
            ];
            this.edit_info[file].class_connections_trigger_names = [
                ... this.edit_info[file].class_connections_trigger_names || [],
                parsed_method.name.identifier
            ];
        };

        const parsed_data: any = QorusJavaParser.parseFileNoExcept(file);

        if (add_class_connections_info && class_connections) {
            addClassConnectionClass(parsed_data.classes);
        }

        parsed_data.classes.forEach(parsed_class => {
            if (!QorusProjectEditInfo.isJavaSymbolExpectedClass(parsed_class, class_name)) {
                return;
            }

            this.addJavaClassInfo(file, parsed_class, base_class_name);

            if (add_class_connections_info && this.edit_info[file].class_connections_class_name) {
                for (const decl of parsed_class.body.fieldDecls || []) {
                    maybeAddClassConnectionMemberDeclaration(decl);
                }
            }

            for (const method of parsed_class.body.methods || []) {
                if (!QorusProjectEditInfo.isJavaDeclPublicMethod(method)) {
                    continue;
                }

                if (add_class_connections_info && this.edit_info[file].class_connections_class_name) {
                    maybeAddTriggerStatements(method);
                }

                this.addMethodInfo(
                    file,
                    method.name.identifier,
                    javaLoc2range(method.loc),
                    javaLoc2range(method.name.loc)
                );
            }

            for (const constructor of parsed_class.body.constructors || []) {
                maybeAddConstructorInfo(constructor);
            }
        });

        return Promise.resolve(this.edit_info[file]);
    }
}
