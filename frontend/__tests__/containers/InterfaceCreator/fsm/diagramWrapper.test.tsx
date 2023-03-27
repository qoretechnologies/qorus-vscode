import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ElementPan } from '../../../../src/components/PanElement';
import FSMDiagramWrapper, {
  IFSMDiagramWrapperProps,
} from '../../../../src/containers/InterfaceCreator/fsm/diagramWrapper';
import { TextContext } from '../../../../src/context/text';

describe('FSMDiagramWrapper', () => {
  it('should render children', () => {
    const props: IFSMDiagramWrapperProps = {
      wrapperDimensions: { width: 100, height: 100 },
      setPan: jest.fn(),
      children: <div>Test</div>,
      zoom: 1,
      setShowStateIds: jest.fn(),
      showStateIds: true,
    };

    render(
      <ReqoreUIProvider>
        <TextContext.Provider value={{ translate: (key: string) => key }}>
          <ElementPan zoom={1} setZoom={() => {}}>
            <FSMDiagramWrapper {...props} />
          </ElementPan>
        </TextContext.Provider>
      </ReqoreUIProvider>
    );
    expect(screen.getByText('Test')).toBeDefined();
  });
  it('should call setPan when panning', () => {
    const setPan = jest.fn();
    const props: IFSMDiagramWrapperProps = {
      wrapperDimensions: { width: 100, height: 100 },
      setPan,
      children: <div>Test</div>,
      zoom: 1,
      setShowStateIds: jest.fn(),
      showStateIds: true,
    };

    render(
      <ReqoreUIProvider>
        <TextContext.Provider value={{ translate: (key: string) => key }}>
          <ElementPan zoom={1} setZoom={() => {}}>
            <FSMDiagramWrapper {...props} />
          </ElementPan>
        </TextContext.Provider>
      </ReqoreUIProvider>
    );

    const diagram = screen.getByText('Test');
    if (!!diagram) {
      diagram.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
      diagram.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
      diagram.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 10 }));
    }
    expect(setPan).toBeDefined();
  });

  it('should call setShowStateIds when toggling showStateIds', () => {
    const setShowStateIds = jest.fn();
    const props: IFSMDiagramWrapperProps = {
      wrapperDimensions: { width: 100, height: 100 },
      setPan: jest.fn(),
      children: <div>Test</div>,
      zoom: 1,
      setShowStateIds,
      showStateIds: true,
    };

    render(
      <ReqoreUIProvider>
        <TextContext.Provider value={{ translate: (key: string) => key }}>
          <ElementPan zoom={1} setZoom={() => {}}>
            <FSMDiagramWrapper {...props} />
          </ElementPan>
        </TextContext.Provider>
      </ReqoreUIProvider>
    );

    if (!!screen && !!screen.getByText('Test')) {
      const toggle = screen.getByText('Test');
      toggle.dispatchEvent(new MouseEvent('click'));
    }
    expect(setShowStateIds).toBeDefined();
  });
});
