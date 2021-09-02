# Changelog

## 2.3.9

#### Bug Fixes

-   Fixed a bug where Java class connections were regenerated multiple times in the source code in some situations
-   Fixed a bug where the WebView would crash when opening a new service that was just created

## 2.3.8

#### Bug Fixes

-   Fixed a bug that prevented creation of more than one service method
-   Fixed a few more cases where confirmation dialog would incorrectly appear
-   Fixed a bug that caused visual artifacts when hovering over a select button with tooltip
-   Fixed a bug in Java service code generation

## 2.3.7

#### Bug Fixes

-   Fixed a bug in Java folder creation - all invalid characters are now transformed
-   Fixed bugs in Java code generation for constant values

## 2.3.6

#### Bug Fixes

-   Added proper scrolling to connection creation view

## 2.3.5

#### Bug Fixes

-   Fixed the default connection URL to use HTTPS on port 8011; HTTP on port 8001 is no longer used by default
-   Fixed a bug in Java code generation

## 2.3.4

#### Bug Fixes

-   Fixed Java code generation of validation methods to use dynamically imported values
-   Fixed a bug where dashes would not be allowed in connection names
-   Fixed a rendering bug that sometimes would prevent rendering of icons on the step diagram

## 2.3.3

#### Bug fixes

-   Fixed code generation of default constructors in Java when extending dynamic classes and connectors exist

## 2.3.2

#### Bug fixes

-   Fixed a bug that would block any deployment after a deployment failed

## 2.3.1

#### Bug fixes

-   Added default constructor code generation for Java classes to declare the default exception (`Throwable`) added to
    all dynamically imported classes
-   Fixed a bug where class package name for Java would contain forbidden characters
-   Fixed a bug where initiating the deploy command would run multiple deployments in parallel and bypass the confirmation dialog
-   Fixed a bug where the confirmation dialog would display after opening a saved interface that modified the Required or Classes tags

## 2.3.0

#### Bug fixes

-   Code generation (and regeneration - when re-targeting an interface for another language) for Python and Java has been greatly improved in all areas
-   Many bug fixes have been made regarding editing and code and metadata alignment

## 2.2.10

#### Bug fixes

-   fixed: when a service is recreated on a language change its methods are not destroyed properly
-   webview crashes when trying to add a service method to an existing service from the webview
-   fixed setting the "unsaved work" flag for services when moving between the main service form and the methods form
    and reseting the changes
-   show the "unsaved work" confirmation dialog when opening another object,
    don't show it when no changes have been made (fixed again)

## 2.2.9

#### Bug fixes

-   show the "unsaved work" confirmation dialog when opening another object from the tree view,
    don't show the confirmation dialog after successful submit or when no changes have been made
-   prefill the target directory when opening a new interface from another interface (it worked only in some situations)
-   fixed: when a new mapper is opened from an FSM it has the Context field selected with value "undefined:undefined"

#### New features

-   make it possible not to use the qorus extension, create the config file only on demand
-   added container resource limits and scaling parameters fields to the stateless service definition

## 2.2.8

#### Bug fixes

-   fixed deployment of pipelines with processor classes as dependencies
-   fixed continuation of editing an interface after establishing an active qorus connection

## 2.2.7

#### Bug fixes

-   fixed deployment of workflows with dependencies

## 2.2.6

#### Bug fixes

-   fixed saving workflows

## 2.2.5

#### Bug fixes

-   interface fields containing file paths must use forward slashes ('/') on any operating system

#### New features

-   added the 'stateless' tag to services

## 2.2.4

#### Bug fixes

-   fixed opening mappers with contextual mappings but no interface context

#### New features

-   limited editing of Qore interfaces that changes only the metadata but not the source code is now possible even if Qore is not installed

## 2.2.3

#### Bug fixes

-   fixed a bug where Open Workflow Steps did not work after Open Workflow and vice-versa
-   fixed encryption of passwords contained in Qorus URLs
-   fixed a bug where mappers displayed no data when opened from other interfaces

## 2.2.0

#### New features

-   new data provider type: Factories
-   pipeline view has been split to 2 pages for a better orientation and usability

#### Bug fixes

-   fixed a bug where 'tags' were not always serialized as strings
-   fixed a bug where the invalid 'option' tag was saved in processor
-   fixed saving of data provider options of complex types
-   fixed bugs where FSMs or pipelines being open from other interfaces opened blank
-   fixed a bug where pipeline could not be submitted unless input provider options, which are optional, were filled

## 2.1.0

#### New features

-   new interface: Errors
-   workflows can now have a errors assigned
-   deployment of an interface now (optionally) includes all referenced interfaces

#### Bug fixes

-   fixed a bug where the the IDE would crash when opening step for editing from the step diagram
-   it is now properly possible to create a Class from another Class
-   icons representing types of interfaces were unified, now they are the same in the tree view and in the webview

## 2.0.2

#### New features

-   new interface: Value map
-   it is now possible to create or edit two interfaces of the same kind at the same time (create Class from a Class for example)
-   groups, event and queues are now edited separately

#### Bug fixes

-   config item with allowed values can now be given a template string instead
-   check referenced interfaces on opening an interface
-   fixed filtering the base class list for source language when creating a new interface

## 2.0.1

#### New features

-   step diagram for Workflows has been redesigned for better user experience

#### Bug fixes

-   connection now properly saves the port
-   target directory is now properly pre set when creating a step from workflow
-   target directory is now shown when selected
-   fixed opening service methods with author for editing
-   description is mandatory for events, groups and queues
-   fixed opening events, groups and queues for editing from the file browser
-   fixed updating the file list after adding new directory
-   removed incorrect message on adding new step from the workflow diagram
-   fixed switching an interface into another language

## 2.0.0

#### Requires

Qorus 5.0.0

#### New features

-   support for Python
-   pipelines
-   finite state machines
-   connections
-   deployment of multiple files or directories
-   in the config item form it's now clear whether a field value has been inherited or overwritten or is new and it's possible to reset the field to the parent value
-   possibility to create subdirectories from the environment manager in the webview
-   encrypted passwords in the qorus instances configuration
-   use username and passwords in the qorus instances configuration for automatic login or at least for prefilling the username in the login form
-   extension is now 20 times smaller in size
-   code sharing among different languages (Qore, Python, Java):
    everything is possible except that a Java class cannot inherit another language class
-   remember last target directory and use it as default for next new interface
-   re-creation of an interface with another programming language
-   re-creation of an interface with a broken source code
-   forms are no longer cleared on submit
-   view and delete interface directly from the webview
-   new tutorial feature to guide you through some of the more complex interfaces
-   many visual improvements

#### Bug fixes

-   behaviour on write file error, e.g. when target directory is invalid
-   saving codeless interfaces
-   fixed service method management

## 1.3.0

#### New features

-   support for editing Java interfaces
-   added the command 'Close Webview'
-   added the command 'Edit current interface'

#### Bug fixes

-   fixed deletion of service and mapper code methods
-   fixed updating base classes in the selection box
-   Java source files are now created in a subdirectory (to fix name collisions)
-   fixed: on submitting edited interface check whether the original still exists
-   fixed: Java class cannot inherit Qore class
-   fixed freezing on deleting a mapper
-   fixed including resources to service deployment

## 1.2.1

-   re-release of 1.2.0 without garbage files as part of the package

## 1.2.0

#### New features

-   edit commands added to file explorer context menu
-   added the 'Create new type' command to explorer context menu
-   A warning dialog has been added when a view is about to be changed and there is unsaved work
-   It is now possible to create and edit new objects directly from their respective fields
-   Mapper inputs and outputs can now be cleared and entered again when editing a mapper

#### Bug fixes

-   check whether file with chosen name already exists
-   fixed: switching from category view to folder view lasts very long time
-   fixed editing steps from tree view
-   fixed showing irrelevant context menu items
-   added confirmation to the 'Deploy directory' command
-   fixed generation of class connections code
-   check validity of class name
-   fixed opening workflow steps
-   active Qorus connection check
-   fixed saving resources as path relative to the yaml file
-   generate config file if project has been set
-   added dependency on qore-vscode
-   remove Allowed values if type == any
-   fixed position of java code lenses
-   fixed: qorus requests fail if the URL contains a trailing
-   delete config item value when type changes
-   don't report a base class name mismatch when it's not true
-   disable type of 'other' interfaces on editing
-   fixed missing .qwf in yaml files
-   fixed saving/reading mapper fields options
-   Adding new steps to the Workflow diagram should no longer result in "Loading step:0"
-   Config item value and default value is now properly set to `null` when type is changed to a different type
-   `Any` type now correctly supports `null` as a value and default value
-   Modal dialogs have been reworked and now only the last opened is closed when `Esc` key is pressed
-   Fixed Job and Service name generation
-   Selecting a step again after it was removed from the workflow diagram now works properly
-   When removing a second-to-last step in group of parallel steps, the last step is now moved upwards in the hierarchy and is rendered inline
-   More space efficient redesign of the connection name dialog
-   Fixed a bug where it was sometime impossible to map 2 compatible fields in mappers
-   Some fields now disallow certain characters to be entered
-   Mapper codes are properly reset after successfuly submiting
-   Fixed code generation for Java array step triggers and for Java async array step signatures
-   Fixed a bug where sometimes an empty `value_true_type` key would be saved in the yaml file
-   Fixed a race condition bug that would cause the newly added step for a workflow diagram to show `Loading step:0` instead of the step's name and version
-   Value maps are now properly displayed in the UI after being saved
-   Empty lists and hashes are now properly displayed in the UI as `{}` and `[]` respectively
-   Static data context is now properly passed to mappers even from new Workflows

## 1.1.1

#### Bug fixes

-   Java connector code generation
-   displaying of folder in folder pickers
-   check of existence of an interface with same name or class name
-   success confirmation message from backend to frontend
-   fixed saving of text-/bin-/resource fields

## 1.1.0

#### New features

-   Open file and Delete file buttons
-   new interface type 'Type'
-   new workflow property 'Static data type'
-   new mapper property 'Context'
-   interfaces of type class or mapper code no longer have the 'Class name' property
-   All delete actions now have a confirmation dialog
-   The entire input hash is now mappable in mappers

#### Bug fixes

-   config item values of type 'Any' cannot be 'undefined'
-   fixed the 'Authors' form input data
-   fixed saving the multiline (markdown) descriptions
-   fixed handling the config items values of type 'Any' whose actual type is hash or list
-   fixed return statement in generated class connections code
-   prevented parsing strings looking like yaml
-   classes no longer have editable config item values
-   added missing button translations in the config items table
-   creating a hash<auto> field with null set to true no longer crashes the webview

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
-   fixed showing of service method info on mouse hover

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
