import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AddFieldButton } from '../../../src/containers/Mapper/add';

describe('AddFieldButton', () => {
  test('renders AddFieldButton with Add button when canManageFields is true', () => {
    render(
      <ReqoreUIProvider>
        <AddFieldButton
          onClick={() => {}}
          isCustom={false}
          canManageFields={true}
          field={{}}
          t={() => {}}
        />
      </ReqoreUIProvider>
    );
    const addButton = screen.getAllByRole('button')[0];
    expect(addButton).toBeInTheDocument();
  });

  test('renders AddFieldButton without Edit button when isCustom is false', () => {
    render(
      <ReqoreUIProvider>
        <AddFieldButton
          onClick={() => {}}
          isCustom={false}
          canManageFields={true}
          field={{}}
          t={() => {}}
        />
      </ReqoreUIProvider>
    );
    const editButton = screen.queryByRole('button', { name: 'EditMapperField' });
    expect(editButton).not.toBeInTheDocument();
  });
});
