import { expect } from 'chai';
import { InputBox, VSBrowser, Workbench } from 'vscode-extension-tester';

import { sleep } from './common/utils';

describe('@ Setup tests', function () {
    this.timeout(1800000);
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {

        const workbench = new Workbench();
        await sleep(8000);
        await workbench.executeCommand('Extest: Open Folder');

        await sleep(1000);
        const input: InputBox = await InputBox.create();
        await input.setText(project_folder);
        await input.confirm();

        await sleep(8000);
    });

    it('Adds a folder to workspace', () => {
        expect(true).to.be.true;
    });
});
