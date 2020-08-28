import React, {
    useContext, useEffect, useState
} from 'react';

import shortid from 'shortid';

import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';

import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import SelectField from '../../../components/Field/select';
import FieldLabel from '../../../components/FieldLabel';
import { Messages } from '../../../constants/messages';
import { TextContext } from '../../../context/text';
import { validateField } from '../../../helpers/validations';
import withMessageHandler from '../../../hocomponents/withMessageHandler';
import ConfigItemManager from '../../ConfigItemManager';
import ManageButton from '../../ConfigItemManager/manageButton';
import { ActionsWrapper, ContentWrapper, FieldInputWrapper, FieldWrapper } from '../panel';

const PipelineElementDialog = ({ onClose, data, parentData, onSubmit, interfaceId, postMessage, onlyQueue }) => {
    const t = useContext(TextContext);
    const [newData, setNewData] = useState(data);
    const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);

    useEffect(() => {
        if (newData.type === 'processor' && newData.name) {
            postMessage(Messages.GET_CONFIG_ITEMS, {
                iface_kind: 'pipeline',
                iface_id: interfaceId,
                processor_data: {
                    pid: newData.pid,
                    class_name: newData.name,
                },
            });
        }
    }, [newData.type, newData.name]);

    const handleDataUpdate = (name: string, value: any) => {
        setNewData((cur) => {
            const result = { ...cur };
            //* If the user is changing type, remove children and name
            if (name === 'type') {
                result.children = [];
                result._children = [];
                result.name = null;
                result.pid = undefined;
            }

            if (result.type === 'processor' && name === 'name') {
                // If the name matches the original name, use the original id
                // otherwise create a new unique id
                if (value === data?.name) {
                    result.pid = data.pid;
                } else {
                    result.pid = shortid.generate();
                }
            }

            return { ...result, [name]: value };
        });
    };

    const isDataValid = () => {
        if (newData.type === 'queue') {
            return true;
        }

        return validateField('string', newData.type) && validateField('string', newData.name);
    };

    return (
        <>
            <CustomDialog
                onClose={onClose}
                isOpen
                title={t('ManagePipeElement')}
                style={{ width: '50vw', paddingBottom: 0 }}
            >
                <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                    <ContentWrapper>
                        <FieldWrapper padded>
                            <FieldLabel label={t('Type')} isValid={validateField('string', newData.type)} />
                            <FieldInputWrapper>
                                <SelectField
                                    defaultItems={
                                        onlyQueue
                                            ? [{ name: 'queue' }]
                                            : [{ name: 'queue' }, { name: 'mapper' }, { name: 'processor' }]
                                    }
                                    onChange={handleDataUpdate}
                                    value={newData.type}
                                    name="type"
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        {newData?.type && newData.type !== 'queue' ? (
                            <FieldWrapper padded>
                                <FieldLabel label={t('Name')} isValid={validateField('string', newData.name)} />
                                <FieldInputWrapper>
                                    <SelectField
                                        key={newData.type}
                                        onChange={handleDataUpdate}
                                        value={newData.name}
                                        name="name"
                                        get_message={{
                                            action: 'creator-get-objects',
                                            object_type:
                                                newData.type === 'processor' ? 'class-with-processor' : newData.type,
                                        }}
                                        return_message={{
                                            action: 'creator-return-objects',
                                            object_type:
                                                newData.type === 'processor' ? 'class-with-processor' : newData.type,
                                            return_value: 'objects',
                                        }}
                                    />
                                </FieldInputWrapper>
                            </FieldWrapper>
                        ) : null}
                    </ContentWrapper>
                    <ActionsWrapper style={{ padding: '10px' }}>
                        <ButtonGroup fill>
                            <Tooltip content={t('ResetTooltip')}>
                                <Button
                                    text={t('Reset')}
                                    icon={'history'}
                                    onClick={() => {
                                        if (newData.type === 'processor' && newData.name) {
                                            postMessage(Messages.RESET_CONFIG_ITEMS, {
                                                iface_id: interfaceId,
                                                processor_id: newData.pid,
                                            });
                                        }
                                        setNewData(data);
                                    }}
                                />
                            </Tooltip>
                            {newData.type === 'processor' && newData.name ? (
                                <ManageButton
                                    type="pipeline"
                                    key={newData.type}
                                    onClick={() => setShowConfigItemsManager(true)}
                                />
                            ) : null}
                            <Button
                                text={t('Submit')}
                                disabled={!isDataValid()}
                                icon={'tick'}
                                name={`fsn-submit-state`}
                                intent={Intent.SUCCESS}
                                onClick={() => {
                                    if (newData.type === 'processor') {
                                        postMessage('submit-processor', {
                                            iface_id: interfaceId,
                                            processor_id: newData.pid,
                                        });
                                    }
                                    onSubmit(newData);
                                    onClose();
                                }}
                            />
                        </ButtonGroup>
                    </ActionsWrapper>
                </Content>
            </CustomDialog>
            {showConfigItemsManager && (
                <CustomDialog
                    isOpen
                    title={t('ConfigItemsManager')}
                    onClose={() => setShowConfigItemsManager(false)}
                    style={{ width: '80vw', backgroundColor: '#fff' }}
                >
                    <ConfigItemManager
                        type="pipeline"
                        processorData={{ pid: newData.pid, class_name: newData.name }}
                        interfaceId={interfaceId}
                        disableAdding
                    />
                </CustomDialog>
            )}
        </>
    );
};

export default withMessageHandler()(PipelineElementDialog);
