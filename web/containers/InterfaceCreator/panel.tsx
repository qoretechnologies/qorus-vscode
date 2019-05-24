import React, { FunctionComponent, useState } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import { size, map, pickBy, filter, reduce } from 'lodash';
import SidePanel from '../../components/SidePanel';
import FieldSelector from '../../components/FieldSelector';
import Content from '../../components/Content';
import compose from 'recompose/compose';
import { TextContext } from '../../context/text';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import Field from '../../components/Field';

export interface IInterfaceCreatorPanel {
    type: string;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    t: TTranslator;
}

export interface IField {
    get_message?: { action: string; object_type: string; return_value?: string };
    return_message?: { action: string; object_type: string; return_value?: string };
    style?: string;
    type?: string;
    default_value?: string;
    values?: string[];
    prefill?: any;
    name: string;
    mandatory?: boolean;
    selected?: boolean;
}

const InterfaceCreatorPanel: FunctionComponent<IInterfaceCreatorPanel> = ({
    type,
    addMessageListener,
    postMessage,
    t,
}) => {
    const [fields, setFields] = useState<IField[]>([]);

    useEffectOnce(() => {
        addMessageListener(Messages.FIELDS_FETCHED, ({ fields }: { fields: IField[] }) => {
            // Set the preselected fields
            const transformedFields: IField[] = map(fields, (field: IField, fieldName: string) => ({
                ...field,
                name: fieldName,
                selected: field.mandatory !== false,
            }));
            // Save the fields
            setFields(transformedFields);
        });
        // Fetch the fields
        postMessage(Messages.GET_FIELDS, { iface_kind: type });
    });

    const addField: (fieldName: string) => void = fieldName => {
        // Remove the field
        setFields(current =>
            map(current, (field: IField) => ({
                ...field,
                selected: fieldName === field.name ? true : field.selected,
            }))
        );
    };

    const handleAddClick: (fieldName: string) => void = fieldName => {
        addField(fieldName);
    };

    if (!size(fields)) {
        return <p> Loading fields... </p>;
    }

    const fieldList: IField[] = filter(fields, (field: IField) => !field.selected);
    const selectedFields: IField[] = filter(fields, (field: IField) => field.selected);

    return (
        <>
            <SidePanel>
                {map(fieldList, (field: any) => (
                    <FieldSelector name={field.name} type={field.type} onClick={handleAddClick} />
                ))}
            </SidePanel>
            <Content>
                {map(selectedFields, (field: any) => (
                    <Field {...field} />
                ))}
            </Content>
        </>
    );
};

export default compose(
    withTextContext(),
    withMessageHandler()
)(InterfaceCreatorPanel);
