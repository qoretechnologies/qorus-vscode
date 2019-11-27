import React, { FC, useState, useCallback, FormEvent } from 'react';
import { Button, Dialog, ButtonGroup, InputGroup, Intent, Classes, Tooltip } from '@blueprintjs/core';
import { TTranslator } from '../../App';
import Box from '../../components/ResponsiveBox';
import set from 'lodash/set';
import size from 'lodash/size';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import String from '../../components/Field/string';
import {
    ContentWrapper,
    FieldWrapper,
    FieldInputWrapper,
    ActionsWrapper,
    SearchWrapper,
} from '../InterfaceCreator/panel';
import FieldLabel from '../../components/FieldLabel';
import { validateField } from '../../helpers/validations';
import SelectField from '../../components/Field/select';
import Pull from '../../components/Pull';
import useMount from 'react-use/lib/useMount';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import BooleanField from '../../components/Field/boolean';
import Content from '../../components/Content';
import SidePanel from '../../components/SidePanel';
import { type } from 'os';
import FieldSelector from '../../components/FieldSelector';
import { types } from 'react-markdown';
import Field from '../../components/Field';
import FieldActions from '../../components/FieldActions';

export interface IMapperFieldModalProps {
    onClose: () => any;
    onSubmit: (data: any) => any;
    t: TTranslator;
    initialData: any;
    relationData: any;
    mapperKeys: any;
    output: any;
}

const MapperFieldModal: FC<IMapperFieldModalProps> = ({
    onClose,
    relationData,
    mapperKeys,
    t,
    initialData,
    onSubmit,
    output,
}) => {
    const [relation, setRelation] = useState(relationData || {});

    const handleChange: (key: string, value: any) => void = (key, value) => {
        setRelation(current => {
            const newField = { ...current };
            newField[key] = value;
            return newField;
        });
    };

    const isFieldValid: () => boolean = () => {
        //const isNameValid: boolean = validateField('string', field.name) && isUnique(field.name);

        return true;
    };

    const handleSubmit = () => {
        // Submit the field
        onSubmit(relation);
        onClose();
    };

    const handleAddClick = (name: string) => {
        setRelation(current => ({
            ...current,
            [name]: null,
        }));
    };

    const handleRemoveClick = (name: string) => {
        setRelation(current => {
            const result = { ...current };
            delete result[name];
            return result;
        });
    };

    const uniqueRoles: string[] = reduce(
        relation,
        (roles, _value, key) => (mapperKeys[key].unique_roles ? [...roles, ...mapperKeys[key].unique_roles] : roles),
        []
    );

    const isKeyDisabled = (name: string): boolean => {
        const roles: string[] = mapperKeys[name].unique_roles;
        // If the roles list does not exist
        if (!roles) {
            // This field can be added except if there is a
            // key with * role
            return uniqueRoles.includes('*');
        }
        // Check if this key can be added solely
        else if (roles.includes('*')) {
            // This key can only be added if there is no
            // other key yet added
            return size(relation) > 0;
        } else {
            // Check if none of the keys roles & a * role isn't
            // yet included
            return !roles.every(role => !uniqueRoles.includes(role)) || uniqueRoles.includes('*');
        }
    };

    const getKeyType = (key: string): string => {
        return mapperKeys[key].value_type === 'any' ? output.type.base_type : mapperKeys[key].value_type;
    };

    return (
        <Dialog isOpen title={t('ManageOutputMapping')} onClose={onClose} style={{ paddingBottom: 0, width: '70vw' }}>
            <Box top fill scrollY style={{ flexFlow: 'row' }}>
                <SidePanel title={t('AddValue')}>
                    <ContentWrapper>
                        {map(mapperKeys, (field: any, fieldName: string) => (
                            <FieldSelector
                                name={fieldName}
                                type={getKeyType(fieldName)}
                                disabled={isKeyDisabled(fieldName)}
                                onClick={handleAddClick}
                            />
                        ))}
                    </ContentWrapper>
                </SidePanel>
                <Content title={t('FillValues')} style={{ height: 'unset' }}>
                    <ContentWrapper>
                        {size(relation) ? (
                            map(relation, (value: any, key: string) => (
                                <FieldWrapper>
                                    <FieldLabel
                                        label={t(`field-label-${key}`)}
                                        isValid={validateField(getKeyType(key), value)}
                                    />
                                    <FieldInputWrapper>
                                        <Field
                                            name={key}
                                            value={value}
                                            type="auto"
                                            defaultType={getKeyType(key)}
                                            onChange={handleChange}
                                        />
                                    </FieldInputWrapper>
                                    <FieldActions name={key} onClick={handleRemoveClick} removable />
                                </FieldWrapper>
                            ))
                        ) : (
                            <p className={Classes.TEXT_MUTED}>No fields available</p>
                        )}
                    </ContentWrapper>

                    <ActionsWrapper style={{ marginTop: 20 }}>
                        <ButtonGroup fill>
                            <Button text="Reset" icon="history" onClick={() => {}} />
                            <Button
                                intent="success"
                                text="Submit"
                                icon="small-tick"
                                disabled={!isFieldValid()}
                                onClick={handleSubmit}
                            />
                        </ButtonGroup>
                    </ActionsWrapper>
                </Content>
            </Box>
        </Dialog>
    );
};

export default withInitialDataConsumer()(MapperFieldModal);
