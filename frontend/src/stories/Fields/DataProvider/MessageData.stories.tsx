import { Meta, StoryObj } from '@storybook/react';
import { ProviderMessageData } from '../../../components/Field/connectors/MessageData';

const meta = {
  component: ProviderMessageData,
  title: 'Fields/DataProvider/MessageData',
} as Meta<typeof ProviderMessageData>;

export default meta;

export const Basic: StoryObj<typeof meta> = {
  args: {
    url: '/dataprovider/factories/wsclient/provider?provider_yaml_options={url=d3NzOi8vc2FuZGJveDpzYW5kYm94QHNhbmRib3gucW9yZXRlY2hub2xvZ2llcy5jb20vYXBpZXZlbnRz}',
    messageId: 'raw',
  },
};

export const Complex: StoryObj<typeof meta> = {
  args: {
    url: '/dataprovider/factories/mqtt/provider?provider_yaml_options={subscription_qos=Mgo=,subscription_topic=JyMnCg==,url=J3RjcDovL2xvY2FsaG9zdDoxODg4MycK}',
    messageId: 'message',
  },
};

export const WithValue: StoryObj<typeof meta> = {
  args: {
    url: '/dataprovider/factories/mqtt/provider?provider_yaml_options={subscription_qos=Mgo=,subscription_topic=JyMnCg==,url=J3RjcDovL2xvY2FsaG9zdDoxODg4MycK}',
    messageId: 'message',
    value: {
      topic: 'test',
      qos: 1,
      retained: true,
    },
  },
};

export const FreeformWithValue: StoryObj<typeof meta> = {
  args: {
    url: '/dataprovider/factories/mqtt/provider?provider_yaml_options={subscription_qos=Mgo=,subscription_topic=JyMnCg==,url=J3RjcDovL2xvY2FsaG9zdDoxODg4MycK}',
    messageId: 'message',
    isFreeform: true,
    value: {
      topic: 'test',
      qos: 1,
      retained: true,
    },
  },
};

export const ReadOnly: StoryObj<typeof meta> = {
  args: {
    readOnly: true,
    url: '/dataprovider/factories/wsclient/provider?provider_yaml_options={url=d3NzOi8vc2FuZGJveDpzYW5kYm94QHNhbmRib3gucW9yZXRlY2hub2xvZ2llcy5jb20vYXBpZXZlbnRz}',
    messageId: 'raw',
  },
};
