import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { LibraryView } from '../../../src/containers/InterfaceCreator/libraryView';

describe('LibraryView', () => {
  test('should render the interface creator panel with the correct props', () => {
    render(
      <ReqoreUIProvider>
        <LibraryView
          t={() => {}}
          isSubItemValid={() => {}}
          removeSubItemFromFields={() => {}}
          initialData={{ 'mapper-code': {} }}
          interfaceId={{}}
          onSubmitSuccess={() => {}}
        />
      </ReqoreUIProvider>
    );
  });
  
  test('should render the interface creator panel with the correct props', () => {
    render(
      <ReqoreUIProvider>
        <LibraryView
          t={() => {}}
          isSubItemValid={() => {}}
          removeSubItemFromFields={() => {}}
          initialData={{ 'mapper-code': {} }}
          interfaceId={{}}
          onSubmitSuccess={() => {}}
        />
      </ReqoreUIProvider>
    );
    expect(screen.getAllByText('LoadingFields')[0]).toBeInTheDocument();
  });
});
