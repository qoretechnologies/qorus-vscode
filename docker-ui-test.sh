#!/bin/bash

set -e
set -x

export rootdir=`pwd`
export PATH=${rootdir}/node_modules/.bin:${PATH}

# install
cd ${rootdir}
npm install
npm install --save-dev vsce
cd ui-test
npm install

# patch extester
cd ${rootdir}/ui-test/node_modules/vscode-extension-tester/out
# if the grep fails, the grep and sed commands must be edited
grep '" --install-extension' util/codeUtil.js
sed -i 's/--install-extension/--user-data-dir test-resources\/settings --install-extension/' util/codeUtil.js
grep 'const args = \[' webdriver/browser.js
sed -i 's/const args = \[/const args = \["--disable-gpu", /' webdriver/browser.js

# setup test environment
cd ${rootdir}
mkdir -p test-resources/settings
git clone -b develop --single-branch --depth 1 "https://${DEMOS_DEPLOY_USER}:${DEMOS_DEPLOY_PASS}@git.qoretechnologies.com/qorus/demos.git" ui-test/test_project
npm run compile:test

# extester setup
ui-test/node_modules/.bin/extest setup-tests

# set vscode resolution
sed -i 's/width:1024,height:768/width:1920,height:1080/' test-resources/VSCode-linux-x64/resources/app/out/vs/code/electron-main/main.js

# install qore extension
test-resources/VSCode-linux-x64/bin/code --user-data-dir test-resources/settings --install-extension qoretechnologies.qore-vscode

# run tests
ui-test/node_modules/.bin/extest run-tests ui-test/out/*.js
