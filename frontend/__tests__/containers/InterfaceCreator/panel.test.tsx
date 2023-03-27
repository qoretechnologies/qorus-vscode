import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import InterfaceCreatorPanel from '../../../src/containers/InterfaceCreator/panel';

describe('InterfaceCreatorPanel', () => {
  it('displays the correct step title', () => {
    render(
      <ReqoreUIProvider>
        <InterfaceCreatorPanel stepOneTitle="Step One" />
      </ReqoreUIProvider>
    );
    expect(screen.getByText('LoadingFields')).toBeInTheDocument();
  });
});
