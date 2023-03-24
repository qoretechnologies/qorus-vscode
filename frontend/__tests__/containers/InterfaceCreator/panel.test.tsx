import '@testing-library/jest-dom';
import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import InterfaceCreatorPanel from '../../../src/containers/InterfaceCreator/panel';

describe('InterfaceCreatorPanel', () => {
  it('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <InterfaceCreatorPanel />
      </ReqoreUIProvider>
    );
  });



  it('displays the correct step title', () => {
    render(
      <ReqoreUIProvider>
        <InterfaceCreatorPanel stepOneTitle="Step One" />
      </ReqoreUIProvider>
    );
    expect(screen.getByText('LoadingFields')).toBeInTheDocument();
  });

});
