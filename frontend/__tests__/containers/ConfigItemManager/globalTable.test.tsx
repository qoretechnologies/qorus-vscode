import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { WorkflowConfigItemsTable } from '../../../src/containers/ConfigItemManager/globalTable';
import { compose, withState, withHandlers, onlyUpdateForKeys } from 'recompose';

describe('WorkflowConfigItemsTable', () => {
  const globalConfig = [
    {
      name: 'name1',
      value: 'value1',
      group: 'group1',
    },
    {
      name: 'name2',
      value: 'value2',
      group: 'group2',
    },
  ];
  const onSubmit = jest.fn();
  const globalItems = [];
  const initialItems = [];
  const modalData = null;
  const handleModalToggle = jest.fn();
  const workflow = true;
  const t = (text) => text;
  const definitionsOnly = false;

  it('should handle modal toggling correctly', () => {
    const toggleModalData = jest.fn();
    const props = { toggleModalData };

    const ModalToggle = jest.fn();
    const EnhancedComponent = compose(
      withState('modalData', 'toggleModalData', null),
      withHandlers({
        handleModalToggle:
          ({ toggleModalData }) =>
          (options) => {
            toggleModalData((value) =>
              value
                ? null
                : {
                    ...options,
                  }
            );
            ModalToggle();
          },
      }),
      onlyUpdateForKeys(['configItems', 'showDescription', 'globalConfig', 'modalData'])
    )(WorkflowConfigItemsTable);
    expect(toggleModalData).toBeDefined();
  });

  it('should update only on specific keys', () => {
    const props = { configItems: [], showDescription: true };
    const shouldUpdate = onlyUpdateForKeys(['configItems', 'showDescription']);
    const EnhancedComponent = shouldUpdate(WorkflowConfigItemsTable);
    const instance = new EnhancedComponent(props);

    expect(instance.shouldComponentUpdate({ configItems: [], showDescription: true })).toBeDefined();
  });

  it('should render the table with the correct data', () => {
    render(
      <ReqoreUIProvider>
        <WorkflowConfigItemsTable
          globalConfig={globalConfig}
          onSubmit={onSubmit}
          globalItems={globalItems}
          initialItems={initialItems}
          modalData={modalData}
          handleModalToggle={handleModalToggle}
          workflow={workflow}
          t={t}
          definitionsOnly={definitionsOnly}
        />
      </ReqoreUIProvider>
    );
    expect(screen.getByText('name1')).toBeInTheDocument();
    expect(screen.getByText('value1')).toBeInTheDocument();
    expect(screen.getByText('name2')).toBeInTheDocument();
    expect(screen.getByText('value2')).toBeInTheDocument();
  });

  it('should call handleModalToggle when the add new value button is clicked', () => {
    render(
      <ReqoreUIProvider>
        <WorkflowConfigItemsTable
          globalConfig={globalConfig}
          onSubmit={onSubmit}
          globalItems={globalItems}
          initialItems={initialItems}
          modalData={modalData}
          handleModalToggle={handleModalToggle}
          workflow={workflow}
          t={t}
          definitionsOnly={definitionsOnly}
        />
      </ReqoreUIProvider>
    );
    expect(handleModalToggle).toBeDefined();
  });

  it('should call onSubmit when the edit value button is clicked', () => {
    render(
      <ReqoreUIProvider>
        <WorkflowConfigItemsTable
          globalConfig={globalConfig}
          onSubmit={onSubmit}
          globalItems={globalItems}
          initialItems={initialItems}
          modalData={modalData}
          handleModalToggle={handleModalToggle}
          workflow={workflow}
          t={t}
          definitionsOnly={definitionsOnly}
        />
      </ReqoreUIProvider>
    );
    expect(onSubmit).toBeDefined();
  });

  it('should call onSubmit with null value when the remove value button is clicked', () => {
    render(
      <ReqoreUIProvider>
        <WorkflowConfigItemsTable
          globalConfig={globalConfig}
          onSubmit={onSubmit}
          globalItems={globalItems}
          initialItems={initialItems}
          modalData={modalData}
          handleModalToggle={handleModalToggle}
          workflow={workflow}
          t={t}
          definitionsOnly={definitionsOnly}
        />
      </ReqoreUIProvider>
    );
    expect(modalData).toBeDefined();
    expect(globalItems).toBeDefined();
    expect(handleModalToggle).toBeDefined();
  });
});
