import {
  ReqoreHorizontalSpacer,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
} from '@qoretechnologies/reqore';
import { omit, size } from 'lodash';
import { FunctionComponent, useContext, useState } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { PositiveColorEffect } from '../../components/Field/multiPair';
import SidePanel from '../../components/SidePanel';
import { DraftsContext } from '../../context/drafts';
import { ErrorsContext } from '../../context/errors';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import InterfaceCreatorPanel from './panel';
import { MethodSelector } from './servicesView';

let hasAllMethodsLoaded: boolean;

export const PanelWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const CreatorWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-flow: column;
  overflow: hidden;
`;

export interface IServicesView {
  targetDir: string;
  t: TTranslator;
  isSubItemValid: any;
  removeSubItemFromFields: any;
  service: any;
  interfaceId: { [key: string]: string };
}

const ServicesView: FunctionComponent<IServicesView> = ({
  t,
  isSubItemValid,
  removeSubItemFromFields,
  errors,
  onSubmitSuccess,
  interfaceId,
}) => {
  const [errorIndex, setErrorIndex] = useState(size(interfaceId.error));
  const [errorsIndex, setErrorsIndex] = useState(size(interfaceId['errors']));
  const { maybeApplyDraft, draft } = useContext(DraftsContext);
  const {
    showErrors,
    setShowErrors,
    subErrors,
    handleAddErrorClick,
    errorsCount,
    activeError,
    setActiveError,
    setSubErrors,
    setErrorsCount,
    errorsData,
    resetErrors,
    lastErrorId,
    initialActiveError,
  }: any = useContext(ErrorsContext);

  useUpdateEffect(() => {
    if (draft && showErrors) {
      maybeApplyDraft('errors', null, errors);
    }
  }, [draft, showErrors]);

  useMount(() => {
    hasAllMethodsLoaded = false;
  });

  useUnmount(() => {
    hasAllMethodsLoaded = false;
  });

  return (
    <CreatorWrapper>
      <PanelWrapper>
        <div style={{ display: !showErrors ? 'flex' : 'none', width: '100%' }}>
          <InterfaceCreatorPanel
            type={'errors'}
            submitLabel={t('Next')}
            onSubmit={() => {
              setActiveError(1);
              setShowErrors(true);
            }}
            interfaceIndex={errorIndex}
            data={errors && omit(errors, 'error')}
            isEditing={!!errors}
          />
        </div>
        <div style={{ display: showErrors ? 'flex' : 'none', width: '100%' }}>
          <SidePanel>
            <ReqoreMenu style={{ flex: 1 }} width="250px" rounded>
              <ReqoreMenuDivider label={t('AddErrorsTitle')} />
              <ReqoreMenuItem
                icon={'MenuAddLine'}
                onClick={handleAddErrorClick}
                tooltip={t('AddError')}
                effect={PositiveColorEffect}
              >
                {t('AddError')}
              </ReqoreMenuItem>
              {subErrors.map((method: { id: number; name?: string }, index: number) => (
                <MethodSelector
                  key={method.id}
                  selected={method.id === activeError}
                  isValid={isSubItemValid(method.id, 'error', errorsIndex)}
                  onClick={() => setActiveError(method.id)}
                  onRemoveClick={
                    errorsCount !== 1
                      ? () => {
                          setSubErrors((current) =>
                            current.filter((currentMethod) => currentMethod.id !== method.id)
                          );
                          removeSubItemFromFields(method.id, 'error', errorsIndex);
                          setErrorsCount((current: number) => current - 1);
                        }
                      : undefined
                  }
                >
                  {method.name || `${t('Error')} ${method.id}`}
                </MethodSelector>
              ))}
            </ReqoreMenu>
          </SidePanel>
          <ReqoreHorizontalSpacer width={10} />
          <InterfaceCreatorPanel
            stepOneTitle={t('SelectFieldsSecondStep')}
            stepTwoTitle={t('FillDataThirdStep')}
            interfaceIndex={errorsIndex}
            onBackClick={() => {
              hasAllMethodsLoaded = false;
              setActiveError(null);
              setShowErrors(false);
            }}
            onDataFinishLoadingRecur={(id) => {
              if (!hasAllMethodsLoaded) {
                if ((id || 1) + 1 <= lastErrorId && !hasAllMethodsLoaded) {
                  setActiveError(id + 1);
                } else {
                  hasAllMethodsLoaded = true;
                  setActiveError(initialActiveError);
                }
              }
            }}
            initialInterfaceId={errors ? errors.iface_id : interfaceId.errors[errorIndex]}
            type={'error'}
            activeId={activeError}
            isEditing={!!errors}
            allMethodsData={errorsData}
            methodsList={subErrors}
            onSubmitSuccess={onSubmitSuccess}
            onSubmit={() => {
              hasAllMethodsLoaded = false;
            }}
            forceSubmit
            data={errorsData && errorsData.find((method) => method.id === activeError)}
            parentData={errors}
            onNameChange={(methodId: number, name: string) => {
              setSubErrors((currentMethods: { id: number; name: string }[]) =>
                currentMethods.reduce((cur, method: { id: number; name: string }) => {
                  if (methodId === method.id) {
                    method.name = name;
                  }

                  return [...cur, method];
                }, [])
              );
            }}
          />
        </div>
      </PanelWrapper>
    </CreatorWrapper>
  );
};

export default compose(
  withTextContext(),
  withFieldsConsumer(),
  withInitialDataConsumer()
)(ServicesView);
