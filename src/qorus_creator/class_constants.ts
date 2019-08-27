let template: any = {};

template.qore =
"\
class ${this.class_name} inherits ${this.base_class_name} {\n\
}\n\
";

template.java =
"\
class ${this.class_name} extends ${this.base_class_name} {\n\
}\n\
";

export const class_template = template;
