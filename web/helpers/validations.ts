import { IField } from "../containers/InterfaceCreator/panel";

export const validateField: (type: string, value: any, field: IField) => boolean = (type, value, field) => {
    switch (type) {
    case "string":
    case "select-string":
        // Strings cannot be empty
        return value !== null && value !== "";
    case "array-of-pairs": {
        // Check if every pair has key & value
        // assigned properly
        return value.every(
            (pair: { [key: string]: string }): boolean =>
                pair[field.fields[0]] !== "" && pair[field.fields[1]] !== ""
        );
    }
    case "select-array":
    case "file-array":
        // Check if there is atleast one value
        // selected
        return value.length !== 0;
    default:
        return true;
    }
};
