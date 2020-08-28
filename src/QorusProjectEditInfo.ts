import * as vscode from 'vscode';
import { existsSync } from 'fs';
import { t } from 'ttag';

import { QorusJavaParser }  from './QorusJavaParser';
import { QorusPythonParser }  from './QorusPythonParser';
import { qoreLoc2Range, pythonLoc2Range, javaLoc2Range,
         pythonNameRange, QoreTextDocument, qoreTextDocument } from './QoreTextDocument';
import { qorus_webview } from './QorusWebview';
import { qore_vscode } from './qore_vscode';
import * as msg from './qorus_message';
import { CONN_CALL_METHOD, GENERATED_TEXT } from './qorus_creator/ClassConnectionsCreate';

export class QorusProjectEditInfo {
    private edit_info: any = {};
    getInfo = file => this.edit_info[file];

    private setError = (file: string, error: string): string => {
        this.edit_info[file] = {error};
        return error;
    }

    checkError = (file: string) => {
        if (this.edit_info?.[file]?.error) {
            qorus_webview.postMessage({
                action: 'maybe-recreate-interface',
                message: this.edit_info[file].error
            });
        }
    }

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

    static isPythonSymbolExpectedClass = (parsed_class: any, class_name?: string): boolean =>
        class_name && class_name === parsed_class.name

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

    static isPythonDeclPublicMethod = (parsed_method: any): boolean =>
        !parsed_method?.name?.startsWith('__')

    private addQoreClassInfo = (file: string, symbol: any, base_class_name?: string) => {
        const class_def_range: vscode.Range = qoreLoc2Range(symbol.loc);
        const class_name_range: vscode.Range = qoreLoc2Range(symbol.name.loc, 'class ');

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
                    : qoreLoc2Range(symbol.inherits[main_base_class_ord].name.loc),
                first_base_class_line: num_inherited > 0
                    ? qoreLoc2Range(symbol.inherits[0].name.loc).start.line
                    : undefined,
                last_base_class_range: num_inherited > 0
                    ? qoreLoc2Range(symbol.inherits[symbol.inherits.length-1].loc)
                    : undefined,
                last_class_line: qoreLoc2Range(symbol.loc).end.line,
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

    private addPythonClassInfo = (file: string, parsed_class: any, base_class_name?: string) => {
        const class_def_range: vscode.Range = pythonLoc2Range(parsed_class.loc);
        const class_name_range: vscode.Range = pythonNameRange(
            this.edit_info[file].text_lines[class_def_range.start.line],
            class_def_range,
            parsed_class.name,
            'class'
        );

        if (!parsed_class.body?.methods?.length && !parsed_class.body?.assignments?.length) {
            this.edit_info[file].is_class_empty = true;
        }

        const num_inherited = (parsed_class.extends || []).length;
        const base_class_names = (parsed_class.extends || []).map(inherited => inherited.name);

        const addClass = (main_base_class_ord: number = -1) => {
            if (!this.edit_info[file]) {
                this.edit_info[file] = {};
            }
            Object.assign(this.edit_info[file], {
                class_def_range,
                class_name_range,
                main_base_class_name_range: main_base_class_ord === -1
                    ? undefined
                    : pythonLoc2Range(parsed_class.extends[main_base_class_ord].loc),
                first_base_class_line: num_inherited > 0
                    ? pythonLoc2Range(parsed_class.extends[0].loc).start.line
                    : undefined,
                last_base_class_range: num_inherited > 0
                    ? pythonLoc2Range(parsed_class.extends[parsed_class.extends.length-1].loc)
                    : undefined,
                last_class_line: class_def_range.end.line,
                base_class_names,
                main_base_class_ord
            });
        };

        if (num_inherited > 0) {
            if (base_class_name) {
                const index = parsed_class.extends.findIndex(({name}) => name === base_class_name);

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
        const class_def_range: vscode.Range = javaLoc2Range(parsed_class.loc);
        const class_name_range: vscode.Range = javaLoc2Range(parsed_class.name.loc);

        const addClass = (main_base_class_ord: number = -1) => {
            if (!this.edit_info[file]) {
                this.edit_info[file] = {};
            }
            Object.assign(this.edit_info[file], {
                class_def_range,
                class_name_range,
                main_base_class_name_range: main_base_class_ord === -1
                    ? undefined
                    : javaLoc2Range(parsed_class.superclass.name.loc),
                first_base_class_line: parsed_class.superclass
                    ? parsed_class.superclass.loc.startLine - 1
                    : undefined,
                last_base_class_range: parsed_class.superclass
                    ? javaLoc2Range(parsed_class.superclass.loc, ' extends')
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

    setFileInfo(file: string, data: any): Promise<any> {
        if (!existsSync(file)) {
            return Promise.reject(this.setError(file, t`OrigIfaceFileDoesNotExist ${file}`));
        }

        const {
            iface_kind = data.type,
            'class-name': class_name,
            'base-class-name': base_class_name,
            'class-connections': class_connections
        } = data;

        if (!iface_kind) {
            return Promise.reject(this.setError(file, t`DataTypeUnknown`));
        }

        this.edit_info[file] = undefined;

        switch (data.lang || 'qore') {
            case 'python': return this.setPythonFileInfo(file, class_name, base_class_name, class_connections);
            case 'java': return this.setJavaFileInfo(file, class_name, base_class_name, class_connections);
            default: return this.setQoreFileInfo(file, class_name, base_class_name, class_connections);
        }
    }

    private setQoreFileInfo(file: string, class_name: string, base_class_name: string, class_connections: any): Promise<any> {
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
                        this.edit_info[file].class_connections_class_range = qoreLoc2Range(symbol.loc);
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
                    this.edit_info[file].class_connections_member_declaration_range = qoreLoc2Range(member.loc);
                    return;
                }
            }
        };

        const maybeAddPrivateMemberBlock = decl => {
            if (decl.nodetype !== 1 || decl.kind !== 7) { // declaration && member group
                return;
            }

            if (decl.modifiers.indexOf('private') > -1) {
                this.edit_info[file].private_member_block_range = qoreLoc2Range(decl.loc);
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
                        qoreLoc2Range(decl.loc)
                    ];
                    this.edit_info[file].class_connections_trigger_names = [
                        ... this.edit_info[file].class_connections_trigger_names || [],
                        decl.name?.name
                    ];
                }
            }
        };

        return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
            if (!symbols.length) {
                return Promise.reject(this.setError(file, t`ErrorParsingFileOrNoSymbolsFound ${file}`));
            }

            if (class_connections) {
                addClassConnectionClass(symbols);
            }
            symbols.forEach(symbol => {
                if (!QorusProjectEditInfo.isQoreSymbolExpectedClass(symbol, class_name)) {
                    return;
                }

                this.addQoreClassInfo(file, symbol, base_class_name);

                for (const decl of symbol.declarations || []) {
                    if (this.edit_info[file].class_connections_class_name) {
                        maybeAddClassConnectionMemberDeclaration(decl);
                        maybeAddTriggerStatements(decl);
                    } else {
                        maybeAddPrivateMemberBlock(decl);
                    }

                    if (QorusProjectEditInfo.isQoreDeclPublicMethod(decl)) {
                        this.addMethodInfo(
                            file,
                            decl.name.name,
                            qoreLoc2Range(decl.loc),
                            qoreLoc2Range(decl.name.loc)
                        );
                    }
                }
            });
            return Promise.resolve(this.edit_info[file]);
        });
    }

    private setJavaFileInfo(file: string, class_name: string, base_class_name: string, class_connections: any): Promise<any> {
        let expected_trigger_names = [];
        Object.keys(class_connections || {}).forEach(connection => {
            class_connections[connection].forEach(connector => {
                if (connector.trigger) {
                    expected_trigger_names.push(connector.trigger);
                }
            });
        });

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
                        this.edit_info[file].class_connections_class_range = javaLoc2Range(parsed_class.loc);
                        this.edit_info[file].class_connections_class_name = parsed_class.name.identifier;
                        break;
                    }
                }
            }
        };

        const maybeAddClassConnectionMemberDeclaration = decl => {
            if (decl.type.identifier !== this.edit_info[file].class_connections_class_name) {
                return;
            }

            if (decl.variables?.length !== 1) {
                return;
            }

            this.edit_info[file].class_connections_member_name = decl.variables[0].name.identifier;
            this.edit_info[file].class_connections_member_declaration_range = javaLoc2Range(decl.loc);
        };

        const maybeAddConstructorInfo = parsed_constructor => {
            const constructor_range = javaLoc2Range(parsed_constructor.loc);
            this.edit_info[file].constructor_range = constructor_range;

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

            this.edit_info[file].is_constructor_empty = !remaining_constructor_code.match(/\S/);

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
                javaLoc2Range(parsed_method.loc)
            ];
            this.edit_info[file].class_connections_trigger_names = [
                ... this.edit_info[file].class_connections_trigger_names || [],
                parsed_method.name.identifier
            ];
        };

        let parsed_data: any;
        try {
            parsed_data = QorusJavaParser.parseFile(file);
        } catch (error) {
            msg.debug({error});
            return Promise.reject(this.setError(file, t`ErrorParsingFile ${file}`));
        }

        if (class_connections) {
            addClassConnectionClass(parsed_data.classes);
        }

        parsed_data.classes.forEach(parsed_class => {
            if (!QorusProjectEditInfo.isJavaSymbolExpectedClass(parsed_class, class_name)) {
                return;
            }

            this.addJavaClassInfo(file, parsed_class, base_class_name);

            if (this.edit_info[file].class_connections_class_name) {
                for (const decl of parsed_class.body.fieldDecls || []) {
                    maybeAddClassConnectionMemberDeclaration(decl);
                }
            }

            for (const method of parsed_class.body.methods || []) {
                if (!QorusProjectEditInfo.isJavaDeclPublicMethod(method)) {
                    continue;
                }

                if (this.edit_info[file].class_connections_class_name) {
                    maybeAddTriggerStatements(method);
                }

                this.addMethodInfo(
                    file,
                    method.name.identifier,
                    javaLoc2Range(method.loc),
                    javaLoc2Range(method.name.loc)
                );
            }

            for (const constructor of parsed_class.body.constructors || []) {
                maybeAddConstructorInfo(constructor);
            }
        });

        return Promise.resolve(this.edit_info[file]);
    }

    private setPythonFileInfo(file: string, class_name: string, base_class_name: string, class_connections: any): Promise<any> {
        let expected_trigger_names = [];
        Object.keys(class_connections || {}).forEach(connection => {
            class_connections[connection].forEach(connector => {
                if (connector.trigger) {
                    expected_trigger_names.push(connector.trigger);
                }
            });
        });

        const doc: QoreTextDocument = qoreTextDocument(file);
        this.addTextLines(file, doc.text);

        const addClassConnectionClass = parsed_classes => {
            let has_the_method = false;

            const class_connection_names = Object.keys(class_connections);
            for (const parsed_class of parsed_classes) {
                if (QorusProjectEditInfo.isPythonSymbolExpectedClass(parsed_class, class_name)) {
                    continue;
                }

                for (const method of parsed_class.body.methods) {
                    if (!QorusProjectEditInfo.isPythonDeclPublicMethod(method)) {
                        continue;
                    }

                    has_the_method = has_the_method || method.name === CONN_CALL_METHOD;

                    if (has_the_method && class_connection_names.includes(method.name)) {
                        this.edit_info[file].class_connections_class_range = pythonLoc2Range(parsed_class.loc);
                        this.edit_info[file].class_connections_class_name = parsed_class.name;
                        break;
                    }
                }
            }
        };

        const maybeAddTriggerStatements = parsed_method => {
            if (!expected_trigger_names.includes(parsed_method.name)) {
                return;
            }

            this.edit_info[file].class_connections_trigger_ranges = [
                ... this.edit_info[file].class_connections_trigger_ranges || [],
                pythonLoc2Range(parsed_method.loc)
            ];

            this.edit_info[file].class_connections_trigger_names = [
                ... this.edit_info[file].class_connections_trigger_names || [],
                parsed_method.name
            ];
        };

        const addConstructorInfo = parsed_constructor => {
            const constructor_range = pythonLoc2Range(parsed_constructor.loc);
            this.edit_info[file].constructor_range = constructor_range;

            let other_constructor_lines = [];
            let is_generated = false;

            const regexp = 'self\\.(\\S+)\\s*=\\s*' +
                this.edit_info[file].class_connections_class_name +
                '\\s*\\(\\s*\\)';

            for (let i = constructor_range.start.line + 1; i < constructor_range.end.line; i++) {
                const line = this.edit_info[file].text_lines[i];
                const match_result = line.match(regexp);
                if (match_result) {
                    this.edit_info[file].class_connections_member_name = match_result[1];
                    const member_declaration_command = match_result[0];
                    const member_declaration_command_start = line.indexOf(member_declaration_command);
                    this.edit_info[file].class_connections_member_declaration_range = new vscode.Range(
                        i,
                        member_declaration_command_start,
                        i,
                        member_declaration_command_start + member_declaration_command.length
                    );
                } else {
                    if(line.indexOf(GENERATED_TEXT.begin) > -1) {
                        is_generated = true;
                    }
                    else if(line.indexOf(GENERATED_TEXT.end) > -1) {
                        is_generated = false;
                    }
                    else if (!is_generated) {
                        other_constructor_lines.push(line);
                    }
                }
            }

            this.edit_info[file].is_constructor_empty = !other_constructor_lines.join('').match(/\S/);
        };

        let parsed_data: any;
        try {
            parsed_data = QorusPythonParser.parseFile(file);
        } catch (error) {
            msg.debug({error});
            return Promise.reject(this.setError(file, t`ErrorParsingFile ${file}`));
        }

        if (class_connections) {
            addClassConnectionClass(parsed_data.classes);
        }

        parsed_data.classes.forEach(parsed_class => {
            if (!QorusProjectEditInfo.isPythonSymbolExpectedClass(parsed_class, class_name)) {
                return;
            }

            this.addPythonClassInfo(file, parsed_class, base_class_name);

            for (const method of parsed_class.body.methods || []) {
                if (!QorusProjectEditInfo.isPythonDeclPublicMethod(method)) {
                    if (method.name === '__init__') {
                        addConstructorInfo(method);
                    }
                    continue;
                }

                if (this.edit_info[file].class_connections_class_name) {
                    maybeAddTriggerStatements(method);
                }

                const method_range: vscode.Range = pythonLoc2Range(method.loc);
                this.addMethodInfo(
                    file,
                    method.name,
                    method_range,
                    pythonNameRange(
                        this.edit_info[file].text_lines[method_range.start.line],
                        method_range,
                        method.name,
                        'def'
                    )
                );
            }
        });

        return Promise.resolve(this.edit_info[file]);
    }
}
