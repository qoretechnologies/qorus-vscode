import React, { FC, useState, useCallback, FormEvent } from 'react';
import { Button, Dialog, ButtonGroup, InputGroup, Intent, Classes, Tooltip } from '@blueprintjs/core';
import { TTranslator } from '../../App';
import Box from '../../components/ResponsiveBox';
import set from 'lodash/set';
import size from 'lodash/size';
import map from 'lodash/map';
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

export interface IMapperFieldModalProps {
    onClose: () => any;
    onSubmit: (data: any) => any;
    t: TTranslator;
    initialData: any;
    relationData: any;
    mapperKeys: any;
}

const MapperFieldModal: FC<IMapperFieldModalProps> = ({
    onClose,
    relationData,
    mapperKeys,
    t,
    initialData,
    onSubmit,
}) => {
    const [relation, setRelation] = useState(relationData || {});

    const onChange: (key: string, value: any) => void = (key, value) => {
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

    const handleAddClick = () => {
        console.log();
    };

    return (
        <Dialog isOpen title={t('AddNewField')} onClose={onClose} style={{ paddingBottom: 0 }}>
            <Box top fill scrollY>
                <SidePanel title={t('AddValue')}>
                    <ContentWrapper>
                        {map(mapperKeys, (field: any, fieldName: string) => (
                            <FieldSelector
                                name={fieldName}
                                type={field.value_type}
                                disabled={false}
                                onClick={handleAddClick}
                            />
                        ))}
                    </ContentWrapper>
                </SidePanel>
                <Content>
                    <ContentWrapper>
                        <>
                            <FieldWrapper>
                                <FieldLabel label={t(`field-label-name`)} isValid={false} />
                                <FieldInputWrapper>
                                    <String onChange={onChange} name="name" value={relation.name} />
                                </FieldInputWrapper>
                            </FieldWrapper>
                        </>
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
