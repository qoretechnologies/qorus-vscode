import {
  ReqoreHorizontalSpacer,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
} from '@qoretechnologies/reqore';
import { omit, size } from 'lodash';
import React, { FunctionComponent, useContext, useState } from 'react';
import { useMount, useUnmount, useUpdateEffect } from 'react-use';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { PositiveColorEffect } from '../../components/Field/multiPair';
import SidePanel from '../../components/SidePanel';
import { DraftsContext } from '../../context/drafts';
import { FunctionsContext } from '../../context/functions';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import InterfaceCreatorPanel from './panel';
import { MethodSelector } from './servicesView';

let hasAllMethodsLoaded: boolean;

const PanelWrapper = styled.div`
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
  initialData: { 'mapper-code': library },
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
    initialShowFunctions,
    lastFunctionId,
    initialActiveFunction,
  }: any = React.useContext(FunctionsContext);

  useUpdateEffect(() => {
    if (draft && showFunctions) {
      maybeApplyDraft('mapper-code', null, library);
    }
  }, [draft, showFunctions]);

  /*
  Using the useMount hook to run a function when the component is mounted.
  */
  useMount(() => {
    hasAllMethodsLoaded = false;
  });

  useUnmount(() => {
    hasAllMethodsLoaded = false;
  });

  return (
    <CreatorWrapper>
      <PanelWrapper>
        <div style={{ display: !showFunctions ? 'flex' : 'none', width: '100%' }}>
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
              library && initialShowFunctions
                ? () => {
                    setShowFunctions(true);
                  }
                : null
            }
          />
        </div>
        <div style={{ display: showFunctions ? 'flex' : 'none', width: '100%' }}>
          <SidePanel>
            <ReqoreMenu style={{ flex: 1 }} width="250px" rounded>
              <ReqoreMenuDivider label={t('AddFunctionsTitle')} />
              <ReqoreMenuItem
                icon={'MenuAddLine'}
                onClick={handleAddFunctionClick}
                tooltip={t('AddFunction')}
                effect={PositiveColorEffect}
              >
                {t('Add Method')}
              </ReqoreMenuItem>
              {functions.map((fun: { id: number; name?: string }, index: number) => (
                <MethodSelector
                  key={fun.id}
                  selected={fun.id === activeFunction}
                  isValid={isSubItemValid(fun.id, 'mapper-methods', methodsIndex)}
                  onClick={() => setActiveFunction(fun.id)}
                  onRemoveClick={
                    functionsCount !== 1
                      ? () => {
                          setFunctions((current) =>
                            current.filter((currentFunction) => currentFunction.id !== fun.id)
                          );
                          removeSubItemFromFields(fun.id, 'mapper-methods', methodsIndex);
                          setFunctionsCount((current: number) => current - 1);
                        }
                      : undefined
                  }
                >
                  {fun.name || `${t('Method')} ${fun.id}`}
                </MethodSelector>
              ))}
            </ReqoreMenu>
          </SidePanel>
          <ReqoreHorizontalSpacer width={10} />
          <InterfaceCreatorPanel
            interfaceIndex={methodsIndex}
            stepOneTitle={t('SelectFieldsSecondStep')}
            stepTwoTitle={t('FillDataThirdStep')}
            onBackClick={() => {
              hasAllMethodsLoaded = false;
              setActiveFunction(1);
              setShowFunctions(false);
            }}
            initialInterfaceId={
              library ? library.interfaceId : interfaceId['mapper-code'][interfaceIndex]
            }
            onDataFinishLoadingRecur={(id) => {
              if (!hasAllMethodsLoaded) {
                if ((id || 1) + 1 <= lastFunctionId && !hasAllMethodsLoaded) {
                  setActiveFunction(id + 1);
                } else {
                  hasAllMethodsLoaded = true;
                  setActiveFunction(initialActiveFunction);
                }
              }
            }}
            type="mapper-methods"
            activeId={activeFunction}
            isEditing={!!library}
            allMethodsData={functionsData}
            methodsList={functions}
            onSubmitSuccess={onSubmitSuccess}
            onSubmit={() => {
              hasAllMethodsLoaded = false;
            }}
            forceSubmit
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
        </div>
      </PanelWrapper>
    </CreatorWrapper>
  );
};

export default compose(
  withTextContext(),
  withFieldsConsumer(),
  withInitialDataConsumer()
)(LibraryView);
