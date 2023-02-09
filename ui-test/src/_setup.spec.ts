import { expect } from 'chai';
import { InputBox, Workbench } from 'vscode-extension-tester';
import { projectFolder, setupTest, sleep } from './utils/common';

describe('@ Setup tests', function () {
    this.timeout(1800000);
    let workbench: Workbench;

    before(async () => {
        await sleep(8000);

        ({ workbench } = await setupTest(undefined, true));

        await workbench.executeCommand('Extest: Open Folder');

        await sleep(1000);

        const input = await new InputBox();

        await input.wait();
        await input.setText(projectFolder);
        await input.confirm();

        await sleep(5000);
    });

    it('Adds a folder to workspace', () => {
        expect(true).to.be.false;
    });
});
