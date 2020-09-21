import { Callout } from '@blueprintjs/core';
import { omit } from 'lodash';
import React, { FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { AppToaster } from '../../components/Toast';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import MapperCreator from '../Mapper';
import InterfaceCreatorPanel, { IField } from './panel';

export const CreatorWrapper = styled.div`
    display: flex;
    flex: 1;
    flex-flow: row;
    overflow: hidden;
`;

export interface IMapperViewProps {
    t: TTranslator;
    mapper: any;
    isFormValid: (type: string) => boolean;
    inConnections?: boolean;
    isEditing?: boolean;
}

const MapperView: FunctionComponent<IMapperViewProps> = ({
    t,
    isFormValid,
    selectedFields,
    mapper,
    showMapperConnections,
    setShowMapperConnections,
    error,
    wrongKeysCount,
    qorus_instance,
    changeInitialData,
    inConnections,
    isEditing,
    ifaceType,
    interfaceContext,
    onSubmitSuccess,
}) => {
    if (!qorus_instance) {
        return (
            <Callout title={t('NoInstanceTitle')} icon="warning-sign" intent="warning">
                {t('NoInstance')}
            </Callout>
        );
    }

    useMount(() => {
        if (wrongKeysCount) {
            AppToaster.show({
                message: `${wrongKeysCount} ${t('IncorrectKeysRemoved')}`,
                intent: 'danger',
            });
        }
    });

    return error ? (
        <Callout intent="danger">{t(error)}</Callout>
    ) : (
        <>
            {!showMapperConnections && (
                <CreatorWrapper>
                    <InterfaceCreatorPanel
                        type={'mapper'}
                        submitLabel={t('Next')}
                        context={interfaceContext}
                        onSubmit={() => {
                            setShowMapperConnections(true);
                        }}
                        data={mapper && omit(mapper, ['connections'])}
                        isEditing={isEditing || !!mapper}
                        onDataFinishLoading={
                            mapper && mapper.show_diagram
                                ? () => {
                                      setShowMapperConnections(true);
                                  }
                                : null
                        }
                    />
                </CreatorWrapper>
            )}
            {showMapperConnections && (
                <MapperCreator
                    onBackClick={() => {
                        setShowMapperConnections(false);
                        if (!inConnections) {
                            changeInitialData('mapper.show_diagram', false);
                        }
                    }}
                    isFormValid={isFormValid('mapper')}
                    methods={selectedFields.mapper.find((field: IField) => field.name === 'functions')?.value}
                    context={selectedFields.mapper.find((field: IField) => field.name === 'context')?.value}
                    isEditing={isEditing || !!mapper}
                    onSubmitSuccess={onSubmitSuccess}
                />
            )}
        </>
    );
};

export default compose(
    withInitialDataConsumer(),
    mapProps(({ defaultMapper, initialData, ...rest }) => ({
        mapper: defaultMapper || initialData.mapper,
        qorus_instance: initialData.qorus_instance,
        changeInitialData: initialData.changeInitialData,
        ...rest,
    })),
    withTextContext(),
    withFieldsConsumer(),
    withMapperConsumer()
)(MapperView);
