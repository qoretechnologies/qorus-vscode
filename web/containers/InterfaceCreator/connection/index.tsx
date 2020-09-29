import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import { useMount } from 'react-use';
import shortid from 'shortid';
import Field from '../../../components/Field';
import { getProtocol } from '../../../components/Field/urlField';
import FieldActions from '../../../components/FieldActions';
import FieldLabel from '../../../components/FieldLabel';
import { Messages } from '../../../constants/messages';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { validateField } from '../../../helpers/validations';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper } from '../panel';

export interface IConnection {
    target_dir: string;
    target_file?: string;
    name: string;
    desc: string;
    connection_url: string;
    connection_options?: { [key: string]: any };
}

export const ConnectionView = ({ onSubmitSuccess }) => {
    const { connection, confirmAction, callBackend } = useContext(InitialContext);
    const { resetAllInterfaceData, setConnectionReset } = useContext(GlobalContext);
    const t = useContext(TextContext);

    const [data, setData] = useState<IConnection>(connection || {});
    const [interfaceId, setInterfaceId] = useState(connection?.iface_id || shortid.generate());

    const handleDataChange = (name: string, value: any) => {
        setData((cur) => {
            const result = { ...cur };

            result[name] = value;

            return result;
        });
    };

    useMount(() => {
        setConnectionReset(() => () => setData({}));
    });

    const reset = () => {
        setData(connection || {});
    };

    const isDataValid = () => {
        return (
            validateField('string', data.target_dir) &&
            validateField('string', data.target_file) &&
            validateField('string', data.name) &&
            validateField('string', data.desc) &&
            validateField('url', data.connection_url) &&
            (!data.connection_options ||
                size(data.connection_options) === 0 ||
                validateField('options', data.connection_options))
        );
    };

    const handleSubmitClick = async () => {
        let fixedMetadata = { ...data };

        if (size(fixedMetadata.options) === 0) {
            delete fixedMetadata.options;
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

    return (
        <>
            <div style={{ flex: 1 }}>
                <FieldWrapper>
                    <FieldLabel
                        label={t('field-label-target_dir')}
                        isValid={validateField('string', data.target_dir)}
                    />
                    <FieldInputWrapper>
                        <Field
                            type="file-string"
                            value={data.target_dir}
                            onChange={handleDataChange}
                            name="target_dir"
                            get_message={{
                                action: 'creator-get-directories',
                                object_type: 'target_dir',
                            }}
                            return_message={{
                                action: 'creator-return-directories',
                                object_type: 'target_dir',
                                return_value: 'directories',
                            }}
                        />
                    </FieldInputWrapper>
                    <FieldActions desc={t(`field-desc-target_dir`)} />
                </FieldWrapper>
                <FieldWrapper>
                    <FieldLabel
                        label={t('field-label-target_file')}
                        isValid={validateField('string', data.target_file)}
                    />
                    <FieldInputWrapper>
                        <Field type="string" value={data.target_file} onChange={handleDataChange} name="target_file" />
                    </FieldInputWrapper>
                    <FieldActions desc={t(`field-desc-target_file`)} />
                </FieldWrapper>
                <FieldWrapper>
                    <FieldLabel label={t('field-label-name')} isValid={validateField('string', data.name)} />
                    <FieldInputWrapper>
                        <Field type="string" value={data.name} onChange={handleDataChange} name="name" />
                    </FieldInputWrapper>
                    <FieldActions desc={t(`field-desc-name`)} />
                </FieldWrapper>
                <FieldWrapper>
                    <FieldLabel label={t('field-label-desc')} isValid={validateField('string', data.desc)} />
                    <FieldInputWrapper>
                        <Field type="long-string" value={data.desc} markdown onChange={handleDataChange} name="desc" />
                    </FieldInputWrapper>
                    <FieldActions desc={t(`field-desc-desc`)} />
                </FieldWrapper>
                <FieldWrapper>
                    <FieldLabel label={t('field-label-url')} isValid={validateField('url', data.connection_url)} />
                    <FieldInputWrapper>
                        <Field
                            type="url"
                            value={data.connection_url}
                            url="options/remote/user?list"
                            onChange={handleDataChange}
                            name="connection_url"
                        />
                    </FieldInputWrapper>
                    <FieldActions desc={t(`field-desc-connection_url`)} />
                </FieldWrapper>
                {getProtocol(data.connection_url) && (
                    <FieldWrapper>
                        <FieldLabel
                            label={t('field-label-options')}
                            info={t('Optional')}
                            isValid={
                                data.options && size(data.options)
                                    ? validateField('options', data.connection_options)
                                    : true
                            }
                        />
                        <FieldInputWrapper>
                            <Field
                                type="options"
                                value={data.connection_options}
                                url={`remote/user/${getProtocol(data.connection_url)}`}
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
