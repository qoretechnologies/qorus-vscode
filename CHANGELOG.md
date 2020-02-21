# Changelog

## 1.0.1

#### New features

-   classes and connectors in the class connection dialog are now automatically selected if there is only one entry
-   config item value dialog now displays the config item type

#### Bug fixes

-   added sorting of folders and interfaces in folder view of Interface Tree
-   mapper provider paths are now checked for trailing slashes
-   mapper creation dialog was enlarged
-   all mapper code references are removed from the output fields when a mapper code is removed from mapper
-   hashes and lists are now properly available as fields for constants and other keys in the output field mapping dialog
-   going back from step diagram no longer causes the webview to crash
-   it is no longer possible to change mapper input & output providers while adding a mapper between connectors
-   config items for workflow have been reworked and now show the correct count of workflow config item values, additionaly workflow config item manager can only be shown if at least one step is present in the current worklow
-   step types in the workflow step diagram now properly show the step types, instead of base class names
-   config items are now fetched properly for all interfaces
-   buttons are no longer rendered out of the dialog body of config item manager, when the window height is too small

## 1.0.0

-   Qorus webview with many features is introduced
-   support for creating of Qorus interfaces such as jobs, services, steps, workflows, classes, mappers etc.
-   connecting building blocks using class-connections manager allowing to create no-code solution for complex enterprise integration scenarios
-   release package management
-   hierarchy view providing an overview of interfaces in the project
-   and much more

The list of all implemented issues can be found in the following link:
https://github.com/qoretechnologies/qorus-vscode/milestone/7?closed=1

## 0.0.8

-   fix: release packager page does not remember its initial state
    https://github.com/qoretechnologies/qorus-vscode/issues/55

## 0.0.7

-   feature: local release packager
    https://github.com/qoretechnologies/qorus-vscode/issues/42
-   feature: qorus instances management with GUI
    https://github.com/qoretechnologies/qorus-vscode/issues/19
-   fix: 401 unauthorized does not redirect you to the qorus instances list
    https://github.com/qoretechnologies/qorus-vscode/issues/30
-   fix: deployment failed will logout you
    https://github.com/qoretechnologies/qorus-vscode/issues/29
    https://github.com/qoretechnologies/qorus-vscode/issues/28
-   fix: when the .proj file is changed, extension doesn't reload showing old qorus instances
    https://github.com/qoretechnologies/qorus-vscode/issues/24

## 0.0.6

-   fixed indirect event-stream package security issue:
    https://code.visualstudio.com/blogs/2018/11/26/event-stream

## 0.0.5

-   fixed service resources are not deployed with services on Windows

## 0.0.4

-   fixed re-login after server restart
-   changed qorus instance tree display
-   fixed opening URLs in external browser on Windows
-   create qorus project file on demand only
-   fixed qorus instance tree content after removal of the project file

## 0.0.3

-   basic documentation

## 0.0.2

-   fix: qorus instance explorer is empty
-   logo updated
-   display name updated

## 0.0.1

-   first public release
