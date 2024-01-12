import { useReqoreProperty } from '@qoretechnologies/reqore';
import { useContext, useEffect, useState } from 'react';
import { Messages } from '../constants/messages';
import { DraftsContext, IDraftData } from '../context/drafts';
import { ErrorsContext } from '../context/errors';
import { FieldContext } from '../context/fields';
import { FunctionsContext } from '../context/functions';
import { InitialContext } from '../context/init';
import { MapperContext } from '../context/mapper';
import { MethodsContext } from '../context/methods';
import { StepsContext } from '../context/steps';
import { callBackendBasic, getDraftId, getTargetFile } from '../helpers/functions';

export const DraftsProvider = ({ children }: any) => {
  const [draft, setDraft] = useState<IDraftData>(null);
  const { setDraftData, draftData, changeTab, setLastDraft } = useContext(InitialContext);
  const { setInterfaceId, setFieldsFromDraft } = useContext(FieldContext);
  const { setMethodsFromDraft } = useContext(MethodsContext);
  const { setStepsFromDraft } = useContext(StepsContext);
  const { setFunctionsFromDraft } = useContext(FunctionsContext);
  const { setMapperFromDraft } = useContext(MapperContext);
  const { setErrorsFromDraft } = useContext(ErrorsContext);

  const addNotification = useReqoreProperty('addNotification');

  const addDraft = (draftData: IDraftData) => {
    setDraft(draftData);
  };

  const removeDraft = () => {
    setDraft(null);
    setDraftData(null);
  };

  useEffect(() => {
    const { type, id } = draftData || {};

    if (type && id) {
      (async () => {
        const fetchedDraft = await callBackendBasic(
          Messages.GET_DRAFT,
          undefined,
          {
            type,
            id,
          },
          null,
          addNotification,
          true
        );

        if (fetchedDraft.ok) {
          addDraft({ ...fetchedDraft.data });
          changeTab('CreateInterface', fetchedDraft.data.type);
          setDraftData(null);
        }
      })();
    }
  }, [draftData]);

  const maybeDeleteDraft = (interfaceKind: string, interfaceId: string) => {
    callBackendBasic(
      Messages.DELETE_DRAFT,
      undefined,
      {
        no_notify: true,
        interfaceKind,
        interfaceId,
      },
      null,
      addNotification,
      true
    );
  };

  const maybeApplyDraft = async (
    ifaceKind: string,
    draftData: IDraftData,
    existingInterface?: any,
    customFunction?: (draft: IDraftData) => void,
    applyClassConnectionsFunc?: Function,
    onFinish?: () => any
  ) => {
    const shouldApplyDraft = draftData ? true : draft?.type === ifaceKind;
    console.log({ existingInterface });
    // Check if draft for this interface kind exists
    if (shouldApplyDraft || getTargetFile(existingInterface)) {
      let draftToApply = draftData || draft;
      // Fetch the draft if the draft id is provided
      if (existingInterface) {
        console.log(getTargetFile(existingInterface));
        const fetchedDraft = await callBackendBasic(
          Messages.GET_DRAFT,
          undefined,
          {
            type: ifaceKind,
            id: getDraftId(existingInterface),
          },
          null,
          addNotification,
          true
        );

        if (fetchedDraft.ok && fetchedDraft.data) {
          draftToApply = fetchedDraft.data;
        } else {
          onFinish?.();
          return;
        }
      }

      const {
        type,
        id,
        fields,
        selectedFields,
        methods,
        selectedMethods,
        steps,
        diagram,
        classConnections,
      } = draftToApply;

      // Set the last saved draft with the interface id
      setLastDraft({ id, type });

      // If the custom function is provided, call it, remove the draft and stop here
      if (customFunction) {
        customFunction(draftToApply);
      } else {
        if (!existingInterface) {
          setInterfaceId(type, id);
        }

        if (type === 'service') {
          setMethodsFromDraft(selectedMethods);
          setFieldsFromDraft('service-methods', methods, selectedMethods);
        }

        if (type === 'mapper-code') {
          setFunctionsFromDraft(selectedMethods);
          setFieldsFromDraft('mapper-methods', methods, selectedMethods);
        }

        if (type === 'errors') {
          setErrorsFromDraft(selectedMethods);
          setFieldsFromDraft('error', methods, selectedMethods);
        }

        if (type === 'mapper') {
          setMapperFromDraft(diagram);
        }

        if (steps) {
          setStepsFromDraft(steps.steps, steps.stepsData, steps.lastStepId);
        }

        setFieldsFromDraft(type, fields, selectedFields);
      }

      if (classConnections) {
        applyClassConnectionsFunc?.(classConnections);
      }

      // Remove the draft
      removeDraft();
    }

    onFinish?.();
  };
  return (
    <DraftsContext.Provider
      value={{
        addDraft,
        removeDraft,
        maybeApplyDraft,
        maybeDeleteDraft,
        draft,
      }}
    >
      {children}
    </DraftsContext.Provider>
  );
};
