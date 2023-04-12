import {
  ReqoreColumn,
  ReqoreH3,
  ReqoreHorizontalSpacer,
  ReqoreIcon,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreMessage,
  ReqoreModal,
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { find, keys, omit, size } from 'lodash';
import { useCallback, useState } from 'react';
import { IFSMVariable, TFSMVariables } from '..';
import { PositiveColorEffect } from '../../../../components/Field/multiPair';
import { validateField } from '../../../../helpers/validations';
import { submitControl } from '../../controls';
import { VariableForm } from './form';

export interface IFSMVariablesProps {
  transient?: TFSMVariables;
  persistent?: TFSMVariables;
  selectedVariable?: {
    name: string;
    variableType: 'var' | 'transient';
  };
  onClose: () => void;
  onSubmit: ({
    transient,
    persistent,
  }: {
    transient: TFSMVariables;
    persistent: TFSMVariables;
    changes?: {
      name: string;
      type: 'transient' | 'var';
      changeType: 'add' | 'remove' | 'update';
    }[];
  }) => void;
}

export const FSMVariables = ({
  transient,
  persistent,
  onClose,
  onSubmit,
  selectedVariable,
}: IFSMVariablesProps) => {
  const [_transient, setTransient] = useState<TFSMVariables>(transient);
  const [_persistent, setPersistent] = useState<TFSMVariables>(persistent);
  const [selectedTab, setSelectedTab] = useState<string | number>(
    selectedVariable?.variableType === 'var' ? 'persistent' : 'transient'
  );
  const [_selectedVariable, setSelectedVariable] = useState<string>(selectedVariable?.name);
  const [changes, setChanges] = useState<
    {
      name: string;
      type: string;
      changeType: 'add' | 'remove' | 'update';
    }[]
  >([]);
  const confirmAction = useReqoreProperty('confirmAction');

  const handleSubmitClick = useCallback(() => {
    onClose();
    onSubmit({ transient: _transient, persistent: _persistent, changes });
  }, [_transient, _persistent]);

  const handleCreateNewClick = () => {
    if (selectedTab === 'transient') {
      setTransient((prev) => ({
        ...prev,
        [`variable_${size(prev)}`]: { type: 'string', value: undefined, variableType: 'transient' },
      }));
      setSelectedVariable(`variable_${size(_transient)}`);
    } else {
      setPersistent((prev) => ({
        ...prev,
        [`variable_${size(prev)}`]: { type: 'string', value: undefined, variableType: 'var' },
      }));
      setSelectedVariable(`variable_${size(_persistent)}`);
    }
  };

  const isVariableValid = (data: IFSMVariable) => {
    return (
      validateField('string', data.type) &&
      validateField(data.type, data.value, { isVariable: true })
    );
  };

  const areVariablesValid = () => {
    return (
      (!_transient || Object.keys(_transient).every((name) => isVariableValid(_transient[name]))) &&
      (!_persistent || Object.keys(_persistent).every((name) => isVariableValid(_persistent[name])))
    );
  };

  const renderVariableList = useCallback(
    (type: 'transient' | 'persistent') => {
      const variables = type === 'transient' ? _transient : _persistent;

      return (
        <>
          <ReqoreMenu padded={false} flat={false} position="left" width="200px">
            <ReqoreMenuItem
              icon="AddLine"
              effect={PositiveColorEffect}
              onClick={handleCreateNewClick}
              wrap
              id="create-new-variable"
            >
              Create new {type === 'transient' ? 'transient' : 'persistent'} variable
            </ReqoreMenuItem>
            {size(variables) === 0 ? (
              <ReqoreMessage intent="muted">No variables created</ReqoreMessage>
            ) : (
              Object.keys(variables).map((name) => (
                <ReqoreMenuItem
                  key={name}
                  selected={_selectedVariable === name}
                  onClick={() => setSelectedVariable(name)}
                  minimal
                  intent={isVariableValid(variables[name]) ? undefined : 'danger'}
                  rightIcon={variables[name].readOnly ? undefined : 'DeleteBin2Fill'}
                  onRightIconClick={() => {
                    // Delete the variable
                    confirmAction({
                      title: 'Delete variable',
                      description: `Are you sure you want to delete the variable "${name}"?`,
                      onConfirm: () => {
                        if (type === 'transient') {
                          setTransient((prev) => {
                            const newTransient = { ...prev };
                            delete newTransient[name];
                            return { ...newTransient };
                          });
                        } else {
                          setPersistent((prev) => {
                            const newPersistent = { ...prev };
                            delete newPersistent[name];
                            return { ...newPersistent };
                          });
                        }

                        setChanges([
                          ...changes,
                          {
                            name,
                            type,
                            changeType: 'remove',
                          },
                        ]);
                      },
                    });
                  }}
                >
                  {name}
                </ReqoreMenuItem>
              ))
            )}
          </ReqoreMenu>
          <ReqoreHorizontalSpacer width={10} />
        </>
      );
    },
    [_selectedVariable, _transient, _persistent, selectedTab]
  );

  const renderVariableForm = useCallback(
    (type: 'transient' | 'persistent') => {
      const variableData: IFSMVariable = find(
        { ..._transient, ..._persistent },
        (_data, name) => name === _selectedVariable
      );

      if (variableData) {
        return (
          <VariableForm
            {...variableData}
            name={_selectedVariable}
            key={_selectedVariable}
            isVariableValid={isVariableValid}
            variableNames={keys(omit(_transient, _selectedVariable))}
            onChange={(originalName: string, data: IFSMVariable) => {
              if (type === 'transient') {
                setTransient((prev) => {
                  const newTransient = { ...prev };
                  delete newTransient[originalName];
                  return { ...newTransient, [data.name]: data };
                });
              } else {
                setPersistent((prev) => {
                  const newPersistent = { ...prev };
                  delete newPersistent[originalName];
                  return { ...newPersistent, [data.name]: data };
                });
              }

              setChanges([
                ...changes,
                {
                  name: originalName,
                  type,
                  changeType: 'update',
                },
              ]);
            }}
          />
        );
      }

      return (
        <ReqorePanel fluid fill contentStyle={{ display: 'flex' }}>
          <ReqoreColumn alignItems="center" justifyContent="center" flexFlow="column">
            <ReqoreIcon icon="InformationLine" size="50px" />
            <ReqoreVerticalSpacer height={10} />
            <ReqoreH3>Select a variable from the left menu to edit it or create a new one</ReqoreH3>
          </ReqoreColumn>
        </ReqorePanel>
      );
    },
    [_selectedVariable, _transient, _persistent, selectedTab]
  );

  return (
    <ReqoreModal
      label="FSM Variables"
      onClose={onClose}
      isOpen
      width="90vw"
      height="90vh"
      bottomActions={[
        submitControl(handleSubmitClick, {
          disabled: !areVariablesValid(),
          id: 'submit-variables',
        }),
      ]}
    >
      <ReqoreTabs
        padded={false}
        tabs={[
          {
            label: 'Transient',
            id: 'transient',
            description: 'Variables that are not saved',
            badge: size(_transient),
          },
          {
            label: 'Persistent',
            id: 'persistent',
            description: 'Variables that are saved',
            badge: size(_persistent),
          },
        ]}
        activeTab={selectedTab}
        onTabChange={(tabId) => {
          setSelectedVariable(undefined);
          setSelectedTab(tabId);
        }}
        fillParent
        fill
      >
        <ReqoreTabsContent
          tabId="transient"
          style={{ flexFlow: 'row', paddingBottom: 0 }}
          padded="vertical"
        >
          {renderVariableList('transient')}
          {renderVariableForm('transient')}
        </ReqoreTabsContent>
        <ReqoreTabsContent
          tabId="persistent"
          style={{ flexFlow: 'row', paddingBottom: 0 }}
          padded="vertical"
        >
          {renderVariableList('persistent')}
          {renderVariableForm('persistent')}
        </ReqoreTabsContent>
      </ReqoreTabs>
    </ReqoreModal>
  );
};
