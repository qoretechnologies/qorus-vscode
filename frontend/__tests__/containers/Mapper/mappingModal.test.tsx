import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { fireEvent, render, screen } from '@testing-library/react';
import MapperFieldModal from '../../../src/containers/Mapper/mappingModal';

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

  it('should render without errors', () => {
    render(
      <ReqoreUIProvider>
        <MapperFieldModal {...props} />
      </ReqoreUIProvider>
    );
  });

});
