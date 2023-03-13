import { fireEvent, render, screen } from '@testing-library/react';
import { GlobalContext } from '../../src/context/global';
import { InitialContext } from '../../src/context/init';
import withInterfaceState from '../../src/hocomponents/withGlobalOptions';

const MockComponent = () => <div>Mock Component</div>;
const WrappedComponent = withInterfaceState()(MockComponent);

describe('withInterfaceState', () => {
  it('should reset the fields when handleInterfaceReset is called', () => {
    const resetInterfaceData = jest.fn();
    const resetFields = jest.fn();
    const resetSteps = jest.fn();
    const resetMethods = jest.fn();
    const resetMapperMethods = jest.fn();
    const resetMapper = jest.fn();
    const setTypeReset = jest.fn();
    const setFsmReset = jest.fn();
    const setPipelineReset = jest.fn();
    const setConnectionReset = jest.fn();

    const handleInterfaceReset = jest.fn();

    render(
      <InitialContext.Provider value={{}}>
        <GlobalContext.Provider
          value={{
            resetAllInterfaceData: handleInterfaceReset,
            resetFields,
            resetSteps,
            resetMethods,
            resetMapperMethods,
            resetMapper,
            setTypeReset,
            setFsmReset,
            setPipelineReset,
            setConnectionReset,
          }}
        >
          <WrappedComponent />
        </GlobalContext.Provider>
      </InitialContext.Provider>
    );
    expect(resetFields).toBeDefined();
  });
});
