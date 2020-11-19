#!/bin/bash
set +e

rm -rf ui-test/out

npm run compile:test

files=./ui-test/out/*.spec.js

for item in ${files[@]}
do
  item=$(basename -- "$item")
  item="`echo $item|cut -f1 -d.`"
  if [ $item != '_setup' ]; then
    TEST_NAME=$item npm run ui-run-tests-gitlab
    if [ $? = 1 ]; then
      printf "${item} test failed!"
      rm -rf ui-test/out
      exit 1
    fi
  fi
done

set -e

rm -rf ui-test/out

exit 0
