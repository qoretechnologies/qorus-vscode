import React, { useContext, useState } from 'react';
import { TTrigger } from '.';
import CustomDialog from '../../../components/CustomDialog';
import { TextContext } from '../../../context/text';
import { FieldWrapper, FieldInputWrapper, ContentWrapper, ActionsWrapper } from '../panel';
import FieldLabel from '../../../components/FieldLabel';
import Spacer from '../../../components/Spacer';
import { validateField } from '../../../helpers/validations';
import RadioField from '../../../components/Field/radioField';
import Content from '../../../components/Content';
import { Intent, ButtonGroup, Tooltip, Button, Callout } from '@blueprintjs/core';
import SelectField from '../../../components/Field/select';
import ConnectorSelector from './connectorSelector';
import { IManageDialog } from '../../ClassConnectionsManager/diagram';
import { FieldContext } from '../../../context/fields';
import size from 'lodash/size';
import map from 'lodash/map';
import { InitialContext } from '../../../context/init';

export interface IFSMTriggerDialogProps {
    index?: number;
    data?: TTrigger;
    onSubmit: (data: TTrigger, index?: number) => any;
    onClose: any;
    ifaceType?: string;
    methodsCount?: number;
    methods?: any[];
    baseClassName?: string;
}

const FSMTriggerDialog: React.FC<IFSMTriggerDialogProps> = ({
    index,
    data,
    onSubmit,
    onClose,
    ifaceType = 'service',
    methodsCount,
    baseClassName,
}) => {
    const t = useContext(TextContext);
    const initialData = useContext(InitialContext);
    const { requestInterfaceData } = useContext(FieldContext);

    console.log(requestInterfaceData('service-methods'));

    const getBaseClassName = () => {
        return requestInterfaceData(ifaceType, 'base-class-name');
    };

    const getMethods: () => { name: string }[] = () => {
        const methods = requestInterfaceData('service-methods') || {};
        // If the methods are empty, check if there are methos in the initial data
        if (!size(methods) && size(initialData.service?.methods)) {
            return initialData.service.methods;
        }

        return map(methods, (method) => {
            const isValid = method.find((field) => field.isValid === true);

            if (isValid) {
                const name = method.find((field) => field.name === 'name').value;
                return { name };
            }

            return undefined;
        }).filter((v) => v);
    };

    const getTriggerType = (data: TTrigger): 'trigger' | 'event-connector' =>
        data.method ? 'trigger' : 'event-connector';

    const [triggerType, setTriggerType] = useState<'trigger' | 'event-connector'>(getTriggerType(data || {}));
    const [newData, setNewData] = useState<TTrigger>(data || {});

    const handleDataUpdate = (name: string, value: string) => {
        if (name === 'method') {
            setNewData({
                method: value,
            });
        } else {
            setNewData(value);
        }
    };

    const isTriggerValid = (): boolean => {
        if (newData.method) {
            return validateField('string', newData.method);
        } else if (newData.connector) {
            return !!newData.connector && !!newData['class'];
        }

        return false;
    };

    const renderTriggerField = () => {
        if (triggerType === 'trigger') {
            const methods = getMethods();
            console.log(getBaseClassName());
            return (
                <>
                    {ifaceType === 'service' && methodsCount === 0 && (
                        <Callout intent="warning">{t('TriggerNoMethodsAvailable')}</Callout>
                    )}
                    {(ifaceType !== 'service' || size(methods) !== 0) && (
                        <SelectField
                            get_message={
                                ifaceType !== 'service' && {
                                    action: 'get-triggers',
                                    message_data: {
                                        iface_kind: ifaceType,
                                        'base-class-name': baseClassName,
                                    },
                                }
                            }
                            return_message={
                                ifaceType !== 'service' && {
                                    action: 'return-triggers',
                                    return_value: 'data.triggers',
                                }
                            }
                            defaultItems={ifaceType === 'service' && methods}
                            value={newData.method}
                            onChange={handleDataUpdate}
                            name="method"
                            fill
                        />
                    )}
                </>
            );
        }

        return (
            <ConnectorSelector
                value={newData}
                onChange={(value) => handleDataUpdate('connector', value)}
                types={['event']}
            />
        );
    };

    return (
        <CustomDialog onClose={onClose} isOpen title={t('TriggerManager')} style={{ width: '80vw', paddingBottom: 0 }}>
            <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                <ContentWrapper>
                    <FieldWrapper padded>
                        <FieldLabel label={t('Trigger')} isValid={isTriggerValid()} />
                        <FieldInputWrapper>
                            <RadioField
                                name="conditionType"
                                onChange={(_name, value) => {
                                    setNewData({});
                                    setTriggerType(value);
                                }}
                                value={triggerType}
                                items={[{ value: 'event-connector' }, { value: 'trigger' }]}
                            />
                            <Spacer size={20} />
                            {renderTriggerField()}
                        </FieldInputWrapper>
                    </FieldWrapper>
                </ContentWrapper>
                <ActionsWrapper style={{ padding: '10px' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button text={t('Reset')} icon={'history'} onClick={() => setNewData(data || {})} />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            disabled={!isTriggerValid()}
                            icon={'tick'}
                            name={`fsm-submit-trigger`}
                            intent={Intent.SUCCESS}
                            onClick={() => {
                                onSubmit(newData, index);
                                onClose();
                            }}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default FSMTriggerDialog;
