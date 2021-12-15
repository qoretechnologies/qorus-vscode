import { Button, ButtonGroup } from '@blueprintjs/core';
import { omit, size } from 'lodash';
import React, { FunctionComponent, useContext, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import SidePanel from '../../components/SidePanel';
import { DraftsContext } from '../../context/drafts';
import { FunctionsContext } from '../../context/functions';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import InterfaceCreatorPanel, { ActionsWrapper, ContentWrapper } from './panel';

const MethodSelector = styled.div`
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

  &:hover {
    border-color: #137cbd;

    div:first-child:not(:last-child) {
      right: 35px;
    }

    div:last-child {
      opacity: 0.7;
      transform: translateY(-50%) rotateZ(45deg);

      &:after,
      &:before {
        background-color: #db3737;
      }
    }
  }
`;

const Selected = styled.div`
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

const RemoveButton = styled.div`
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

const PanelWrapper = styled.div`
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

export interface ILibraryView {
  targetDir: string;
  t: TTranslator;
  isSubItemValid: any;
  removeSubItemFromFields: any;
  initialData: any;
  interfaceId: { [key: string]: string };
}

const LibraryView: FunctionComponent<ILibraryView> = ({
  t,
  isSubItemValid,
  removeSubItemFromFields,
  initialData: { 'mapper-code': library, lang_client_unavailable },
  interfaceId,
  onSubmitSuccess,
}) => {
  const [interfaceIndex, setInterfaceIndex] = useState(size(interfaceId['mapper-code']));
  const [methodsIndex, setMethodIndex] = useState(size(interfaceId['mapper-methods']));
  const { maybeApplyDraft, draft } = useContext(DraftsContext);
  const {
    showFunctions,
    functions,
    setActiveFunction,
    activeFunction,
    functionsCount,
    setFunctions,
    setFunctionsCount,
    handleAddFunctionClick,
    setShowFunctions,
    functionsData,
  }: any = React.useContext(FunctionsContext);

  useUpdateEffect(() => {
    if (draft && showFunctions) {
      maybeApplyDraft('mapper-code', null, library);
    }
  }, [draft, showFunctions]);

  return (
    <CreatorWrapper>
      <PanelWrapper>
        {!showFunctions && (
          <InterfaceCreatorPanel
            type="mapper-code"
            submitLabel={t('Next')}
            onSubmit={() => {
              setActiveFunction(1);
              setShowFunctions(true);
            }}
            interfaceIndex={interfaceIndex}
            data={library && omit(library, 'functions')}
            isEditing={!!library}
            onDataFinishLoading={
              library && activeFunction
                ? () => {
                    setShowFunctions(true);
                  }
                : null
            }
          />
        )}
        {showFunctions && (
          <>
            <SidePanel title={t('AddFunctionsTitle')}>
              <ContentWrapper>
                {functions.map((fun: { id: number; name?: string }, index: number) => (
                  <MethodSelector
                    key={fun.id}
                    active={fun.id === activeFunction}
                    valid={isSubItemValid(fun.id, 'mapper-methods', methodsIndex)}
                    onClick={() => setActiveFunction(fun.id)}
                  >
                    {fun.name || `${t('Method')} ${fun.id}`}
                    {fun.id === activeFunction && (
                      <>
                        <Selected />
                      </>
                    )}
                    {functionsCount !== 1 && !lang_client_unavailable ? (
                      <RemoveButton
                        onClick={() => {
                          setFunctions((current) =>
                            current.filter((currentFunction) => currentFunction.id !== fun.id)
                          );
                          removeSubItemFromFields(fun.id, 'mapper-methods', methodsIndex);
                          setFunctionsCount((current: number) => current - 1);
                        }}
                      />
                    ) : null}
                  </MethodSelector>
                ))}
              </ContentWrapper>
              <ActionsWrapper>
                <ButtonGroup fill>
                  <Button
                    text={t('AddFunction')}
                    icon={'plus'}
                    onClick={handleAddFunctionClick}
                    disabled={lang_client_unavailable}
                  />
                </ButtonGroup>
              </ActionsWrapper>
            </SidePanel>
            <InterfaceCreatorPanel
              interfaceIndex={methodsIndex}
              stepOneTitle={t('SelectFieldsSecondStep')}
              stepTwoTitle={t('FillDataThirdStep')}
              onBackClick={() => {
                setActiveFunction(null);
                setShowFunctions(false);
              }}
              initialInterfaceId={
                library ? library.interfaceId : interfaceId['mapper-code'][interfaceIndex]
              }
              type="mapper-methods"
              activeId={activeFunction}
              isEditing={!!library}
              allMethodsData={functionsData}
              methodsList={functions}
              onSubmitSuccess={onSubmitSuccess}
              data={functionsData && functionsData.find((fun) => fun.id === activeFunction)}
              parentData={library}
              onNameChange={(functionId: number, name: string) => {
                setFunctions((currentFunctions: { id: number; name: string }[]) =>
                  currentFunctions.reduce((cur, fun: { id: number; name: string }) => {
                    if (functionId === fun.id) {
                      fun.name = name;
                    }

                    return [...cur, fun];
                  }, [])
                );
              }}
            />
          </>
        )}
      </PanelWrapper>
    </CreatorWrapper>
  );
};

export default compose(
  withTextContext(),
  withFieldsConsumer(),
  withInitialDataConsumer()
)(LibraryView);
