import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import BooleanField from '../../src/components/Field/boolean';

test('<BooleanField /> - renders a field with a default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <BooleanField default_value={true} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-checkbox')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', true);
});

test('<BooleanField /> - renders a field with a value that overwrites default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <BooleanField default_value={true} value={false} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-checkbox')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', false);
});

test('<BooleanField /> - changes value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <BooleanField default_value={true} value={false} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(onChange).toHaveBeenNthCalledWith(1, 'test', false);
  expect(document.querySelector('.reqore-checkbox')).toBeTruthy();

  fireEvent.click(document.querySelector('.reqore-checkbox'));

  expect(onChange).toHaveBeenNthCalledWith(2, 'test', true);
});
