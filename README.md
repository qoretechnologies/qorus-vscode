# qorus-vscode

A developer's front end for Qorus Integration Engine

https://qoretechnologies.com/products

## Features

The extension makes possible remote deployment of edited Qorus source files directly from the VSCode editor.
Qorus server can be attached and interface code debugged.

## How to use

### Configuration data and corresponding tree view

In order to work with the extension a project must be open in the VSCode editor. By project we mean the root directory of a project (the root of a git repository, for a typical example).

Next, development environments and their Qorus instances have to be configured. To do this, use the configuration tool [Project configuration] in the Qorus manager webview that can be opened
by clicking the violet hexagon [Q] icon at the right top corner (it is visible only if at least one project file is open).
If the project configuration is done for the first time some initial configuration data is automatically generated to be modified by the user.

The configuration data structure is three-level: Environments -> Qorus instances -> Qorus instance properties. Each development environment can have several Qorus instances
and each Qorus instance has a main URL (URL of the Qorus engine itself) and, optionally, several custom URLs.

Based on the configuration data a *Qorus instances tree view* is provided in the Explorer pane. Switching to the *Qorus instances tree view* is done by clicking the hexagon [Q] icon in the activity bar.
The configuration data is stored in the file named **qorusproject.json** at the root directory of the project and the file is not supposed to be edited manually.

More projects (directories) can be open at the same time. When editing alternately files from different projects the *Qorus instances tree view* changes accordingly.

### Deployment

There are three deployment actions:

* Deploy the file currently active in the editor. This is executed by the keyboard shortcut `Ctrl+Alt+o` (or find the command `Qorus: Deploy current file` in the command box)
* Deploy a single file from the context menu
* Deploy a directory from the context menu (deploy all deployable files in the directory including subdirectories)

The deployment is targeted to the Qorus instance that is currently set as **active**.
A Qorus instance can be set as active in the *Qorus instances tree view*, either from the context menu over a Qorus instance node (second level node) or simply by clicking the Qorus instance node directly.
Active Qorus instance is marked by the green light icon. Of course, at most one Qorus instance can be active at a time, setting another instance active inactivates the instance that was active before.

### Deleting interfaces
You can also remove interfaces from the active Qorus instance. To this end, use the [Delete interfaces] Qorus manager menu item.

### Login/Logout

If a Qorus instance requires authentication (and the user has not yet logged in that instance) the `Set as active Qorus instance` command opens a login dialog and after successful login the instance will be active.
Authentication tokens are stored, so next time login is not required.
(Tokens are stored only for the VSCode runtime, not persistently.)

The **context menus** over the *Qorus instance tree node*s offer also the following commands

* Login without setting the instance active
* Logout (if the instance was active it becomes inactive, of course)
* Set the instance inactive, but stay logged in

### Making a release package
Use the Qorus manager webview menu item [Make release] to create a release package.
Before using it the source repository must be 'clean': all changes must be commited and the working branch synchronized with remote (everything pushed/pulled).
You can create either a 'full release package' containing all source files or an 'incremental release package' containing only files that have changed since the selected commit.
Once you have create a package you can also save it to (re)use it later.

### Debugging

The sessions are configured in `launch.json` file referenced from `Debug` view.
Extension implements *qorus* debugging type.
Both local and remote interfaces of *workflow* / *job* / *service* kind are supported.
`Interface` name (i.e. program) may be specified by *name*, *name:version*, *id* or pickup from
selection box *${command:AskForInterface}* when starting debugging session.

To start debugging prepare launch file, select a configuration from drop box and
click `Start debugging`. The debugging is performed for current active *Qorus instance*.
When specified interface code (program) is executed in Qorus then VSCode extension
is notified, program interrupted and user can start stepping code e.g.`F11`, inspecting stack, variables, etc.
To leave program stepping press `F5`. The source code is downloaded from Qorus. The code openned in editor
has no file extension so no language is detected. To show coloring and enable breakpoints change language type manually to *Qore*.

The launch file data structure is explained by the following example:

    {
        "version": "0.2.0",
        "configurations": [
            {
                "type": "qorus",
                "request": "attach",
                "name": "Attach job",
                "kind": "job",
                "interface": "${command:AskForInterface}",
            },
            {
                "type": "qorus",
                "request": "attach",
                "name": "Attach job_id: #1",
                "kind": "service",
                "interface": 1
            },
            {
                "type": "qorus",
                "request": "attach",
                "name": "Attach test-debug_job",
                "kind": "job",
                "interface": "test-debug_job"
            },
            {
                "type": "qorus",
                "request": "attach",
                "name": "Attach test-debug_job:1.0",
                "kind": "job",
                "interface": "test-debug_job:1.0"
            }
        ]
    }
