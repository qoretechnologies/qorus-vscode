import { expect } from 'chai';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import { isEqual, isObject, transform } from 'lodash';
import * as path from 'path';
import { goldFilesFolder } from './common';

function difference(object: any, base: any) {
    function changes(object: any, base: any) {
        return transform(object, function (result: any, value: any, key: any) {
            if (!isEqual(value, base[key])) {
                result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(object, base);
}

export const compareWithGoldFiles = async (
    folder: string,
    files: string[],
    gold_files_subfolder: string = '',
    transformer?: (data: any) => any
) => {
    const compare = (file_name: string) => {
        const file_path = path.join(folder, file_name);
        const file_exists = fs.existsSync(file_path);

        if (!file_exists) {
            throw new Error(`File ${file_name} not found!`);
        }

        const gold_file_path = path.join(goldFilesFolder, gold_files_subfolder, file_name);
        const expected_file_contents = fs.readFileSync(gold_file_path);
        const true_file_contents = fs.readFileSync(file_path);

        if (path.extname(file_name) === '.yaml') {
            let expected_file_data = jsyaml.safeLoad(expected_file_contents.toString());
            let true_file_data = jsyaml.safeLoad(true_file_contents.toString());

            if (transformer) {
                expected_file_data = transformer(expected_file_data);
                true_file_data = transformer(true_file_data);
            }

            if (!isEqual(expected_file_data, true_file_data)) {
                console.error(
                    'Gold file different. Difference:',
                    JSON.stringify(difference(expected_file_data, true_file_data))
                );
            }

            expect(isEqual(expected_file_data, true_file_data)).to.be.true;
        } else {
            expect(true_file_contents).to.eql(expected_file_contents);
        }
    };

    files.forEach((file) => compare(file));
};
