# Changelog

## 1.0.4

#### Bug fixes

-   mappers used in class connections are now added automatically to the mappers tag
-   fixed displaying the workflow keylist tag
-   editing groups, events and queues is now possible
-   fixed handling default config item values of complex types
-   interfaces with class connections can now be re-created
-   fixed misinterpreting of string values that look like yaml code
-   it is now possible to set 0 for int and float config items
-   strings starting with `-` are no longer misinterpeted as lists in config items
-   the add new field button is no longer replaced by delete button when hovering mapper field
-   folder tree list is no longer hidden after 4 seconds when choosing a folder

## 1.0.3

#### Bug fixes

-   fixed generating mapper code
-   fixed deploying mapper code
-   modules made deployable
-   fixed passing params in generated class connections code
-   fixed using qore classes in generated java class connections code
-   adding custom field for hash typed mappers now works properly
-   selecting factory provider now properly removes all previous children
-   submitting an interface now properly resets class connections

## 1.0.2

#### New features

-   generate dummy implemenation of abstract step methods and the run method for jobs
-   qorus object parser removed
-   some form fields are no longer subject so sorting, namely: targetr dir, name, desc

#### Bug fixes

-   fixed deleting and renaming of java service methods
-   fixed: group/queue/event names being changed to "undefined" on edit
-   fixed crashing when mapper data are incorrect
-   fixed formatting of markdown code in yaml
-   fixed imports for java steps
-   fixed: inherited config items sometimes are not saved
-   fixed disappering of some fields in edit forms
-   fixed erasing base class name from the code file
-   fixed: on removing a base class do not remove its config items if it's also in the requires/classes list
-   fixed inheritance of config item default values and values
-   fixed all interface source is sometimes deleted and corrupted YAML is saved
-   fixed saving of inherited config items
-   fixed sending of empty classes in some cases, resulting in source code being deleted
-   fixed tooltip for default config item value in config item value dialog
-   fixed scrollbar not showing in the delete interface view

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
-   on changing/removing classes remove config items of removed classes
-   if interface is created as codeless but after editing is no longer codeless then saving crashes
-   fixed getting the step type: it was computed to early, before the inheritance information was known
-   implemented the is-templated-string flag for workflow config item values
-   fields in the interface edit forms are now sorted
-   when adding steps in the workflow step diagram, their config items are now immediately fetched so that workflow level config item values can be set
-   fixed error where workflow config item values are copied from another workflow with same steps
-   fixed deleting local config item values

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
