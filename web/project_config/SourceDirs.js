import React from 'react';
import { Button, Classes, H4, HTMLTable, Intent, Popover } from "@blueprintjs/core";
import { T } from '../common/Translate';


export const SourceDirs = props => (
    <div className='config-item'>
        <HTMLTable condensed={true}>
            <thead>
                <tr>
                    <th colspan='2'>
                        <H4 className='fg-color'><T t='AddRemoveDir' /></H4>
                    </th>
                </tr>
            </thead>
            <tbody>
                {props.data.map(dir =>
                    <tr key={dir}>
                        <td style={{ minWidth: 120, paddingTop: 12 }}>
                            {dir}
                        </td>
                        <td>
                            <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
                                <Button icon='cross' minimal={true} title=<T t='Remove' /> />
                                <div>
                                    <T t='ConfirmRemoveDir' />
                                    <strong>{dir}</strong>?

                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 27 }}>
                                        <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                                            <T t='ButtonCancel' />
                                        </Button>
                                        <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS}
                                            onClick={props.removeSourceDir.bind(null, dir)}
                                        >
                                            <T t='ButtonDelete' />
                                        </Button>
                                    </div>
                                </div>
                            </Popover>
                        </td>
                    </tr>
                )}
                <tr>
                    <td />
                    <td style={{ paddingTop: 16 }}>
                        <Button
                            icon='plus'
                            minimal={true}
                            onClick={props.addSourceDir}
                            title=<T t='AddNew' />
                        />
                    </td>
                </tr>
            </tbody>
        </HTMLTable>
    </div>
);
