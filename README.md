# Qorus Developer Tools

Qorus developer tools for the [Qorus Integration Engine](https://qoretechnologies.com/qorus_integration_engine/).
This extension makes it possible to easily create, deploy, and test Qorus interfaces directly from the Visual Studio Code editor.
It is a perfect tool for creating no-code solutions for the Qorus Integration Engine. The Qorus Developer Tools allow to create building blocks that can be reused later and setup an initial configuration for them.

## Version 2.0.2 overview - What's new:
- new interface: Value map
- it is now possible to create or edit two interfaces of the same kind at the same time (create Class from a Class for example)
### Bug fixes
- config item with allowed values can now be given a template string instead

## Version 2.0.1 overview - What's new:
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


## Version 2.0.0 overview - What's new:
* Python is now a supported language
* The extension is now 20x smaller
* New Flow Designer (Finite State Machines): supports building arbitrary logic for any interface object with a mouse and configuration of building blocks instead of coding
* Support for pipelines added: build high-performance data flow processing solutions using a mouse
* Support for connections added
* You can now deploy multiple files and directories
* Code can now be shared between Qore, Java and Python; interfaces can also be regenerated from configuration in another language
* New tutorial feature to guide you through some of the more complex interfaces
...and many more new features and bug fixes, for a complete list please check the changelog.

## Version 1.3.0 overview - What's new:
* Support for editing Java interfaces
* Added the commands 'Close Webview' and 'Edit current interface'
#### Bug fixes:
* Deletion of service and mapper code methods
* Updating base classes in the selection box
* Java source files are now created in a subdirectory (to fix name collisions)
* On submitting edited interface check whether the original still exists
* Java class cannot inherit Qore class
* Freezing on deleting a mapper
* Fixed including resources to service deployment

## Version 1.2.0 overview - What's new:
* A warning dialog has been added when a view is about to be changed and there is unsaved work
* It is now possible to create and edit new objects **directly** from their respective fields
* Mapper inputs and outputs can now be cleared and entered again when editing an existing mapper
* Fixed a race condition bug that would cause the newly added step for a workflow diagram to show Loading step:0 instead of the step's name and version
* When removing a second-to-last step in group of parallel steps, the last step is now moved upwards in the hierarchy and is rendered inline

... and a lot more, please see changelog for all features and bug fixes.

## Version 1.1.1 overview - What was fixed:
* Java class connections code generation
* displaying of folder in folder pickers
* check of existence of an interface with same name or class name
* success confirmation message from backend to frontend
* fixed: saving of text-/bin-/resource fields

## Version 1.1.0 overview - What's new:
* Interface type **Type** support
* Workflow property **Static data type**
* Mapper property **Context**
* The entire input hash is now mappable in mappers
* Open file and Delete file buttons
* All delete actions now have a confirmation dialog
* Many bugs are fixed

## Features

* Qorus Webview
* Configuration manager helps to easily manage configuration data of the project (no need for manual work with **qorusproject.json**).
* Support for creating of Qorus interfaces such as jobs, services, steps, workflows, classes, mappers etc.
* Connecting building blocks using class-connections manager allows to create no-code solution for complex enterprise integration scenarios
* Release package management
* Hierarchy view of all interfaces in the project
* and more

## How to use

There are three main user interfaces to use the extension:
* Webview
* Hierarchy view
* Commands

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
    - **URLs**: the Qorus instance "main" URL at the first position and then any custom URLs, if any (here only the *'dev 1'* Qorus instance in the *'dev'* environment has any custom URLs). Custom URLs are supposed to serve as shortcuts for opening project related sites - simply by clicking (the opened tool/browser depends on the operating system).

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
- Use the *Deploy* buttons shown when hovering mouse cursor over an interface or a directory in the *Qorus Interfaces* tree view.

![deployment](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/deployment.gif?raw=true)

The deployment is targeted to a Qorus instance that is currently set as **active**.

A Qorus instance can be set as active in the *Qorus Instances* tree view, either from the context menu of a Qorus instance node (second level node) or simply by clicking a Qorus instance node directly.

Active Qorus instance is marked by a green light icon. At most one Qorus instance can be active at a time. Setting another instance active deactivates the previously active instance.

### Login/Logout

If a Qorus instance requires authentication (and the user has not yet logged in that instance) the `Set as active Qorus instance` command opens a login dialog. After a successful login, the instance will become active. Also login can be performed in the webview.

![login](https://github.com/qoretechnologies/qorus-vscode/blob/master/images/gif/login.gif?raw=true)

Authentication tokens are stored, so that next time logging-in is not required.
(Tokens are only stored in memory while VSCode is running, not persistently.)

Context menus of instances in the *Qorus Instances* tree view contain also the following commands:
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
