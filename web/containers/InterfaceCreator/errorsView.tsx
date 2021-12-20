import { Button, ButtonGroup } from '@blueprintjs/core';
import { omit, size } from 'lodash';
import React, { FunctionComponent, useContext, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import SidePanel from '../../components/SidePanel';
import { DraftsContext } from '../../context/drafts';
import { ErrorsContext } from '../../context/errors';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import InterfaceCreatorPanel, { ActionsWrapper, ContentWrapper } from './panel';

let hasAllMethodsLoaded: boolean;

export const MethodSelector = styled.div`
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding: 0px 10px;
  margin-bottom: 5px;
  border: 1px solid #eee;
  border-color: ${(props) => (props.active ? '#137cbd' : '#eee')};
  border-left-color: ${(props) => (props.valid ? '#0F9960' : '#DB3737')};
  border-left-width: 3px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s ease-in;
  position: relative;

  div.bp3-button-group {
    float: right;
  }

  &:hover {
    border-color: #137cbd;

    div:not(.bp3-button-group):first-child:not(:last-child) {
      right: 35px;
    }

    div:not(.bp3-button-group):last-child {
      opacity: 0.7;
      transform: translateY(-50%) rotateZ(45deg);

      &:after,
      &:before {
        background-color: #db3737;
      }
    }
  }
`;

export const Selected = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  width: 8px;
  height: 8px;
  transform: translateY(-50%);
  transition: all 0.3s ease-in;

  &:after,
  &:before {
    position: absolute;
    content: '';
    display: block;
  }

  &:after {
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 99px;
    background-color: #137cbd;
  }
`;

export const RemoveButton = styled.div`
  transition: all 0.3s ease-in;
  position: absolute;
  right: 5px;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  opacity: 0;

  &:after,
  &:before {
    position: absolute;
    content: '';
    display: block;
    background-color: #eee;
  }

  &:after {
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
  }

  &:before {
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 2px;
  }
`;

export const PanelWrapper = styled.div`
  margin-top: 10px;
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
    return () => {
      hasAllMethodsLoaded = false;
    };
  });

  return (
    <CreatorWrapper>
      <PanelWrapper>
        <div style={{ display: !showErrors ? 'flex' : 'none' }}>
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
          <SidePanel title={t('AddErrorsTitle')}>
            <ContentWrapper>
              {subErrors.map((method: { id: number; name?: string }, index: number) => (
                <MethodSelector
                  name={`select-error-${method.name}`}
                  key={method.id}
                  active={method.id === activeError}
                  valid={isSubItemValid(method.id, 'error', errorsIndex)}
                  onClick={() => setActiveError(method.id)}
                >
                  {method.name || `${t('Error')} ${method.id}`}
                  {method.id === activeError && (
                    <>
                      <Selected />
                    </>
                  )}
                  {errorsCount !== 1 && (
                    <RemoveButton
                      name={`remove-error-${method.name}`}
                      onClick={() => {
                        setSubErrors((current) =>
                          current.filter((currentMethod) => currentMethod.id !== method.id)
                        );
                        removeSubItemFromFields(method.id, 'error', errorsIndex);
                        setErrorsCount((current: number) => current - 1);
                      }}
                    />
                  )}
                </MethodSelector>
              ))}
            </ContentWrapper>
            <ActionsWrapper>
              <ButtonGroup fill>
                <Button
                  name={'add-error-button'}
                  text={t('AddError')}
                  icon={'plus'}
                  onClick={handleAddErrorClick}
                />
              </ButtonGroup>
            </ActionsWrapper>
          </SidePanel>
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
