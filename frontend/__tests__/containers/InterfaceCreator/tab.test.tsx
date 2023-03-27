import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { getTypeName, ITabProps, StyledHeader } from '../../../src/containers/InterfaceCreator/tab';

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
