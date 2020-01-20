# qorus-vscode

A developer's front end for the Qorus Integration Engine.

https://qoretechnologies.com/qorus_integration_engine/

## Features

The extension makes it possible to remotely deploy Qorus interfaces directly from the Visual Studio Code editor.

## How to use

### Configuration data and corresponding tree view

In order to work with the extension, a project must be open in the VSCode editor. By project we mean the root directory of a project (e.g. the root of a git repository).

Next, in the root directory, there needs to be a project configuration file **qorusproject.json** describing development environments and Qorus instances used during the project development. If the configuration file **qorusproject.json** is not present, it can be generated from a template so that the user can simply edit its contents seeing the required structure. Creation of the configuration file is offered in the context menu over each file and each folder within the project.

Based on the configuration file contents, *Qorus Instances* tree view is provided in the explorer pane. Switching to the *Qorus Instances* tree view is done by clicking the hexagon [Q] (Qorus) icon in the activity bar.

Multiple projects (directories) can be opened at the same time. While alternately editing files from different projects the *Qorus Instances* tree view changes accordingly.

The configuration file structure is explained by the following example:

```
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
```

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

### Deployment

There are several possible deployment methods:
- Deploy the file currently active in the editor. This can be done using keyboard shortcut `Ctrl+Alt+o` or by using command `Qorus: Deploy current file` from the Command Palette.
- Use the `Qorus: Deploy file` command from a file's context menu (in the Explorer view).
- Use the `Qorus: Deploy directory` command from a directory's context menu (deploys all deployable files in the directory including subdirectories).
- Use the *Deploy* buttons shown when hovering mouse cursor over an interface or a directory in the *Qorus Interfaces* tree view.

The deployment is targeted to a Qorus instance that is currently set as **active**.

A Qorus instance can be set as active in the *Qorus Instances* tree view, either from the context menu of a Qorus instance node (second level node) or simply by clicking a Qorus instance node directly.

Active Qorus instance is marked by a green light icon. At most one Qorus instance can be active at a time. Setting another instance active deactivates the previously active instance.

### Login/Logout

If a Qorus instance requires authentication (and the user has not yet logged in that instance) the `Set as active Qorus instance` command opens a login dialog. After a successful login, the instance will become active.

Authentication tokens are stored, so that next time logging-in is not required.
(Tokens are only stored in memory while VSCode is running, not persistently.)

Context menus of instances in the *Qorus Instances* tree view contain also the following commands:
- Login without setting the instance active.
- Logout (if the instance was active it becomes inactive).
- Set the instance inactive while staying logged in.
