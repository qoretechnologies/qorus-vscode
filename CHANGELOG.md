# Changelog

## Version 4.3.0

#### New features

- Enetring message data in message FSM states can now be done using both a free-form text input and newly a guided form

## Version 4.2.5

#### Bug fixes

- Fixed a bug where the some options were sent to the server without being properly yaml serialized

## Version 4.2.4

#### Bug fixes

- Fixed a bug opening connections with invalid connection options for the current server that could cause a crash

## Version 4.2.3

#### Bug fixes

- Fixed a critical bug opening services in the IDE that could cause a crash

## Version 4.2.2

#### Bug fixes

- Fixed a critical bug where many existing mappers using data providers for input and/or output would not load properly

## Version 4.2.1

#### Bug fixes

- Fixed a bug reading config items in jobs and services

## Version 4.2.0

#### New features

- New Interfaces list view - view and manage all local, remote interfaces, and drafts in one place
- New & improved config items view - config items can now be filtered, zooming in and out is now possible, and the view is now more user friendly
- Improved navigation - Added breadcrumbs to some views, added back button to the topbar that allows you to go back to the previous view
- Types now support descriptions
- Minor bug fixes and improvements

## Version 4.1.0

! Important ! - Some features of this release require Qorus 6.0.3 or later to be installed on the server.

#### New features

- Variables in FSMS - Variables in FSMs can be declared which allows Qorus developers to restrict the data type of values that can be assigned to of the variable. When a variable is declared as type `data-provider`, then the variable will be instantiated when referenced according to the configuration provided in the IDE, and the variable will be persistent until it goes out of scope. Variable action states can be created from `data-provider` variables as well, that allow actions to be executed on the data provider. Because these variables are persistent, and because `data-provider` variables normally represent a connection to a server or network service, this allows Qorus users to implement actions on a persistent object or connection in FSMs such as transaction management or connection-oriented actions that require persistence to work properly.
- Data providers now support Favorites - save any data provider you frequently use to your favorites and access them quickly from the Favorites button in the data provider browser
- Flow Builder (FSM) now supports zooming in and out of the diagram! See the new zoom controls in the top right corner of the diagram.
- Template values are now fetched from the Qorus server and provide descriptions for each value. This makes it easier to understand what each value is for
- New Transaction block added to FSMs. This block allows you to group multiple states into a single transaction. This is useful for example when you want to perform complex manipulations on records in a record-based data provider (such as a database, for example) in a single transaction. If any of the states in the transaction fail, the transaction will be automatically rolled back, while if the transaction block exits with no errors, the transaction is automatically committed.
- Event based data providers are now supported for services, including automatic variables for events with FSMs associated to them

#### Bug fixes

- Fixed a bug that caused the config item button in Connector states in Flow Builder to always show 0
- Many other small bug fixes and QOL improvements

## Version 4.0.6

- New send message state: Added the ability to use the message-based integration pattern to send messages from no-code flows / finite state machines

## Version 4.0.5

- Fixed a bug where the selecting a table in a Create State action would crash the webview

## Version 4.0.4

- General improvements and bug fixes.

## Version 4.0.3

#### New features

- Relevant inputs now have either auto-focus or are focused when the user starts typing automatically (such inputs are indicated by a keyboard icon on the right side of the input) #1157
- Tidied up more fields and put them in their respective groups so that the interface is even more readable

#### Bug fixes

- Drafts can now be properly deleted inside the WebView using the delete butto n#1154
- Fixed a layout issue with pipeline descriptions #1153
- Only showing event triggers for FSMs in services #1013
- Pipeline element processor tooltip shows the original description after a change #1155
- When comparing of type call fails, the IDE now properly treats those types as compatible #1137
- Output field dialogue now provides the key description in a tooltip #1057
- Fixed FSM state descriptions in the state selector #1160
- Fixed a bug that did not show the description when hovering config item name #1163
- Fixed a bug where the `remove` control on the FSM trigger item wouldn't work. Closes #1164
- It is no longer possible to select 2 same triggers for one FSM

## Version 4.0.0

#### Features

- The WebView has been redesigned to use the new in-house UI library and to be more responsive, faster and overall more pleasant to use
- The WebView now supports dark mode, light mode or your current theme mode

- !IMPORTANT - the extension now requires Qorus 6.0.0 or newer

## Version 3.9.8

#### Bug fixes

- Fixed regression bug caused by version 3.6.4, where config all items would always be reset when opening FSM states

## Version 3.9.7

#### Bug fixes

- Fixed regression bug caused by version 3.9.6, where the `Deploy Interface` button disappeared from deployable interfaces

## Version 3.9.6

#### Bug fixes

- Schema modules & Scripts & Tests can no longer be deployed and can instead be run against the active Qorus instance

## Version 3.9.5

#### Features

- Releases view was rewritten to use the new in-house UI library

## Version 3.9.4

#### Bug fixes

- Recognize `*test.py` and `*Test.java` as tests
- Allow the extension to create custom releases without requiring an initialized git repository in the project directory

## Version 3.9.3

#### Bug fixes

- Fixed a bug where the provider URLs for Pipeline input provider were built incorrectly
- The maximum height of the input & output providers on the mapper diagram page have been adjusted
- The `Set as null` button's width has been adjusted to fit the text
- Fixed a bug where deleting any interface from the Hierarchy view would result in the name of the interface to be shown as `undefined`

## Version 3.9.2

#### Bug fixes

- Fixed a bug where the webview would crash when selecting certain data types when browsing data providers
- Fixed a bug that prevented search providers with empty search arguments to be saved
- Fixed a bug where the WebView would crash when trying to add a `Context` field to existing mappers
- Fixed a bug where the WebView would crash when trying to edit a saved state which contained an action that included options with `/` in the value
- Fixed enlarged + buttons in the Api Manager field in Services
- Config items default value is now properly checked when `Can be undefined` is set, and the form can be submitted

## Version 3.9.1

#### Bug fixes

- Fixed a bug where the data provider URL would not be built correctly when using the search states in FSM

## Version 3.9.0

#### Bug fixes

- Complex hash/object-editing is now supported throughout the application
- Fixed a bug where a response/request type was not working properly in mappers

## Version 3.8.4

#### Bug fixes

- It is no longer possible to select a non-record-based provider in Pipeline input provider

## Version 3.8.3

#### New Features

- Whenever an error occurs when traversing the data provider, the error will now be displayed.

#### Bug fixes

- Fixed an issue where a Windows build would not work properly because of an internal path issue
- Fixed a bug where it was not possible to select `request` `response` data providers in Mappers
- Fixed a bug that caused the webview to crash when selecting a certain data provider factory in Mappers (csvread and csvwrite were affected)
- Fixed a bug where it was possible to select non record-based data provider in the pipeline input provider

## Version 3.8.2

#### Bug fixes

- Fixed an issue in Mappers that caused infinite draft saving loop which prevented options being added and eventually crashed the active Qorus connection

## Version 3.8.1

#### Bug fixes

- Fixed a bug that prevented new Mappers from being created

## Version 3.8.0

#### Bug fixes

- Mappers can now be opened and managed even if the input or output connection is down / broken
- Opening a Class with connectors will no longer create a draft if nothing has changed

## Version 3.7.0

#### New Features

- Implemented new FSM states - create, single record search, multiple record search, update, and delete
- Requires Qorus 5.1.35+ to support new FSM functionality

#### Bug Fixes

- Fixed a bug that prevented creation of FSM Block states

## Version 3.6.7

#### Bug Fixes

- Fixed a bug that would not allow to go to the 2nd page in Pipeline view

## Version 3.6.6

#### Bug Fixes

- Fixed a bug that left "null" value in an FSM state when removing all transitions

## Version 3.6.5

#### Bug Fixes

- Fixed a bug that caused a crash when creating a job while the Schedule field was empty

## Version 3.6.4

#### Bug Fixes

- Fixed Pipeline & FSM provider fields & unnecessary draft saving issue
- Fixed a bug where deploying an FSM would not deploy Class dependencies
- Fixed a bug where FSM drafts would be saved without any changes when editing FSMs
- Fixed a bug where config items were left over in YAML when switching from connectors inside FSM states

## Version 3.6.3

#### Bug Fixes

- Fixed a bug where new mapper submit button would not be enabled unless the mapper page was left
- Fixed draft changes being saved upon opening pipeline without any changes.

## Version 3.6.2

#### Bug Fixes

- Fixed draft changes being saved upon opening FSM without any changes.

## Version 3.6.1

#### Bug Fixes

- Fixed a bug where the FSM fields wrapper would not collapse when hidden.

## Version 3.6.0

#### New Features

- FSMs now support input & output types
- FSMs created from API Manager service now automatically acquire the required input type for the given endpoint

#### Bug Fixes

- Fixed a bug where the FSM would crash with an API call state
- Fixed a bug that caused config items values with multiple curly brackets to be incorrectly interpreted

## Version 3.5.0

#### New Features

- It is now possible to create a custom release by selecting interfaces inside the `Release` tab.

#### Bug Fixes

- Fixed a bug when validating various key-value fields that caused the IDE to crash.
- Fixed bugs in "make release" functionality where it would refuse to make a release if there were untracked files in the repository and where release packages were not installable by Qorus
- Fixed bugs in "make release" functionality where it would get stuck in a broken state if the connection to the Qorus server was lost while the release was being created
- Requires Qorus 5.1.31+ to support remote release deployment from the IDE

## Version 3.4.0

#### New Features

- Added IDE support for API managers in services, allowing Qorus services to provide server-side API implementations with a low-code/no-code solution; these can also be microservices when Qorus is deployed in Kubernetes and the stateless flag is set (requires Qorus 5.1.30+)

#### Bug Fixes

- IF states no longer save the `input-output-type` flag to YAML if it's not defined
- Many visual improvements and bug fixes

## Version 3.3.1

#### Bug Fixes

- Fixed a bug that caused issues when adding optional options

## Version 3.3.0

#### New Features

- Introducing new type of state: API Call - It is a perfect tool for creating no-code solutions for the Qorus Integration Engine. The Qorus Developer Tools allow to create building blocks that can be reused later and setup an initial configuration for them (requires Qorus 5.1.29+)
- It is now possible to duplicate interfaces right from the hierarchy view

#### Bug Fixes

- Reordered some context menu item for better consistency
- Fixed a bug in allowed values in config items that caused discrepancies when adding new allowed values

## Version 3.2.2

#### Bug Fixes

- Fixed a bug where non-factory data providers in config items were not able to be saved

## Version 3.2.1

#### Bug Fixes

- It is now possible to edit factory data providers, and their options, without having to re-create them

## Version 3.2.0

#### Bug Fixes

- Fixed a bug where it was not possible to drag mapper inputs if the window was scrolled all the way the bottom

#### New Features

- Hierarchy view now shows and allows deployment of Qorus files such as Schema modules, Scripts and Tests
- Any file inside your source directories can now be deployed to your active instance
- QoL improvements for the item select dialog - descriptions are now hidden and will be shown after hovering an item; The filter stays on top of the dialog when scrolling;
- It is now possible to execute tests from the hierarchy view

## Version 3.1.1

#### Bug Fixes

- Fixed a bug that prevented mapper provider types from loading properly

## Version 3.1.0

#### New Features

- Added support for data provider factories to allow for more flexibility and more types of data providers to be used in mappers (support for data provider factories requires Qorus 5.1.25+)
- Added support for the following new config item types (which are backwards compatible with strings) to allow for a better user experience by restricting possible values to only valid values for the type:
  - `Connection`: allows only valid connection names to be selected
  - `Data provider`: allows only valid data providers to be selected
  - `Job`: allows only valid job names to be selected
  - `Mapper`: allows only valid mapper names to be selected
  - `Service`: allows only valid service names to be selected
  - `Value map`: allows only valid value map names to be selected
  - `Workflow`: allows only valid workflow names to be selected

#### Bug Fixes

- Fixed a bug handling mapper drafts
- Fixed a bug where some valid mappers would not open to the diagram page
- Fixed a bug that prevented pipeline with the identical name as it's FSM parent to be shown in the state dialog

## Version 3.0.2

#### Bug Fixes

- Fixed a bug in Java code generation for step validation methods with connectors
- Fixed a bug where the IDE was not usable on Windows
- Config items type selection no longer offers soft types
- Config items value field no longer automatically wraps hash & list element values

## Version 3.0.1

#### Bug Fixes

- Fixed a bug that incorrectly saved config items with any type
- Fixed a visual bug that caused empty spaces to appear in some field selectors
- ENTER key is now properly respected on the login page
- Fixed a bug where the login page would not disappear after successfully logging in
- Fixed a bug where only the latest version of some interfaces would be shown in the hierarchy view

## Version 3.0

#### New Features

- Automatic draft management for all objects; never lose work again due to the IDE resetting its state; drafts are saved of any edits made and can be managed directly in the IDE as well

#### Bug fixes

- fixed a bug where selecting an incompatible mapper in a pipeline dialog would result in an unusuable dialog
- fixed a bug where it was impossible to add service methods to a service in certain situations
- fixed a bug where it was not possible to enter in a config item string value with newlines
- fixed a bug where it was not possible to save a config item value in an FSM connector with type `any`
- fixed a bug where the job schedule was reset to a default value every time a job was opened
- fixed a bug in the Qorus connections page where icons were lost when the active connection was lost
- fixed a bug where the IDE would remain on the login page after a successful login
- fixed a bug where the step modal dialog in the workflow diagrm view had a horizontal scroll bar with steps with very long names
- fixed a bug where the Java constructor name was not renamed when the object class name was changed

## 2.3.25

#### Bug Fixes

- Fixed indentation for tags in generated YAML files

## 2.3.24

#### Bug Fixes

- Spaces in class connections are no longer allowed & supported

## 2.3.23

#### Bug Fixes

- Passwords for Qorus with special characters are now supported
  _Existing passwords with special characters need to be updated manually in the environments view_

## 2.3.22

#### Bug Fixes

- Fixed a bug that would cause the webview to crash after creating new class with connectors from an FSM state
- Replaced the X icon with a trash icon on all FSM states

## 2.3.21

#### Bug Fixes

- Fixed inherited config items not being deleted when the parent config item is removed

## 2.3.20

#### Bug Fixes

- Moved the buttons inside class connections dialog under the box, so that the full connector name can be seen at all times

## 2.3.19

#### Bug Fixes

- Fixed a bug that prevented setting and saving inherited config items to `null`

## 2.3.18

#### New features

- Mappers and Types now support fields with dots in their names (with backwards compatibility).

## 2.3.17

#### Bug Fixes

- Configuration items that have not yet been submitted are highlighted in the configuration item modal

## 2.3.16

#### Bug Fixes

- Addressed usability issues with pipeline diagrams
- Added a `Remove value` button to configuration item modals to implement another possibility for removing the configuration item value

## 2.3.15

#### Bug Fixes

- Fixed a bug that caused internal config item data to be incorrectly saved

## 2.3.14

#### Bug Fixes

- Fixed a bug that prevented editing of pipeline elements
- Fixed a bug that stored old and incorrect connections settings in local state when connection URL / options would change
- Requires field in classes with processor is no longer limited to only processor classes
- Fixed a bug that would cause the webview to crash when removing the classes field from workflow fields
- Fixed a bug where changing the mapper / data type field name would not properly change the name in the internal data

## 2.3.13

#### Bug Fixes

- Fixed a bug that prevented steps opened from workflow to get the correct data

## 2.3.12

#### Bug Fixes

- Various bugs fixes and improvements for service methods handling for Python and Java

## 2.3.11

#### Bug Fixes

- Fixed a bug where Java code would be incorrectly generated after a connection has been added
- Added missing color for the mapper relation of type AUTO
- It is now possible & supported to add spaces in custom mapper field names
- Added field descriptions to the mapper field mapping dialog
- It is no longer possible to select soft types in the mapper field mapping dialog

## 2.3.10

#### Bug Fixes

- Fixed a bug notification toasters would be rendered outside of the view
- Fixed a bug that prevented going back to service from the methods page

## 2.3.9

#### Bug Fixes

- Fixed a bug where Java class connections were regenerated multiple times in the source code in some situations
- Fixed a bug where the WebView would crash when opening a new service that was just created

## 2.3.8

#### Bug Fixes

- Fixed a bug that prevented creation of more than one service method
- Fixed a few more cases where confirmation dialog would incorrectly appear
- Fixed a bug that caused visual artifacts when hovering over a select button with tooltip
- Fixed a bug in Java service code generation

## 2.3.7

#### Bug Fixes

- Fixed a bug in Java folder creation - all invalid characters are now transformed
- Fixed bugs in Java code generation for constant values

## 2.3.6

#### Bug Fixes

- Added proper scrolling to connection creation view

## 2.3.5

#### Bug Fixes

- Fixed the default connection URL to use HTTPS on port 8011; HTTP on port 8001 is no longer used by default
- Fixed a bug in Java code generation

## 2.3.4

#### Bug Fixes

- Fixed Java code generation of validation methods to use dynamically imported values
- Fixed a bug where dashes would not be allowed in connection names
- Fixed a rendering bug that sometimes would prevent rendering of icons on the step diagram

## 2.3.3

#### Bug fixes

- Fixed code generation of default constructors in Java when extending dynamic classes and connectors exist

## 2.3.2

#### Bug fixes

- Fixed a bug that would block any deployment after a deployment failed

## 2.3.1

#### Bug fixes

- Added default constructor code generation for Java classes to declare the default exception (`Throwable`) added to
  all dynamically imported classes
- Fixed a bug where class package name for Java would contain forbidden characters
- Fixed a bug where initiating the deploy command would run multiple deployments in parallel and bypass the confirmation dialog
- Fixed a bug where the confirmation dialog would display after opening a saved interface that modified the Required or Classes tags

## 2.3.0

#### Bug fixes

- Code generation (and regeneration - when re-targeting an interface for another language) for Python and Java has been greatly improved in all areas
- Many bug fixes have been made regarding editing and code and metadata alignment

## 2.2.10

#### Bug fixes

- fixed: when a service is recreated on a language change its methods are not destroyed properly
- webview crashes when trying to add a service method to an existing service from the webview
- fixed setting the "unsaved work" flag for services when moving between the main service form and the methods form
  and reseting the changes
- show the "unsaved work" confirmation dialog when opening another object,
  don't show it when no changes have been made (fixed again)

## 2.2.9

#### Bug fixes

- show the "unsaved work" confirmation dialog when opening another object from the tree view,
  don't show the confirmation dialog after successful submit or when no changes have been made
- prefill the target directory when opening a new interface from another interface (it worked only in some situations)
- fixed: when a new mapper is opened from an FSM it has the Context field selected with value "undefined:undefined"

#### New features

- make it possible not to use the qorus extension, create the config file only on demand
- added container resource limits and scaling parameters fields to the stateless service definition

## 2.2.8

#### Bug fixes

- fixed deployment of pipelines with processor classes as dependencies
- fixed continuation of editing an interface after establishing an active qorus connection

## 2.2.7

#### Bug fixes

- fixed deployment of workflows with dependencies

## 2.2.6

#### Bug fixes

- fixed saving workflows

## 2.2.5

#### Bug fixes

- interface fields containing file paths must use forward slashes ('/') on any operating system

#### New features

- added the 'stateless' tag to services

## 2.2.4

#### Bug fixes

- fixed opening mappers with contextual mappings but no interface context

#### New features

- limited editing of Qore interfaces that changes only the metadata but not the source code is now possible even if Qore is not installed

## 2.2.3

#### Bug fixes

- fixed a bug where Open Workflow Steps did not work after Open Workflow and vice-versa
- fixed encryption of passwords contained in Qorus URLs
- fixed a bug where mappers displayed no data when opened from other interfaces

## 2.2.0

#### New features

- new data provider type: Factories
- pipeline view has been split to 2 pages for a better orientation and usability

#### Bug fixes

- fixed a bug where 'tags' were not always serialized as strings
- fixed a bug where the invalid 'option' tag was saved in processor
- fixed saving of data provider options of complex types
- fixed bugs where FSMs or pipelines being open from other interfaces opened blank
- fixed a bug where pipeline could not be submitted unless input provider options, which are optional, were filled

## 2.1.0

#### New features

- new interface: Errors
- workflows can now have a errors assigned
- deployment of an interface now (optionally) includes all referenced interfaces

#### Bug fixes

- fixed a bug where the the IDE would crash when opening step for editing from the step diagram
- it is now properly possible to create a Class from another Class
- icons representing types of interfaces were unified, now they are the same in the tree view and in the webview

## 2.0.2

#### New features

- new interface: Value map
- it is now possible to create or edit two interfaces of the same kind at the same time (create Class from a Class for example)
- groups, event and queues are now edited separately

#### Bug fixes

- config item with allowed values can now be given a template string instead
- check referenced interfaces on opening an interface
- fixed filtering the base class list for source language when creating a new interface

## 2.0.1

#### New features

- step diagram for Workflows has been redesigned for better user experience

#### Bug fixes

- connection now properly saves the port
- target directory is now properly pre set when creating a step from workflow
- target directory is now shown when selected
- fixed opening service methods with author for editing
- description is mandatory for events, groups and queues
- fixed opening events, groups and queues for editing from the file browser
- fixed updating the file list after adding new directory
- removed incorrect message on adding new step from the workflow diagram
- fixed switching an interface into another language

## 2.0.0

#### Requires

Qorus 5.0.0

#### New features

- support for Python
- pipelines
- finite state machines
- connections
- deployment of multiple files or directories
- in the config item form it's now clear whether a field value has been inherited or overwritten or is new and it's possible to reset the field to the parent value
- possibility to create subdirectories from the environment manager in the webview
- encrypted passwords in the qorus instances configuration
- use username and passwords in the qorus instances configuration for automatic login or at least for prefilling the username in the login form
- extension is now 20 times smaller in size
- code sharing among different languages (Qore, Python, Java):
  everything is possible except that a Java class cannot inherit another language class
- remember last target directory and use it as default for next new interface
- re-creation of an interface with another programming language
- re-creation of an interface with a broken source code
- forms are no longer cleared on submit
- view and delete interface directly from the webview
- new tutorial feature to guide you through some of the more complex interfaces
- many visual improvements

#### Bug fixes

- behaviour on write file error, e.g. when target directory is invalid
- saving codeless interfaces
- fixed service method management

## 1.3.0

#### New features

- support for editing Java interfaces
- added the command 'Close Webview'
- added the command 'Edit current interface'

#### Bug fixes

- fixed deletion of service and mapper code methods
- fixed updating base classes in the selection box
- Java source files are now created in a subdirectory (to fix name collisions)
- fixed: on submitting edited interface check whether the original still exists
- fixed: Java class cannot inherit Qore class
- fixed freezing on deleting a mapper
- fixed including resources to service deployment

## 1.2.1

- re-release of 1.2.0 without garbage files as part of the package

## 1.2.0

#### New features

- edit commands added to file explorer context menu
- added the 'Create new type' command to explorer context menu
- A warning dialog has been added when a view is about to be changed and there is unsaved work
- It is now possible to create and edit new objects directly from their respective fields
- Mapper inputs and outputs can now be cleared and entered again when editing a mapper

#### Bug fixes

- check whether file with chosen name already exists
- fixed: switching from category view to folder view lasts very long time
- fixed editing steps from tree view
- fixed showing irrelevant context menu items
- added confirmation to the 'Deploy directory' command
- fixed generation of class connections code
- check validity of class name
- fixed opening workflow steps
- active Qorus connection check
- fixed saving resources as path relative to the yaml file
- generate config file if project has been set
- added dependency on qore-vscode
- remove Allowed values if type == any
- fixed position of java code lenses
- fixed: qorus requests fail if the URL contains a trailing
- delete config item value when type changes
- don't report a base class name mismatch when it's not true
- disable type of 'other' interfaces on editing
- fixed missing .qwf in yaml files
- fixed saving/reading mapper fields options
- Adding new steps to the Workflow diagram should no longer result in "Loading step:0"
- Config item value and default value is now properly set to `null` when type is changed to a different type
- `Any` type now correctly supports `null` as a value and default value
- Modal dialogs have been reworked and now only the last opened is closed when `Esc` key is pressed
- Fixed Job and Service name generation
- Selecting a step again after it was removed from the workflow diagram now works properly
- When removing a second-to-last step in group of parallel steps, the last step is now moved upwards in the hierarchy and is rendered inline
- More space efficient redesign of the connection name dialog
- Fixed a bug where it was sometime impossible to map 2 compatible fields in mappers
- Some fields now disallow certain characters to be entered
- Mapper codes are properly reset after successfuly submiting
- Fixed code generation for Java array step triggers and for Java async array step signatures
- Fixed a bug where sometimes an empty `value_true_type` key would be saved in the yaml file
- Fixed a race condition bug that would cause the newly added step for a workflow diagram to show `Loading step:0` instead of the step's name and version
- Value maps are now properly displayed in the UI after being saved
- Empty lists and hashes are now properly displayed in the UI as `{}` and `[]` respectively
- Static data context is now properly passed to mappers even from new Workflows

## 1.1.1

#### Bug fixes

- Java connector code generation
- displaying of folder in folder pickers
- check of existence of an interface with same name or class name
- success confirmation message from backend to frontend
- fixed saving of text-/bin-/resource fields

## 1.1.0

#### New features

- Open file and Delete file buttons
- new interface type 'Type'
- new workflow property 'Static data type'
- new mapper property 'Context'
- interfaces of type class or mapper code no longer have the 'Class name' property
- All delete actions now have a confirmation dialog
- The entire input hash is now mappable in mappers

#### Bug fixes

- config item values of type 'Any' cannot be 'undefined'
- fixed the 'Authors' form input data
- fixed saving the multiline (markdown) descriptions
- fixed handling the config items values of type 'Any' whose actual type is hash or list
- fixed return statement in generated class connections code
- prevented parsing strings looking like yaml
- classes no longer have editable config item values
- added missing button translations in the config items table
- creating a hash<auto> field with null set to true no longer crashes the webview

## 1.0.4

#### Bug fixes

- mappers used in class connections are now added automatically to the mappers tag
- fixed displaying the workflow keylist tag
- editing groups, events and queues is now possible
- fixed handling default config item values of complex types
- interfaces with class connections can now be re-created
- fixed misinterpreting of string values that look like yaml code
- it is now possible to set 0 for int and float config items
- strings starting with `-` are no longer misinterpeted as lists in config items
- the add new field button is no longer replaced by delete button when hovering mapper field
- folder tree list is no longer hidden after 4 seconds when choosing a folder

## 1.0.3

#### Bug fixes

- fixed generating mapper code
- fixed deploying mapper code
- modules made deployable
- fixed passing params in generated class connections code
- fixed using qore classes in generated java class connections code
- adding custom field for hash typed mappers now works properly
- selecting factory provider now properly removes all previous children
- submitting an interface now properly resets class connections

## 1.0.2

#### New features

- generate dummy implemenation of abstract step methods and the run method for jobs
- qorus object parser removed
- some form fields are no longer subject so sorting, namely: targetr dir, name, desc

#### Bug fixes

- fixed deleting and renaming of java service methods
- fixed: group/queue/event names being changed to "undefined" on edit
- fixed crashing when mapper data are incorrect
- fixed formatting of markdown code in yaml
- fixed imports for java steps
- fixed: inherited config items sometimes are not saved
- fixed disappering of some fields in edit forms
- fixed erasing base class name from the code file
- fixed: on removing a base class do not remove its config items if it's also in the requires/classes list
- fixed inheritance of config item default values and values
- fixed all interface source is sometimes deleted and corrupted YAML is saved
- fixed saving of inherited config items
- fixed sending of empty classes in some cases, resulting in source code being deleted
- fixed tooltip for default config item value in config item value dialog
- fixed scrollbar not showing in the delete interface view
- fixed showing of service method info on mouse hover

## 1.0.1

#### New features

- classes and connectors in the class connection dialog are now automatically selected if there is only one entry
- config item value dialog now displays the config item type

#### Bug fixes

- added sorting of folders and interfaces in folder view of Interface Tree
- mapper provider paths are now checked for trailing slashes
- mapper creation dialog was enlarged
- all mapper code references are removed from the output fields when a mapper code is removed from mapper
- hashes and lists are now properly available as fields for constants and other keys in the output field mapping dialog
- going back from step diagram no longer causes the webview to crash
- it is no longer possible to change mapper input & output providers while adding a mapper between connectors
- config items for workflow have been reworked and now show the correct count of workflow config item values, additionaly workflow config item manager can only be shown if at least one step is present in the current worklow
- step types in the workflow step diagram now properly show the step types, instead of base class names
- config items are now fetched properly for all interfaces
- buttons are no longer rendered out of the dialog body of config item manager, when the window height is too small
- on changing/removing classes remove config items of removed classes
- if interface is created as codeless but after editing is no longer codeless then saving crashes
- fixed getting the step type: it was computed to early, before the inheritance information was known
- implemented the is-templated-string flag for workflow config item values
- fields in the interface edit forms are now sorted
- when adding steps in the workflow step diagram, their config items are now immediately fetched so that workflow level config item values can be set
- fixed error where workflow config item values are copied from another workflow with same steps
- fixed deleting local config item values

## 1.0.0

- Qorus webview with many features is introduced
- support for creating of Qorus interfaces such as jobs, services, steps, workflows, classes, mappers etc.
- connecting building blocks using class-connections manager allowing to create no-code solution for complex enterprise integration scenarios
- release package management
- hierarchy view providing an overview of interfaces in the project
- and much more

The list of all implemented issues can be found in the following link:
https://github.com/qoretechnologies/qorus-vscode/milestone/7?closed=1

## 0.0.8

- fix: release packager page does not remember its initial state
  https://github.com/qoretechnologies/qorus-vscode/issues/55

## 0.0.7

- feature: local release packager
  https://github.com/qoretechnologies/qorus-vscode/issues/42
- feature: qorus instances management with GUI
  https://github.com/qoretechnologies/qorus-vscode/issues/19
- fix: 401 unauthorized does not redirect you to the qorus instances list
  https://github.com/qoretechnologies/qorus-vscode/issues/30
- fix: deployment failed will logout you
  https://github.com/qoretechnologies/qorus-vscode/issues/29
  https://github.com/qoretechnologies/qorus-vscode/issues/28
- fix: when the .proj file is changed, extension doesn't reload showing old qorus instances
  https://github.com/qoretechnologies/qorus-vscode/issues/24

## 0.0.6

- fixed indirect event-stream package security issue:
  https://code.visualstudio.com/blogs/2018/11/26/event-stream

## 0.0.5

- fixed service resources are not deployed with services on Windows

## 0.0.4

- fixed re-login after server restart
- changed qorus instance tree display
- fixed opening URLs in external browser on Windows
- create qorus project file on demand only
- fixed qorus instance tree content after removal of the project file

## 0.0.3

- basic documentation

## 0.0.2

- fix: qorus instance explorer is empty
- logo updated
- display name updated

## 0.0.1

- first public release
