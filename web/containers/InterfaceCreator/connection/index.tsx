import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import map from 'lodash/map';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import { useMount } from 'react-use';
import shortid from 'shortid';
import Field from '../../../components/Field';
import { getProtocol } from '../../../components/Field/urlField';
import FieldActions from '../../../components/FieldActions';
import FieldLabel from '../../../components/FieldLabel';
import Loader from '../../../components/Loader';
import { Messages } from '../../../constants/messages';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { validateField } from '../../../helpers/validations';
import { addMessageListener, postMessage } from '../../../hocomponents/withMessageHandler';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper, IField } from '../panel';

export interface IConnection {
    target_dir: string;
    target_file?: string;
    name: string;
    desc: string;
    url: string;
    connection_options?: { [key: string]: any };
}

export const ConnectionView = ({ onSubmitSuccess }) => {
    const { connection, confirmAction, callBackend } = useContext(InitialContext);
    const { resetAllInterfaceData, setConnectionReset } = useContext(GlobalContext);
    const t = useContext(TextContext);

    const [data, setData] = useState<IConnection>(connection || {});
    const [interfaceId, setInterfaceId] = useState(connection?.iface_id || shortid.generate());
    const [fields, setFields] = useState(undefined);

    const handleDataChange = (name: string, value: any) => {
        setData((cur) => {
            const result = { ...cur };

            result[name] = value;

            return result;
        });
    };

    useMount(() => {
        setConnectionReset(() => () => setData({}));

        addMessageListener(Messages.FIELDS_FETCHED, ({ fields }) => {
            setFields(fields);
        });

        postMessage(Messages.GET_FIELDS, { iface_kind: 'connection', is_editing: !!connection });
    });

    const reset = () => {
        setData(connection || {});
    };

    const isDataValid = () => {
        return (
            validateField('string', data.target_dir) &&
            validateField('string', data.name) &&
            validateField('string', data.desc) &&
            validateField('url', data.url) &&
            (!data.connection_options ||
                size(data.connection_options) === 0 ||
                validateField('options', data.connection_options))
        );
    };

    const handleSubmitClick = async () => {
        let fixedMetadata = { ...data };

        if (size(fixedMetadata.connection_options) === 0) {
            delete fixedMetadata.connection_options;
        }

        const result = await callBackend(
            connection ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
            undefined,
            {
                iface_kind: 'connection',
                iface_id: interfaceId,
                orig_data: connection,
                no_data_return: !!onSubmitSuccess,
                data: fixedMetadata,
            },
            t('SavingConnection...')
        );

        if (result.ok) {
            if (onSubmitSuccess) {
                onSubmitSuccess(data);
            }
            reset();
            resetAllInterfaceData('connection');
        }
    };

    if (!size(fields)) {
        return <Loader text={t('LoadingFields')} />;
    }

    return (
        <>
            <div style={{ flex: 1 }}>
                {map(fields, (field: IField) => (
                    <FieldWrapper>
                        <FieldLabel
                            label={t(`field-label-${field.name}`)}
                            info={
                                field.markdown
                                    ? t('MarkdownSupported')
                                    : field.mandatory === false
                                    ? t('Optional')
                                    : undefined
                            }
                            isValid={
                                field.mandatory !== false || data[field.name]
                                    ? validateField(field.type || 'string', data[field.name])
                                    : true
                            }
                        />
                        <FieldInputWrapper>
                            <Field {...field} value={data[field.name]} onChange={handleDataChange} />
                        </FieldInputWrapper>
                        <FieldActions desc={t(`field-desc-${field.name}`)} />
                    </FieldWrapper>
                ))}
                <FieldWrapper>
                    <FieldLabel label={t('field-label-url')} isValid={validateField('url', data.url)} />
                    <FieldInputWrapper>
                        <Field
                            type="url"
                            value={data.url}
                            url="options/remote?list"
                            onChange={handleDataChange}
                            name="url"
                        />
                    </FieldInputWrapper>
                    <FieldActions desc={t(`field-desc-url`)} />
                </FieldWrapper>
                {getProtocol(data.url) && (
                    <FieldWrapper>
                        <FieldLabel
                            label={t('field-label-options')}
                            info={t('Optional')}
                            isValid={
                                data.connection_options && size(data.connection_options)
                                    ? validateField('options', data.connection_options)
                                    : true
                            }
                        />
                        <FieldInputWrapper>
                            <Field
                                type="options"
                                value={data.connection_options}
                                url={`remote/${getProtocol(data.url)}`}
                                onChange={handleDataChange}
                                name="connection_options"
                            />
                        </FieldInputWrapper>
                        <FieldActions desc={t(`field-desc-connection_options`)} />
                    </FieldWrapper>
                )}
            </div>
            <ActionsWrapper>
                <ButtonGroup fill>
                    <Tooltip content={t('ResetTooltip')}>
                        <Button
                            text={t('Reset')}
                            icon={'history'}
                            onClick={() => {
                                confirmAction(
                                    'ResetFieldsConfirm',
                                    () => {
                                        reset();
                                    },
                                    'Reset',
                                    'warning'
                                );
                            }}
                        />
                    </Tooltip>
                    <Button
                        text={t('Submit')}
                        onClick={handleSubmitClick}
                        disabled={!isDataValid()}
                        icon={'tick'}
                        intent={Intent.SUCCESS}
                    />
                </ButtonGroup>
            </ActionsWrapper>
        </>
    );
};
