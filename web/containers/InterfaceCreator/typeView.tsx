import React, { useState } from 'react';
import { CreatorWrapper } from './mapperView';
import Suggest from '../../components/Field/suggest';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { StyledMapperWrapper, StyledFieldsWrapper } from '../Mapper';
import MapperFieldModal from '../Mapper/modal';
import withTextContext from '../../hocomponents/withTextContext';
import { ActionsWrapper } from './panel';
import { ButtonGroup, Tooltip, Button, Intent } from '@blueprintjs/core';
import { set, unset, get, size, map } from 'lodash';
import { flattenFields, getLastChildIndex } from '../../helpers/mapper';
import MapperOutput from '../Mapper/output';
import MapperInput from '../Mapper/input';

const TypeView = ({ initialData, t }) => {
    const [val, setVal] = useState('');
    const [types, setTypes] = useState([]);
    const [addDialog, setAddDialog] = useState({});
    const [fields, setFields] = useState({});

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

    const flattenedFields = flattenFields(fields);

    return (
        <>
            <Suggest defaultItems={types} value={val} onChange={(_name, value) => setVal(value)} />
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
                            //onClick={handleSubmitClick}
                            disabled={false}
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

export default compose(withInitialDataConsumer(), withTextContext())(TypeView);
