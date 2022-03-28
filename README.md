# Qorus Developer Tools

Qorus developer tools for the [Qorus Integration Engine](https://qoretechnologies.com/qorus_integration_engine/).
This extension makes it possible to easily create, deploy, and test Qorus interfaces directly from the Visual Studio Code editor.
It is a perfect tool for creating no-code solutions for the Qorus Integration Engine. The Qorus Developer Tools allow to create building blocks that can be
reused later and setup an initial configuration for them.

## Version 3.3.0 overview - What's new:

- Introducing new type of state: API Call - It is a perfect tool for creating no-code solutions for the Qorus Integration Engine. The Qorus Developer Tools allow to create building blocks that can be reused later and setup an initial configuration for them.
- It is now possible to duplicate interfaces right from the hierarchy view
- Reordered some context menu item for better consistency
- Fixed a bug in allowed values in config items that caused discrepancies when adding new allowed values

## Version 3.2.2 overview - What's new:

- Fixed a bug where non-factory data providers in config items were not able to be saved

## Version 3.2.1 overview - What's new:

- It is now possible to edit factory data providers, and their options, without having to re-create them

## Version 3.2.0 overview - What's new:

- Hierarchy view now shows and allows deployment of Qorus files such as Schema modules, Scripts and Tests
- Any file inside your source directories can now be deployed to your active instance
- QoL improvements for the item select dialog - descriptions are now hidden and will be shown after hovering an item; The filter stays on top of the dialog when scrolling;
- It is now possible to execute tests from the hierarchy view
- Fixed a bug where it was not possible to drag mapper inputs if the window was scrolled all the way the bottom

## Version 3.1.1 overview - What's new:

- Fixed a bug that prevented mapper provider types from loading properly

## Version 3.1.0 overview - What's new:

- Added support for data provider factories to allow for more flexibility and more types of data providers to be used in mappers (support for data provider factories requires Qorus 5.1.25+)
- Added support for the following new config item types (which are backwards compatible with strings) to allow for a better user experience by restricting possible values to only valid values for the type:
  - `Connection`: allows only valid connection names to be selected
  - `Data provider`: allows only valid data providers to be selected
  - `Job`: allows only valid job names to be selected
  - `Mapper`: allows only valid mapper names to be selected
  - `Service`: allows only valid service names to be selected
  - `Value map`: allows only valid value map names to be selected
  - `Workflow`: allows only valid workflow names to be selected
- Fixed a bug handling mapper drafts
- Fixed a bug where some valid mappers would not open to the diagram page
- Fixed a bug that prevented pipeline with the identical name as it's FSM parent to be shown in the state dialog

## Version 3.0.2 overview - What's new:

- Fixed a bug in Java code generation for step validation methods with connectors
- Fixed a bug where the IDE was not usable on Windows
- Config items type selection no longer offers soft types
- Config items value field no longer automatically wraps hash & list element values

## Version 3.0.1 overview - What's new:

- Fixed a bug that incorrectly saved config items with any type
- Fixed a visual bug that caused empty spaces to appear in some field selectors
- ENTER key is now properly respected on the login page
- Fixed a bug where the login page would not disappear after successfully logging in
- Fixed a bug where only the latest version of some interfaces would be shown in the hierarchy view

## Version 3.0 overview - What's new:

- Automatic draft management for all objects; never lose work again due to the IDE resetting its state; drafts are saved of any edits made and can be managed directly in the IDE as well
- fixed a bug where selecting an incompatible mapper in a pipeline dialog would result in an unusuable dialog
- fixed a bug where it was impossible to add service methods to a service in certain situations
- fixed a bug where it was not possible to enter in a config item string value with newlines
- fixed a bug where it was not possible to save a config item value in an FSM connector with type `any`
- fixed a bug where the job schedule was reset to a default value every time a job was opened
- fixed a bug in the Qorus connections page where icons were lost when the active connection was lost
- fixed a bug where the IDE would remain on the login page after a successful login
- fixed a bug where the step modal dialog in the workflow diagrm view had a horizontal scroll bar with steps with very long names
- fixed a bug where the Java constructor name was not renamed when the object class name was changed

---

## Main Features

- Qorus Webview
- Configuration manager helps to easily manage configuration data of the project (no need for manual work with **qorusproject.json**).
- Support for creating of Qorus interfaces such as jobs, services, steps, workflows, classes, mappers etc.
- Connecting building blocks using class-connections manager allows to create no-code solution for complex enterprise integration scenarios
- Release package management
- Hierarchy view of all interfaces in the project
- and more

## How to use

There are three main user interfaces to use the extension:

- Webview
- Hierarchy view
- Commands

### Webview

The webview can be opened using the Qorus icon, which placed in the hierarchy view and also in the VS Code action bar or by qorus webview command. The webview can be used for creation/editing of Qorus interfaces, project configuration, release package management and much more.

![interface_creation](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/interface_creation.gif?raw=true)

Creating Qorus mapper using the provider API support:
![mapper_creation](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/mapper_creation.gif?raw=true)

### Hierarchy view

The hierarchy view provides an overview of the open project. In the `interfaces` tab all interfaces that are currently present in the project and based on the `src directories` configuration are shown. They can be sorted according to the folder hierarchy on the disk or according to interface types. Also the hierarchy view provides quick actions in order to perform operations on the server or make changes on local files such as deploying an interface to an active instance or creating a new interface.

The `instances` tab of the hierarchy view displays all configured environments with instances and links to them based on the configuration file (**qorusproject.json**).

The interpretation of the data is depicted by a tree with three levels:

- **development environments** (here `local` and `dev`)
  - **Qorus instances** (here both environments have two Qorus instances)
    - **URLs**: the Qorus instance "main" URL at the first position and then any custom URLs, if any (here only the _'dev 1'_ Qorus instance in the _'dev'_ environment has any custom URLs). Custom URLs are supposed to serve as shortcuts for opening project related sites - simply by clicking (the opened tool/browser depends on the operating system).

The corresponding tree looks as follows:

```
* local
  * main local Qorus instance
    * main URL (http://localhost:8001)
  * local Qorus instance
    * main URL (https://localhost:8011)
* dev
  * dev 1
    * main URL (http://1.2.3.4:5678)
    * abc (sftp://abc@def/ghi)
    * xyz (sftp://xyz@uvw)
  * dev 2
    * main URL (https://2.3.4.5:6789)
```

![hierarchy_view](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/hierarchy_view.gif?raw=true)

### Deployment

There are several possible deployment methods:

- Deploy the file currently active in the editor. This can be done using keyboard shortcut `Ctrl+Alt+o` or by using command `Qorus: Deploy current file` from the Command Palette.
- Use the `Qorus: Deploy file` command from a file's context menu (in the Explorer view).
- Use the `Qorus: Deploy directory` command from a directory's context menu (deploys all deployable files in the directory including subdirectories).
- Use the _Deploy_ buttons shown when hovering mouse cursor over an interface or a directory in the _Qorus Interfaces_ tree view.

![deployment](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/deployment.gif?raw=true)

The deployment is targeted to a Qorus instance that is currently set as **active**.

A Qorus instance can be set as active in the _Qorus Instances_ tree view, either from the context menu of a Qorus instance node (second level node) or simply by clicking a Qorus instance node directly.

Active Qorus instance is marked by a green light icon. At most one Qorus instance can be active at a time. Setting another instance active deactivates the previously active instance.

### Login/Logout

If a Qorus instance requires authentication (and the user has not yet logged in that instance) the `Set as active Qorus instance` command opens a login dialog. After a successful login, the instance will become active. Also login can be performed in the webview.

![login](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/login.gif?raw=true)

Authentication tokens are stored, so that next time logging-in is not required.
(Tokens are only stored in memory while VSCode is running, not persistently.)

Context menus of instances in the _Qorus Instances_ tree view contain also the following commands:

- Login without setting the instance active.
- Logout (if the instance was active it becomes inactive).
- Set the instance inactive while staying logged in.

### Hints

- If there can be a heavy filesystem traffic in a part of the project folder, such as running a build with make,
  exclude that part from file watching otherwise the extension may get frozen:

  - open settings (File -> Preferences -> Settings)
  - switch to the Workspace tab
  - search for "watcher exclude"
  - add a pattern there

- If you are not using the Qore programming language and would not like to see messages relating to missing Qore infrastructure for the Qore Language Server, unset the `Qore: Use QLS` setting in Settings (or add `"qore.useQLS": false` in `settings.json`)
