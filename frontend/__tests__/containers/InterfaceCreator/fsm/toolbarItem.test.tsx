import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  FSMItemDescByType,
  FSMItemIconByType,
  StyledToolbarItem,
} from '../../../../src/containers/InterfaceCreator/fsm/toolbarItem';

test('renders toolbar item with correct props', () => {
  const { getByText } = render(
    <StyledToolbarItem
      type="mapper"
      disabled={false}
      name="My Mapper"
      count={2}
      category="success"
      onDoubleClick={() => {}}
      onDragStart={() => {}}
    >
      My Mapper
    </StyledToolbarItem>
  );

  const toolbarItem = screen.getByText('My Mapper');
  expect(toolbarItem).toBeInTheDocument();
  expect(toolbarItem).toHaveStyle('width: 150px;');
});

test('returns correct icon for FSM item type', () => {
  expect(FSMItemIconByType['mapper']).toEqual('FileTransferLine');
  expect(FSMItemIconByType['if']).toEqual('QuestionMark');
});

test('returns correct description for FSM item type', () => {
  expect(FSMItemDescByType['mapper']).toEqual('Execute data transformations on the input data');
  expect(FSMItemDescByType['if']).toEqual('Control the logical flow with an expression');
});
