import React, { FunctionComponent, useContext } from 'react';

import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import size from 'lodash/size';

import { Button, ButtonGroup, Tooltip } from '@blueprintjs/core';

import { InitialContext } from '../../context/init';

const StyledFieldLabel = styled.div`
    padding: 0px 0 0 10px;
    flex: 0 1 auto;
    min-width: 80px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
`;

export interface IFieldActions {
    desc?: string;
    name: string;
    onClick: (name: string) => any;
    removable: boolean;
    value: any;
}

const FieldActions: FunctionComponent<IFieldActions> = ({ desc, name, onClick, removable, value }) => {
    const initContext = useContext(InitialContext);

    return (
        <StyledFieldLabel>
            <ButtonGroup minimal>
                {removable && (
                    <Button
                        icon={'trash'}
                        intent="danger"
                        onClick={() => {
                            if (onClick) {
                                if (size(value)) {
                                    initContext.confirmAction('ConfirmRemoveField', () => onClick(name));
                                } else {
                                    onClick(name);
                                }
                            }
                        }}
                    />
                )}
                {desc && (
                    <Tooltip content={<ReactMarkdown source={desc} />}>
                        <Button icon={'info-sign'} />
                    </Tooltip>
                )}
            </ButtonGroup>
        </StyledFieldLabel>
    );
};

export default FieldActions;
