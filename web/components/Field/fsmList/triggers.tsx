import React, {
    ReactNode, useContext
} from 'react';

import { Button, Classes, Tag } from '@blueprintjs/core';

import { TTrigger } from '../../../containers/InterfaceCreator/fsm';
import { TextContext } from '../../../context/text';
import { getTriggerName } from './';

export interface IFSMListTriggersProps {
    triggers: TTrigger[];
    setTriggerManager: any;
    handleTriggerRemove: (name: ReactNode, fsmIndex: number) => any;
    fsmIndex: number;
    disabled: boolean;
}

const IFSMListTriggers: React.FC<IFSMListTriggersProps> = ({
    triggers = [],
    setTriggerManager,
    handleTriggerRemove,
    fsmIndex,
    disabled,
}) => {
    const t = useContext(TextContext);

    return (
        <>
            {triggers.length === 0 && <span className={Classes.TEXT_MUTED}>{t('NoTriggersYet')}</span>}{' '}
            {triggers.map((trigger: TTrigger, index: number) => (
                <>
                    <Tag
                        large
                        interactive
                        intent="none"
                        minimal
                        onClick={() => {
                            setTriggerManager({ isOpen: true, data: trigger, fsmIndex, index });
                        }}
                        onRemove={(e, props) => {
                            e.stopPropagation();
                            handleTriggerRemove(props.children, fsmIndex);
                        }}
                    >
                        {getTriggerName(trigger)}
                    </Tag>{' '}
                </>
            ))}
            <Button
                icon="add"
                intent="success"
                disabled={disabled}
                onClick={() => setTriggerManager({ isOpen: true, fsmIndex })}
            />
        </>
    );
};

export default IFSMListTriggers;
