<div align="center">
  <br><br><br>
  <img src="./public/logo.png" alt="Unstated Logo" width="350">
  <br><br><br>
</div>

# Qorus Developer Tools

Qorus developer tools for the [Qorus Integration Engine](https://qoretechnologies.com/qorus_integration_engine/).
This extension makes it possible to easily create, deploy, and test Qorus interfaces directly from the Visual Studio Code editor.
It is a perfect tool for creating no-code solutions for the Qorus Integration Engine. The Qorus Developer Tools extension enables creating, editing, and extending reusable IT and AI building blocks for advanced automation challenges.

## Version 4.2.2

#### Bug fixes

- Fixed a critical bug where many existing mappers using data providers for input and/or output would not load properly

## Version 4.2.1

#### Bug sixes

- Fixed a bug reading config items in jobs and services

## Version 4.2.0

#### New features

- New Interfaces list view - view and manage all local, remote interfaces, and drafts in one place
- New & improved config items view - config items can now be filtered, zooming in and out is now possible, and the view is now more user friendly
- Improved navigation - Added breadcrumbs to some views, added back button to the topbar that allows you to go back to the previous view
- Types now support descriptions

## Version 4.1.0

#### New features

! Important ! - Some features of this release require Qorus 6.0.3 or later to be installed on the server.

- Variables in FSMS - Variables in FSMs can be declared which allows Qorus developers to restrict the data type of values that can be assigned to of the variable. When a variable is declared as type `data-provider`, then the variable will be instantiated when referenced according to the configuration provided in the IDE, and the variable will be persistent until it goes out of scope. Variable action states can be created from `data-provider` variables as well, that allow actions to be executed on the data provider. Because these variables are persistent, and because `data-provider` variables normally represent a connection to a server or network service, this allows Qorus users to implement actions on a persistent object or connection in FSMs such as transaction management or connection-oriented actions that require persistence to work properly.
- Data providers now support Favorites - save any data provider you frequently use to your favorites and access them quickly from the Favorites button in the data provider browser
- Flow Builder (FSM) now supports zooming in and out of the diagram! See the new zoom controls in the top right corner of the diagram.
- Template values are now fetched from the Qorus server and provide descriptions for each value. This makes it easier to understand what each value is for
- New Transaction block added to FSMs. This block allows you to group multiple states into a single transaction. This is useful for example when you want to perform complex manipulations on records in a record-based data provider (such as a database, for example) in a single transaction. If any of the states in the transaction fail, the transaction will be automatically rolled back, while if the transaction block exits with no errors, the transaction is automatically committed.
- Event based data providers are now supported for services, including automatic variables for events with FSMs associated to them

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

## Contributing

The Qorus Developer Tools project welcomes all constructive contributions. Contributions can be of many forms including bug fixes, enhancements, fixes to documentation, additional tests and more!

See the [Contributing Guide](CONTRIBUTING.md) for more technical details on contributing.

### Security Issues

If you discover a security vulnerability in this repository, please see [Security Policies and Procedures](SECURITY.md)

## License

[MIT](LICENSE.txt)
