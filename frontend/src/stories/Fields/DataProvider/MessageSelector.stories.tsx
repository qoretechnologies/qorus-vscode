import { ProviderMessageSelector } from '../../../components/Field/connectors/MessageSelector';

export default {
  component: ProviderMessageSelector,
  title: 'Fields/DataProvider/MessageSelector',
};

export const Basic = {
  args: {
    url: '/dataprovider/factories/wsclient/provider?provider_yaml_options={url=d3NzOi8vc2FuZGJveDpzYW5kYm94QHNhbmRib3gucW9yZXRlY2hub2xvZ2llcy5jb20vYXBpZXZlbnRz}',
  },
};

export const ReadOnly = {
  args: {
    readOnly: true,
    url: '/dataprovider/factories/wsclient/provider?provider_yaml_options={url=d3NzOi8vc2FuZGJveDpzYW5kYm94QHNhbmRib3gucW9yZXRlY2hub2xvZ2llcy5jb20vYXBpZXZlbnRz}',
  },
};
