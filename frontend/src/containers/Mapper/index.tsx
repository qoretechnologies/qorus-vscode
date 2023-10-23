import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreModal,
  ReqorePanel,
  useReqore,
  useReqoreTheme,
} from '@qoretechnologies/reqore';
import { IReqoreButtonProps } from '@qoretechnologies/reqore/dist/components/Button';
import { IReqoreControlGroupProps } from '@qoretechnologies/reqore/dist/components/ControlGroup';
import { find } from 'lodash';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import styled, { css } from 'styled-components';
import { TTranslator } from '../../App';
import Connectors, { IProviderType } from '../../components/Field/connectors';
import {
  NegativeColorEffect,
  PositiveColorEffect,
  SaveColorEffect,
} from '../../components/Field/multiPair';
import { IField } from '../../components/FieldWrapper';
import { Messages } from '../../constants/messages';
import { deleteDraft, getDraftId } from '../../helpers/functions';
import {
  flattenFields,
  getLastChildIndex,
  getStaticDataFieldname,
  hasStaticDataField,
} from '../../helpers/mapper';
import TinyGrid from '../../images/graphy-dark.png';
import MapperInput from './input';
import MappingModal, { getKeyType } from './mappingModal';
import MapperFieldModal from './modal';
import MapperOutput from './output';

import compose from 'recompose/compose';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, { TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

const FIELD_HEIGHT = 31;
const FIELD_MARGIN = 5;
export const TYPE_COLORS = {
  int: '#3a9c52',
  integer: '#3a9c52',
  float: '#1f8c71',
  number: '#217536',

  string: '#2c5ba8',
  date: '#443e9c',

  listauto: '#693594',
  hashauto: '#9723a8',

  bool: '#a66121',
  binary: '#e6b12e',

  any: '#a9a9a9',
  auto: '#d7d7d7',
};

export const StyledMapperWrapper = styled.div`
  width: 900px;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0 auto;
`;

export const StyledFieldsWrapper: React.FC<IReqoreControlGroupProps & { width?: string }> = styled(
  ReqoreControlGroup
)`
  width: ${({ width }) => width || '300px'} !important;
`;

const StyledConnectionsWrapper = styled.div`
  flex: 1 1 auto;
  height: 100%;
  width: 300px;
`;

export const StyledMapperFieldWrapper = styled(ReqoreControlGroup)`
  transition: all 0.2s ease-in-out;
  width: ${({ isMapperChild, level, isTypeView }) =>
    isMapperChild
      ? `${isTypeView ? 600 : 300 - level * 15}px`
      : isTypeView
      ? '600px'
      : '300px'} !important;
  position: relative;

  ${({ input, isMapperChild, level }) =>
    input &&
    css`
      margin-left: ${isMapperChild ? `${level * 15}px` : '0'} !important;
    `}

  ${({ childrenCount, isDragging }) =>
    childrenCount !== 0 && !isDragging
      ? css`
          &:after {
            content: '';
            display: table;
            position: absolute;
            width: 1px;
            ${({ input }) =>
              input
                ? css`
                    left: 5px;
                  `
                : css`
                    right: 5px;
                  `};
            top: ${FIELD_HEIGHT}px;
            height: ${childrenCount * (FIELD_HEIGHT + FIELD_MARGIN) - FIELD_HEIGHT / 2}px;
            background-color: ${({ theme }) => theme.intents.muted};
            z-index: 0;
          }
        `
      : null}

  ${({ isMapperChild, isDragging }) =>
    isMapperChild && !isDragging
      ? css`
          &:before {
            content: '';
            display: table;
            position: absolute;
            width: 10px;
            height: 1px;
            ${({ input }) =>
              input
                ? css`
                    left: -10px;
                  `
                : css`
                    right: -10px;
                  `};
            top: ${FIELD_HEIGHT / 2}px;
            background-color: ${({ theme }) => theme.intents.muted};
            z-index: 0;
          }
        `
      : null}
`;

export const StyledMapperField: React.FC<IReqoreButtonProps> = styled(ReqoreButton)``;

const StyledLine = styled.line`
  stroke-width: 1px;
  cursor: pointer;

  &:hover {
    stroke-width: 3px;
    stroke: #ff0000;
  }
`;

export interface IMapperCreatorProps {
  initialData: any;
  t: TTranslator;
  inputs: any[];
  setInputs: (inputs: any) => void;
  outputs: any[];
  setOutputs: (outputs: any) => void;
  providerData: any[];
  setProviderData: (data: any) => void;
  inputProvider: string;
  setInputProvider: (provider: string) => void;
  outputProvider: string;
  setOutputProvider: (provider: string) => void;
  relations: any;
  setRelations: (relations: any) => void;
  inputsLoading: boolean;
  setInputsLoading: (loading: boolean) => void;
  outputsLoading: boolean;
  setOutputsLoading: (loading: boolean) => void;
  onBackClick: () => void;
  addField: (fieldsType: string, path: string, name: string, data?: any) => void;
  editField: (fieldsType: string, path: string, name: string, data?: any) => void;
  isFormValid: boolean;
  setMapperKeys: (keys: any) => void;
  mapperKeys: any;
  methods: any[];
  inputOptionProvider: IProviderType;
  outputOptionProvider: IProviderType;
  setInputOptionProvider: any;
  setOutputOptionProvider: any;
  isEditing?: boolean;
  postMessage: TPostMessage;
}

export interface IMapperRelation {
  input: string;
  output: string;
}

const MapperCreator: React.FC<IMapperCreatorProps> = ({
  initialData,
  t,
  inputs,
  setInputs,
  outputs,
  setOutputs,
  inputChildren,
  setInputChildren,
  outputChildren,
  setOutputChildren,
  inputRecord,
  setInputRecord,
  outputRecord,
  setOutputRecord,
  inputProvider,
  setInputProvider,
  outputProvider,
  setOutputProvider,
  relations,
  setRelations,
  inputsLoading,
  setInputsLoading,
  outputsLoading,
  setOutputsLoading,
  onBackClick,
  isFormValid,
  addField,
  editField,
  setMapperKeys,
  mapperKeys,
  methods,
  selectedFields,
  inputOptionProvider,
  outputOptionProvider,
  setInputOptionProvider,
  setOutputOptionProvider,
  hideInputSelector,
  hideOutputSelector,
  setHideInputSelector,
  setHideOutputSelector,
  isEditingMapper: isEditing,
  postMessage,
  interfaceId,
  getUrlFromProvider,
  mapperSubmit,
  resetAllInterfaceData,
  resetMapper,
  isFromConnectors,
  contextInputs,
  hasInitialInput,
  hasInitialOutput,
  onSubmitSuccess,
  defaultMapper,
  setShowMapperConnections,
  context,
  isContextLoaded,
  interfaceIndex,
  inputsError,
  outputsError,
  setInputsError,
  setOutputsError,
}) => {
  const [{ isDragging }, _dropRef] = useDrop({
    accept: 'none',
    canDrop: () => false,
    collect: (monitor) => ({
      isDragging: !!monitor.getItem(),
    }),
  });
  const [addDialog, setAddDialog] = useState({});
  const [mappingDialog, setMappingDialog] = useState({});
  const theme = useReqoreTheme();
  const [selectedField, setSelectedField] = useState(undefined);
  const { addNotification } = useReqore();

  useEffect(() => {
    const mapper = selectedFields.mapper[interfaceIndex];
    const ctx = mapper.find((mapperField) => mapperField.name === 'context');

    if (ctx && isContextLoaded) {
      // Fix relations
      // If the context and previous context are different
      // remove all the context fields
      const contextFields = contextInputs && flattenFields(contextInputs);
      let hasFixedContext = false;

      setRelations((cur) => {
        let result = { ...cur };

        result = reduce(
          result,
          (newResult, relation, outputField) => {
            if (relation.context) {
              // check if the field exists in inputs
              const contextInputFieldName = getStaticDataFieldname(relation.context);

              if (
                hasStaticDataField(relation.context) &&
                (!contextFields || !contextFields.find((cF) => cF.path === contextInputFieldName))
              ) {
                hasFixedContext = true;
                return {
                  ...newResult,
                  [outputField]: {
                    ...omit(relation, ['context']),
                  },
                };
              }
            }

            return {
              ...newResult,
              [outputField]: relation,
            };
          },
          {}
        );

        if (hasFixedContext) {
          addNotification({
            content: t('RemovedIncompatibleContext'),
            intent: 'warning',
            duration: 3000,
          });
        }

        return result;
      });
    }
  }, [outputs, contextInputs, isContextLoaded]);

  if (!isContextLoaded) {
    return <p> Loading context... </p>;
  }

  const saveRelationData: (outputPath: string, data: any, merge?: boolean) => void = (
    outputPath,
    data,
    merge
  ) => {
    setRelations((current) => {
      const result = { ...current };
      // Check if this output already exists
      if (!result[outputPath]) {
        // Create it
        result[outputPath] = {};
      }
      // Add / merge the new data
      return reduce(
        result,
        (newRelations, relation, output) => {
          // Check if the output matches
          if (output === outputPath) {
            relation = merge ? { ...relation, ...data } : data;
          }
          // Return new data
          return { ...newRelations, [output]: relation };
        },
        {}
      );
    });
  };

  const removeRelation: (outputPath: string, usesContext?: boolean, isInputHash?: boolean) => void =
    (outputPath, usesContext, isInputHash) => {
      if (inputsError || outputsError) {
        return;
      }
      // Remove the selected relation
      // @ts-ignore
      setRelations((current: any): any =>
        reduce(
          current,
          (newRelations, rel: any, relationOutput): boolean => {
            if (relationOutput === outputPath) {
              return {
                ...newRelations,
                [relationOutput]: omit(
                  rel,
                  usesContext ? ['context'] : isInputHash ? ['use_input_record'] : ['name']
                ),
              };
            }
            return { ...newRelations, [relationOutput]: rel };
          },
          {}
        )
      );
    };

  const removeFieldRelations: (path: string, type: string) => void = (path, type) => {
    // Remove the selected relation
    // @ts-ignore
    setRelations((current) =>
      reduce(
        current,
        (newRelations, rel, relationOutput: string) => {
          if (type === 'outputs') {
            if (relationOutput && relationOutput.startsWith(path)) {
              return { ...newRelations };
            }

            return { ...newRelations, [relationOutput]: rel };
          } else {
            if (rel.name && rel.name.startsWith(path)) {
              return { ...newRelations, [relationOutput]: omit(rel, ['name']) };
            }

            return { ...newRelations, [relationOutput]: rel };
          }
        },
        {}
      )
    );
  };

  const renameFieldRelation: (oldPath: string, newPath: string, type: string) => void = (
    oldPath,
    newPath,
    type
  ) => {
    // Remove the selected relation
    // @ts-ignore
    setRelations((current) =>
      reduce(
        current,
        (newRelations, rel, relationOutput: string) => {
          if (type === 'outputs') {
            if (relationOutput && relationOutput.startsWith(oldPath)) {
              const path = relationOutput.replace(oldPath, newPath);

              return { ...newRelations, [path]: rel };
            }

            return { ...newRelations, [relationOutput]: rel };
          } else {
            if (rel.name && rel.name.startsWith(oldPath)) {
              rel.name = rel.name.replace(oldPath, newPath);

              return { ...newRelations, [relationOutput]: rel };
            }

            return { ...newRelations, [relationOutput]: rel };
          }
        },
        {}
      )
    );
  };

  const clearInputs: (soft?: boolean) => void = (soft) => {
    // Reset all the data to default
    if (!soft) {
      setInputProvider(null);
      setInputChildren([]);
    }
    setRelations({});
    setInputs(null);
    setInputsLoading(false);
    setInputRecord(null);
    setInputsError(null);
    setHideInputSelector(false);
  };

  const clearOutputs: (soft?: boolean) => void = (soft) => {
    // Reset all the data to default
    if (!soft) {
      setOutputProvider(null);
      setOutputChildren([]);
    }
    setRelations({});
    setOutputs(null);
    setOutputsLoading(false);
    setOutputRecord(null);
    setOutputsError(null);
    setHideOutputSelector(false);
  };

  const reset: () => void = () => {
    resetAllInterfaceData('mapper', true);
  };

  const isMapperValid: () => boolean = () =>
    isFormValid && size(filterEmptyRelations(relations)) !== 0;
  const flattenedInputs = inputs && flattenFields(inputs);
  const flattenedContextInputs = contextInputs && flattenFields(contextInputs);
  const flattenedOutputs = outputs && flattenFields(outputs);

  const hasAvailableRelation: (types: string[]) => boolean = (types) => {
    if (flattenedOutputs) {
      let availableOutputsCount = 0;
      // Loop through all the output fields that support this field
      // with the provided types
      flattenedOutputs
        .filter(
          (output) =>
            types.includes('any') ||
            output.type.types_accepted.includes('any') ||
            (size(types) <= size(output.type.types_accepted) &&
              output.type.types_accepted.some((type: string) => types.includes(type)))
        )
        .forEach((output) => {
          if (isAvailableForDrop(output.path)) {
            availableOutputsCount++;
          }
        });
      if (availableOutputsCount) {
        return true;
      }
      return false;
    }
    return false;
  };

  const isAvailableForDrop = (outputPath: string): boolean => {
    // Get the unique roles for the name key
    const { unique_roles } = mapperKeys.name;
    // Get the unique roles for this output
    const uniqueRoles: string[] = reduce(
      relations[outputPath],
      (roles, _value, key) =>
        mapperKeys[key].unique_roles ? [...roles, ...mapperKeys[key].unique_roles] : roles,
      []
    );
    // Check if none of the keys roles & a * role isn't
    // yet included
    if (unique_roles.every((role) => !uniqueRoles.includes(role)) && !uniqueRoles.includes('*')) {
      return true;
    }
    return false;
  };

  const getFieldTypeColor: (
    type: 'inputs' | 'outputs' | 'context',
    name: string,
    types?: string[]
  ) => string = (type, name, types) => {
    if (types) {
      // Return the color
      return TYPE_COLORS[types[0].replace(/</g, '').replace(/>/g, '')];
    }
    const fieldTypes = {
      inputs: flattenedInputs,
      outputs: flattenedOutputs,
      context: flattenedContextInputs,
    };
    // Find the field
    const field = fieldTypes[type].find((input) => input.path === name);
    if (field) {
      // Return the color
      return TYPE_COLORS[field.type.types_returned[0].replace(/</g, '').replace(/>/g, '')];
    }
    return null;
  };

  const handleClick =
    (type) =>
    (field?: any, edit?: boolean, remove?: boolean): void => {
      if (remove) {
        editField(type, field.path, null, true);
        removeFieldRelations(field.path, type);
      } else {
        // Save the fields into a accessible object
        const fields = { inputs, outputs };

        setAddDialog({
          isOpen: true,
          siblings: field ? field?.type?.fields : fields[type],
          fieldData: edit ? field : null,
          type,
          isParentCustom: field?.isCustom,
          onSubmit: (data) => {
            if (edit) {
              editField(type, field.path, data);
              renameFieldRelation(field.path, data.path, type);
            } else {
              addField(type, field?.path || '', data);
            }
          },
        });
      }
    };

  const handleManageClick = (output) => {
    setMappingDialog({
      isOpen: true,
      relationData: relations[output.path],
      inputs: flattenedInputs,
      mapperKeys,
      output,
      interfaceIndex,
      onSubmit: (relation) => {
        setRelations((current) => {
          const result = { ...current };
          result[output.path] = relation;
          return result;
        });
      },
    });
  };

  const filterEmptyRelations: (relations: any) => any = (relations) => {
    return reduce(
      relations,
      (newRel, rel, name) => {
        if (size(rel)) {
          return {
            ...newRel,
            [name]: rel,
          };
        }
        return newRel;
      },
      {}
    );
  };

  const getCustomFields: (type: string) => any[] = (type) => {
    if (type === 'inputs') {
      if (flattenedInputs) {
        return flattenedInputs.reduce((newInputs, input) => {
          if (input.firstCustomInHierarchy) {
            return { ...newInputs, [input.name]: input };
          }
          return newInputs;
        }, {});
      }
      return {};
    } else {
      return flattenedOutputs.reduce((newOutputs, output) => {
        if (output.firstCustomInHierarchy) {
          return { ...newOutputs, [output.name]: output };
        }
        return newOutputs;
      }, {});
    }
  };

  const handleDrop = (
    inputPath: string,
    outputPath: string,
    usesContext?: boolean,
    isInputHash?: boolean
  ): void => {
    // If the user is mapping the whole input hash
    if (isInputHash) {
      // If the user is mapping static data inputi
      if (usesContext) {
        saveRelationData(outputPath, { context: `$static:*` });
      }
      // User is mapping the selected type type
      else {
        saveRelationData(outputPath, { use_input_record: true });
      }
    }
    // User is mapping ordinary field
    else {
      saveRelationData(
        outputPath,
        usesContext ? { context: `$static:{${inputPath}}` } : { name: inputPath },
        true
      );
    }
  };

  const handleSubmitClick = async () => {
    // Build the mapper object
    const mapper = reduce(
      selectedFields.mapper[interfaceIndex],
      (result: { [key: string]: any }, field: IField) => ({
        ...result,
        [field.name]: field.value,
      }),
      {}
    );
    // Add the relations
    mapper.fields = filterEmptyRelations(relations);
    // Rebuild the mapper options
    const mapperOptions: { [key: string]: any } = mapper.mapper_options;
    // Add the input & output providers
    mapper.mapper_options = {
      ...(mapperOptions || {}),
      'mapper-input': {
        ...inputOptionProvider,
        'custom-fields': getCustomFields('inputs'),
      },
      'mapper-output': {
        ...outputOptionProvider,
        'custom-fields': getCustomFields('outputs'),
      },
    };
    // Create the mapper field options type list
    const relationTypeList = [];
    forEach(mapper.fields, (relationData, outputFieldName) => {
      const outputField = flattenedOutputs.find((o) => o.path === outputFieldName);
      // Go through the data in the output field relation
      forEach(relationData, (_, relationName) => {
        relationTypeList.push({
          outputField: outputFieldName,
          field: relationName,
          type: getKeyType(relationName, mapperKeys, outputField),
        });
      });
    });

    mapper.output_field_option_types = relationTypeList;

    if (mapper.context) {
      delete mapper.context.static_data;
    }

    const result = await initialData.callBackend(
      !isEditing ? Messages.CREATE_INTERFACE : Messages.EDIT_INTERFACE,
      undefined,
      {
        iface_kind: 'mapper',
        data: mapper,
        orig_data: defaultMapper || initialData.mapper,
        open_file_on_success: !mapperSubmit,
        iface_id: interfaceId.mapper[interfaceIndex],
        no_data_return: !!onSubmitSuccess || !!mapperSubmit,
      },
      t('Saving mapper...')
    );

    if (result.ok) {
      // If on submit
      if (mapperSubmit) {
        mapperSubmit(mapper.name, mapper.version);
      }
      // If on submit success exists
      if (onSubmitSuccess) {
        onSubmitSuccess(mapper);
      }

      const fileName = getDraftId(
        defaultMapper || initialData.mapper,
        interfaceId.mapper[interfaceIndex]
      );

      deleteDraft('mapper', fileName, false);
      // Reset the interface data
      resetAllInterfaceData('mapper');
    }
  };

  const getProviderInfoHeight = (id: string): number => {
    return 45;
  };

  const hasInputRelation = (path: string): boolean => {
    return find(
      relations,
      (relation) =>
        relation.name === path ||
        (relation.context && path === getStaticDataFieldname(relation.context))
    );
  };

  const hasOutputRelation = (path: string): boolean => {
    return find(
      relations,
      (relation, outputPath) =>
        outputPath === path &&
        ('name' in relation || ('context' in relation && relation.context.startsWith('$static:')))
    );
  };

  return (
    <>
      {selectedField && (
        <ReqoreModal
          isOpen
          label={selectedField?.name}
          badge={selectedField.type.base_type}
          onClose={() => setSelectedField(undefined)}
          blur={3}
          responsiveActions={false}
          actions={[
            {
              label: t('Manage field mappings'),
              icon: 'NodeTree',
              onClick: () => {
                handleManageClick(selectedField);
              },
              effect: PositiveColorEffect,
              flat: false,
              show: selectedField.fieldType === 'outputs',
            },
            {
              label: t('Add child field'),
              icon: 'AddLine',
              onClick: () => {
                handleClick(selectedField.fieldType)(selectedField);
              },
              effect: PositiveColorEffect,
              flat: false,
              show: selectedField.type.can_manage_fields === true,
            },
            {
              label: t('Edit'),
              icon: 'EditLine',
              onClick: () => {
                handleClick(selectedField.fieldType)(selectedField, true);
              },
              show: selectedField.isCustom === true,
            },
            {
              label: t('Remove'),
              icon: 'DeleteBinLine',
              effect: NegativeColorEffect,
              onClick: () => {
                handleClick(selectedField.fieldType)(selectedField, false, true);
                setSelectedField(undefined);
              },
              show: selectedField.isCustom === true,
            },
          ]}
        >
          {selectedField?.desc || 'No description'}
        </ReqoreModal>
      )}
      <ReqorePanel
        minimal
        flat
        fill
        contentStyle={{
          display: 'flex',
          flexFlow: 'column',
        }}
        bottomActions={[
          {
            label: t('Reset'),
            icon: 'HistoryLine',
            disabled: inputsLoading || outputsLoading,
            onClick: () => {
              initialData.confirmAction('ResetFieldsConfirm', reset, 'Reset', 'warning');
            },
          },
          {
            label: t('Back'),
            icon: 'ArrowLeftLine',
            disabled: inputsLoading || outputsLoading,
            onClick: () => onBackClick(),
          },
          {
            label: t('Submit'),
            onClick: handleSubmitClick,
            disabled: !isMapperValid(),
            icon: 'CheckLine',
            effect: SaveColorEffect,
            position: 'right',
          },
        ]}
      >
        <div style={{ display: 'flex' }}>
          {!hideInputSelector && (
            <div style={{ width: '50%' }}>
              <Connectors
                title={t('Input fields')}
                providerType="inputs"
                value={inputOptionProvider}
                onChange={(_name, provider) => {
                  setInputOptionProvider(provider);
                }}
                record={inputRecord}
                setRecord={setInputRecord}
                setFields={setInputs}
                hide={() => setHideInputSelector(true)}
              />
            </div>
          )}
          {!hideOutputSelector && (
            <div style={{ width: '50%' }}>
              <Connectors
                title={t('Output fields')}
                providerType="outputs"
                value={outputOptionProvider}
                onChange={(_name, provider) => {
                  setOutputOptionProvider(provider);
                }}
                record={outputRecord}
                setRecord={setOutputRecord}
                setFields={setOutputs}
                hide={() => setHideOutputSelector(true)}
              />
            </div>
          )}
        </div>
        <div
          style={{
            width: '100%',
            marginTop:
              isFromConnectors || isEditing || (hideInputSelector && hideOutputSelector)
                ? 0
                : '15px',
            padding: 10,
            flex: 1,
            overflow: 'auto',
            borderRadius: '10px',
            background: `${theme.main} url(${TinyGrid})`,
          }}
        >
          <StyledMapperWrapper>
            <StyledFieldsWrapper vertical fluid>
              {hideInputSelector ? (
                <ReqorePanel
                  badge={'hash<auto>'}
                  label={'Input'}
                  size="small"
                  id="input-provider-info"
                  responsiveActions={false}
                  responsiveTitle={false}
                  flat
                  isCollapsed
                  contentStyle={{
                    overflow: 'hidden',
                    wordBreak: 'break-all',
                  }}
                  tooltip={{
                    content: (
                      <p style={{ wordBreak: 'break-all' }}>{getUrlFromProvider('input')}</p>
                    ),
                  }}
                  actions={[
                    {
                      icon: 'EditLine',
                      onClick: () => {
                        setHideInputSelector(false);
                        if (isEditing) {
                          clearInputs();
                        }
                      },
                      show: !(isFromConnectors && hasInitialInput),
                      tooltip: t('EditProvider'),
                    },
                  ]}
                  intent={inputsError ? 'danger' : undefined}
                />
              ) : null}
              {size(flattenedInputs) !== 0
                ? map(flattenedInputs, (input, index) => (
                    <MapperInput
                      key={input.path}
                      name={input.name}
                      types={input.type.types_returned}
                      {...input}
                      field={input}
                      hasRelation={hasInputRelation(input.path)}
                      id={index + 1}
                      lastChildIndex={getLastChildIndex(input, flattenedInputs) - index}
                      onClick={() => {
                        setSelectedField({
                          ...input,
                          fieldType: 'inputs',
                        });
                      }}
                      hasAvailableOutput={hasAvailableRelation(input.type.types_returned)}
                    />
                  ))
                : null}
              {!inputsError &&
              size(flattenedInputs) === 0 &&
              !(hideInputSelector && inputOptionProvider?.can_manage_fields) ? (
                <ReqorePanel intent="warning">
                  {inputOptionProvider?.type === 'factory'
                    ? t('NoMapperFieldsAvailable')
                    : t('MapperNoInputFields')}
                </ReqorePanel>
              ) : null}
              {!inputsError && hideInputSelector && inputOptionProvider?.can_manage_fields && (
                <ReqoreButton
                  fluid
                  minimal
                  intent="success"
                  icon="AddLine"
                  onClick={() => handleClick('inputs')()}
                >
                  {t('AddNewField')}
                </ReqoreButton>
              )}
              {size(flattenedContextInputs) !== 0 && (
                <ReqorePanel
                  badge={'hash<auto>'}
                  label={t('StaticData')}
                  size="small"
                  id="input-provider-info-static-data"
                  responsiveActions={false}
                  flat
                  isCollapsed
                  contentStyle={{
                    overflow: 'hidden',
                    wordBreak: 'break-all',
                  }}
                  tooltip={{
                    content: <p style={{ wordBreak: 'break-all' }}>{t('StaticDataFieldDesc')}</p>,
                  }}
                />
              )}
              {size(flattenedContextInputs) !== 0
                ? map(flattenedContextInputs, (input, index) => (
                    <MapperInput
                      key={input.path}
                      name={input.name}
                      types={input.type.types_returned}
                      {...input}
                      field={input}
                      id={(flattenedInputs?.length || 0) + (index + 1)}
                      lastChildIndex={getLastChildIndex(input, flattenedContextInputs) - index}
                      usesContext
                      hasRelation={hasInputRelation(input.path)}
                      onClick={() => {
                        setSelectedField({
                          ...input,
                          fieldType: 'inputs',
                        });
                      }}
                      hasAvailableOutput={hasAvailableRelation(input.type.types_returned)}
                    />
                  ))
                : null}
            </StyledFieldsWrapper>
            <StyledConnectionsWrapper>
              {!inputsError && !outputsError && size(relations) ? (
                <svg
                  height={
                    Math.max(
                      [...(flattenedInputs || []), ...(flattenedContextInputs || [])]?.length,
                      flattenedOutputs?.length
                    ) *
                      (FIELD_HEIGHT + FIELD_MARGIN) +
                    126
                  }
                >
                  {map(relations, (relation, outputPath) => (
                    <>
                      {!!relation.name && (
                        <>
                          <StyledLine
                            key={outputPath.replace(/ /g, '')}
                            onClick={() => removeRelation(outputPath)}
                            stroke={theme.intents.success}
                            x1={0}
                            y1={
                              (flattenedInputs.findIndex((input) => input.path === relation.name) +
                                1) *
                                (FIELD_HEIGHT + FIELD_MARGIN) -
                              (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                              getProviderInfoHeight('input-provider-info')
                            }
                            x2={300}
                            y2={
                              (flattenedOutputs.findIndex((output) => output.path === outputPath) +
                                1) *
                                (FIELD_HEIGHT + FIELD_MARGIN) -
                              (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                              getProviderInfoHeight('input-provider-info')
                            }
                          />
                        </>
                      )}
                      {relation.use_input_record && (
                        <>
                          <StyledLine
                            key={outputPath.replace(/ /g, '')}
                            onClick={() => removeRelation(outputPath, false, true)}
                            stroke={theme.intents.success}
                            x1={0}
                            y1={20}
                            x2={300}
                            y2={
                              (flattenedOutputs.findIndex((output) => output.path === outputPath) +
                                1) *
                                (FIELD_HEIGHT + FIELD_MARGIN) -
                              (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                              getProviderInfoHeight('input-provider-info')
                            }
                          />
                        </>
                      )}
                      {!!relation.context &&
                      hasStaticDataField(relation.context) &&
                      size(flattenedContextInputs) ? (
                        <>
                          <StyledLine
                            key={outputPath}
                            onClick={() => removeRelation(outputPath, true, true)}
                            stroke={theme.intents.success}
                            x1={0}
                            y1={
                              getProviderInfoHeight('input-provider-info') +
                              getProviderInfoHeight('input-provider-info') +
                              (size(flattenedInputs) +
                                (inputOptionProvider?.can_manage_fields ? 1 : 0) +
                                flattenedContextInputs.findIndex(
                                  (input) => input.path === getStaticDataFieldname(relation.context)
                                ) +
                                1) *
                                (FIELD_HEIGHT + FIELD_MARGIN) -
                              (FIELD_HEIGHT / 2 + FIELD_MARGIN)
                            }
                            x2={300}
                            y2={
                              (flattenedOutputs.findIndex((output) => output.path === outputPath) +
                                1) *
                                (FIELD_HEIGHT + FIELD_MARGIN) -
                              (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                              getProviderInfoHeight('input-provider-info')
                            }
                          />
                        </>
                      ) : null}
                      {!!relation.context &&
                      relation.context === '$static:*' &&
                      size(flattenedContextInputs) ? (
                        <>
                          <StyledLine
                            key={outputPath}
                            onClick={() => removeRelation(outputPath, true)}
                            stroke={theme.intents.success}
                            x1={0}
                            y1={
                              getProviderInfoHeight('input-provider-info') +
                              getProviderInfoHeight('input-provider-info') +
                              (size(flattenedInputs) +
                                (inputOptionProvider?.can_manage_fields ? 1 : 0)) *
                                (FIELD_HEIGHT + FIELD_MARGIN)
                            }
                            x2={300}
                            y2={
                              (flattenedOutputs.findIndex((output) => output.path === outputPath) +
                                1) *
                                (FIELD_HEIGHT + FIELD_MARGIN) -
                              (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                              getProviderInfoHeight('input-provider-info')
                            }
                          />
                        </>
                      ) : null}
                    </>
                  ))}
                </svg>
              ) : null}
            </StyledConnectionsWrapper>
            <StyledFieldsWrapper vertical fluid>
              {hideOutputSelector ? (
                <ReqorePanel
                  badge={'hash<auto>'}
                  label={'Output'}
                  size="small"
                  id="output-provider-info"
                  responsiveActions={false}
                  responsiveTitle={false}
                  flat
                  isCollapsed
                  contentStyle={{
                    overflow: 'hidden',
                    wordBreak: 'break-all',
                  }}
                  actions={[
                    {
                      icon: 'EditLine',
                      onClick: () => {
                        setHideOutputSelector(false);
                        if (isEditing) {
                          clearOutputs();
                        }
                      },
                      show: !(isFromConnectors && hasInitialOutput),
                      tooltip: t('EditProvider'),
                    },
                  ]}
                  tooltip={{
                    content: (
                      <p style={{ wordBreak: 'break-all' }}>{getUrlFromProvider('output')}</p>
                    ),
                  }}
                  intent={outputsError ? 'danger' : undefined}
                />
              ) : null}
              {size(flattenedOutputs) !== 0
                ? map(flattenedOutputs, (output, index) => (
                    <MapperOutput
                      key={output.path}
                      name={output.name}
                      hasRelation={hasOutputRelation(output.path)}
                      hasData={!isAvailableForDrop(output.path)}
                      highlight={!!size(relations[output.path])}
                      {...output}
                      field={output}
                      onDrop={handleDrop}
                      id={index + 1}
                      accepts={output.type.types_accepted}
                      lastChildIndex={getLastChildIndex(output, flattenedOutputs) - index}
                      onClick={() => {
                        setSelectedField({
                          ...output,
                          fieldType: 'outputs',
                        });
                      }}
                      onManageClick={() => handleManageClick(output)}
                      hasError={inputsError || outputsError}
                      t={t}
                    />
                  ))
                : null}
              {!outputsError &&
              size(flattenedOutputs) === 0 &&
              !(hideOutputSelector && outputOptionProvider?.can_manage_fields) ? (
                <ReqorePanel intent="warning">{t('MapperNoOutputFields')}</ReqorePanel>
              ) : null}
              {!outputsError && hideOutputSelector && outputOptionProvider?.can_manage_fields && (
                <ReqoreButton
                  fluid
                  minimal
                  intent="success"
                  icon="AddLine"
                  onClick={() => handleClick('outputs')()}
                >
                  {t('AddNewField')}
                </ReqoreButton>
              )}
            </StyledFieldsWrapper>
          </StyledMapperWrapper>
        </div>
      </ReqorePanel>
      {addDialog.isOpen && (
        <MapperFieldModal
          t={t}
          onClose={() => {
            setSelectedField(undefined);
            setAddDialog({});
          }}
          {...addDialog}
        />
      )}
      {mappingDialog.isOpen && (
        <MappingModal
          t={t}
          onClose={() => setMappingDialog({})}
          {...mappingDialog}
          methods={methods}
        />
      )}
    </>
  );
};

export default compose(
  withInitialDataConsumer(),
  withTextContext(),
  withMapperConsumer(),
  withFieldsConsumer(),
  withMessageHandler(),
  withGlobalOptionsConsumer()
)(MapperCreator);
