import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';
import { NewState } from '../Views/FSM.stories';
import { StoryMeta } from '../types';
import {
  _testsSelectItemFromCollection,
  _testsSelectItemFromDropdown,
  _testsSubmitFSMState,
  sleep,
} from './utils';

const meta = {
  component: FSMView,
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
  parameters: {
    chromatic: {
      disableSnapshot: true,
    },
  },
} as StoryMeta<typeof FSMView, { stateType?: string }>;

export default meta;

type StoryFSM = StoryObj<typeof meta>;

export const SwitchesToBuilder: StoryFSM = {
  args: {
    fsm,
  },
  parameters: {
    chromatic: {
      disableSnapshot: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await fireEvent.click(canvas.getAllByText('Go to flow builder')[0]);
      await expect(document.querySelector('#fsm-diagram svg')).toBeInTheDocument();
    });
  },
};

export const ShowsStateIds: StoryFSM = {
  args: {
    fsm,
  },
  parameters: {
    chromatic: {
      disableSnapshot: false,
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await fireEvent.click(document.querySelector('#show-state-ids'));

    await expect(canvas.getAllByText('[1] Save Intent Info')[0]).toBeInTheDocument();
  },
};

export const AutoAlign: StoryFSM = {
  args: {
    fsm,
  },
  parameters: {
    chromatic: {
      disableSnapshot: false,
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('#fsm-diagram .reqore-panel').length).toBe(9);
        await sleep(1000);
        await fireEvent.click(canvas.getAllByText('Auto align states')[0]);
      },
      { timeout: 5000 }
    );
  },
};

export const SelectedStateChange: StoryFSM = {
  args: {
    fsm,
  },
  parameters: {
    chromatic: {
      disableSnapshot: false,
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await waitFor(() => document.querySelector('#state-3'));
    await fireEvent.click(document.querySelector('#state-3'));

    await sleep(500);

    await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();

    await fireEvent.click(document.querySelector('#state-1'));

    await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();
  },
};

export const NewVariableState: StoryFSM = {
  play: async ({ canvasElement, mapperId = 'mapper', ...rest }) => {
    const canvas = within(canvasElement);

    await SwitchesToBuilder.play({ canvasElement, ...rest });

    // Open the variables dialog
    await waitFor(async () => {
      await fireEvent.click(document.querySelector('#fsm-variables'));
      await expect(document.querySelector('#create-new-variable')).toBeInTheDocument();
    });

    await fireEvent.click(document.querySelector('#create-new-variable'));
    await expect(document.querySelector('#save-variable')).toBeDisabled();

    await fireEvent.change(document.querySelectorAll('.reqore-input')[0], {
      target: { value: 'testVariable' },
    });
    await fireEvent.change(document.querySelectorAll('.reqore-textarea')[0], {
      target: { value: 'This is a test description' },
    });
    await waitFor(_testsSelectItemFromDropdown(canvas, 'data-provider', 'string'));

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));
    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('omquser')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await sleep(1000);

    await waitFor(
      async () => {
        await fireEvent.change(document.querySelectorAll('.reqore-textarea')[1], {
          target: { value: 'SELECT * FROM gl_record' },
        });
        await sleep(1000);
        await fireEvent.click(canvas.getAllByText('Apply search options')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await sleep(1000);

    await waitFor(
      async () => {
        await expect(document.querySelector('#save-variable')).toBeEnabled();
        await fireEvent.click(document.querySelector('#save-variable'));
        await fireEvent.click(document.querySelector('#submit-variables'));
      },
      {
        timeout: 5000,
      }
    );

    await fireEvent.dblClick(document.querySelector(`#var-actiontestVariable`));
    await waitFor(() => expect(document.querySelector('.reqore-drawer')).toBeInTheDocument());
    expect(document.querySelector('#state-1')).toBeInTheDocument();

    // The submit button needs to be disabled
    //await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromDropdown(canvas, 'search-single'), { timeout: 5000 });
    await waitFor(_testsSelectItemFromCollection(canvas, 'invoice_amount', 'AddArgument (39)'), {
      timeout: 5000,
    });

    // Fill the search arg selected
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelectorAll('.system-option .reqore-input')[0], {
          target: {
            value: '100',
          },
        });
        await sleep(500);
      },
      { timeout: 5000 }
    );

    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await sleep(2500);

    // Open the state
    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector(`#state-1`));
        await sleep(1500);
        await expect(document.querySelectorAll('.system-option.reqore-input')[0]).toHaveValue(100);
      },
      { timeout: 15000 }
    );
  },
};

export const NewMapperState: StoryFSM = {
  play: async ({ canvasElement, mapperId = 'mapper', ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: mapperId });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(
      _testsSelectItemFromCollection(canvas, 'Test Mapper 1', 'Select or create a Mapper'),
      { timeout: 5000 }
    );
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Test Mapper 1')).toBeInTheDocument());
  },
};

export const NewPipelineState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'pipeline' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromCollection(canvas, 'Test Pipeline 1'), { timeout: 5000 });
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Test Pipeline 1')).toBeInTheDocument());
  },
};

export const NewConnectorState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'connector' });

    const className = 'Test Class With Connectors 1';
    const connectorName = 'Input Output Connector';

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromDropdown(canvas, className), { timeout: 5000 });
    await waitFor(_testsSelectItemFromCollection(canvas, connectorName), { timeout: 5000 });
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByText(`${className}:${connectorName} connector`)).toBeInTheDocument()
    );
  },
};

export const NewFSMState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'fsm' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromDropdown(canvas, 'Test FSM 1'), { timeout: 5000 });
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Test FSM 1')).toBeInTheDocument());
  },
};

export const NewWhileState: StoryFSM = {
  play: async ({ canvasElement, blockType = 'while', ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: blockType });
    await waitFor(async () => await fireEvent.click(document.querySelector('.state-next-button')));

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();

    // Add new mapper state to the block
    await fireEvent.dblClick(document.querySelector(`#state1mapper`));
    await waitFor(() => expect(document.querySelectorAll('.reqore-drawer').length).toBe(2));
    await waitFor(
      _testsSelectItemFromCollection(canvas, 'Test Mapper 1', 'Select or create a Mapper'),
      { timeout: 5000 }
    );
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState('state-state1State1-submit-button'), { timeout: 5000 });
    await waitFor(async () => {
      await expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);
      await expect(canvas.getByText('State 1.State 1')).toBeInTheDocument();
      await expect(canvas.getByText('Test Mapper 1')).toBeInTheDocument();
    });

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText(`${blockType} block (1)`)).toBeInTheDocument());

    // State can be opened and viewed
    await fireEvent.click(document.querySelector(`#state-1`));
    await waitFor(async () => await fireEvent.click(document.querySelector('.state-next-button')));
    await waitFor(async () => {
      await expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);
      await expect(canvas.getByText('State 1.State 1')).toBeInTheDocument();
      await expect(canvas.getByText('Test Mapper 1')).toBeInTheDocument();
    });
  },
};

export const NewForState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewWhileState.play({ canvasElement, blockType: 'for', ...rest });
  },
};

export const NewForEachState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewWhileState.play({ canvasElement, blockType: 'foreach', ...rest });
  },
};

export const NewIfState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'if' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(
      async () => await userEvent.type(document.querySelector('#condition-field'), 'asfg condition')
    );
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('asfg condition')).toBeInTheDocument());
  },
};

export const NewApiCallState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'apicall' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('factory'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('qorus-api')[0]);
      },
      {
        timeout: 10000,
      }
    );

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(2);
        await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
        await fireEvent.click(canvas.getAllByText('util')[0]);
      },
      {
        timeout: 10000,
      }
    );

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(3);
        await fireEvent.click(document.querySelectorAll('.provider-selector')[2]);
        await fireEvent.click(canvas.getAllByText('log-message')[0]);
      },
      {
        timeout: 10000,
      }
    );

    await waitFor(() => fireEvent.click(document.querySelectorAll('.reqore-checkbox')[1]), {
      timeout: 10000,
    });
    await waitFor(
      () =>
        fireEvent.change(document.querySelector('.system-option textarea'), {
          target: {
            value: 'logging some stuff',
          },
        }),
      { timeout: 10000 }
    );

    await waitFor(_testsSubmitFSMState(), { timeout: 10000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('factory/qorus-api/util/log-message'), {
      timeout: 10000,
    });

    // Check that state data were saved
    await fireEvent.click(document.querySelector('#state-1'));
    await waitFor(() => canvas.findByDisplayValue('logging some stuff'), { timeout: 10000 });
    await expect(document.querySelector('.system-option textarea')).toHaveValue(
      'logging some stuff'
    );
  },
};

export const NewMessageState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'send-message' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('factory'));

    await waitFor(() => expect(document.querySelector('.provider-selector')).toBeInTheDocument(), {
      timeout: 10000,
    });

    await fireEvent.click(document.querySelector('.provider-selector'));
    await fireEvent.click(canvas.getAllByText('wsclient')[0]);

    await waitFor(() => expect(document.querySelector('.system-option')).toBeInTheDocument(), {
      timeout: 10000,
    });
    await fireEvent.change(document.querySelector('.system-option textarea'), {
      target: {
        value: 'wss://sandbox:sandbox@sandbox.qoretechnologies.com/apievents',
      },
    });

    await waitFor(
      async () => {
        await canvas.findAllByText(/Apply options/);
        await fireEvent.click(canvas.getAllByText(/Apply options/)[0]);
      },
      { timeout: 10000 }
    );

    await waitFor(
      async () => {
        await expect(document.querySelector('.provider-message-selector')).toBeInTheDocument();
        await fireEvent.click(document.querySelector('.provider-message-selector'));
      },
      { timeout: 10000 }
    );

    // Select the message type
    await waitFor(
      async () => {
        await canvas.findByText(/Select from items/g);
        await fireEvent.click(canvas.getByText('raw'));
      },
      { timeout: 10000 }
    );

    await waitFor(
      async () => {
        await expect(document.querySelector('.provider-message-data textarea')).toBeInTheDocument();
        await fireEvent.change(document.querySelector('.provider-message-data textarea'), {
          target: { value: 'Hello World' },
        });
      },
      { timeout: 10000 }
    );

    //Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 10000 });

    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('factory/wsclient'), { timeout: 10000 });

    // Check that state data were saved
    await fireEvent.click(document.querySelector('#state-1'));
    await waitFor(() => canvas.findByDisplayValue('Hello World'), { timeout: 10000 });
    await expect(document.querySelector('.provider-message-data textarea')).toHaveValue(
      'Hello World'
    );
  },
};

export const NewSingleSearchState: StoryFSM = {
  play: async ({ canvasElement, stateType, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: stateType || 'search-single' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('omq')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(2);
        await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
        await sleep(1000);
        await fireEvent.click(canvas.getAllByText('audit_event_codes')[0]);
      },
      {
        timeout: 10000,
      }
    );

    // Add the search criteria
    await waitFor(_testsSelectItemFromCollection(canvas, 'audit_event_code', 'AddArgument (4)'), {
      timeout: 5000,
    });

    // Change the operator to logical not, which allows us to add second operator
    await waitFor(_testsSelectItemFromCollection(canvas, 'logical not (!)', 'equals (=)'), {
      timeout: 5000,
    });

    // Add second operator like
    await waitFor(
      async () => await fireEvent.click(document.querySelectorAll('.operators .reqore-button')[1])
    );
    await waitFor(_testsSelectItemFromCollection(canvas, 'like'), {
      timeout: 5000,
    });

    // Add the search criteria value
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelector('.system-option .reqore-input'), {
          target: {
            value: 12,
          },
        });
      },
      { timeout: 5000 }
    );

    await sleep(500);

    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await fireEvent.click(document.querySelector('#state-1'));
    await waitFor(
      async () => {
        await expect(document.querySelector('.system-option .reqore-input')).toHaveValue(12);
      },
      { timeout: 5000 }
    );
  },
};

export const NewSearchState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewSingleSearchState.play({ canvasElement, ...rest, stateType: 'search' });
  },
};

export const NewDeleteState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewSingleSearchState.play({ canvasElement, ...rest, stateType: 'delete' });
  },
};

export const NewUpdateState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'update' });
    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('omq')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await sleep(1000);

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(2);
        await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
        await sleep(1000);
        await fireEvent.click(canvas.getAllByText('audit_event_codes')[0]);
      },
      {
        timeout: 5000,
      }
    );

    // Add the search criteria
    await waitFor(_testsSelectItemFromCollection(canvas, 'description', 'AddArgument (4)'), {
      timeout: 5000,
    });

    // Add the search criteria value
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelector('.system-option .reqore-textarea'), {
          target: {
            value: 'Some description',
          },
        });
      },
      { timeout: 5000 }
    );

    await sleep(500);

    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await fireEvent.click(document.querySelector('#state-1'));
    await waitFor(
      async () => {
        await expect(document.querySelector('.system-option .reqore-textarea')).toHaveValue(
          'Some description'
        );
      },
      { timeout: 5000 }
    );
  },
};

export const NewCreateFromFormState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'create' });
    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('omq')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await sleep(1000);

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(2);
        await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
        await sleep(1000);
        await fireEvent.click(canvas.getAllByText('audit_event_codes')[0]);
      },
      {
        timeout: 5000,
      }
    );

    // Add the search criteria
    await waitFor(
      async () => {
        await fireEvent.click(canvas.getAllByText('AddAnotherRecord')[0]);
      },
      {
        timeout: 5000,
      }
    );

    // Add the search criteria
    await waitFor(_testsSelectItemFromCollection(canvas, 'description', 'AddArgument (4)'), {
      timeout: 5000,
    });

    // Add the search criteria value
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelector('.system-option .reqore-textarea'), {
          target: {
            value: 'Some description',
          },
        });
      },
      { timeout: 5000 }
    );

    await sleep(500);

    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await fireEvent.click(document.querySelector('#state-1'));
    await waitFor(
      async () => {
        await expect(document.querySelector('.system-option .reqore-textarea')).toHaveValue(
          'Some description'
        );
      },
      { timeout: 5000 }
    );
  },
};

export const NewCreateFromTextState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'create' });
    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('omq')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await sleep(1000);

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(2);
        await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
        await sleep(1000);
        await fireEvent.click(canvas.getAllByText('audit_event_codes')[0]);
      },
      {
        timeout: 5000,
      }
    );

    // Add the search criteria
    await waitFor(
      async () => {
        await fireEvent.click(canvas.getAllByText('Text')[0]);
      },
      {
        timeout: 5000,
      }
    );

    // Add the search criteria value
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelectorAll('.reqore-textarea')[1], {
          target: {
            value: '- description: Some description',
          },
        });
        await fireEvent.click(document.querySelectorAll('#save-create-args')[0]);
        await expect(document.querySelectorAll('#save-create-args').length).toBe(0);
      },
      { timeout: 5000 }
    );

    await sleep(500);

    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await fireEvent.click(document.querySelector('#state-1'));
    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.reqore-textarea')[1]).toHaveDisplayValue(
          /- description: Some description/
        );
      },
      { timeout: 5000 }
    );
  },
};
