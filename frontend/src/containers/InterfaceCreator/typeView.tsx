import { Button, ButtonGroup, Callout, Intent, Tooltip } from '@blueprintjs/core';
import { cloneDeep, get, isEqual, map, reduce, set, size, unset } from 'lodash';
import { useContext, useState } from 'react';
import { useDebounce, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import FileField from '../../components/Field/fileString';
import String from '../../components/Field/string';
import Suggest from '../../components/Field/suggest';
import FieldLabel from '../../components/FieldLabel';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper } from '../../components/FieldWrapper';
import { Messages } from '../../constants/messages';
import { DraftsContext, IDraftData } from '../../context/drafts';
import { deleteDraft, getDraftId, getTargetFile, hasValue } from '../../helpers/functions';
import { flattenFields, getLastChildIndex } from '../../helpers/mapper';
import { validateField } from '../../helpers/validations';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import TinyGrid from '../../images/TinyGrid';
import { StyledFieldsWrapper, StyledMapperWrapper } from '../Mapper';
import MapperInput from '../Mapper/input';
import MapperFieldModal from '../Mapper/modal';

export const formatFields = (fields) => {
  const newFields = reduce(
    fields,
    (formattedFields, field, fieldName) => {
      const name = fieldName.replace(/(?<!\\)\./g, '\\.');

      return {
        ...formattedFields,
        [name]: {
          ...field,
          name,
          type: {
            ...field?.type,
            fields: formatFields(field?.type?.fields || {}),
          },
        },
      };
    },
    {}
  );

  return newFields;
};

const TypeView = ({ initialData, t, setTypeReset, onSubmitSuccess }) => {
  const [interfaceId, setInterfaceId] = useState(null);
  const [val, setVal] = useState(initialData?.type?.path || '');
  const [types, setTypes] = useState([]);
  const [addDialog, setAddDialog] = useState({});
  const [fields, setFields] = useState(
    formatFields(initialData.type ? cloneDeep(initialData.type.typeinfo.fields) : {})
  );
  const [targetDir, setTargetDir] = useState(initialData?.type?.target_dir || '');
  const [targetFile, setTargetFile] = useState(initialData?.type?.target_file || '');
  const { maybeApplyDraft, draft } = useContext(DraftsContext);

  const reset = (soft?: boolean) => {
    setInterfaceId(shortid.generate());

    if (soft) {
      setVal(initialData?.type?.path || '');
      setAddDialog({});
      setFields(initialData.type ? cloneDeep(initialData.type.typeinfo.fields) : {});
      setTargetDir(initialData?.type?.target_dir || '');
      setTargetFile(initialData?.type?.target_file || '');
    } else {
      setVal('');
      setAddDialog({});
      setFields({});
      setTargetDir('');
      setTargetFile('');
    }
  };

  const applyDraft = () => {
    // Apply the draft with "type" as first parameter and a custom function
    maybeApplyDraft(
      'type',
      undefined,
      initialData?.type,
      ({ typeData: { fields, val, targetDir, targetFile, types }, interfaceId }: IDraftData) => {
        setInterfaceId(interfaceId);
        setVal(val);
        setTypes(types);
        setTargetDir(targetDir);
        setTargetFile(targetFile);
        setFields(fields);
      }
    );
  };

  useUpdateEffect(() => {
    if (draft) {
      applyDraft();
    }
  }, [draft]);

  useMount(() => {
    setTypeReset(() => reset);

    if (initialData.qorus_instance) {
      (async () => {
        const data = await initialData.fetchData('/system/metadata/types');
        setTypes(data.data);
        setInterfaceId(initialData?.type?.iface_id || shortid.generate());
        applyDraft();
      })();
    }

    return () => {
      setTypeReset(null);
    };
  });

  // Compare initial data with state to check if the type has changed
  const hasDataChanged = () => {
    return (
      initialData.type?.path !== val ||
      !isEqual(initialData.type?.typeinfo?.fields, fields) ||
      initialData.type?.target_dir !== targetDir ||
      initialData.type?.target_file !== targetFile
    );
  };

  useDebounce(
    () => {
      const draftId = getDraftId(initialData.type, interfaceId);
      const hasChanged = initialData.type ? hasDataChanged() : true;

      if (
        draftId &&
        (hasValue(val) || hasValue(targetDir) || hasValue(targetFile) || size(fields)) &&
        hasChanged
      ) {
        initialData.saveDraft(
          'type',
          draftId,
          {
            typeData: {
              val,
              targetDir,
              targetFile,
              fields,
              types,
            },
            interfaceId,
            associatedInterface: getTargetFile(initialData.type),
            isValid: !(!size(fields) && validateField('string', val)),
          },
          val
        );
      }
    },
    1500,
    [val, types, fields, targetDir, targetFile]
  );

  if (!initialData.qorus_instance) {
    return (
      <Callout title={t('NoInstanceTitle')} icon="warning-sign" intent="warning">
        {t('NoInstance')}
      </Callout>
    );
  }

  const addField = (path: string, data) => {
    // Set the new fields
    setFields((current) => {
      // Clone the current fields
      const result: any = { ...current };
      // If we are adding field to the top
      if (path === '') {
        // Simply add the field
        result[data.name] = data;
        return result;
      }
      // Build the path
      const fields: string[] = path.split(/(?<!\\)\./g);
      let newPath: string;
      let newPathList: string[];
      fields.forEach((fieldName) => {
        if (!newPath) {
          newPath = fieldName;
          newPathList = [fieldName];
        } else {
          newPath += `.type.fields.${fieldName}`;
          newPathList.push('type', 'fields', fieldName);
        }
      });
      // Get the object at the exact path
      const obj: any = get(result, newPathList);
      // Add new object
      obj.type.fields[data.name] = data;
      // Return new data
      return result;
    });
  };

  const editField = (path, data, remove?: boolean, oldData?: any) => {
    // Set the new fields
    setFields((current) => {
      // Clone the current fields
      const result: any = cloneDeep(current);
      // Build the path
      const fields: string[] = path.split(/(?<!\\)\./g);
      let newPath: string;
      let newPathList: string[];
      fields.forEach((fieldName) => {
        if (!newPath) {
          newPath = fieldName;
          newPathList = [fieldName];
        } else {
          newPath += `.type.fields.${fieldName}`;
          newPathList.push('type', 'fields', fieldName);
        }
      });
      // Always remove the original object
      unset(result, newPathList);
      if (remove) {
        return result;
      }
      // Build the updated path
      const oldFields: string[] = path.split(/(?<!\\)\./g);
      // Remove the last value from the fields
      oldFields.pop();
      // Add the new name to the end of the fields list
      oldFields.push(data.name);

      let newUpdatedPath: string;
      let newUpdatedPathList: string[];
      oldFields.forEach((fieldName) => {
        if (!newUpdatedPath) {
          newUpdatedPath = fieldName;
          newUpdatedPathList = [fieldName];
        } else {
          newUpdatedPath += `.type.fields.${fieldName}`;
          newUpdatedPathList.push('type', 'fields', fieldName);
        }
      });
      // Get the object at the exact path
      set(result, newUpdatedPathList, {
        ...data,
        path: oldFields.join('.'),
      });
      // Return new data
      return result;
    });
  };

  const handleClick = (field?: any, edit?: boolean, remove?: boolean): void => {
    if (remove) {
      editField(field.path, null, true);
    } else {
      setAddDialog({
        isOpen: true,
        siblings: field ? field?.type?.fields : fields,
        fieldData: edit ? field : null,
        isParentCustom: field?.isCustom,
        onSubmit: (data, oldData) => {
          if (edit) {
            editField(field.path, data, false, oldData);
          } else {
            addField(field?.path || '', data);
          }
        },
      });
    }
  };

  const handleSubmitClick = async () => {
    const result = await initialData.callBackend(
      initialData.type ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
      undefined,
      {
        iface_kind: 'type',
        orig_data: initialData.type,
        no_data_return: !!onSubmitSuccess,
        data: {
          target_dir: !targetDir || targetDir === '' ? undefined : targetDir,
          target_file: !targetFile || targetFile === '' ? undefined : targetFile,
          path: val,
          typeinfo: {
            base_type: 'hash<auto>',
            name: 'hash<auto>',
            can_manage_fields: true,
            fields,
          },
        },
      },
      t('Saving type...')
    );

    if (result.ok) {
      if (onSubmitSuccess) {
        onSubmitSuccess({
          target_dir: !targetDir || targetDir === '' ? undefined : targetDir,
          target_file: !targetFile || targetFile === '' ? undefined : targetFile,
          path: val,
          typeinfo: {
            base_type: 'hash<auto>',
            name: 'hash<auto>',
            can_manage_fields: true,
            fields,
          },
        });
      }

      deleteDraft('type', interfaceId, false);
      reset();
    }
  };

  const flattenedFields = flattenFields(fields);

  return (
    <>
      <FieldWrapper name="selected-field">
        <FieldLabel
          label={t('field-label-target_dir')}
          isValid={validateField('file-string', targetDir)}
        />
        <FieldInputWrapper>
          <FileField
            onChange={(_name, value) => setTargetDir(value)}
            name="target_dir"
            value={targetDir}
            get_message={{
              action: 'creator-get-directories',
              object_type: 'target_dir',
            }}
            return_message={{
              action: 'creator-return-directories',
              object_type: 'target_dir',
              return_value: 'directories',
            }}
          />
        </FieldInputWrapper>
      </FieldWrapper>
      <FieldWrapper name="selected-field">
        <FieldLabel label={t('field-label-target_file')} info={t('Optional')} isValid />
        <FieldInputWrapper>
          <String
            onChange={(_name, value) => setTargetFile(value)}
            name="target-dir"
            value={targetFile}
          />
        </FieldInputWrapper>
      </FieldWrapper>
      <FieldWrapper name="selected-field">
        <FieldLabel label={t('Path')} isValid={validateField('string', val)} />
        <FieldInputWrapper>
          <Suggest
            defaultItems={types}
            value={val}
            name="path"
            onChange={(_name, value) => setVal(value)}
          />
        </FieldInputWrapper>
      </FieldWrapper>
      <div
        style={{
          width: '100%',
          marginTop: '15px',
          padding: 10,
          flex: 1,
          overflow: 'auto',
          background: `url(${TinyGrid})`,
        }}
      >
        <StyledMapperWrapper style={{ justifyContent: 'center', paddingTop: '10px' }}>
          <StyledFieldsWrapper style={{ flex: '0 1 auto' }}>
            {size(flattenedFields) !== 0
              ? map(flattenedFields, (input, index) => (
                  <MapperInput
                    key={input.path}
                    name={input.name}
                    types={input.type.types_returned}
                    {...input}
                    field={input}
                    id={index + 1}
                    lastChildIndex={getLastChildIndex(input, flattenedFields) - index}
                    onClick={handleClick}
                    hasAvailableOutput={true}
                  />
                ))
              : null}
            <Button
              fill
              text={t('AddNewField')}
              minimal
              intent="success"
              icon="add"
              name="type-add-field"
              onClick={() => handleClick()}
            />
          </StyledFieldsWrapper>
        </StyledMapperWrapper>
      </div>
      <ActionsWrapper>
        <div style={{ float: 'right', width: '100%' }}>
          <ButtonGroup fill>
            <Tooltip content={t('ResetTooltip')}>
              <Button
                text={t('Reset')}
                icon={'history'}
                onClick={() => {
                  initialData.confirmAction(
                    'ResetFieldsConfirm',
                    () => {
                      reset(true);
                    },
                    'Reset',
                    'warning'
                  );
                }}
              />
            </Tooltip>
            <Button
              text={t('Submit')}
              onClick={handleSubmitClick}
              disabled={!(size(fields) && validateField('string', val))}
              icon={'tick'}
              name="type-submit"
              intent={Intent.SUCCESS}
            />
          </ButtonGroup>
        </div>
      </ActionsWrapper>
      {addDialog.isOpen && (
        <MapperFieldModal t={t} onClose={() => setAddDialog({})} {...addDialog} />
      )}
    </>
  );
};

export default compose(
  withInitialDataConsumer(),
  withTextContext(),
  withMessageHandler(),
  withGlobalOptionsConsumer()
)(TypeView);
