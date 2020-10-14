#!/bin/bash

set -e
set -x

export rootdir=`pwd`
export PATH=${rootdir}/node_modules/.bin:${PATH}
export DISPLAY=:0
export XAUTHORITY=${HOME}/.Xauthority
export PROJECT_FOLDER=${rootdir}/ui-test/test_project
export TEST_GOLD_FILES=${rootdir}/ui-test/gold_files

find_active_monitor() {
    x_output=`xrandr -q | grep "connected primary" | xargs | cut -d' ' -f1`
    [ "$x_output" == "" ] && return 1
    return 0
}

video_recording() {
    ps aux | grep "ffmpeg.*$1\.mp4" | grep -v grep  > /dev/null 2>&1
}

recording_pid() {
    ps aux | grep "ffmpeg.*$1\.mp4" | grep -v grep | grep -v tmux | xargs | cut -d' ' -f2
}

signal_recording() {
    video_pid=`recording_pid`
    if [ "$video_pid" != "" ]; then
        echo "Found PID of video recording: $video_pid"
        echo "Sending $1 signal to recording..."
        kill -s $1 $video_pid
    fi
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
rm -rf ui-test/out && npm run compile:test

# extester setup
cd ${rootdir}
ui-test/node_modules/.bin/extest setup-tests

# set resolution
if find_active_monitor; then
    xrandr --output ${x_output} --mode 1680x1050
else
    echo "Cannot find active monitor -> cannot set screen resolution" >&2
    exit 1
fi
sed -i 's/width:1024,height:768/width:1680,height:1000/' test-resources/VSCode-linux-x64/resources/app/out/vs/code/electron-main/main.js

# install qore extension
#test-resources/VSCode-linux-x64/bin/code --user-data-dir test-resources/settings --install-extension qoretechnologies.qore-vscode
test-resources/VSCode-linux-x64/bin/code --install-extension qoretechnologies.qore-vscode

# record video
session_name=test-`head -c 192 /dev/urandom | tr -dc A-Za-z0-9 | head -c 24`
tmux new-session -d -s "${session_name}" "ffmpeg -f x11grab -video_size 1680x1050 -i :0 -codec:v libx264 -r 15 /tmp/qorus-vscode-uitest.mp4"

# run tests
set +e
ui-test/node_modules/.bin/extest run-tests 'ui-test/out/all.spec.js'
rc="$?"

# send command to turn off video recording cleanly
tmux send-keys -t "${session_name}" q

# wait until video recording finishes
set +x
echo "Waiting for the video recording to finish..."
i=0
while video_recording; do
    if [ "$i" == "60" ]; then
        echo "5 minutes timeout for video recording to finish"
        signal_recording INT
    elif [ "$i" == "72" ]; then
        echo "6 minutes timeout for video recording to finish"
        signal_recording TERM
    elif [ "$i" == "84" ]; then
        echo "7 minutes timeout for video recording to finish"
        signal_recording KILL
    fi

    sleep 5
    i=$((i+1))
done

exit $rc
