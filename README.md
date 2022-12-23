# Qorus Developer Tools

Qorus developer tools for the [Qorus Integration Engine](https://qoretechnologies.com/qorus_integration_engine/).
This extension makes it possible to easily create, deploy, and test Qorus interfaces directly from the Visual Studio Code editor.
It is a perfect tool for creating no-code solutions for the Qorus Integration Engine. The Qorus Developer Tools extension enables creating, editing, and extending reusable IT and AI building blocks for advanced automation challenges.

## Version 3.9.5 overview - What's new:

- Releases view was rewritten to use the new in-house UI library

## Version 3.9.4 overview - What's new:

- Recognize `*test.py` and `*Test.java` as tests
- Allow the extension to create custom releases without requiring an initialized git repository in the project directory

## Version 3.9.3 overview - What's new:

- Fixed a bug where the provider URLs for Pipeline input provider were built incorrectly
- The maximum height of the input & output providers on the mapper diagram page have been adjusted
- The `Set as null` button's width has been adjusted to fit the text
- Fixed a bug where deleting any interface from the Hierarchy view would result in the name of the interface to be shown as `undefined`

## Version 3.9.2 overview - What's new:

- Fixed a bug where the webview would crash when selecting certain data types when browsing data providers
- Fixed a bug that prevented search providers with empty search arguments to be saved
- Fixed a bug where the WebView would crash when trying to add a `Context` field to existing mappers
- Fixed a bug where the WebView would crash when trying to edit a saved state which contained an action that included options with `/` in the value
- Fixed enlarged + buttons in the Api Manager field in Services
- Config items default value is now properly checked when `Can be undefined` is set, and the form can be submitted

## Version 3.9.1 overview - What's new:

- Fixed a bug where the data provider URL would not be built correctly when using the search states in FSM

## Version 3.9.0 overview - What's new:

- Complex hash/object-editing is now supported throughout the application
- Fixed a bug where a response/request type was not working properly in mappers

## Version 3.8.4 overview - What's new:

- It is no longer possible to select a non-record-based provider in Pipeline input provider

## Version 3.8.3 overview - What's new:

- Whenever an error occurs when traversing the data provider, the error will now be displayed.
- Fixed an issue where a Windows build would not work properly because of an internal path issue
- Fixed a bug where it was not possible to select `request` `response` data providers in Mappers
- Fixed a bug that caused the webview to crash when selecting a certain data provider factory in Mappers (csvread and csvwrite were affected)
- Fixed a bug where it was possible to select non record-based data provider in the pipeline input provider

## Version 3.8.2 overview - What's new:

- Fixed an issue in Mappers that caused infinite draft saving loop which prevented options being added and eventually crashed the active Qorus connection

## Version 3.8.1 overview - What's new:

- Fixed a bug that prevented new Mappers from being created

## Version 3.8.0 overview - What's new:

- Mappers can now be opened and managed even if the input or output connection is down / broken
- Opening a Class with connectors will no longer create a draft if nothing has changed

## Version 3.7.0 overview - What's new:

- Implemented new FSM states - create, single record search, multiple record search, update, and delete
- Fixed a bug that prevented creation of FSM Block states
- Requires Qorus 5.1.35+ to support new FSM functionality

![update_state](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/update-state.gif?raw=true)

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
