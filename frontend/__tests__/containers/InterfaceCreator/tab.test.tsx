import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import {
  getTypeName,
  ITabProps,
  StyledHeader,
  TutorialButton,
} from '../../../src/containers/InterfaceCreator/tab';

describe('StyledHeader', () => {
  it('renders with correct title', () => {
    const props: ITabProps = {
      initialData: {},
      t: () => '',
      children: null,
      type: '',
      isEditing: false,
      name: '',
      resetAllInterfaceData: () => null,
    };

    const title = 'Title';
    const { container } = render(
      <StyledHeader>
        <h2>{title}</h2>
      </StyledHeader>
    );

    expect(container.querySelector('h2')).toHaveTextContent(title);
  });
});

describe('getTypeName', () => {
  it('returns the correct string for a given type', () => {
    const t = jest.fn((x) => x);

    expect(getTypeName('fsm', t)).toBe('FiniteStateMachine');
    expect(getTypeName('', t)).toBe('');
  });
});

describe('TutorialButton', () => {
  it('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <TutorialButton type="default" onClick={() => {}} />
      </ReqoreUIProvider>
    );
  });

  /*it('displays correct text when clicked', async () => {
    const onClick = jest.fn();
    const type = 'default';
  
    render(
      <ReqoreUIProvider>
        <TutorialButton type={type} onClick={onClick} />
      </ReqoreUIProvider>
    );
  
    const button = await waitFor(() => screen.getByTestId('tutorial-button'));
  
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  
    const expectedTitle = 'tutorial-controls';
    const expectedContent = 'tutorial-controls-content';
  
    expect(onClick).toHaveBeenCalled();
  
    const tutorial = screen.getByTestId('tutorial');
  
    expect(tutorial).toHaveTextContent(expectedTitle);
    expect(tutorial).toHaveTextContent(expectedContent);
  });*/
});
