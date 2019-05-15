export const service_template =
"\
class ${this.class_name} inherits ${this.inherits} {\n\
    init() {\n\
    }\n\
}\n\
";


export const default_service_headers = {
    'class-based': true,
    'parse-options': ['PO_NEW_STYLE', 'PO_STRICT_ARGS', 'PO_REQUIRE_TYPES'],
};
