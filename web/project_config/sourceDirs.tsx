import React, { FunctionComponent, useContext, useState } from 'react';

import size from 'lodash/size';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import compose from 'recompose/compose';
import styled from 'styled-components';

import { Button, Icon } from '@blueprintjs/core';

import { TTranslator } from '../App';
import CustomDialog from '../components/CustomDialog';
import TreeField from '../components/Field/tree';
import Loader from '../components/Loader';
import { Messages } from '../constants/messages';
import { InitialContext } from '../context/init';
import withMessageHandler, { TMessageListener, TPostMessage } from '../hocomponents/withMessageHandler';
import withTextContext from '../hocomponents/withTextContext';
import { StyledNoData } from './environment';

const StyledDirWrapper = styled.div`
    min-width: 300px;
    padding: 10px;
    padding-bottom: 0;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;

    p {
        line-height: 30px;
        border-bottom: 1px solid #eee;

        .bp3-icon {
            opacity: 0.7;
            margin-right: 10px;
        }
    }
`;

const StyledDirHeader = styled.h3`
    margin: 0;
    padding: 10px;
    color: #444;
    background-color: #eee;
`;

export interface ISourceDirectoriesProps {
    onSubmitClick: (folder: string) => void;
    onDeleteClick: (folder: string) => void;
    onClose: (event: any) => void;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    t: TTranslator;
}

const SourceDirectories: FunctionComponent<ISourceDirectoriesProps> = ({
    onSubmitClick,
    onDeleteClick,
    onClose,
    addMessageListener,
    postMessage,
    t,
}) => {
    const [sourceDirs, setSourceDirs] = useState<string[]>(null);
    const initContext = useContext(InitialContext);

    useEffectOnce(() => {
        // Update the source dirs on message
        addMessageListener(Messages.CONFIG_RETURN_DATA, ({ data }) => {
            setSourceDirs(data.source_directories);
        });
        // Get the config data, so we can get the
        // source directories
        postMessage(Messages.CONFIG_GET_DATA);
    });

    return (
        <CustomDialog
            isOpen
            icon="folder-close"
            onClose={onClose}
            title={t('ManageSourceDirectories')}
            style={{ backgroundColor: '#fff' }}
        >
            {!sourceDirs ? (
                <Loader text="Loading..." />
            ) : (
                <>
                    <StyledDirHeader>
                        <Icon icon="dot" /> {t('MyDirectories')}
                    </StyledDirHeader>
                    <StyledDirWrapper>
                        {size(sourceDirs) ? (
                            sourceDirs.map(dir => (
                                <p key={dir}>
                                    <Icon icon="folder-close" />
                                    {dir}
                                    <Button
                                        minimal
                                        small
                                        icon="trash"
                                        intent="danger"
                                        onClick={() =>
                                            initContext.confirmAction('ConfirmRemoveSourceDir', () =>
                                                onDeleteClick(dir)
                                            )
                                        }
                                        style={{ marginTop: '3px', float: 'right' }}
                                    />
                                </p>
                            ))
                        ) : (
                            <StyledNoData>
                                <Icon icon="disable" iconSize={16} /> {t('NoDirectories')}
                            </StyledNoData>
                        )}
                    </StyledDirWrapper>
                    <StyledDirHeader>
                        <Icon icon="dot" /> {t('AddSourceDirectory')}
                    </StyledDirHeader>
                    <StyledDirWrapper>
                        <TreeField
                            onChange={(_name, value) => onSubmitClick(value.map(path => path.name || path))}
                            value={sourceDirs.map(dir => ({ name: dir }))}
                            useRelativePath
                            get_message={{
                                action: Messages.GET_PROJECT_DIRS,
                            }}
                            return_message={{
                                action: Messages.RETURN_PROJECT_DIRS,
                                return_value: 'directories',
                            }}
                        />
                    </StyledDirWrapper>
                </>
            )}
        </CustomDialog>
    );
};

export default compose(withTextContext(), withMessageHandler())(SourceDirectories);
