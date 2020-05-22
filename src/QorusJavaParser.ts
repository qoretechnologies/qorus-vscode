import { readFileSync } from 'fs';
import { parse } from 'java-parser';

// a function for test printing out parsed CST of a file (output from the java-parser module)
/*import { writeFileSync } from 'fs';
function printJsonCST(filepath: string, encoding: string = 'utf-8') {
    let jfile = readFileSync(filepath, {encoding: encoding});
    let cst = parse(jfile);
    writeFileSync(filepath + ".cst", JSON.stringify(cst, (k, v) => {
        return (k === 'START_CHARS_HINT')
            || (k === 'categoryMatches')
            || (k === 'categoryMatchesMap')
            || (k === 'tokenType')
            || (k === 'PATTERN')
            || (k === 'CATEGORIES')
            ? undefined
            : v;
    }, 2));
}*/

export class QorusJavaParser {
    private static _parseModifiers(modifiersNode): object | undefined {
        const modifiers = [];
        for (const mod of modifiersNode || []) {
            const children = mod?.children;
            const modname = children?.Public?.[0]?.image
                ?? children?.Protected?.[0]?.image
                ?? children?.Private?.[0]?.image
                ?? children?.Abstract?.[0]?.image
                ?? children?.Static?.[0]?.image
                ?? children?.Final?.[0]?.image
                ?? children?.Transient?.[0]?.image
                ?? children?.Volatile?.[0]?.image
                ?? children?.Synchronized?.[0]?.image
                ?? children?.Native?.[0]?.image
                ?? children?.Strictfp?.[0]?.image
                // ignoring annotations
                ;
            modifiers.push({
                name: modname,
                loc: mod.location
            });
        }
        return modifiers.length > 0 ? modifiers : undefined;
    }

    private static _parseThrows(throwsNode): object | undefined {
        if (!throwsNode) {
            return undefined;
        }

        const exceptions = [];
        for (const ex of throwsNode.children?.exceptionTypeList?.[0]?.children?.exceptionType || []) {
            const exname = ex?.children?.classType?.[0]?.children?.Identifier?.[0]?.image;
            if (exname) {
                exceptions.push({
                    identifier: exname,
                    loc: ex.location
                });
            }
        }
        if (exceptions.length < 1) {
            return undefined;
        }

        const throwsKW = throwsNode.children?.Throws?.[0];
        return {
            loc: throwsNode.location,
            exceptions: exceptions,
            throwsKWLoc: throwsKW ? {
                startLine: throwsKW.startLine,
                endLine: throwsKW.endLine,
                startColumn: throwsKW.startColumn,
                endColumn: throwsKW.endColumn,
                startOffset: throwsKW.startOffset,
                endOffset: throwsKW.endOffset
            } : undefined
        };
    }

    private static _parseConstructorName(declaratorNode): object | undefined {
        const id = declaratorNode?.children?.simpleTypeName?.[0];
        if (id) {
            return {
                identifier: id?.children?.Identifier?.[0]?.image,
                loc: id.location
            };
        }
        return undefined;
    }

    private static _parseClassMethodName(declaratorNode): object | undefined {
        const id = declaratorNode?.children?.Identifier?.[0];
        if (id) {
            return {
                identifier: id.image,
                loc: {
                    startLine: id.startLine,
                    endLine: id.endLine,
                    startColumn: id.startColumn,
                    endColumn: id.endColumn,
                    startOffset: id.startOffset,
                    endOffset: id.endOffset
                }
            };
        }
        return undefined;
    }

    private static _parseClassMethodReturnType(resultNode): object | undefined {
        const children = resultNode?.children || {};
        for (const prop in children) {
            if (children.hasOwnProperty(prop)) {
                return {
                    identifier: children[prop]?.[0]?.image,
                    loc: resultNode?.location
                };
            }
        }
        return undefined;
    }

    private static _parseClassFieldVariables(declListNode): any[] {
        const vars = [];
        for (const vDecl of declListNode?.children?.variableDeclarator || []) {
            const id = vDecl?.children?.variableDeclaratorId?.[0]?.children?.Identifier?.[0]?.image;
            if (id) {
                vars.push({
                    identifier: id,
                    loc: vDecl.location
                });
            }
        }
        return vars;
    }

    private static _parseClassFieldType(typeNode): object | undefined {
        // handle class/interface types
        let type = typeNode?.children?.unannReferenceType?.[0]?.children?.unannClassOrInterfaceType?.[0];
        if (type) {
            return {
                identifier: type?.children?.unannClassType?.[0]?.children?.Identifier?.[0]?.image,
                loc: type.location
            };
        }
    
        // handle primitive types
        type = typeNode?.children?.unannPrimitiveType?.[0];
        if (!type) {
            return undefined;
        }

        // handle boolean
        if (type?.children?.Boolean?.[0]) {
            return {
                identifier: 'boolean',
                loc: type.location
            };
        }

        // handle number types
        type = type?.children?.numericType?.[0];
        if (!type) {
            return undefined;
        }

        // handle integer types
        let numtype = type?.children?.integralType?.[0];
        if (numtype) {
            const children = numtype?.children;
            const typename = children?.Byte?.[0]?.image
                ?? children?.Short?.[0]?.image
                ?? children?.Int?.[0]?.image
                ?? children?.Long?.[0]?.image
                ?? children?.Char?.[0]?.image;
            return {
                identifier: typename,
                loc: numtype.location
            };
        }

        // handle float types
        numtype = type?.children?.floatingPointType?.[0];
        if (numtype) {
            const children = numtype?.children;
            const typename = children?.Float?.[0]?.image
                ?? children?.Double?.[0]?.image;
            return {
                identifier: typename,
                loc: numtype.location
            };
        }

        return undefined;
    }

    private static _parseConstructorDecl(constrNode): object | undefined {
        const children = constrNode?.children;
        return {
            loc: constrNode.location,
            name: QorusJavaParser._parseConstructorName(children?.constructorDeclarator?.[0]),
            modifiers: QorusJavaParser._parseModifiers(children?.constructorModifier),
            throws: QorusJavaParser._parseThrows(children?.throws?.[0]),
            body: undefined
            //
        };
    }

    private static _parseClassMethodDecl(methodNode): object | undefined {
        const headerChildren = methodNode?.children?.methodHeader?.[0]?.children;
        return {
            loc: methodNode.location,
            name: QorusJavaParser._parseClassMethodName(headerChildren?.methodDeclarator?.[0]),
            modifiers: QorusJavaParser._parseModifiers(methodNode?.children?.methodModifier),
            returnType: QorusJavaParser._parseClassMethodReturnType(headerChildren?.result?.[0]),
            throws: QorusJavaParser._parseThrows(headerChildren?.throws?.[0]),
            body: undefined
            //
        };
    }

    private static _parseClassFieldDecl(fieldNode): object | undefined {
        const children = fieldNode?.children;
        return {
            loc: fieldNode.location,
            variables: QorusJavaParser._parseClassFieldVariables(children?.variableDeclaratorList?.[0]),
            modifiers: QorusJavaParser._parseModifiers(children?.fieldModifier),
            type: QorusJavaParser._parseClassFieldType(children?.unannType?.[0])
        };
    }

    private static _parseClassMemberDecl(body, memberNode) {
        if (!memberNode?.children) {
            return;
        }

        // handle field
        let decl = memberNode.children?.fieldDeclaration?.[0];
        if (decl) {
            const field = QorusJavaParser._parseClassFieldDecl(decl);
            if (field) {
                body.fieldDecls.push(field);
            }
        }

        // handle method
        decl = memberNode.children?.methodDeclaration?.[0];
        if (decl) {
            const method = QorusJavaParser._parseClassMethodDecl(decl);
            if (method) {
                body.methods.push(method);
            }
        }
    }

    private static _parseSuperclass(superclassNode): object | undefined {
        if (!superclassNode) {
            return undefined;
        }
        const superclstype = superclassNode.children?.classType?.[0];
        const extnd = superclassNode.children?.Extends?.[0];
        return {
            loc: superclassNode.location,
            name: {
                identifier: superclstype?.children?.Identifier?.[0]?.image,
                loc: superclstype?.location
            },
            extendsKWLoc: extnd ? {
                startLine: extnd.startLine,
                endLine: extnd.endLine,
                startColumn: extnd.startColumn,
                endColumn: extnd.endColumn,
                startOffset: extnd.startOffset,
                endOffset: extnd.endOffset
            } : undefined
        };
    }

    private static _parseInterfaces(interfacesNode): object | undefined {
        if (!interfacesNode) {
            return undefined;
        }

        const interfaces = [];
        const interfaceTypeList = interfacesNode.children?.interfaceTypeList?.[0];
        for (const intf of interfaceTypeList?.children?.interfaceType || []) {
            const id = intf?.children?.classType?.[0]?.children?.Identifier?.[0]?.image;
            if (id) {
                interfaces.push({
                    identifier: id,
                    loc: intf.location
                });
            }
        }
        const impl = interfacesNode.children?.Implements?.[0];
        return {
            loc: interfacesNode.location,
            interfaces: interfaces,
            implementsKWLoc: impl ? {
                startLine: impl.startLine,
                endLine: impl.endLine,
                startColumn: impl.startColumn,
                endColumn: impl.endColumn,
                startOffset: impl.startOffset,
                endOffset: impl.endOffset
            } : undefined
        };
    }

    private static _parseClassBody(bodyNode): object | undefined {
        let body: any = {
            constructors: [],
            fieldDecls: [],
            methods: []
        };
        for (const bDecl of bodyNode?.children?.classBodyDeclaration || []) {
            // handle class member
            let decl = bDecl?.children?.classMemberDeclaration?.[0];
            if (decl) {
                QorusJavaParser._parseClassMemberDecl(body, decl);
                continue;
            }

            // handle constructor
            decl = bDecl?.children?.constructorDeclaration?.[0];
            if (decl) {
                const constr = QorusJavaParser._parseConstructorDecl(decl);
                if (constr) {
                    body.constructors.push(constr);
                }
                continue;
            }
        }
        return body;
    }

    private static _parseClassDecl(classNode): object | undefined {
        const normalClassDecl = classNode?.children?.normalClassDeclaration?.[0];
        if (!normalClassDecl) {
            return undefined;
        }

        const ncDeclChildren = normalClassDecl.children;
        const name = ncDeclChildren?.typeIdentifier?.[0];
        const cls = ncDeclChildren?.Class?.[0];
        return {
            loc: classNode.location,
            name: {
                identifier: name?.children?.Identifier?.[0]?.image,
                loc: name?.location
            },
            modifiers: QorusJavaParser._parseModifiers(classNode?.children?.classModifier),
            classKWLoc: cls ? {
                startLine: cls.startLine,
                endLine: cls.endLine,
                startColumn: cls.startColumn,
                endColumn: cls.endColumn,
                startOffset: cls.startOffset,
                endOffset: cls.endOffset
            } : undefined,
            superclass: QorusJavaParser._parseSuperclass(ncDeclChildren?.superclass?.[0]),
            interfaces: QorusJavaParser._parseInterfaces(ncDeclChildren?.superinterfaces?.[0]),
            body: QorusJavaParser._parseClassBody(ncDeclChildren?.classBody?.[0])
        };
    }

    private static _extractAST(cst): object | undefined {
        let ast = {
            classes: []
        };

        const cu = cst?.children?.ordinaryCompilationUnit?.[0];
        if (!cu) {
            return undefined;
        }

        //const importDecls = cu?.children?.importDeclaration;

        // get only what we need
        for (const tDecl of cu?.children?.typeDeclaration || []) {
            for (const cDecl of tDecl?.children?.classDeclaration || []) {
                const cls = QorusJavaParser._parseClassDecl(cDecl);
                if (cls) {
                    ast.classes.push(cls);
                }
            }
        }

        return ast.classes.length ? ast : undefined;
    }

    /** Parse Java source code. */
    public static parse(text: string): object | undefined {
        const cst = parse(text);
        return QorusJavaParser._extractAST(cst);
    }

    /** Parse Java file from a filepath. */
    public static parseFile(filePath: string, encoding: string = 'utf-8'): object | undefined {
        const contents = readFileSync(filePath, {encoding: encoding});
        return QorusJavaParser.parse(contents);
    }
}
