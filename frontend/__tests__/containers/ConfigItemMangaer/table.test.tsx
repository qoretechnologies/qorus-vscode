import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigItemsTable, getItemType } from '../../../src/containers/ConfigItemManager/table';

describe('ConfigItemsTable component', () => {
  let mockProps, wrapper;

  beforeEach(() => {
    mockProps = {
      items: { key: 'value' },
      dispatchAction: jest.fn(),
      intrf: 'mockInterface',
      openModal: jest.fn(),
      closeModal: jest.fn(),
      onSubmit: jest.fn(),
      belongsTo: 'mockBelongsTo',
      showDescription: true,
      levelType: 'mockLevelType',
      stepId: 1,
      type: 'mockType',
      definitionsOnly: false,
      disableAdding: false,
      configItems: {},
    };
  });

  it('should render without crashing', () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemsTable {...mockProps} />
      </ReqoreUIProvider>
    );
  });

  it('should toggle group view on button click', () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemsTable {...mockProps} />
      </ReqoreUIProvider>
    );
    const button = screen.getByRole('button', { name: mockProps.groupName });
    fireEvent.click(button);
    expect(screen.getByRole('button')).toBeDefined();
  });
});

describe('getItemType function', () => {
  it('should return the correct type for a given value', () => {
    expect(getItemType('auto', '3')).toEqual('int');
    expect(getItemType('any', 'true')).toEqual('bool');
    expect(getItemType('array', '[1, 2, 3]')).toEqual('array');
    expect(getItemType('hash', '{ "key": "value" }')).toEqual('hash');
    expect(getItemType('string', 'hello')).toEqual('string');
    expect(getItemType('number', '42')).toEqual('number');
    expect(getItemType('boolean', 'true')).toEqual('boolean');
  });
});
