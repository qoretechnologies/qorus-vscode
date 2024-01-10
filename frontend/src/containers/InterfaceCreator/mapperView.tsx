import { ReqoreMessage, ReqoreVerticalSpacer, useReqore } from '@qoretechnologies/reqore';
import { cloneDeep, omit, size } from 'lodash';
import { FunctionComponent, useContext, useState } from 'react';
import { useLifecycles, useUpdateEffect } from 'react-use';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField } from '../../components/FieldWrapper';
import { DraftsContext } from '../../context/drafts';
import { getDraftId } from '../../helpers/functions';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import MapperCreator from '../Mapper';
import InterfaceCreatorPanel from './panel';

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
  inputsError,
  outputsError,
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
  inputsLoading,
  outputsLoading,
  initialMapperDraftData,
}) => {
  const { maybeApplyDraft, draft } = useContext(DraftsContext);
  const { addNotification } = useReqore();

  if (!qorus_instance) {
    return (
      <ReqoreMessage title={t('NoInstanceTitle')} intent="warning">
        {t('NoInstance')}
      </ReqoreMessage>
    );
  }

  const [interfaceIndex] = useState(size(interfaceId.mapper));

  useLifecycles(
    () => {
      if (wrongKeysCount) {
        addNotification({
          content: `${wrongKeysCount} ${t('IncorrectKeysRemoved')}`,
          intent: 'danger',
        });
      }
    },
    () => {
      setShowMapperConnections(false);
    }
  );

  const fixedOptions = omit(mapper?.options, ['mapper-input', 'mapper-output']);
  const newMapper = cloneDeep(mapper);

  if (newMapper) {
    newMapper.mapper_options = size(fixedOptions) ? fixedOptions : undefined;

    if (!size(newMapper.mapper_options)) {
      delete newMapper.mapper_options;
    }
  }

  useUpdateEffect(() => {
    if (draft && showMapperConnections) {
      maybeApplyDraft('mapper', null, newMapper);
    }
  }, [draft, showMapperConnections]);

  useUpdateEffect(() => {
    if (showMapperConnections && !inputsLoading && !outputsLoading) {
      const draftId = getDraftId(mapper, interfaceId.mapper[interfaceIndex]);

      initialData.saveDraft('mapper', draftId, {
        fields: fields.mapper[interfaceIndex],
        selectedFields: selectedFields.mapper[interfaceIndex],
        diagram: mapperData,
      });
    }
  }, [JSON.stringify(omit(mapperData, ['isContextLoaded']))]);

  return (
    <>
      {inputsError && <ReqoreMessage intent="warning">{t(inputsError)}</ReqoreMessage>}
      {outputsError && <ReqoreMessage intent="warning">{t(outputsError)}</ReqoreMessage>}
      {inputsError || outputsError ? <ReqoreVerticalSpacer height={10} /> : null}
      {!showMapperConnections && (
        <CreatorWrapper>
          <InterfaceCreatorPanel
            type={'mapper'}
            interfaceIndex={interfaceIndex}
            submitLabel={t('Next')}
            context={interfaceContext}
            disabledSubmit={inputsLoading || outputsLoading}
            onSubmit={() => {
              setShowMapperConnections(true);
            }}
            data={newMapper && omit(newMapper, ['connections'])}
            isEditing={isEditing || !!newMapper}
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
          methods={
            selectedFields.mapper[interfaceIndex].find(
              (field: IField) => field.name === 'functions'
            )?.value
          }
          context={
            selectedFields.mapper[interfaceIndex].find((field: IField) => field.name === 'context')
              ?.value
          }
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
