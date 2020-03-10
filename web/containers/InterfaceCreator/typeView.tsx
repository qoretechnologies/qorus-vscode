import React, { useState } from 'react';
import Suggest from '../../components/Field/suggest';
import FileField from '../../components/Field/fileString';
import String from '../../components/Field/string';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { StyledMapperWrapper, StyledFieldsWrapper } from '../Mapper';
import MapperFieldModal from '../Mapper/modal';
import withTextContext from '../../hocomponents/withTextContext';
import { ActionsWrapper, FieldWrapper, FieldInputWrapper } from './panel';
import { ButtonGroup, Tooltip, Button, Intent } from '@blueprintjs/core';
import { set, unset, get, size, map } from 'lodash';
import { flattenFields, getLastChildIndex, filterInternalData } from '../../helpers/mapper';
import MapperInput from '../Mapper/input';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import FieldLabel from '../../components/FieldLabel';
import { validateField } from '../../helpers/validations';

const TypeView = ({ initialData, t, postMessage }) => {
    const [val, setVal] = useState(initialData?.type?.path || '');
    const [types, setTypes] = useState([]);
    const [addDialog, setAddDialog] = useState({});
    const [fields, setFields] = useState(initialData?.type?.typeinfo?.fields || {});
    const [targetDir, setTargetDir] = useState(initialData?.type?.target_dir || '');
    const [targetFile, setTargetFile] = useState(initialData?.type?.target_file || '');

    useMount(() => {
        (async () => {
            const data = await initialData.fetchData('/system/metadata/types');
            setTypes(data.data);
        })();
    });

    const reset = () => {
        setVal('');
        setAddDialog({});
        setFields({});
        setTargetDir('');
        setTargetFile('');
    };

    const addField = (path, data) => {
        // Set the new fields
        setFields(current => {
            // Clone the current fields
            const result: any = { ...current };
            // If we are adding field to the top
            if (path === '') {
                // Simply add the field
                result[data.name] = data;
                return result;
            }
            // Build the path
            const fields: string[] = path.split('.');
            let newPath: string;
            fields.forEach(fieldName => {
                if (!newPath) {
                    newPath = fieldName;
                } else {
                    newPath += `.type.fields.${fieldName}`;
                }
            });
            // Get the object at the exact path
            const obj: any = get(result, newPath);
            // Add new object
            obj.type.fields[data.name] = data;
            // Return new data
            return result;
        });
    };

    const editField = (path, data, remove?: boolean) => {
        // Set the new fields
        setFields(current => {
            // Clone the current fields
            const result: any = { ...current };
            // Build the path
            const fields: string[] = path.split('.');
            let newPath: string;
            fields.forEach(fieldName => {
                if (!newPath) {
                    newPath = fieldName;
                } else {
                    newPath += `.type.fields.${fieldName}`;
                }
            });
            // Get the object at the exact path
            if (remove) {
                unset(result, newPath);
            } else {
                set(result, newPath, data);
            }
            // Return new data
            return result;
        });
    };

    const handleClick = (field?: any, edit?: boolean, remove?: boolean): void => {
        if (remove) {
            editField(field.path, null, true);
        } else {
            setAddDialog({
                isOpen: true,
                siblings: field ? field?.type?.fields : fields,
                fieldData: edit ? field : null,
                isParentCustom: field?.isCustom,
                onSubmit: data => {
                    if (edit) {
                        editField(field.path, data);
                    } else {
                        addField(field?.path || '', data);
                    }
                },
            });
        }
    };

    const handleSubmitClick = () => {
        postMessage(initialData.type ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE, {
            iface_kind: 'type',
            orig_data: initialData.type,
            data: {
                target_dir: targetDir,
                target_file: targetFile,
                path: val,
                typeinfo: {
                    base_type: 'hash<auto>',
                    can_manage_fields: true,
                    fields,
                },
            },
        });
        reset();
    };

    const flattenedFields = flattenFields(fields);

    return (
        <>
            <FieldWrapper>
                <FieldLabel label={t('TargetDir')} info={t('Optional')} isValid />
                <FieldInputWrapper>
                    <FileField
                        onChange={(_name, value) => setTargetDir(value)}
                        name="target-dir"
                        value={targetDir}
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
            </FieldWrapper>
            <FieldWrapper>
                <FieldLabel label={t('field-label-target_file')} info={t('Optional')} isValid />
                <FieldInputWrapper>
                    <String onChange={(_name, value) => setTargetFile(value)} name="target-dir" value={targetFile} />
                </FieldInputWrapper>
            </FieldWrapper>
            <FieldWrapper>
                <FieldLabel label={t('Path')} isValid={validateField('string', val)} />
                <FieldInputWrapper>
                    <Suggest defaultItems={types} value={val} onChange={(_name, value) => setVal(value)} />
                </FieldInputWrapper>
            </FieldWrapper>
            <div
                style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: 10,
                    flex: 1,
                    overflow: 'auto',
                    background: `url(${
                        process.env.NODE_ENV === 'development'
                            ? `http://localhost:9876/images/tiny_grid.png`
                            : `vscode-resource:${initialData.path}/images/tiny_grid.png)`
                    }`,
                }}
            >
                <StyledMapperWrapper style={{ justifyContent: 'center', paddingTop: '10px' }}>
                    <StyledFieldsWrapper style={{ flex: '0 1 auto' }}>
                        {size(flattenedFields) !== 0
                            ? map(flattenedFields, (input, index) => (
                                  <MapperInput
                                      key={input.path}
                                      name={input.name}
                                      types={input.type.types_returned}
                                      {...input}
                                      field={input}
                                      id={index + 1}
                                      lastChildIndex={getLastChildIndex(input, flattenedFields) - index}
                                      onClick={handleClick}
                                      hasAvailableOutput={true}
                                  />
                              ))
                            : null}
                        <Button
                            fill
                            text={t('AddNewField')}
                            minimal
                            intent="success"
                            icon="add"
                            onClick={() => handleClick()}
                        />
                    </StyledFieldsWrapper>
                </StyledMapperWrapper>
            </div>
            <ActionsWrapper>
                <div style={{ float: 'right', width: '100%' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button text={t('Reset')} icon={'history'} onClick={reset} />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            onClick={handleSubmitClick}
                            disabled={!(size(fields) && validateField('string', val))}
                            icon={'tick'}
                            intent={Intent.SUCCESS}
                        />
                    </ButtonGroup>
                </div>
            </ActionsWrapper>
            {addDialog.isOpen && <MapperFieldModal t={t} onClose={() => setAddDialog({})} {...addDialog} />}
        </>
    );
};

export default compose(withInitialDataConsumer(), withTextContext(), withMessageHandler())(TypeView);
