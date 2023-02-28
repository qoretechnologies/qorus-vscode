import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import Auto from '../../src/components/Field/auto';

test('Renders default <Auto /> field with no type', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Auto onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-button').length).toBe(2);

  expect(onChange).toHaveBeenLastCalledWith('test', undefined, 'any', true);
});

test('Renders default <Auto /> field with no type, type can be selected', () => {
  const onChange = jest.fn();
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <Auto onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-dropdown-control')!);

  jest.advanceTimersByTime(10);

  fireEvent.click(screen.getAllByText('string')[0]);

  jest.advanceTimersByTime(10);

  expect(document.querySelector('.reqore-textarea')).toBeTruthy();

  fireEvent.change(document.querySelector('.reqore-textarea')!, {
    target: {
      value: 'asfg',
    },
  });

  expect(onChange).toHaveBeenLastCalledWith('test', 'asfg', 'string', false);

  fireEvent.click(document.querySelector('.reqore-dropdown-control')!);

  jest.advanceTimersByTime(10);

  fireEvent.click(screen.getAllByText('int')[0]);

  expect(document.querySelector('.reqore-input')).toBeTruthy();

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: {
      value: 123,
    },
  });

  expect(onChange).toHaveBeenLastCalledWith('test', 123, 'int', false);
});

test('Renders default <Auto /> field type determined from value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Auto onChange={onChange} name="test" value={{ key: 'value' }} />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea').length).toBe(1);

  expect(onChange).toHaveBeenLastCalledWith('test', { key: 'value' }, 'hash', false);
});

test('Renders default <Auto /> field with default type', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Auto onChange={onChange} name="test" defaultType="bool" />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-checkbox').length).toBe(1);

  expect(onChange).toHaveBeenLastCalledWith('test', false, 'bool', false);
});

test('Renders default <Auto /> field with default internal type', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Auto onChange={onChange} name="test" defaultInternalType="bool" value={false} />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-checkbox').length).toBe(1);

  expect(onChange).toHaveBeenLastCalledWith('test', false, 'bool', false);
});

test('Renders default <Auto /> field with outside defined can be null', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Auto
        onChange={onChange}
        name="test"
        defaultInternalType="bool"
        value={false}
        requestFieldData={(name, key) => {
          if (name === 'can_be_undefined' && key === 'value') {
            return true;
          }

          return undefined;
        }}
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-checkbox').length).toBe(1);

  expect(onChange).toHaveBeenLastCalledWith('test', false, 'bool', true);
});

test('Renders default <Auto /> field with outside defined type', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Auto
        onChange={onChange}
        name="test"
        value={[1, 2, 3]}
        requestFieldData={(name, key) => {
          if (name === 'type_depends_on' && key === 'value') {
            return 'list';
          }

          return true;
        }}
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea').length).toBe(1);

  expect(onChange).toHaveBeenLastCalledWith('test', [1, 2, 3], 'list', true);
});
