import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import Select from '../../src/components/Field/select';

const items: { name: string; desc?: string }[] = [
  { name: 'Test' },
  { name: 'Test2 filter me' },
  { name: 'Test3' },
];
const itemsWithDescription: { name: string; desc?: string }[] = [
  { name: 'Test', desc: 'Test description' },
  { name: 'Test2', desc: 'Test2 description' },
  { name: 'Test3', desc: 'Test3 description' },
];

test('renders <SelectField /> with default items', () => {
  const onChange = jest.fn();
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <Select defaultItems={items} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();
  expect(screen.getAllByText('PleaseSelect')).toBeTruthy();

  // Click the dropdown
  fireEvent.click(document.querySelector('.reqore-dropdown-control')!);

  // Wait for the dropdown to open
  jest.advanceTimersByTime(10);

  expect(document.querySelectorAll('.reqore-button').length).toBe(4);
});

test('renders <SelectField /> with default items and value', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Select defaultItems={items} value="Test3" onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();
  expect(screen.getAllByText('Test3')).toBeTruthy();
});

test('renders <SelectField /> with default items, onChange is fired', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Select defaultItems={items} onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();

  // Click the dropdown
  fireEvent.click(document.querySelector('.reqore-dropdown-control')!);

  // Wait for the dropdown to open
  jest.advanceTimersByTime(10);

  fireEvent.click(screen.getAllByText('Test2 filter me')[0]);

  expect(onChange).toBeCalledWith('test', 'Test2 filter me');
});

test('renders <SelectField /> with 1 item, auto selects it', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Select defaultItems={[{ name: 'Single item' }]} autoSelect onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-control-group').length).toBe(0);
  expect(document.querySelectorAll('.reqore-dropdown').length).toBe(0);
  expect(document.querySelector('.reqore-button')).toBeTruthy();
  expect(onChange).toBeCalledWith('test', 'Single item');
});

test('renders <SelectField /> with default items with description and value', () => {
  const onChange = jest.fn();
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <Select defaultItems={itemsWithDescription} value="Test3" onChange={onChange} name="test" />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-button')).toBeTruthy();
  expect(screen.getAllByText('Test3')).toBeTruthy();
  expect(screen.getAllByText('Hover to see description')).toBeTruthy();

  // Click the dropdown
  fireEvent.click(document.querySelector('.reqore-button')!);

  jest.advanceTimersByTime(10);

  expect(document.querySelector('.reqore-modal')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(3);
});

test('renders <SelectField /> with default items and value, with forced dropdown', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Select
        defaultItems={itemsWithDescription}
        value="Test3"
        onChange={onChange}
        name="test"
        forceDropdown
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();
  expect(screen.getAllByText('Test3')).toBeTruthy();
});

test('renders <SelectField /> with items fetched from backend', async () => {
  const onChange = jest.fn();
  jest.useRealTimers();

  render(
    <ReqoreUIProvider>
      <Select
        //defaultItems={items}
        get_message={{ action: 'select-items' }}
        return_message={{ action: 'select-items-response', return_value: 'testData' }}
        onChange={onChange}
        name="test"
      />
    </ReqoreUIProvider>
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Click the dropdown
  fireEvent.click(document.querySelector('.reqore-button')!);

  jest.advanceTimersByTime(10);

  expect(document.querySelectorAll('.reqore-modal').length).toBe(1);
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(4);

  expect(screen.getAllByText('Item 1')).toBeTruthy();
  expect(screen.getAllByText('Item 1 description')).toBeTruthy();
});

test('renders <SelectField /> with items fetched from backend and with filters', async () => {
  const onChange = jest.fn();
  jest.useRealTimers();

  render(
    <ReqoreUIProvider>
      <Select
        //defaultItems={items}
        get_message={{ action: 'select-items' }}
        return_message={{ action: 'select-items-response', return_value: 'testData' }}
        onChange={onChange}
        name="test"
        filters={['filterMe']}
      />
    </ReqoreUIProvider>
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Click the dropdown
  fireEvent.click(document.querySelector('.reqore-button')!);

  jest.advanceTimersByTime(10);

  expect(document.querySelectorAll('.reqore-modal').length).toBe(1);
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(4);
  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(2);

  fireEvent.click(screen.getAllByText('Filterme')[0]);

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(1);
  expect(screen.getAllByText('Item 3')).toBeTruthy();
  expect(screen.getAllByText('Item 3 description')).toBeTruthy();
});

test('renders <SelectField /> with predicate filter', () => {
  const onChange = jest.fn();
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <Select
        defaultItems={items}
        onChange={onChange}
        name="test"
        predicate={(name) => name.includes('filter me')}
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(document.querySelector('.reqore-dropdown-control')).toBeTruthy();
  expect(screen.getAllByText('PleaseSelect')).toBeTruthy();

  // Click the dropdown
  fireEvent.click(document.querySelector('.reqore-dropdown-control')!);

  // Wait for the dropdown to open
  jest.advanceTimersByTime(10);

  expect(document.querySelectorAll('.reqore-button').length).toBe(2);
  expect(screen.getAllByText('Test2 filter me')).toBeTruthy();
});
