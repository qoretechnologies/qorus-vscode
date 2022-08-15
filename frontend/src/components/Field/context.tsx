import { ControlGroup } from '@blueprintjs/core';
import size from 'lodash/size';
import { FunctionComponent, useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { Messages } from '../../constants/messages';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import SelectField from './select';
import String from './string';

export interface IContextField {
  value: {
    iface_kind: string;
    name: string;
  };
}

const ContextField: FunctionComponent<IContextField & IFieldChange & IField> = ({
  onChange,
  value = {},
  default_value,
  name,
  read_only,
  disabled,
  addMessageListener,
  postMessage,
}) => {
  const [ifaces, setIfaces] = useState(null);

  useMount(() => {
    if (!read_only && !disabled) {
      addMessageListener(Messages.RETURN_OBJECTS_WITH_STATIC_DATA, (data) => {
        // Save the interfaces returned from the backend
        setIfaces(data.objects);
      });
    }
    // Save the default value
    if (default_value || (value && size(value))) {
      const val = default_value || value;
      onChange(name, val);
      // Ask for the context interface
      if (!read_only && !disabled) {
        postMessage(Messages.GET_INTERFACE_DATA, {
          iface_kind: val.iface_kind,
          name: val.name,
          custom_data: {
            event: 'context',
            iface_kind: val.iface_kind,
          },
        });
      }
    }
  });

  useEffect(() => {
    if (value.iface_kind) {
      // Reset the ifaces
      setIfaces(null);
      // When the interface changes, ask for a list of interfaces
      // with static data defined
      postMessage(Messages.GET_OBJECTS_WITH_STATIC_DATA, {
        iface_kind: value.iface_kind,
      });
    }
  }, [value.iface_kind]);

  if (read_only || disabled) {
    return (
      <String name={name} read_only value={`${default_value.iface_kind}:${default_value.name}`} />
    );
  }

  return (
    <div>
      <ControlGroup fill>
        <SelectField
          name="iface_kind"
          value={value.iface_kind}
          defaultItems={[
            {
              name: 'workflow',
            },
          ]}
          onChange={(_fieldName: string, val: string) => {
            onChange(name, { iface_kind: val });
            setIfaces(null);
          }}
          fill
        />
        {ifaces && (
          <SelectField
            name="name"
            value={value.name}
            defaultItems={ifaces}
            onChange={(_fieldName: string, val: string) => {
              onChange(name, { ...value, name: val });
              // Ask for the context interface
              postMessage(Messages.GET_INTERFACE_DATA, {
                iface_kind: value.iface_kind,
                name: val,
                custom_data: {
                  event: 'context',
                  iface_kind: value.iface_kind,
                },
              });
            }}
            fill
          />
        )}
      </ControlGroup>
    </div>
  );
};

export default withMessageHandler()(ContextField);
