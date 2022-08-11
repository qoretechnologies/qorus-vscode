import { Button, ButtonGroup, Classes, InputGroup, Intent, Tooltip } from '@blueprintjs/core';
import {
  camelCase,
  cloneDeep,
  filter,
  find,
  forEach,
  includes,
  isEqual,
  last,
  map,
  omit,
  reduce,
  size,
  uniqBy,
  upperFirst,
} from 'lodash';
import isArray from 'lodash/isArray';
import { FormEvent, FunctionComponent, useContext, useEffect, useRef, useState } from 'react';
import { useDebounce, useMount, useUpdateEffect } from 'react-use';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import withState from 'recompose/withState';
import shortid from 'shortid';
import Content from '../../components/Content';
import CustomDialog from '../../components/CustomDialog';
import Field from '../../components/Field';
import { allowedTypes } from '../../components/Field/arrayAuto';
import FieldActions from '../../components/FieldActions';
import FieldLabel from '../../components/FieldLabel';
import FieldSelector from '../../components/FieldSelector';
import {
  ActionsWrapper,
  ContentWrapper,
  FieldInputWrapper,
  FieldWrapper,
  IField,
  IInterfaceCreatorPanel,
  SearchWrapper,
} from '../../components/FieldWrapper';
import Loader from '../../components/Loader';
import SidePanel from '../../components/SidePanel';
import { Messages } from '../../constants/messages';
import { DraftsContext, IDraftData, IDraftsContext } from '../../context/drafts';
import { InitialContext } from '../../context/init';
import { maybeSendOnChangeEvent } from '../../helpers/common';
import { deleteDraft, getDraftId, getTargetFile } from '../../helpers/functions';
import { getTypeFromValue, maybeParseYaml, validateField } from '../../helpers/validations';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, {
  addMessageListener,
  postMessage,
} from '../../hocomponents/withMessageHandler';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
import withStepsConsumer from '../../hocomponents/withStepsConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ClassConnectionsManager from '../ClassConnectionsManager';
import ConfigItemManager from '../ConfigItemManager';
import ManageConfigButton from '../ConfigItemManager/manageButton';
import { processSteps } from './workflowsView';

const InterfaceCreatorPanel: FunctionComponent<IInterfaceCreatorPanel> = ({
  type,
  t,
  fields,
  setFields,
  selectedFields,
  setSelectedFields,
  query,
  setQuery,
  selectedQuery,
  setSelectedQuery,
  onSubmit,
  activeId,
  onNameChange,
  isFormValid,
  stepOneTitle = 'SelectFieldsTitle',
  stepTwoTitle = 'FillDataTitle',
  submitLabel = 'Submit',
  onBackClick,
  allSelectedFields,
  data,
  onDataFinishLoading,
  isEditing,
  allMethodsData,
  methodsList,
  forceSubmit,
  resetFields,
  openFileOnSubmit,
  hasConfigManager,
  parent,
  interfaceId,
  setInterfaceId,
  disabledFields,
  hasClassConnections,
  initialInterfaceId,
  resetMethods,
  resetAllInterfaceData,
  isClassConnectionsManagerEnabled,
  classConnectionsData,
  setClassConnectionsData,
  showClassConnectionsManager,
  setShowClassConnectionsManager,
  resetClassConnections,
  areClassConnectionsValid,
  removeCodeFromRelations,
  steps,
  stepsData,
  definitionsOnly,
  context,
  onSubmitSuccess,
  onDataFinishLoadingRecur,
  addInterface,
  removeInterface,
  interfaceIndex,
  lastStepId,
  allFields,
  setClassConnectionsFromDraft,
  parentData,
  disabledSubmit,
  ...rest
}) => {
  const isInitialMount = useRef(true);
  const [show, setShow] = useState<boolean>(false);
  const [messageListener, setMessageListener] = useState(null);
  const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);
  const [fieldListeners, setFieldListeners] = useState([]);
  const initialData = useContext(InitialContext);
  const { maybeApplyDraft, draft } = useContext<IDraftsContext>(DraftsContext);
  const originalData = useRef(data);

  useEffect(() => {
    originalData.current = data;
  }, [data]);

  useUpdateEffect(() => {
    if (draft && show) {
      maybeApplyDraft(type, null, null, setClassConnectionsFromDraft);
    }
  }, [draft, show]);

  const getClasses = () => {
    const classes = selectedFields?.find((field: IField) => field.name === 'classes');

    if (classes) {
      return selectedFields?.find((field: IField) => field.name === 'classes')?.value;
    }

    return undefined;
  };

  const fetchConfigItems: (currentIfaceId: string) => void = (currentIfaceId) => {
    postMessage(Messages.GET_CONFIG_ITEMS, {
      iface_id: currentIfaceId || interfaceId,
      iface_kind: type,
      classes: type === 'workflow' ? undefined : getClasses(),
      steps: type === 'workflow' && size(steps) ? processSteps(steps, stepsData) : undefined,
    });
  };

  useMount(() => {
    addInterface(type, interfaceIndex);
  });

  useDebounce(
    () => {
      const draftId = getDraftId(parentData || data, interfaceId);

      if (draftId && type !== 'config-item') {
        (async () => {
          let hasAnyChanges;

          if (!data) {
            hasAnyChanges = (selectedFields || []).some((field) => {
              if (field.value) {
                return !isEqual(field.value, field.default_value);
              }

              return false;
            });
          } else {
            hasAnyChanges = (selectedFields || []).some((field) => {
              if (field.name === 'orig_name') {
                return false;
              }

              if (!isEqual(field.value, originalData.current[field.name])) {
                console.log(
                  'Field is different',
                  field.name,
                  field.value,
                  originalData.current[field.name]
                );
              }

              return !isEqual(field.value, originalData.current[field.name]);
            });
          }

          if (!hasAnyChanges) {
            return;
          }

          updateDraft();
        })();
      }
    },
    1500,
    [selectedFields, classConnectionsData, isEditing, type]
  );

  const updateDraft = async () => {
    const draftId = getDraftId(parentData || data, interfaceId);

    if (!draftId) {
      return;
    }

    const fileData: Omit<Partial<IDraftData>, 'interfaceKind'> = {};

    switch (type) {
      case 'service':
      case 'service-methods':
        fileData.fields = allFields['service'][interfaceIndex];
        fileData.selectedFields = allSelectedFields['service'][interfaceIndex];
        fileData.methods = allFields['service-methods'][interfaceIndex];
        fileData.selectedMethods = allSelectedFields['service-methods'][interfaceIndex];
        fileData.isValid =
          isFormValid('service', interfaceIndex) && isFormValid('service-methods', interfaceIndex);
        break;
      case 'mapper-code':
      case 'mapper-methods':
        fileData.fields = allFields['mapper-code'][interfaceIndex];
        fileData.selectedFields = allSelectedFields['mapper-code'][interfaceIndex];
        fileData.methods = allFields['mapper-methods'][interfaceIndex];
        fileData.selectedMethods = allSelectedFields['mapper-methods'][interfaceIndex];
        fileData.isValid =
          isFormValid('mapper-code', interfaceIndex) &&
          isFormValid('mapper-methods', interfaceIndex);
        break;
      case 'errors':
      case 'error':
        fileData.fields = allFields.errors[interfaceIndex];
        fileData.selectedFields = allSelectedFields.errors[interfaceIndex];
        fileData.methods = allFields.error[interfaceIndex];
        fileData.selectedMethods = allSelectedFields.error[interfaceIndex];
        fileData.isValid =
          isFormValid('error', interfaceIndex) && isFormValid('errors', interfaceIndex);
        break;
      case 'mapper':
        fileData.fields = allFields.mapper[interfaceIndex];
        fileData.selectedFields = allSelectedFields.mapper[interfaceIndex];
        fileData.diagram = rest.mapperData;
        fileData.isValid =
          isFormValid('mapper', interfaceIndex) && size(rest.mapperData.relations) > 0;
        break;
      case 'workflow':
        fileData.fields = allFields['workflow'][interfaceIndex];
        fileData.selectedFields = allSelectedFields['workflow'][interfaceIndex];
        fileData.steps = {
          steps,
          stepsData,
          lastStepId,
        };
        fileData.isValid = isFormValid('workflow', interfaceIndex) && size(steps) > 0;
        break;
      default:
        fileData.fields = allFields[type][interfaceIndex];
        fileData.selectedFields = allSelectedFields[type][interfaceIndex];
        fileData.isValid = canSubmit();
    }

    fileData.classConnections = classConnectionsData;
    fileData.interfaceId = interfaceId;
    fileData.associatedInterface = getTargetFile(parentData || data);

    await initialData.saveDraft(type, draftId, fileData);
  };

  useEffect(() => {
    // Remove the current listeners
    fieldListeners.forEach((listener) => {
      listener();
    });
    // Add the message listeners for fields
    setFieldListeners([
      addMessageListener(Messages.CREATOR_ADD_FIELD, ({ field, notify }) => {
        addField(field, notify === true ? true : false);
      }),
      addMessageListener(Messages.CREATOR_REMOVE_FIELD, ({ field, notify }) => {
        removeField(field, notify === true ? true : false);
      }),
      addMessageListener(Messages.CREATOR_ENABLE_FIELD, ({ field }) => {
        toggleDisableField(field, false);
      }),
      addMessageListener(Messages.CREATOR_DISABLE_FIELD, ({ field }) => {
        toggleDisableField(field, true);
      }),
      addMessageListener(Messages.CREATOR_CHANGE_FIELD_VALUE, ({ field, value }) => {
        handleFieldChange(field, value);
      }),
    ]);

    return () => {
      // Remove the current listeners
      fieldListeners.forEach((listener) => {
        listener();
      });
    };
  }, [fields]);

  useEffect(() => {
    // Remove the message listener if it exists
    messageListener && messageListener();
    // Create a message listener for this activeId
    const messageListenerHandler = addMessageListener(
      Messages.FIELDS_FETCHED,
      ({
        fields: newFields,
        ...rest
      }: {
        newFields: { [key: string]: IField };
        iface_kind: string;
      }) => {
        // Register only for this interface
        if (rest.iface_kind !== type) {
          return;
        }
        // Clone initial data
        const clonedData = cloneDeep(data);
        if (!fields || !fields.length) {
          // Mark the selected fields
          const transformedFields: IField[] = map(newFields, (field: IField) => ({
            ...field,
            selected: (clonedData && field.name in clonedData) || field.mandatory !== false,
            isValid:
              clonedData && field.name in clonedData
                ? validateField(field.type || 'string', clonedData[field.name], field)
                : false,
            value: clonedData && field.name in clonedData ? clonedData[field.name] : undefined,
            hasValueSet: clonedData && field.name in clonedData,
          }));
          if (!size(selectedFields)) {
            // Pull the pre-selected fields
            const preselectedFields: IField[] = filter(
              transformedFields,
              (field: IField) => field.selected
            );
            // Add original name field
            if (isEditing) {
              preselectedFields.push({
                name: 'orig_name',
                value: clonedData && clonedData.name,
                isValid: true,
                selected: true,
                internal: true,
              });
            }
            setSelectedFields(type, preselectedFields, activeId, interfaceIndex);
          }
          // Save the fields
          setFields(type, transformedFields, activeId, interfaceIndex);
        }
        // Check if onDataFinish function is set
        // only do this on initial mount
        if (onDataFinishLoading && isInitialMount.current) {
          // Run the callback
          onDataFinishLoading();
          // Set the mount to false
          isInitialMount.current = false;
        }

        // Check if onDataFinishRecur function is set
        if (onDataFinishLoadingRecur) {
          // Run the callback
          onDataFinishLoadingRecur(activeId);
        }
        const currentInterfaceId = data
          ? clonedData.iface_id
          : type === 'service-methods' || type === 'mapper-methods' || type === 'error'
          ? interfaceId
          : shortid.generate();
        // Check if the interface id exists, which means user
        // has already been on this view
        if (!interfaceId) {
          // Create it if this is brand new interface
          setInterfaceId(type, currentInterfaceId, interfaceIndex);
        }
        // Add draft if one exists
        maybeApplyDraft(type, null, data, null, setClassConnectionsFromDraft);
        // Set show
        setShow(true);
        // Fetch config items
        fetchConfigItems(interfaceId || currentInterfaceId);
      }
    );
    // Set the new message listener
    setMessageListener(() => messageListenerHandler);
    // Fetch the fields
    if (type === 'config-item' && isEditing) {
      postMessage(Messages.GET_FIELDS, {
        iface_kind: type,
        is_editing: isEditing,
        context,
        iface_id: interfaceId,
        name: data.name,
        lang: isEditing ? data.lang : undefined,
      });
    } else {
      postMessage(Messages.GET_FIELDS, {
        iface_kind: type,
        is_editing: isEditing,
        context,
        lang: isEditing ? data?.lang : undefined,
      });
    }
    // Cleanup on unmount
    return () => {
      // Remove the message listener if it exists
      messageListenerHandler();
    };
  }, [activeId, interfaceId, initialInterfaceId]);

  const resetLocalFields: (newActiveId?: number) => void = async (newActiveId) => {
    resetAllInterfaceData(type, true);
    // Delete the draft
    const draftId = getDraftId(parentData || data, interfaceId);
    await deleteDraft(type, draftId, false);
    // Reset also config items
    postMessage(Messages.RESET_CONFIG_ITEMS, {
      iface_id: interfaceId,
    });
    // Hide the fields until they are fetched
    setShow(false);
    // Fetch the fields
    if (type === 'config-item' && isEditing) {
      postMessage(Messages.GET_FIELDS, {
        iface_kind: type,
        is_editing: isEditing,
        context,
        iface_id: interfaceId,
        name: data.name,
        lang: isEditing ? data.lang : undefined,
      });
    } else {
      postMessage(Messages.GET_FIELDS, {
        iface_kind: type,
        is_editing: isEditing,
        iface_id: isEditing ? interfaceId : undefined,
        context,
        lang: isEditing ? data?.lang : undefined,
      });
    }
  };

  const addField: (fieldName: string, notify?: boolean) => void = (fieldName, notify = true) => {
    // Check if the field is already selected
    const selectedField: IField = find(selectedFields, (field: IField) => field.name === fieldName);
    // Add it if it's not
    if (!selectedField) {
      // Remove the field
      setFields(
        type,
        (current: IField[]) =>
          map(current, (field: IField) => ({
            ...field,
            selected: fieldName === field.name ? true : field.selected,
          })),
        activeId,
        interfaceIndex
      );
      // Get the field
      const field: IField = find(fields, (field: IField) => field.name === fieldName);
      if (field) {
        // Add the field to selected list
        setSelectedFields(
          type,
          (current: IField[]) => {
            // Check if this field should notify
            if (field.notify_on_add && notify) {
              postMessage(Messages.CREATOR_FIELD_ADDED, {
                field: fieldName,
                iface_id: interfaceId,
                iface_kind: type,
              });
            }
            return [
              ...current,
              {
                ...field,
                selected: true,
              },
            ];
          },
          activeId,
          interfaceIndex
        );
      }
    }
  };

  /*
  When the user removes a field, we need to remove it from the interface
  definition and from the selected fields.
  */
  const removeField: (fieldName: string, notify?: boolean) => void = (fieldName, notify = true) => {
    // If mapper code was removed, try to remove relations
    if (type === 'mapper' && fieldName === 'codes') {
      // Remove the code from relations
      removeCodeFromRelations();
    }
    if (fieldName === 'classes') {
      resetClassConnections?.();
    }
    // Remove the field
    setFields(
      type,
      (current: IField[]) => {
        // Check if this field has a remove event
        const field: IField = current.find((f: IField) => f.name === fieldName);

        if (notify && field.notify_on_remove) {
          postMessage(Messages.CREATOR_FIELD_REMOVED, {
            field: fieldName,
            iface_id: interfaceId,
            iface_kind: type,
          });
        }

        // Add the field to selected list
        setSelectedFields(
          type,
          (current: IField[]) => filter(current, (field: IField) => field.name !== fieldName),
          activeId,
          interfaceIndex
        );

        return map(current, (field: IField) => ({
          ...field,
          selected: fieldName === field.name ? false : field.selected,
          value: fieldName === field.name ? undefined : field.value,
          isValid: fieldName === field.name ? false : field.isValid,
          hasValueSet: fieldName === field.name ? false : field.hasValueSet,
        }));
      },
      activeId,
      interfaceIndex
    );
  };

  const toggleDisableField: (fieldName: string, disabled: boolean) => void = (
    fieldName,
    disabled
  ) => {
    setTimeout(() => {
      setFields(
        type,
        (current: IField[]) =>
          map(current, (field: IField) => ({
            ...field,
            disabled: fieldName === field.name ? disabled : field.disabled,
          })),
        activeId,
        interfaceIndex
      );
      setSelectedFields(
        type,
        (current: IField[]) =>
          map(current, (field: IField) => ({
            ...field,
            disabled: fieldName === field.name ? disabled : field.disabled,
          })),
        activeId,
        interfaceIndex
      );
    }, 1000);
  };

  const handleAddClick: (fieldName: string) => void = (fieldName) => {
    addField(fieldName);
  };

  /*
  We get the field name, the value, the type, and the canBeNull flag. We then
  check if the field is prefilled by other fields. If it is, we update the value
  of the prefilled fields. We then check if the field needs style changes. If it
  does, we change the value based on the style. We then validate the field. If
  it is valid, we update the value. If it is not valid, we don't update the
  value. We then check if the field name is "name". If it is, we change the name
  of the method
  */
  const handleFieldChange: (
    fieldName: string,
    value: any,
    forcedType?: string,
    canBeNull?: boolean,
    explicit?: boolean,
    metadata?: any
  ) => void = (fieldName, value, forcedType, canBeNull, explicit, metadata) => {
    setSelectedFields(
      type,
      (currentFields: IField[]): IField[] => {
        return currentFields.reduce((newFields: IField[], currentField: IField): IField[] => {
          // Check if the field matches
          if (currentField.name === fieldName) {
            // Check if this field prefills any other fields
            const prefills: IField[] = currentFields.filter(
              (field: IField) => field.prefill === fieldName
            );
            // Update the value of all of the prefill field
            // But only if they did not set the value themselves
            if (prefills.length) {
              prefills.forEach((field: IField) => {
                // Check if the field already has a value set
                // by its self
                if (!field.hasValueSet && !isEditing) {
                  // Modify the field
                  setTimeout(() => {
                    handleFieldChange(field.name, value, null, canBeNull, true);
                  }, 300);
                }
              });
            }
            // Check if this field needs style changes
            if (
              currentField.style &&
              // Quick hack for classes and mapper codes
              (currentField.name === 'class-class-name' || !currentField.hasValueSet)
            ) {
              // Modify the value based on the style
              switch (currentField.style) {
                case 'PascalCase':
                  value = upperFirst(camelCase(value));
                  break;
                case 'camelCase':
                  value = camelCase(value);
                  break;
                default:
                  break;
              }
            }
            // Validate the field
            let isValid;
            const finalFieldType = forcedType || currentField.type;
            // If this is auto field
            if (finalFieldType === 'auto' || finalFieldType === 'array-auto') {
              // Get the type
              const fieldType = requestFieldData(currentField['type-depends-on'], 'value');
              // If this is a single field
              if (finalFieldType === 'auto') {
                // Validate single field
                isValid = validateField(fieldType, value, currentField);
              } else {
                // Check if the type is in allowed types
                if (allowedTypes.includes(fieldType)) {
                  // Validate all values
                  isValid = value.every((val: string | number) =>
                    validateField(fieldType, val, currentField, canBeNull)
                  );
                } else {
                  isValid = false;
                }
              }
            } else {
              // Basic field with predefined type
              isValid = validateField(finalFieldType || 'string', value, currentField, canBeNull);
            }
            // On change events
            maybeSendOnChangeEvent(currentField, value, type, interfaceId, isEditing);
            // Add the value
            return [
              ...newFields,
              {
                ...currentField,
                value,
                hasValueSet: !explicit,
                isValid,
              },
            ];
          }
          // Return unchanged fields
          return [...newFields, { ...currentField }];
        }, []);
      },
      activeId,
      interfaceIndex
    );

    // Check if we should change the name of the
    // method
    if (fieldName === 'name' && onNameChange) {
      // Change the method name in the side panel
      onNameChange(activeId, value, metadata?.originalName);
    }
  };

  const handleAddAll: () => void = () => {
    // Add all remaning fields that are
    // not yet selected
    fields.forEach((field: IField): void => {
      if (!field.selected && !field.disabled) {
        addField(field.name);
      }
    });
  };

  /*
  We get the interface ID from the parent data, delete the draft for this
  interface, set the value flag for all selected fields, and then call the
  submit function.
  */
  const handleSubmitClick: () => void = async () => {
    // File name
    const fileName = getDraftId(parentData || data, interfaceId);
    // Set the value flag for all selected fields
    setSelectedFields(
      type,
      (currentFields: IField[]): IField[] => {
        return currentFields.reduce((newFields: IField[], currentField: IField): IField[] => {
          // Add the value
          return [
            ...newFields,
            {
              ...currentField,
              hasValueSet: true,
            },
          ];
        }, []);
      },
      activeId,
      interfaceIndex
    );

    if (onSubmit) {
      onSubmit(selectedFields);
    }

    let result;

    if (!onSubmit || forceSubmit) {
      // Delete the draft for this interface
      deleteDraft(type, fileName, false);

      let newData: { [key: string]: any };
      // If this is service methods
      if (type === 'service-methods' || type === 'mapper-methods' || type === 'error') {
        let intrfType;
        let subItemType;

        switch (type) {
          case 'mapper-methods': {
            intrfType = 'mapper-code';
            subItemType = 'mapper-methods';
            break;
          }
          case 'error': {
            intrfType = 'errors';
            subItemType = 'errors_errors';
            break;
          }
          default: {
            intrfType = 'service';
            subItemType = 'methods';
            break;
          }
        }

        // Get the service data
        newData = reduce(
          allSelectedFields[intrfType][interfaceIndex],
          (result: { [key: string]: any }, field: IField) => ({
            ...result,
            [field.name]: field.value,
          }),
          {}
        );
        // Add the methods
        newData[subItemType] = map(allSelectedFields[type][interfaceIndex], (serviceMethod) => {
          return reduce(
            serviceMethod,
            (result: { [key: string]: any }, field: IField) => ({
              ...result,
              [field.name]: field.value,
            }),
            {}
          );
        });
        // Filter deleted methods
        if (methodsList) {
          newData[subItemType] = newData[subItemType].filter((m) =>
            methodsList.find((ml) => ml.name === m.name)
          );
        }
      } else {
        // Build the finished object
        newData = reduce(
          selectedFields,
          (result: { [key: string]: any }, field: IField) => ({
            ...result,
            [field.name]: field.value,
          }),
          {}
        );
      }
      // Set the interface kind
      let iface_kind = type;
      // Service methods use the service type
      if (type === 'service-methods') {
        iface_kind = 'service';
      } else if (type === 'mapper-methods') {
        iface_kind = 'mapper-code';
      } else if (type === 'error') {
        iface_kind = 'errors';
      }
      // Config items use the parent type
      if (parent) {
        iface_kind = `${parent}:${type}`;
      }
      // Add workflow data with step
      if (type === 'step') {
        // Get the workflow data
        const workflow = reduce(
          last(allSelectedFields.workflow),
          (result: { [key: string]: any }, field: IField) => ({
            ...result,
            [field.name]: field.value,
          }),
          {}
        );
        result = await initialData.callBackend(
          isEditing ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
          undefined,
          {
            iface_kind,
            data: { ...newData, 'class-connections': classConnectionsData },
            orig_data: data,
            workflow,
            open_file_on_success: openFileOnSubmit !== false,
            no_data_return: !!onSubmitSuccess,
            iface_id: interfaceId,
          },
          t(`Saving ${iface_kind}...`)
        );
      } else {
        let true_type: string;
        //* If this is a config item get the true type of the default_value field
        if (type === 'config-item' && newData.default_value) {
          // Get the default value field
          true_type = getTypeFromValue(maybeParseYaml(newData.default_value));
        }

        result = await initialData.callBackend(
          isEditing ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
          undefined,
          {
            iface_kind,
            data: {
              ...newData,
              'class-connections': classConnectionsData,
              default_value_true_type: true_type,
            },
            orig_data:
              type === 'service-methods' || type === 'mapper-methods' || type === 'error'
                ? initialData[iface_kind]
                : data,
            open_file_on_success: !onSubmitSuccess && openFileOnSubmit !== false,
            no_data_return: !!onSubmitSuccess,
            iface_id: interfaceId,
          },
          t(`Saving ${iface_kind}...`)
        );
      }

      if (result.ok) {
        if (onSubmitSuccess) {
          onSubmitSuccess(newData);
        }
        // If this is config item, reset only the fields
        // local fields will be unmounted
        if (type === 'config-item') {
          resetFields(type, interfaceIndex);
        }

        if (onBackClick) {
          onBackClick();
        }
      }
    }
  };

  if (!size(fields) || !show) {
    return <Loader text={t('LoadingFields')} />;
  }

  // Filter out the selected fields
  const fieldList: IField[] = filter(fields, (field: IField) => {
    // Only included unselected fields
    if (!field.selected) {
      // Check if the query is set
      if (query && query !== '') {
        return includes(field.name.toLowerCase(), query.toLowerCase());
      } else {
        return true;
      }
    } else {
      return false;
    }
  });

  // Filter out the selected fields
  const selectedFieldList: IField[] = filter(selectedFields, (field: IField) => {
    // Only included unselected fields
    if (field.selected) {
      // Check if the query is set
      if (selectedQuery && selectedQuery !== '') {
        return includes(field.name.toLowerCase(), selectedQuery.toLowerCase());
      } else {
        return true;
      }
    } else {
      return false;
    }
  });

  const requestFieldData: (fieldName: string, fieldKey?: string) => string = (
    fieldName,
    fieldKey
  ) => {
    // Find this field
    const field: IField = selectedFields.find((field: IField) => field.name === fieldName);
    // Check if this field exists & is selected
    if (field) {
      // Return the requested field property
      return fieldKey ? field[fieldKey] : field;
    }
    // Return null
    return null;
  };

  const isFieldDisabled: (field: IField) => boolean = (field) => {
    // Check if the field is disabled on its own
    // or required other field to be added
    if (field.disabled) {
      return true;
    } else if (field.requires_fields) {
      const req = isArray(field.requires_fields) ? field.requires_fields : [field.requires_fields];
      // Check if the required field is valid
      if (
        selectedFields
          .filter((sField) => req.includes(sField.name))
          .every((sField) => sField.isValid)
      ) {
        return false;
      }
      return true;
    } else if (disabledFields) {
      // Check if this field is in the disabled fields list
      if (disabledFields.includes(field.name)) {
        return true;
      }
    }
    return false;
  };

  const isConfigManagerEnabled = () => {
    if (type === 'workflow') {
      return !!size(steps);
    }
    // Find the base class name field
    const baseClassName: IField = [...fieldList, ...selectedFields].find(
      (field: IField) => field.name === 'base-class-name'
    );
    // Check if the field exists
    if (baseClassName) {
      // Check if the field is mandatory
      if (baseClassName.mandatory === false) {
        // Fetch config items if base class name is not selected
        // and user is editing
        if (!baseClassName.selected && isEditing) {
          fetchConfigItems();
        }
        // If the base class name is not mandatory
        // enable the config items by default
        return baseClassName.selected ? baseClassName.isValid : true;
      }
      // The field has to be selected and valid
      return baseClassName.isValid;
    }
    // Not valid
    return false;
  };

  const getMappersFromClassConnections = (classConnections) => {
    const mappers = [];
    forEach(classConnections, (connectionData) => {
      connectionData.forEach((connectorData) => {
        if (connectorData.mapper) {
          mappers.push(connectorData.mapper);
        }
      });
    });
    return mappers;
  };

  const modifyMappers = (classConnections) => {
    // Get the current mappers from class connections
    const currentCCMappers = getMappersFromClassConnections(classConnectionsData);
    const newCCMappers: string[] = getMappersFromClassConnections(classConnections);
    // Get the mappers field
    const mappers = selectedFields.find((field) => field.name === 'mappers');
    // Check if the field is selected
    if (!mappers) {
      // If there are new mappers, add the field
      if (size(newCCMappers)) {
        handleAddClick('mappers');
        // Add the mappers
        handleFieldChange(
          'mappers',
          newCCMappers.map((mapper) => ({ name: mapper }))
        );
        return;
      }
      // Stop otherwise
      else {
        return;
      }
    }
    // Filter out only the mappers that were previously in class connections
    let newMappers = mappers.value.filter((mapper) => {
      // Check if this mapper is in the new cc mappers
      if (!newCCMappers.includes(mapper.name)) {
        // It's not, it either never was there, or got removed
        // Check if the mapper is in the current mappers
        if (currentCCMappers.includes(mapper.name)) {
          // It was there before and was removed
          // Remove it
          return false;
        }
        // It was never in class connections, keep it
        return true;
      }
      // Leave it
      return true;
    });
    // Add all mappers from the new cc mappers
    newMappers = [...newMappers, ...newCCMappers.map((mapper) => ({ name: mapper }))];
    // Save the new mappers
    handleFieldChange('mappers', uniqBy(newMappers, 'name'));
  };

  const supportsContext = () => {
    const supportedIfaces = ['workflow'];
    const ifaceType: string = type === 'step' ? 'workflow' : type;

    return supportedIfaces.includes(ifaceType);
  };

  const getInterfaceNameForContext = () => {
    const ifaceType: string = type === 'step' ? 'workflow' : type;

    const iName: IField = last(allSelectedFields[ifaceType])?.find(
      (field) => field.name === 'name'
    );
    const iVersion: IField = last(allSelectedFields[ifaceType])?.find(
      (field) => field.name === 'version'
    );
    const iStaticData: IField = last(allSelectedFields[ifaceType])?.find(
      (field) => field.name === 'staticdata-type'
    );

    if (!iName || !iVersion || !iStaticData) {
      return null;
    }

    if (!iName.isValid || !iVersion.isValid || !iStaticData || !iStaticData.isValid) {
      return null;
    }

    return `${iName.value}:${iVersion.value}`;
  };

  const getContext = () => {
    if (supportsContext() && getInterfaceNameForContext()) {
      const ifaceType: string = type === 'step' ? 'workflow' : type;
      const staticData: IField = last(allSelectedFields[ifaceType]).find(
        (field) => field.name === 'staticdata-type'
      );
      return {
        iface_kind: type === 'step' ? 'workflow' : type,
        name: getInterfaceNameForContext(),
        static_data: staticData.value,
      };
    }
    return null;
  };

  const canSubmit: () => boolean = () => {
    let isValid = true;

    if (hasClassConnections && !areClassConnectionsValid()) {
      isValid = false;
    }

    // Check the disabled submit flag
    if (disabledSubmit) {
      isValid = false;
    }

    if (type === 'service-methods' && !isFormValid('service')) {
      isValid = false;
    }

    if (!isFormValid(type)) {
      isValid = false;
    }

    return isValid;
  };

  return (
    <>
      <SidePanel title={t(stepOneTitle)}>
        <SearchWrapper>
          <InputGroup
            placeholder={t('FilterAvailableFields')}
            value={query}
            onChange={(event: FormEvent<HTMLInputElement>) =>
              setQuery(type, event.currentTarget.value)
            }
            leftIcon={'search'}
            intent={query !== '' ? Intent.PRIMARY : Intent.NONE}
          />
        </SearchWrapper>
        <ContentWrapper>
          {fieldList.length ? (
            map(fieldList, (field: any) => (
              <FieldSelector
                name={field.name}
                type={field.type}
                disabled={isFieldDisabled(field)}
                onClick={handleAddClick}
              />
            ))
          ) : (
            <p className={Classes.TEXT_MUTED}>No fields available</p>
          )}
        </ContentWrapper>
        {fieldList.length ? (
          <ActionsWrapper>
            <ButtonGroup fill>
              <Tooltip content={t('SelectAllTooltip')}>
                <Button
                  text={t('SelectAll')}
                  icon={'plus'}
                  onClick={handleAddAll}
                  name="add-all-fields"
                />
              </Tooltip>
            </ButtonGroup>
          </ActionsWrapper>
        ) : null}
      </SidePanel>
      <Content title={t(stepTwoTitle)} style={{ paddingLeft: 0 }}>
        <SearchWrapper style={{ marginLeft: '15px' }}>
          <InputGroup
            placeholder={t('FilterSelectedFields')}
            value={selectedQuery}
            onChange={(event: FormEvent<HTMLInputElement>) =>
              setSelectedQuery(type, event.currentTarget.value)
            }
            leftIcon={'search'}
            intent={selectedQuery !== '' ? Intent.PRIMARY : Intent.NONE}
          />
        </SearchWrapper>
        <ContentWrapper>
          {map(
            selectedFieldList,
            (field: IField) =>
              !field.internal && (
                <FieldWrapper
                  key={field.name}
                  name="selected-field"
                  style={{ paddingLeft: '15px' }}
                >
                  <FieldLabel
                    info={field.markdown && t('MarkdownSupported')}
                    label={t(`field-label-${field.name}`)}
                    isValid={field.isValid}
                  />
                  <FieldInputWrapper>
                    <Field
                      {...field}
                      onChange={handleFieldChange}
                      requestFieldData={requestFieldData}
                      resetClassConnections={resetClassConnections}
                      showClassesWarning={hasClassConnections}
                      interfaceKind={type}
                      iface_kind={type}
                      activeId={activeId}
                      interfaceId={interfaceId}
                      prefill={
                        field.prefill &&
                        selectedFieldList.find(
                          (preField: IField) => preField.name === field.prefill
                        )
                      }
                      disabled={isFieldDisabled(field)}
                      context={getContext()}
                    />
                  </FieldInputWrapper>
                  <FieldActions
                    value={field.value}
                    parentValue={field['parent-value']}
                    desc={t(`field-desc-${field.name}`)}
                    name={field.name}
                    onResetClick={() => {
                      handleFieldChange(field.name, field['parent-value']);
                    }}
                    isSet={field['is-set']}
                    disabled={isFieldDisabled(field)}
                    onClick={removeField}
                    removable={field.mandatory === false}
                  />
                </FieldWrapper>
              )
          )}
        </ContentWrapper>
        <ActionsWrapper>
          {(hasConfigManager || hasClassConnections) && (
            <div style={{ float: 'left', width: '48%' }}>
              <ButtonGroup fill>
                {hasClassConnections && (
                  <Button
                    icon={areClassConnectionsValid() ? 'code-block' : 'warning-sign'}
                    intent={areClassConnectionsValid() ? 'none' : 'warning'}
                    disabled={!isClassConnectionsManagerEnabled(interfaceIndex)}
                    onClick={() => setShowClassConnectionsManager(true)}
                    name={`${type}-class-connections-button`}
                  >
                    {t('ManageClassConnections')} ({size(classConnectionsData)})
                  </Button>
                )}
                {hasConfigManager && (
                  <ManageConfigButton
                    type={type}
                    disabled={!isConfigManagerEnabled()}
                    onClick={() => setShowConfigItemsManager(true)}
                  />
                )}
              </ButtonGroup>
            </div>
          )}
          <div
            style={{
              float: 'right',
              width: hasConfigManager || hasClassConnections ? '48%' : '100%',
            }}
          >
            <ButtonGroup fill>
              {onBackClick && (
                <Tooltip content={t('BackTooltip')}>
                  <Button text={t('Back')} icon={'undo'} onClick={() => onBackClick()} />
                </Tooltip>
              )}
              <Tooltip content={t('ResetTooltip')}>
                <Button
                  text={t('DiscardChangesButton')}
                  icon={'history'}
                  onClick={() => {
                    initialData.confirmAction(
                      'ResetFieldsConfirm',
                      () => {
                        resetLocalFields(activeId);
                      },
                      'Discard changes',
                      'warning'
                    );
                  }}
                />
              </Tooltip>
              <Button
                text={t(submitLabel)}
                disabled={!canSubmit()}
                icon={'tick'}
                name={`interface-creator-submit-${type}`}
                intent={Intent.SUCCESS}
                onClick={handleSubmitClick}
              />
            </ButtonGroup>
          </div>
        </ActionsWrapper>
      </Content>
      {showClassConnectionsManager && hasClassConnections && initialData.qorus_instance && (
        <CustomDialog
          isOpen
          title={t('ClassConnectionsManager')}
          onClose={() => setShowClassConnectionsManager(false)}
          style={{
            width: '80vw',
            minHeight: '40vh',
            maxHeight: '90vh',
            backgroundColor: '#fff',
          }}
        >
          <ClassConnectionsManager
            ifaceType={type === 'service-methods' ? 'service' : type}
            interfaceIndex={interfaceIndex}
            baseClassName={requestFieldData('base-class-name', 'value')}
            interfaceContext={getContext()}
            initialConnections={classConnectionsData}
            onSubmit={(classConnections) => {
              const modifiedConnections = reduce(
                classConnections,
                (newConnections, connection, name) => {
                  return {
                    ...newConnections,
                    [name]: connection.reduce(
                      (newConnection, item) => [
                        ...newConnection,
                        omit(item, [
                          'nextItemData',
                          'previousItemData',
                          'isInputCompatible',
                          'isOutputCompatible',
                          'index',
                          'isBetween',
                          'isEditing',
                          'isEvent',
                          'isLast',
                        ]),
                      ],
                      []
                    ),
                  };
                },
                {}
              );
              modifyMappers(modifiedConnections);
              setClassConnectionsData(modifiedConnections);
              setShowClassConnectionsManager(false);
            }}
          />
        </CustomDialog>
      )}
      {showConfigItemsManager && hasConfigManager ? (
        <CustomDialog
          isOpen
          title={t('ConfigItemsManager')}
          onClose={() => setShowConfigItemsManager(false)}
          style={{ width: '80vw', backgroundColor: '#fff' }}
        >
          <ConfigItemManager
            type={type}
            baseClassName={
              selectedFields &&
              selectedFields.find((field: IField) => field.name === 'base-class-name')?.value
            }
            classes={getClasses()}
            definitionsOnly={definitionsOnly}
            interfaceId={interfaceId}
            resetFields={resetFields}
            onUpdate={() => updateDraft()}
            steps={processSteps(steps, stepsData)}
          />
        </CustomDialog>
      ) : null}
    </>
  );
};

export default compose(
  withInitialDataConsumer(),
  withTextContext(),
  withMessageHandler(),
  withMethodsConsumer(),
  withGlobalOptionsConsumer(),
  withMapperConsumer(),
  withStepsConsumer(),
  withFieldsConsumer(),
  withState(
    'interfaceIndex',
    'setInterfaceIndex',
    ({ type, interfaceId, interfaceIndex, selectedFields }) => {
      return interfaceIndex ?? size(interfaceId[type]);
    }
  ),
  mapProps(
    ({
      type,
      fields,
      selectedFields,
      query,
      selectedQuery,
      activeId,
      interfaceId,
      initialInterfaceId,
      interfaceIndex,
      ...rest
    }) => ({
      fields: activeId ? fields[type]?.[interfaceIndex]?.[activeId] : fields[type][interfaceIndex],
      selectedFields: activeId
        ? selectedFields[type]?.[interfaceIndex]?.[activeId]
        : selectedFields[type][interfaceIndex],
      query: query[type][interfaceIndex],
      selectedQuery: selectedQuery[type][interfaceIndex],
      allSelectedFields: selectedFields,
      allFields: fields,
      interfaceId:
        initialInterfaceId ||
        interfaceId[type === 'service-methods' ? 'service' : type][interfaceIndex],
      type,
      activeId,
      interfaceIndex,
      ...rest,
    })
  )
)(InterfaceCreatorPanel);
