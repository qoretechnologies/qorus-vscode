import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { render, waitFor } from '@testing-library/react';
import { IMapperFieldModalProps, MapperFieldModal } from '../../../src/containers/Mapper/modal';

const props: IMapperFieldModalProps = {
  type: 'inputs',
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  t: (str: string) => str,
  initialData: {
    fetchData: jest.fn().mockReturnValue({ data: [] }),
  },
  siblings: {},
  fieldData: null,
  isParentCustom: false,
};

describe('MapperFieldModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} />
      </ReqoreUIProvider>
    );
  });

  it('fetches the available types on mount', async () => {
    const fetchData = jest.fn().mockReturnValue({ data: [] });
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} initialData={{ fetchData }} />
      </ReqoreUIProvider>
    );
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1));
  });
  /*
  it('displays an error message when the available types could not be retrieved', async () => {
    const fetchData = jest.fn().mockReturnValue({ error: true });
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} initialData={{ fetchData }} />
      </ReqoreUIProvider>
    );
    expect(await screen.findByText('UnableToRetrieveTypes')).toBeInTheDocument();
  });
  it('changes the field name when the input is changed', () => {
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} />
      </ReqoreUIProvider>
    );
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(input.value).toBe('New Name');
  });
  it('changes the field description when the input is changed', () => {
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} />
      </ReqoreUIProvider>
    );
    const input = screen.getByLabelText('Description') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Description' } });
    expect(input.value).toBe('New Description');
  });
  it('changes the field type when the select is changed', () => {
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} />
      </ReqoreUIProvider>
    );
    const select = screen.getByLabelText('Type') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'string' } });
    expect(select.value).toBe('string');
  });
  it('changes the "canBeNull" property when the select is changed', () => {
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} />
      </ReqoreUIProvider>
    );
    const select = screen.getByLabelText('Type') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '*string' } });
    expect(select.value).toBe('*string');
    const checkbox = screen.getByLabelText('Can be null?') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });*/
});
