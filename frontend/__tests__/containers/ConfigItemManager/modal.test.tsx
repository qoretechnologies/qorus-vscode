import React from 'react';
import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import ConfigItemsModal, { templatesList } from '../../../src/containers/ConfigItemManager/modal';

describe('ConfigItemsModal', () => {
  it('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal />
      </ReqoreUIProvider>
    );
  });
  /*
  it('renders with default values', () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal />
      </ReqoreUIProvider>
    );
    const valueInput = screen.getByLabelText('Value') as HTMLInputElement;
    expect(valueInput.value).toBeDefined();
  });
  

  it('renders with the correct tab selected', () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal/>
      </ReqoreUIProvider>
    );
    expect(screen.getByText('Template').classList).toContain('active');
  });

  it('renders the correct template type and key', () => {
    const item = { is_templated_string: true, value: `$${templatesList[0]}:key` };
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal item={item} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText(templatesList[0]).classList).toContain('selected');
    expect(screen.getByText('key').value).toBe('key');
  });

  it('calls the onSubmit function when save button is clicked', () => {
    const mockOnSubmit = jest.fn();
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal onSubmit={mockOnSubmit} />
      </ReqoreUIProvider>
    );
    fireEvent.click(screen.getByText('Save'));
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls the onSubmit function with the correct values', () => {
    const mockOnSubmit = jest.fn();
    const item = { name: 'test', parent_class: 'parent' };
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal item={item} onSubmit={mockOnSubmit} />
      </ReqoreUIProvider>
    );
    const value = 'test value';
    fireEvent.change(screen.getByLabelText('Value'), { target: { value } });
    fireEvent.click(screen.getByText('Save'));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      item.name,
      value,
      item.parent_class,
      false,
      false,
      null
    );
  });

  it('calls the onSubmit function with null value when remove button is clicked', () => {
    const mockOnSubmit = jest.fn();
    const item = { name: 'test', parent_class: 'parent' };
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal item={item} onSubmit={mockOnSubmit} />
      </ReqoreUIProvider>
    );
    fireEvent.click(screen.getByText('Remove'));
    expect(mockOnSubmit).toHaveBeenCalledWith(item.name, null, item.parent_class, false, true);
  });*/
});
