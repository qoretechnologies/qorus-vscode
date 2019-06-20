# qorus-vscode

A developer's front end for Qorus Integration Engine

https://qoretechnologies.com/qorus_integration_engine/

## Features

The extension makes possible remote deployment of edited Qorus source files directly from the VSCode editor.
Qorus server can be attached and interface code debugged.

## How to use

### Configuration data and corresponding tree view

In order to work with the extension a project must be open in the VSCode editor. By project we mean the root directory of a project (the root of a git repository, for a typical example).

Next, in the root directory there needs to be a project configuration file named **qorusproject.json** defining development environments and Qorus instances used during the project development. If the configuration file **qorusproject.json** is not there it can be generated from a template so that the user can simply edit its contents seeing the required structure. Creation of the file is offered in the context menu over each file and each folder within the project.

Based on the configuration file contents a *Qorus instances tree view* is provided in the explorer pane. Switching to the *Qorus instances tree view* is done by clicking the hexagon [Q] icon in the activity bar.

More projects (directories) can be open at the same time. When editing alternately files from different projects the *Qorus instances tree view* changes accordingly.

The configuration file data structure is explained by the following example:

    {
        "qorus_instances": {
            "local": [
                {
                    "url": "http://localhost:8001",
                    "name": "main local Qorus instance",
                    "custom_urls": []
                },
                {
                    "url": "https://localhost:8011",
                    "name": "local Qorus instance"
                }
            ],
            "dev": [
                {
                    "url": "http://1.2.3.4:5678",
                    "name": "dev 1",
                    "custom_urls": [
                        {
                            "url": "sftp://abc@def/ghi",
                            "name": "abc"
                        },
                        {
                            "url": "sftp://xyz@uvw",
                            "name": "xyz"
                        }
                    ]
                },
                {
                    "url": "https://2.3.4.5:6789",
                    "name": "dev 2"
                }
            ]
        }
    }

The interpretation of the data is depicted by a tree with three levels:
- development **environments** (here '*local*' and '*dev*')
- - **Qorus instances** (here both environments have two Qorus instances)
- - - **URLs**: the Qorus instance "main" URL at the first position and then the custom URLs, if any (here only the '*dev 1*' Qorus instance in the '*dev*' environment has any custom URLs). Custom URLs are supposed to serve as shortcuts for opening project related sites - simply by clicking (the opening tool depends on the operating system).

The corresponding tree looks as follows:

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

### Deployment

There are three deployment actions:
- Deploy the file currently active in the editor. This is executed by the keyboard shortcut `Ctrl+Alt+o` (or find the command `Qorus: Deploy current file` in the command box)
- Deploy a single file from the context menu
- Deploy a directory from the context menu (deploy all deployable files in the directory including subdirectories)

The deployment is targeted to the Qorus instance that is currently set as **active**.
A Qorus instance can be set as active in the *Qorus instances tree view*, either from the context menu over a Qorus instance node (second level node) or simply by clicking the Qorus instance node directly. Active Qorus instance is marked by the green light icon. Of course, at most one Qorus instance can be active at a time, setting another instance active inactivates the instance that was active before.

### Login/Logout

If a Qorus instance requires authentication (and the user has not yet logged in that instance) the `Set as active Qorus instance` command opens a login dialog and after successful login the instance will be active.
Authentication tokens are stored, so next time login is not required.
(Tokens are stored only for the VSCode runtime, not persistently.)

The **context menus** over the *Qorus instance tree node*s offer also the following commands
- Login without setting the instance active
- Logout (if the instance was active it becomes inactive, of course)
- Set the instance inactive, but stay logged in

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
