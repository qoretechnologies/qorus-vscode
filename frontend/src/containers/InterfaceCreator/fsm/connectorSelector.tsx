import { ReqoreControlGroup } from '@qoretechnologies/reqore';
import { useEffect, useState } from 'react';
import SelectField from '../../../components/Field/select';
import Loader from '../../../components/Loader';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../../hocomponents/withMessageHandler';

export interface IConnectorSelectorProps {
  value?: {
    class: string;
    connector: string;
  };
  onChange: (value: { class: string; connector: string }) => void;
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  types: string[];
  target_dir: string;
}

export interface IClass {
  name: string;
  desc: string;
  'class-connectors': IConnector[];
}

export interface IConnector {
  name: string;
  type: 'input' | 'output' | 'input-output' | 'event' | 'condition';
}

const ConnectorSelector = ({
  value,
  onChange,
  addMessageListener,
  postMessage,
  types,
  target_dir,
}: IConnectorSelectorProps) => {
  const [classes, setClasses] = useState<IClass[]>(null);

  useEffect(() => {
    const listener = addMessageListener('creator-return-objects', (data) => {
      if (data.object_type === 'class-with-connectors') {
        setClasses(data.objects);
      }
    });

    postMessage('creator-get-objects', {
      object_type: 'class-with-connectors',
      custom_data: {
        connector_type: types,
      },
    });

    return () => {
      listener();
    };
  }, []);

  const getConnectors = (): IConnector[] => {
    const selectedClass: IClass = classes.find((clss) => clss.name === value?.['class']);

    return selectedClass?.['class-connectors'].filter((connector) =>
      types.includes(connector.type)
    );
  };

  const handleChange = (name: string, val: any) => {
    let newValue = value;

    if (name === 'class' && newValue) {
      newValue.connector = null;
      postMessage('creator-get-objects', {
        object_type: 'class-with-connectors',
        custom_data: {
          connector_type: types,
        },
      });
    }

    onChange({
      ...value,
      [name]: val,
    });
  };

  if (!classes) {
    return <Loader />;
  }

  return (
    <ReqoreControlGroup stack fluid vertical>
      <SelectField
        onChange={handleChange}
        value={value?.['class']}
        name="class"
        target_dir={target_dir}
        defaultItems={classes}
        reference={{
          iface_kind: 'class',
        }}
      />
      {value?.['class'] && (
        <SelectField
          defaultItems={getConnectors()}
          onChange={handleChange}
          value={value?.connector}
          name="connector"
          description={'Class connector'}
        />
      )}
    </ReqoreControlGroup>
  );
};

export default withMessageHandler()(ConnectorSelector);
