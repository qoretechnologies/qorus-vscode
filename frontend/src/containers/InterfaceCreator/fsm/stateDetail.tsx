import {
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { camelCase, isEqual, reduce, size } from 'lodash';
import { memo, useContext, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { IFSMMetadata, IFSMState, IFSMStates, TAppAndAction, TFSMVariables } from '.';
import {
  NegativeColorEffect,
  PositiveColorEffect,
  SaveColorEffect,
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
  metadata: IFSMMetadata;
  states: IFSMStates;
  inputProvider?: any;
  outputProvider?: any;
  activeTab?: string;
  onClose: () => void;
  onSubmit: (data: Partial<IFSMState>) => void;
  onDelete: (unfilled?: boolean) => void;
}

export const FSMStateDetail = memo(
  ({
    data,
    onClose,
    onSubmit,
    onDelete,
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
    const app = useGetAppActionData((dataToSubmit?.action?.value as TAppAndAction)?.app || null);

    const [blockLogicType, setBlockLogicType] = useState<'fsm' | 'custom'>(
      data.fsm ? 'fsm' : 'custom'
    );
    const [actionType, setActionType] = useState<TAction>(data?.action?.type || 'none');

    const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const autoVars = useFetchAutoVarContext(
      dataToSubmit['block-config']?.['data-provider']?.value,
      'transaction-block'
    );

    useUpdateEffect(() => {
      console.log(data, dataToSubmit);
      if (!isEqual(data, dataToSubmit)) {
        setHasSaved(false);
      }
    }, [dataToSubmit]);

    const handleClose = () => {
      if (hasSaved) {
        onClose();
      } else {
        confirmAction({
          title: 'Unsaved changes',
          intent: 'warning',
          description:
            'You have unsaved changes. Are you sure you want to close this action detail?',
          onConfirm: onClose,
        });
      }
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

    const isDataValid = () => {
      if (
        autoVars.loading ||
        (dataToSubmit['block-type'] === 'transaction' && !size(autoVars.value))
      ) {
        return false;
      }

      return isStateValid(dataToSubmit, metadata);
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
          defaultSize: {
            width: dataToSubmit.type === 'block' ? '100%' : '400px',
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
        bottomActions={[
          {
            tooltip: t('Delete state'),
            effect: NegativeColorEffect,
            icon: 'DeleteBinLine',
            onClick: onDelete,
          },
          {
            label: isCustomBlockFirstPage()
              ? t('Next')
              : hasSaved
              ? undefined
              : !isDataValid()
              ? 'Fix to save'
              : t('Save action'),
            disabled: isCustomBlockFirstPage()
              ? !isFSMBlockConfigValid(dataToSubmit)
              : !isDataValid() || isLoading,
            className: isCustomBlockFirstPage() ? 'state-next-button' : 'state-submit-button',
            id: `state-${camelCase(dataToSubmit?.name)}-submit-button`,
            icon: !isDataValid() ? 'ErrorWarningLine' : 'CheckLine',
            effect:
              isLoading || !isDataValid()
                ? WarningColorEffect
                : isCustomBlockFirstPage()
                ? PositiveColorEffect
                : SaveColorEffect,
            show: isCustomBlockFirstPage() || !hasSaved,
            position: 'right',
            responsive: false,
            onClick: () => {
              if (!isCustomBlockFirstPage()) {
                setIsLoading(true);

                postMessage('submit-fsm-state', {
                  iface_id: interfaceId,
                  state_id: dataToSubmit.id,
                });

                const modifiedData = { ...dataToSubmit };

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

                onSubmit(modifiedData);

                setIsLoading(false);
                setHasSaved(true);
              } else {
                setIsMetadataHidden(true);
              }
            },
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
                console.log(data);
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
