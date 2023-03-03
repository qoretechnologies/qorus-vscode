import { StoryFn } from '@storybook/react';
import StringField from '../../components/Field/string';

export default {
  component: StringField,
};

const Template: StoryFn<typeof StringField> = (args) => <StringField {...args} />;

export const Empty = Template.bind({});
export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'Test',
};
export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  default_value: 'Some default value',
};
export const WithValue = Template.bind({});
WithValue.args = {
  value: 'Some value',
  default_value: 'Some default value',
};
