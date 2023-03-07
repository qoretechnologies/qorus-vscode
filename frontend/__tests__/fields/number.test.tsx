import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import Number from '../../src/components/Field/number';
import String from '../../src/components/Field/string';

test('<NumberField /> - renders a field with a defaultValue', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Number default_value={10} onChange={onChange} name="test" type="int" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', 10);
});

test('<NumberField> - renders a field with a number value that overwrites default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Number default_value={10} value={20} onChange={onChange} name="test" type="number" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', 20);
});

test('<NumberField> - renders a field with a number as a string value that overwrites default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Number default_value={10} value="20" onChange={onChange} name="test" type="number" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', 20);
});

test('<NumberField> - renders a field with a float value that overwrites default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Number default_value={10} value={3.5} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', 3.5);
});

test('<NumberField> - renders a field with a float value as string that overwrites default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Number default_value={10} value="3.5" onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-input')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', 3.5);
});

test('<NumberField> - renders a correct value with backend messages provided', async () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <String
        get_message={{ action: 'number-test' }}
        return_message={{ action: 'number-test-response', return_value: 'importantValue' }}
        onChange={onChange}
        name="test"
      />
    </ReqoreUIProvider>
  );

  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(onChange).toHaveBeenLastCalledWith('test', 1234);
});
