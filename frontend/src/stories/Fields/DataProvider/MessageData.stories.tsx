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
