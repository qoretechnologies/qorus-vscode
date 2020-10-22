import { expect } from 'chai';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import { isEqual } from 'lodash';
import * as path from 'path';
import { goldFilesFolder } from './common';

export const compareWithGoldFiles = async (folder: string, files: string[], gold_files_subfolder = '') => {
    console.log(folder, files, gold_files_subfolder);

    const compare = (file_name: string) => {
        const file_path = path.join(folder, file_name);
        const file_exists = fs.existsSync(file_path);
        console.log(file_path);
        expect(file_exists).to.be.true;
        if (!file_exists) {
            return;
        }

        const gold_file_path = path.join(goldFilesFolder, gold_files_subfolder, file_name);
        console.log(gold_file_path);
        const expected_file_contents = fs.readFileSync(gold_file_path);
        const true_file_contents = fs.readFileSync(file_path);

        if (path.extname(file_name) === '.yaml') {
            const expected_file_data = jsyaml.safeLoad(expected_file_contents.toString());
            const true_file_data = jsyaml.safeLoad(true_file_contents.toString());
            expect(isEqual(expected_file_data, true_file_data)).to.be.true;
        } else {
            expect(true_file_contents).to.eql(expected_file_contents);
        }
    };

    files.forEach((file) => compare(file));
};
