import React from 'react';
import { Button, Classes, H4, HTMLTable, Intent, Popover } from '@blueprintjs/core';
import withTextContext from '../hocomponents/withTextContext';

export const SourceDirs = withTextContext()(props => (
    <>
        <HTMLTable condensed={true}>
            <thead>
                <tr>
                    <th colspan='2'>
                        <H4 className='fg-color'>{props.t('AddRemoveDir')}</H4>
                    </th>
                </tr>
            </thead>
            <tbody>
                {props.data.map(dir => (
                    <tr key={dir}>
                        <td style={{ minWidth: 120, paddingTop: 12 }}>
                            <span className='fg-color'>{dir}</span>
                        </td>
                        <td>
                            <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
                                <Button icon='cross' minimal={true} title={props.t('Remove')} />
                                <div>
                                    {props.t('ConfirmRemoveDir')}
                                    <strong>{dir}</strong>?
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 27 }}>
                                        <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                                            {props.t('ButtonCancel')}
                                        </Button>
                                        <Button
                                            intent={Intent.DANGER}
                                            className={Classes.POPOVER_DISMISS}
                                            onClick={props.removeSourceDir.bind(null, dir)}
                                        >
                                            {props.t('ButtonDelete')}
                                        </Button>
                                    </div>
                                </div>
                            </Popover>
                        </td>
                    </tr>
                ))}
                <tr>
                    <td />
                    <td style={{ paddingTop: 16 }}>
                        <Button icon='plus' minimal={true} onClick={props.addSourceDir} title={props.t('AddNew')} />
                    </td>
                </tr>
            </tbody>
        </HTMLTable>
    </>
));
