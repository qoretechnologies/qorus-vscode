import { parse } from '@qoretechnologies/python-parser';
import { readFileSync } from 'fs';

// a function for test printing out parsed AST of a file (output from the python-program-analysis module)
/*import { writeFileSync } from 'fs';
export function printPythonJsonAST(filepath: string, encoding: string = 'utf-8') {
    let pyfile = readFileSync(filepath, {encoding: encoding});
    let ast = parse(pyfile);
    writeFileSync(filepath + ".ast", JSON.stringify(ast, null, 2));
}*/

export class QorusPythonParser {
    private static _parseAssign(assignNode): object | undefined {
        let targets = [];
        let sources = [];

        for (const targ of assignNode?.targets ?? []) {
            if (targ?.type !== 'name') {
                continue;
            }
            targets.push({
                loc: targ.location,
                type: targ.type,
                name: targ.id,
            });
        }

        for (const src of assignNode?.sources ?? []) {
            sources.push({
                loc: src?.location,
                type: src?.type,
                value: src?.type === 'literal' ? src.value : undefined,
            });
        }

        return assignNode.location
            ? {
                  loc: assignNode.location,
                  targets: targets,
                  sources: sources,
              }
            : undefined;
    }

    private static _parseParamDefArg(defArgNode): object | undefined {
        return {
            loc: defArgNode.location,
            type: defArgNode.type,
            val: defArgNode.type === 'literal' ? defArgNode.value : undefined,
        };
    }

    private static _parseDefParams(paramsArr): any[] | undefined {
        if (!paramsArr) {
            return undefined;
        }
        const params = [];
        for (const param of paramsArr) {
            if (param.type !== 'parameter') {
                continue;
            }
            params.push({
                loc: param.location,
                name: param.name,
                default: param.default ? QorusPythonParser._parseParamDefArg(param.default) : undefined,
            });
        }
        return params.length > 0 ? params : undefined;
    }

    private static _parseDef(defNode): object | undefined {
        if (!defNode?.name) {
            return undefined;
        }
        return {
            loc: defNode.location,
            name: defNode.name,
            params: QorusPythonParser._parseDefParams(defNode.params),
        };
    }

    private static _parseClassBody(codeArr): object | undefined {
        if (!codeArr) {
            return undefined;
        }

        const body = {
            methods: [],
            assignments: [],
        };
        for (const node of codeArr) {
            const type = node?.type;
            if (type === 'def') {
                const meth = QorusPythonParser._parseDef(node);
                if (meth) {
                    body.methods.push(meth);
                }
            } else if (type === 'assign') {
                const assign = QorusPythonParser._parseAssign(node);
                if (assign) {
                    body.assignments.push(assign);
                }
            } else {
                continue;
            }
        }
        return body;
    }

    private static _parseExtends(extendsArr): any[] | undefined {
        if (!extendsArr) {
            return undefined;
        }
        let exts = [];
        for (const ext of extendsArr ?? []) {
            if (ext?.type !== 'arg') {
                continue;
            }
            exts.push({
                loc: ext.location,
                name: ext?.actual?.id,
            });
        }
        return exts.length > 0 ? exts : undefined;
    }

    private static _parseClass(clsNode): object | undefined {
        if (!clsNode?.name) {
            return undefined;
        }
        return {
            loc: clsNode.location,
            name: clsNode.name,
            body: QorusPythonParser._parseClassBody(clsNode.code),
            extends: QorusPythonParser._parseExtends(clsNode.extends),
        };
    }

    private static _parseFromImport(impNode): object | undefined {
        let imports = [];
        for (const imp of impNode?.imports ?? []) {
            imports.push({
                loc: imp.location,
                path: imp.path,
            });
        }

        return imports.length > 0
            ? {
                  loc: impNode.location,
                  from: impNode.base,
                  imports: imports,
              }
            : undefined;
    }

    private static _parseImport(impNode): object | undefined {
        let names = [];
        for (const imp of impNode?.names ?? []) {
            names.push({
                loc: imp.location,
                path: imp.path,
            });
        }

        return names.length > 0
            ? {
                  loc: impNode.location,
                  names: names,
              }
            : undefined;
    }

    private static _extractInfo(tree): object | undefined {
        let info = {
            classes: [],
            functions: [],
            fromimports: [],
            imports: [],
            assignments: [],
        };

        if (tree?.type !== 'module') {
            return undefined;
        }

        for (const node of tree.code ?? []) {
            const type = node?.type;
            if (type === 'class') {
                const cls = QorusPythonParser._parseClass(node);
                if (cls) {
                    info.classes.push(cls);
                }
            } else if (type === 'def') {
                const func = QorusPythonParser._parseDef(node);
                if (func) {
                    info.functions.push(func);
                }
            } else if (type === 'assign') {
                const assign = QorusPythonParser._parseAssign(node);
                if (assign) {
                    info.assignments.push(assign);
                }
            } else if (type === 'from') {
                const imp = QorusPythonParser._parseFromImport(node);
                if (imp) {
                    info.fromimports.push(imp);
                }
            } else if (type === 'import') {
                const imp = QorusPythonParser._parseImport(node);
                if (imp) {
                    info.imports.push(imp);
                }
            } else {
                continue;
            }
        }

        return info;
    }

    /** Parse Python source code. Throws on syntax errors. */
    public static parse(text: string): object | undefined {
        const tree = parse(text);
        return QorusPythonParser._extractInfo(tree);
    }

    /** Parse Python source code. Does not throw exceptions. */
    public static parseNoExcept(text: string): object | undefined {
        try {
            return QorusPythonParser.parse(text);
        } catch (err) {
            return undefined;
        }
    }

    /** Parse Python file from a filepath. Throws on syntax errors. */
    public static parseFile(filePath: string, encoding: string = 'utf-8'): object | undefined {
        const contents = readFileSync(filePath, { encoding: encoding });
        return QorusPythonParser.parse(contents);
    }

    /** Parse Python file from a filepath. Does not throw exceptions. */
    public static parseFileNoExcept(filePath: string, encoding: string = 'utf-8'): object | undefined {
        try {
            return QorusPythonParser.parseFile(filePath, encoding);
        } catch (err) {
            return undefined;
        }
    }
}
