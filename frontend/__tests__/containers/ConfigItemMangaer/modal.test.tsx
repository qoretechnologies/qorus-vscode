import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ConfigItemsModal from '../../../src/containers/ConfigItemManager/modal';

describe('ConfigItemsModal', () => {
  it('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemsModal />
      </ReqoreUIProvider>
    );

    expect(screen.getByText('AssignNewConfig')).toBeDefined();
  });
});
