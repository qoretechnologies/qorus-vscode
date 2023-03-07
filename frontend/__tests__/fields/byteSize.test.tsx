import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import ByteSizeField from '../../src/components/Field/byteSize';

test('<ByteSize /> - renders a field with a default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <ByteSizeField default_value="5 MiB" onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toBeTruthy();

  // expect the input to have value 5
  expect(document.querySelector('.reqore-input')?.getAttribute('value')).toBe('5');
  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();
  expect(document.querySelector('.reqore-dropdown-control')).toHaveTextContent(/MiB/);

  expect(onChange).toHaveBeenCalledWith('test', '5 MiB');
});

test('<ByteSize /> - renders a field with a value that overwrites default value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <ByteSizeField default_value="5 MiB" value="4KB" onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toBeTruthy();

  // expect the input to have value 5
  expect(document.querySelector('.reqore-input')?.getAttribute('value')).toBe('4');
  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();
  expect(document.querySelector('.reqore-dropdown-control')).toHaveTextContent(/KB/);

  expect(onChange).toHaveBeenCalledWith('test', '4KB');
});

test('<ByteSize /> - changes value properly', () => {
  const onChange = jest.fn();
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ByteSizeField default_value="5 MiB" value="4KB" onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-input')).toBeTruthy();

  fireEvent.change(document.querySelector('.reqore-input'), { target: { value: 10 } });

  expect(document.querySelector('.reqore-input')?.getAttribute('value')).toBe('4');
  expect(document.querySelector('.reqore-dropdown-control')).toHaveTextContent(/KB/);
  expect(onChange).toHaveBeenLastCalledWith('test', '10KB');

  fireEvent.click(document.querySelector('.reqore-dropdown-control'));

  jest.advanceTimersByTime(500);

  expect(document.querySelector('.reqore-popover-content')).toBeTruthy();

  fireEvent.click(document.querySelectorAll('.reqore-button')[2]);

  expect(onChange).toHaveBeenLastCalledWith('test', '4MB');
});
