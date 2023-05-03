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
  globalvar?: TFSMVariables;
  localvar?: TFSMVariables;
  selectedVariable?: {
    name: string;
    variableType: 'globalvar' | 'localvar';
  };
  onClose: () => void;
  onSubmit: (data: {
    globalvar: TFSMVariables;
    localvar: TFSMVariables;
    changes?: {
      name: string;
      type: 'globalvar' | 'localvar';
      changeType: 'add' | 'remove' | 'update';
    }[];
  }) => void;
}

export const FSMVariables = ({
  globalvar,
  localvar,
  onClose,
  onSubmit,
  selectedVariable,
}: IFSMVariablesProps) => {
  const [_transient, setTransient] = useState<TFSMVariables>(globalvar);
  const [_persistent, setPersistent] = useState<TFSMVariables>(localvar);
  const [selectedTab, setSelectedTab] = useState<string | number>(
    selectedVariable?.variableType || 'globalvar'
  );
  const [_selectedVariable, setSelectedVariable] = useState<string>(selectedVariable?.name);
  const [changes, setChanges] = useState<
    {
      name: string;
      type: 'globalvar' | 'localvar';
      changeType: 'add' | 'remove' | 'update';
    }[]
  >([]);
  const confirmAction = useReqoreProperty('confirmAction');

  const handleSubmitClick = useCallback(() => {
    onClose();
    onSubmit({ globalvar: _transient, localvar: _persistent, changes });
  }, [_transient, _persistent]);

  const handleCreateNewClick = () => {
    if (selectedTab === 'globalvar') {
      setTransient((prev) => ({
        ...prev,
        [`variable_${size(prev)}`]: { type: 'string', value: undefined, variableType: 'globalvar' },
      }));
      setSelectedVariable(`variable_${size(_transient)}`);
    } else {
      setPersistent((prev) => ({
        ...prev,
        [`variable_${size(prev)}`]: { type: 'string', value: undefined, variableType: 'localvar' },
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
    (type: 'globalvar' | 'localvar') => {
      const variables = type === 'globalvar' ? _transient : _persistent;

      return (
        <>
          <ReqoreMenu
            padded={false}
            flat={false}
            position="left"
            width="200px"
            className="variable-list"
          >
            <ReqoreMenuItem
              icon="AddLine"
              effect={PositiveColorEffect}
              onClick={handleCreateNewClick}
              wrap
              id="create-new-variable"
            >
              Create new {type === 'globalvar' ? 'globalvar' : 'localvar'} variable
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
                  className="variable-selector"
                  intent={isVariableValid(variables[name]) ? undefined : 'danger'}
                  rightIcon={variables[name].readOnly ? undefined : 'DeleteBin2Fill'}
                  onRightIconClick={() => {
                    // Delete the variable
                    confirmAction({
                      title: 'Delete variable',
                      description: `Are you sure you want to delete the variable "${name}"?`,
                      onConfirm: () => {
                        if (type === 'globalvar') {
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
    (type: 'globalvar' | 'localvar') => {
      const variableData: IFSMVariable = find(
        selectedTab === 'globalvar' ? _transient : _persistent,
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
              if (type === 'globalvar') {
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
            label: 'Global',
            id: 'globalvar',
            description: 'Global variables',
            badge: size(_transient),
          },
          {
            label: 'Local',
            id: 'localvar',
            description: 'Local variables',
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
          tabId="globalvar"
          style={{ flexFlow: 'row', paddingBottom: 0 }}
          padded="vertical"
        >
          {renderVariableList('globalvar')}
          {renderVariableForm('globalvar')}
        </ReqoreTabsContent>
        <ReqoreTabsContent
          tabId="localvar"
          style={{ flexFlow: 'row', paddingBottom: 0 }}
          padded="vertical"
        >
          {renderVariableList('localvar')}
          {renderVariableForm('localvar')}
        </ReqoreTabsContent>
      </ReqoreTabs>
    </ReqoreModal>
  );
};
