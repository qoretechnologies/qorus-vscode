#!/bin/bash

set -e
set -x

export rootdir=`pwd`
export PATH=${rootdir}/node_modules/.bin:${PATH}
export DISPLAY=:0
export XAUTHORITY=${HOME}/.Xauthority

find_active_monitor() {
    x_output=`xrandr -q | grep "connected primary" | xargs | cut -d' ' -f1`
    [ "$x_output" == "" ] && return 1
    return 0
}

# cleanup vscode settings
rm -rf ${HOME}/.vscode

# install
cd ${rootdir}
npm install
npm install --save-dev vsce
cd ui-test
npm install

# patch extester
cd ${rootdir}/ui-test/node_modules/vscode-extension-tester/out
# if the grep fails, the grep and sed commands must be edited
#grep '" --install-extension' util/codeUtil.js
#sed -i 's/--install-extension/--user-data-dir test-resources\/settings --install-extension/' util/codeUtil.js
grep 'const args = \[' browser.js
sed -i 's/const args = \[/const args = \["--disable-gpu", /' browser.js

# setup test environment
cd ${rootdir}
mkdir -p test-resources/settings

# set resolution
if find_active_monitor; then
    xrandr --output ${x_output} --mode 1920x1200
else
    echo "Cannot find active monitor -> cannot set screen resolution" >&2
    exit 1
fi
sed -i 's/width:1024,height:768/width:1920,height:1200/' test-resources/VSCode-linux-x64/resources/app/out/vs/code/electron-main/main.js

# install qore extension
#test-resources/VSCode-linux-x64/bin/code --user-data-dir test-resources/settings --install-extension qoretechnologies.qore-vscode
test-resources/VSCode-linux-x64/bin/code --install-extension qoretechnologies.qore-vscode

# run tests
set +e
./tests.sh
rc="$?"

exit $rc
