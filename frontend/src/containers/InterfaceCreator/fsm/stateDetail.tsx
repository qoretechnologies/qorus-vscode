import {
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTag,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { IReqoreTagProps } from '@qoretechnologies/reqore/dist/components/Tag';
import { camelCase, isEqual, reduce, size } from 'lodash';
import { memo, useCallback, useContext, useState } from 'react';
import { useDebounce, useUnmount, useUpdateEffect } from 'react-use';
import { IFSMMetadata, IFSMState, IFSMStates, TAppAndAction, TFSMVariables } from '.';
import {
  NegativeColorEffect,
  PositiveColorEffect,
  WarningColorEffect,
} from '../../../components/Field/multiPair';
import { InputOutputType } from '../../../components/InputOutputType';
import { TextContext } from '../../../context/text';
import {
  isFSMActionValid,
  isFSMBlockConfigValid,
  isFSMNameValid,
  isStateValid,
} from '../../../helpers/fsm';
import { postMessage } from '../../../hocomponents/withMessageHandler';
import { useFetchActionOptions } from '../../../hooks/useFetchActionOptions';
import { useFetchAutoVarContext } from '../../../hooks/useFetchAutoVarContext';
import { useGetAppActionData } from '../../../hooks/useGetAppActionData';
import { EditableMessage } from './LabelEditor';
import FSMStateDialog, { TAction } from './stateDialog';
import { FSMItemIconByType } from './toolbarItem';
import FSMTransitionOrderDialog from './transitionOrderDialog';

export interface IFSMStateDetailProps {
  id: string | number;
  interfaceId: string;
  data: IFSMState;
  metadata: Partial<IFSMMetadata>;
  states: IFSMStates;
  inputProvider?: any;
  outputProvider?: any;
  activeTab?: string;
  onClose: () => void;
  onSubmit: (data: Partial<IFSMState>, addNewStateOnSuccess?: boolean) => void;
  onDelete: (unfilled?: boolean) => void;
  onSavedStatusChanged?: (hasSaved: boolean) => void;
}

export const FSMStateDetail = memo(
  ({
    data,
    onClose,
    onSubmit,
    onDelete,
    onSavedStatusChanged,
    activeTab,
    inputProvider,
    outputProvider,
    metadata,
    states,
    id,
    interfaceId,
  }: IFSMStateDetailProps) => {
    const t = useContext(TextContext);
    const confirmAction = useReqoreProperty('confirmAction');
    const [dataToSubmit, setDataToSubmit] = useState<IFSMState>(data);
    const [hasSaved, setHasSaved] = useState<boolean>(true);
    const { app, action } = useGetAppActionData(
      (dataToSubmit?.action?.value as TAppAndAction)?.app,
      (dataToSubmit?.action?.value as TAppAndAction)?.action
    );
    const [blockLogicType, setBlockLogicType] = useState<'fsm' | 'custom'>(
      data.fsm ? 'fsm' : 'custom'
    );
    const [actionType, setActionType] = useState<TAction>(data?.action?.type || 'none');

    const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(false);
    const [isSubmitLoading, setIsLoading] = useState<boolean>(false);

    const {
      load,
      loading,
      data: optionsSchema,
    } = useFetchActionOptions({
      action,
      options: (dataToSubmit?.action?.value as TAppAndAction)?.options,
    });

    const autoVars = useFetchAutoVarContext(
      dataToSubmit['block-config']?.['data-provider']?.value,
      'transaction-block'
    );

    useUpdateEffect(() => {
      if (!isEqual(data, dataToSubmit)) {
        load();
        setHasSaved(false);
      }
    }, [dataToSubmit]);

    useUpdateEffect(() => {
      //onSavedStatusChanged?.(hasSaved);
    }, [hasSaved]);

    useUnmount(() => {
      onSavedStatusChanged?.(true);
    });

    const isLoading = isSubmitLoading || autoVars.loading || loading;

    const isDataValid = useCallback(() => {
      if (
        autoVars.loading ||
        (dataToSubmit['block-type'] === 'transaction' && !size(autoVars.value))
      ) {
        return false;
      }

      if (isLoading) {
        return false;
      }

      return isStateValid(dataToSubmit, metadata, optionsSchema);
    }, [autoVars.loading, JSON.stringify(dataToSubmit), JSON.stringify(optionsSchema), isLoading]);

    useDebounce(
      () => {
        if (isDataValid() && !isCustomBlockFirstPage() && !hasSaved) {
          handleSubmitClick();
        }
      },
      100,
      [dataToSubmit, isDataValid(), hasSaved]
    );

    const handleClose = () => {
      if (isLoading) {
        confirmAction({
          title: 'Action in progress',
          intent: 'warning',
          description:
            'There is an action in progress. Are you sure you want to close this action detail?',
          onConfirm: onClose,
        });

        return;
      }

      if (!hasSaved) {
        confirmAction({
          title: 'Unsaved changes',
          intent: 'warning',
          description:
            'You have unsaved changes. Are you sure you want to close this action detail?',
          onConfirm: onClose,
        });

        return;
      }

      onClose();
    };

    const updateSubmitData = (data: Partial<IFSMState>) => {
      setDataToSubmit((cur) => ({ ...cur, ...data }));
    };

    const isCustomBlockFirstPage = () => {
      return !isMetadataHidden && dataToSubmit.type === 'block' && blockLogicType === 'custom';
    };

    const isCustomBlockSecondPage = () => {
      return isMetadataHidden && dataToSubmit.type === 'block' && blockLogicType === 'custom';
    };

    const handleSubmitClick = (addNewStateOnSuccess?: boolean) => {
      if (!isCustomBlockFirstPage()) {
        setIsLoading(true);

        postMessage?.('submit-fsm-state', {
          iface_id: interfaceId,
          state_id: dataToSubmit.id,
        });

        const modifiedData: IFSMState = { ...dataToSubmit };

        modifiedData.isValid = true;

        if (blockLogicType === 'custom') {
          modifiedData.fsm = undefined;
        } else {
          modifiedData.states = undefined;
        }

        if (modifiedData.execution_order === null) {
          delete modifiedData.execution_order;
        }

        if (modifiedData.type === 'block' && !modifiedData['block-type']) {
          modifiedData['block-type'] = 'for';
        }

        if (modifiedData.type === 'if' && !modifiedData['input-output-type']) {
          delete modifiedData['input-output-type'];
        }

        if (!size(modifiedData['block-config'])) {
          delete modifiedData['block-config'];
        }

        modifiedData.globalvar = reduce<TFSMVariables, TFSMVariables>(
          modifiedData.globalvar,
          (newGlobal, val, key): TFSMVariables => {
            if (!val.readOnly) {
              return {
                ...newGlobal,
                [key]: val,
              };
            }

            return newGlobal;
          },
          {}
        );

        if (!size(modifiedData.globalvar)) {
          delete modifiedData.globalvar;
        }

        if (size(autoVars.value)) {
          modifiedData.autovar = autoVars.value;
        }

        if (modifiedData.action?.type === 'appaction') {
          // Check if all options have a value
          const { options } = modifiedData.action.value as TAppAndAction;

          if (options) {
            modifiedData.action.value = {
              ...(modifiedData.action.value as TAppAndAction),
              options: reduce(
                options,
                (newOptions, option, optionName) => {
                  if (option.value !== undefined) {
                    return {
                      ...newOptions,
                      [optionName]: option,
                    };
                  }

                  return newOptions;
                },
                {}
              ),
            };
          }
        }

        onSubmit(modifiedData, addNewStateOnSuccess);

        setIsLoading(false);
        setHasSaved(true);
      } else {
        setIsMetadataHidden(true);
      }
    };

    return (
      <ReqorePanel
        flat
        label={data.name}
        onClose={handleClose}
        className="fsm-state-detail"
        resizable={{
          enable: {
            left: true,
          },
          minWidth: 500,
          defaultSize: {
            width: dataToSubmit.type === 'block' ? '85%' : '500px',
            height: '100%',
          },
        }}
        icon={FSMItemIconByType[dataToSubmit?.action?.type || dataToSubmit?.type]}
        iconImage={app?.logo}
        iconProps={{
          rounded: true,
          size: '35px',
        }}
        padded={false}
        onLabelEdit={(name) => updateSubmitData({ name: name.toString() })}
        transparent
        responsiveActions={false}
        responsiveTitle={false}
        style={{ paddingLeft: 10, borderLeft: '1px dashed #cccccc30', borderRadius: 0 }}
        contentStyle={{
          display: 'flex',
          flexFlow: 'column',
          overflow: 'hidden',
        }}
        actions={[
          {
            as: ReqoreTag,
            show: hasSaved,
            props: {
              label: 'Saved',
              minimal: true,
              theme: { main: 'transparent' },
              flat: true,
              asBadge: true,
              icon: 'CheckLine',
              iconColor: 'success:lighten',
              className: 'state-saved-flag',
            } as IReqoreTagProps,
          },
        ]}
        bottomActions={[
          {
            tooltip: t('Delete state'),
            effect: NegativeColorEffect,
            className: 'state-delete-button',
            icon: 'DeleteBinLine',
            onClick: onDelete,
          },
          {
            show: isCustomBlockFirstPage(),
            label: !isFSMBlockConfigValid(dataToSubmit) ? t('Fix to proceed') : t('Next'),
            disabled: !isFSMBlockConfigValid(dataToSubmit),
            className: 'state-next-button',
            icon: !isFSMBlockConfigValid(dataToSubmit)
              ? 'ErrorWarningLine'
              : 'ArrowRightCircleLine',
            effect: PositiveColorEffect,
            position: 'right',
            onClick: () => setIsMetadataHidden(true),
          },
          {
            label: isLoading
              ? undefined
              : !isDataValid()
              ? 'Fix to save'
              : hasSaved
              ? undefined
              : t(`Save`),
            disabled: !isDataValid() || isLoading,
            show: (isLoading || !isDataValid()) && !isCustomBlockFirstPage(),
            className: 'state-submit-button',
            id: `state-${camelCase(dataToSubmit?.name)}-submit-button`,
            icon: isLoading ? 'Loader5Line' : !isDataValid() ? 'ErrorWarningLine' : undefined,
            leftIconProps: {
              animation: isLoading ? 'spin' : isDataValid() ? 'heartbeat' : undefined,
            },
            customTheme: { main: 'transparent' },
            effect: isLoading ? undefined : !isDataValid() ? WarningColorEffect : undefined,
            position: 'right',
            responsive: false,
          },
        ]}
      >
        <EditableMessage
          size="small"
          contentEffect={{
            color: '#d7d7d7',
          }}
          asMarkdown
          content={data.desc || t('No description')}
          onEdit={(desc) => updateSubmitData({ desc: desc.toString() })}
        />
        <ReqoreVerticalSpacer height={10} />
        <ReqoreTabs
          fill
          fillParent
          tabs={[
            { label: 'Configuration', id: 'configuration', icon: 'SettingsLine' },
            { label: 'Types', id: 'info', icon: 'InformationLine', disabled: data.isNew },
            {
              label: 'Transitions',
              id: 'transitions',
              icon: 'LinksLine',
              badge: size(data.transitions),
              disabled: data.isNew,
            },
          ]}
          activeTab={activeTab}
          tabsPadding="top"
          padded={false}
          style={{ overflow: 'hidden' }}
        >
          <ReqoreTabsContent tabId="info">
            <InputOutputType inputProvider={inputProvider} outputProvider={outputProvider} />
          </ReqoreTabsContent>

          <ReqoreTabsContent tabId="configuration">
            <FSMStateDialog
              key={data.id}
              actionType={actionType}
              setActionType={setActionType}
              fsmName={metadata.name}
              target_dir={metadata.target_dir}
              metadata={metadata}
              blockLogicType={blockLogicType}
              setBlockLogicType={setBlockLogicType}
              isNameValid={isFSMNameValid(dataToSubmit.name)}
              isActionValid={isFSMActionValid(dataToSubmit, actionType, metadata)}
              isCustomBlockSecondPage={isCustomBlockSecondPage()}
              isMetadataHidden={isMetadataHidden}
              setIsMetadataHidden={setIsMetadataHidden}
              isLoading={isLoading}
              onSubmit={(_id, data) => {
                updateSubmitData(data);
              }}
              data={dataToSubmit}
              id={id.toString()}
              deleteState={(_id, unfilled) => onDelete(unfilled)}
              interfaceId={interfaceId}
              otherStates={reduce(
                states,
                (newStates, localState, sid) =>
                  sid === id ? { ...newStates } : { ...newStates, [sid]: localState },
                {}
              )}
            />
          </ReqoreTabsContent>
          <ReqoreTabsContent tabId="transitions">
            <FSMTransitionOrderDialog
              transitions={states[id].transitions}
              id={id.toString()}
              getStateData={(id) => states[id]}
              onSubmit={(_id, data) => onSubmit(data)}
              states={states}
            />
          </ReqoreTabsContent>
        </ReqoreTabs>
      </ReqorePanel>
    );
  }
);
