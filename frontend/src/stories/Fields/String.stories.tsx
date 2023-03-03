import { expect } from '@storybook/jest';
import { StoryFn } from '@storybook/react';
import StringField from '../../components/Field/string';

export default {
  component: StringField,
};

const Template: StoryFn<typeof StringField> = (args) => <StringField {...args} />;

export const Empty: StoryFn<typeof StringField> = Template.bind({});

export const WithLabel: StoryFn<typeof StringField> = Template.bind({});
WithLabel.args = {
  label: 'Field',
};

WithLabel.play = async () => {
  await expect(document.querySelector('.reqore-tag')).toBeInTheDocument();
};

export const WithDefaultValue: StoryFn<typeof StringField> = Template.bind({});
WithDefaultValue.args = {
  default_value: 'Some default value',
};

export const WithValue: StoryFn<typeof StringField> = Template.bind({});
WithValue.args = {
  value: 'Some value',
  default_value: 'Some default value',
};

export const WithAutofocus: StoryFn<typeof StringField> = Template.bind({});
WithAutofocus.args = {
  autoFocus: true,
};

export const CanBeNull: StoryFn<typeof StringField> = Template.bind({});
CanBeNull.args = {
  canBeNull: true,
  value: null,
};
