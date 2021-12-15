import { Callout } from '@blueprintjs/core';
import { omit, size } from 'lodash';
import React, { FunctionComponent, useContext, useState } from 'react';
import { useDebounce, useLifecycles, useUpdateEffect } from 'react-use';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { AppToaster } from '../../components/Toast';
import { DraftsContext } from '../../context/drafts';
import { getDraftId } from '../../helpers/functions';
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
  isFormValid: (type: string, interfaceIndex?: number) => boolean;
  inConnections?: boolean;
  isEditing?: boolean;
}

const MapperView: FunctionComponent<IMapperViewProps> = ({
  t,
  isFormValid,
  selectedFields,
  mapper,
  initialData,
  fields,
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
  interfaceId,
  mapperData,
}) => {
  const { maybeApplyDraft, draft } = useContext(DraftsContext);

  if (!qorus_instance) {
    return (
      <Callout title={t('NoInstanceTitle')} icon="warning-sign" intent="warning">
        {t('NoInstance')}
      </Callout>
    );
  }

  const [interfaceIndex] = useState(size(interfaceId.mapper));

  useLifecycles(
    () => {
      if (wrongKeysCount) {
        AppToaster.show({
          message: `${wrongKeysCount} ${t('IncorrectKeysRemoved')}`,
          intent: 'danger',
        });
      }
    },
    () => {
      setShowMapperConnections(false);
    }
  );

  useUpdateEffect(() => {
    if (draft && showMapperConnections) {
      console.log('APPLYING DRAFT FROM MAPPER VIEW');
      maybeApplyDraft('mapper', null, mapper);
    }
  }, [draft, showMapperConnections]);

  useDebounce(
    () => {
      if (showMapperConnections) {
        const draftId = getDraftId(mapper, interfaceId.mapper[interfaceIndex]);

        initialData.saveDraft('mapper', draftId, {
          fields: fields.mapper[interfaceIndex],
          selectedFields: selectedFields.mapper[interfaceIndex],
          diagram: mapperData,
          interfaceId,
          associatedInterface: mapper?.yaml_file,
          isValid: isFormValid('mapper', interfaceIndex) && size(mapperData.relations),
        });
      }
    },
    1500,
    [JSON.stringify(mapperData)]
  );

  return error ? (
    <Callout intent="danger">{t(error)}</Callout>
  ) : (
    <>
      {!showMapperConnections && (
        <CreatorWrapper>
          <InterfaceCreatorPanel
            type={'mapper'}
            interfaceIndex={interfaceIndex}
            submitLabel={t('Next')}
            context={interfaceContext}
            onSubmit={() => {
              setShowMapperConnections(true);
            }}
            data={mapper && omit(mapper, ['connections'])}
            isEditing={isEditing || !!mapper}
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
          isFormValid={isFormValid('mapper', interfaceIndex)}
          methods={selectedFields.mapper.find((field: IField) => field.name === 'functions')?.value}
          context={selectedFields.mapper.find((field: IField) => field.name === 'context')?.value}
          isEditing={isEditing || !!mapper}
          onSubmitSuccess={onSubmitSuccess}
          interfaceIndex={interfaceIndex}
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
    initialData,
    ...rest,
  })),
  withTextContext(),
  withFieldsConsumer(),
  withMapperConsumer()
)(MapperView);
