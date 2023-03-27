import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { render, screen } from '@testing-library/react';
import MapperFieldModal from '../../../src/containers/Mapper/mappingModal';
import { userEvent } from '@storybook/testing-library';

describe('MapperFieldModal', () => {
  const props = {
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    t: jest.fn(),
    initialData: {},
    relationData: {},
    mapperKeys: {},
    output: {},
    inputs: [],
    selectedFields: [],
  };

  it('should render without errors', async () => {
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} />
      </ReqoreUIProvider>
    );
    const submitButton = screen.getByRole('button', { name: 'Submit Submit' });
    await userEvent.click(submitButton);
    expect(props.onSubmit).toHaveBeenCalled();
  });
});
