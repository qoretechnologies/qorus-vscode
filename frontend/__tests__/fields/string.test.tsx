import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import String from '../../src/components/Field/string';
import { Empty, WithDefaultValue } from '../../src/stories/Fields/String.stories';

test.only('<StringField> - renders empty string field', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Empty {...Empty.args} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(document.querySelector('.reqore-tag')).toBeFalsy();
  expect(onChange).toHaveBeenCalledWith('test', undefined);
});

test.only('<StringField> - renders a string field with a defaultValue', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <WithDefaultValue {...WithDefaultValue.args} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(document.querySelector('.reqore-tag')).toBeFalsy();
  expect(onChange).toHaveBeenCalledWith('test', 'Some default value');
});

test('<StringField> - renders a string field with a value that overwrites default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <String default_value="Test" value="hello" onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', 'hello');
});

test('<StringField> - renders a string field with a label', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <String default_value="Test" onChange={onChange} name="test" label="Field" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(document.querySelector('.reqore-tag')).toBeTruthy();
  expect(screen.getByText('Field')).toBeTruthy();
});

test('<StringField> - renders a string field with autoFocus', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <String default_value="Test" onChange={onChange} name="test" autoFocus />
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toHaveFocus();
});

test('<StringField> - renders a correct null value if can be null is true', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <String default_value="Test" value={null} canBeNull onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', null);
  // Expect the input to have value of 'Value set to [null]'
  expect(document.querySelector('.reqore-input')).toHaveValue('Value set to [null]');
});

test('<StringField> - renders a no value if can be null is false', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <String default_value="Test" value={null} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', 'Test');
  // Expect the input to have value of default value
  expect(document.querySelector('.reqore-input')).toHaveValue('Test');
});

test('<StringField> - renders a correct value with backend messages provided', async () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <String
        get_message={{ action: 'string-test' }}
        return_message={{ action: 'string-test-response', return_value: 'importantValue' }}
        onChange={onChange}
        name="test"
      />
    </ReqoreUIProvider>
  );

  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(onChange).toHaveBeenLastCalledWith('test', '1234');
});
