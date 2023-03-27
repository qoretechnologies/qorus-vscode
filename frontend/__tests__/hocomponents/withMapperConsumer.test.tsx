import { render } from '@testing-library/react';
import { MapperContext } from '../../src/context/mapper';
import withMapperConsumer from '../../src/hocomponents/withMapperConsumer';

describe('withMapperConsumer', () => {
  it('renders without crashing', () => {
    const MockComponent = () => <div />;
    const EnhancedComponent = withMapperConsumer()(MockComponent);
    render(<EnhancedComponent />);
  });
  it('merges props and mapperData correctly', () => {
    const MockComponent = ({ inputs, contextInputs, mapperData }) => {
      expect(inputs).toBe('inputs');
      expect(contextInputs).toBe('contextInputs');
      expect(mapperData).toEqual({
        inputs: 'inputs',
        contextInputs: 'contextInputs',
        outputs: 'outputs',
        inputProvider: 'inputProvider',
        outputProvider: 'outputProvider',
        relations: 'relations',
        inputChildren: 'inputChildren',
        outputChildren: 'outputChildren',
        inputRecord: 'inputRecord',
        outputRecord: 'outputRecord',
        inputOptionProvider: 'inputOptionProvider',
        outputOptionProvider: 'outputOptionProvider',
        mapperKeys: 'mapperKeys',
        hideInputSelector: 'hideInputSelector',
        hideOutputSelector: 'hideOutputSelector',
        error: 'error',
        isContextLoaded: 'isContextLoaded',
      });
      return null;
    };
    const fieldsData = {
      inputs: 'inputs',
      contextInputs: 'contextInputs',
      outputs: 'outputs',
      inputProvider: 'inputProvider',
      outputProvider: 'outputProvider',
      relations: 'relations',
      inputChildren: 'inputChildren',
      outputChildren: 'outputChildren',
      inputRecord: 'inputRecord',
      outputRecord: 'outputRecord',
      inputOptionProvider: 'inputOptionProvider',
      outputOptionProvider: 'outputOptionProvider',
      mapperKeys: 'mapperKeys',
      hideInputSelector: 'hideInputSelector',
      hideOutputSelector: 'hideOutputSelector',
      error: 'error',
      isContextLoaded: 'isContextLoaded',
    };
    const EnhancedComponent = withMapperConsumer()(MockComponent);
    render(<EnhancedComponent inputs="inputs" contextInputs="contextInputs" />, {
      wrapper: ({ children }) => (
        <MapperContext.Provider value={fieldsData}>{children}</MapperContext.Provider>
      ),
    });
  });
});
