import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { size, upperFirst } from 'lodash';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import { NewState } from '../../Views/FSM.stories';
import { StoryMeta } from '../../types';
import {
  _testsAddNewState,
  _testsAddNewVariableState,
  _testsClickState,
  _testsCloseStateDetail,
  _testsGetStateByLabel,
  _testsQodexCanBePublished,
  _testsSelectItemFromCollection,
  _testsSelectItemFromDropdown,
  _testsSubmitFSMState,
  sleep,
} from '../utils';
import { NewVariableState } from './Variables.stories';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/New states',
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

export const NewStateFromVariable: StoryFSM = {
  play: async ({ canvasElement, mapperId = 'mapper', ...rest }) => {
    const canvas = within(canvasElement);
    await NewVariableState.play({ canvasElement, ...rest });

    await fireEvent.click(canvas.getByText(`testVariable`, { selector: 'h4' }));
    await waitFor(() => expect(document.querySelector('.fsm-state-detail')).toBeInTheDocument());
    expect(_testsGetStateByLabel('testVariable')).toBeInTheDocument();

    // The submit button needs to be disabled
    //await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await _testsSelectItemFromDropdown(canvas, 'search-single')();
    await sleep(300);
    await _testsSelectItemFromCollection(canvas, 'invoice_amount', 'AddArgument (39)')();

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

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await _testsCloseStateDetail();

    await sleep(2500);

    await _testsClickState('testVariable');

    await sleep(1500);

    // Open the state
    await waitFor(
      async () => {
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

    await sleep(200);

    await _testsSelectItemFromCollection(canvas, 'bb-test-db-step', 'Select or create a Mapper')();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await waitFor(() => expect(canvas.getAllByText('bb-test-db-step').length).toBe(4));
    await _testsQodexCanBePublished();
  },
};

export const NewPipelineState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'pipeline' });

    await sleep(200);

    await _testsSelectItemFromCollection(canvas, 'factory-test')();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await waitFor(() => expect(canvas.getAllByText('factory-test').length).toBe(4));
    await _testsQodexCanBePublished();
  },
};

export const NewConnectorState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'connector' });

    const className = 'BBM_AutoMapper';
    const connectorName = 'runMapper';

    await sleep(200);
    await _testsSelectItemFromCollection(canvas, className)();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await sleep(200);

    await expect(document.querySelector('.state-submit-button')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getAllByText(`ManageConfigItems`)[0]).toBeInTheDocument());
    await waitFor(() =>
      expect(canvas.getByText(`${className}:${connectorName} connector`)).toBeInTheDocument()
    );
    await _testsQodexCanBePublished();
  },
};

export const NewFSMState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'fsm' });

    await sleep(200);

    await _testsSelectItemFromCollection(canvas, 'fsm-event-test')();

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });

    await waitFor(() => expect(canvas.getAllByText('fsm-event-test').length).toBe(5));
    await _testsQodexCanBePublished();
  },
};

export const NewWhileState: StoryFSM = {
  play: async ({ canvasElement, blockType = 'while', stateName = 'While', ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: blockType });

    await waitFor(
      async () => await expect(document.querySelector('.state-next-button')).toBeDisabled(),
      {
        timeout: 5000,
      }
    );

    // Fill the required option
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelectorAll('.system-option .reqore-textarea')[0], {
          target: {
            value: 'This is a test',
          },
        });
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => await expect(document.querySelector('.state-next-button')).toBeEnabled(),
      {
        timeout: 5000,
      }
    );

    await fireEvent.click(document.querySelector('.state-next-button'));

    // Add new mapper state to the block
    await _testsAddNewState('mapper', canvas, `${upperFirst(blockType)}`);

    await waitFor(() => expect(document.querySelectorAll('.fsm-state-detail').length).toBe(2));

    await sleep(200);

    await _testsSelectItemFromCollection(canvas, 'bb-test-db-step', 'Select or create a Mapper')();

    // Submit the state
    await waitFor(_testsSubmitFSMState('state-mapper-submit-button'), { timeout: 5000 });
    await waitFor(async () => {
      await expect(
        canvas.getByText('bb-test-db-step', { selector: '.reqore-tag-content span' })
      ).toBeInTheDocument();
    });
    await sleep(200);
    // Submit the state
    await waitFor(_testsSubmitFSMState(`state-${blockType}-submit-button`), { timeout: 5000 });
    await sleep(200);
    await _testsCloseStateDetail();
    await sleep(200);
    await waitFor(() => expect(document.querySelectorAll('.fsm-state-detail').length).toBe(0));
    await waitFor(() => expect(canvas.getByText(`${blockType} block (1)`)).toBeInTheDocument());

    // State can be opened and viewed
    await _testsClickState(stateName);
    await waitFor(async () => await fireEvent.click(document.querySelector('.state-next-button')));
    await waitFor(async () => {
      await expect(document.querySelectorAll('.fsm-state-detail').length).toBe(1);
      await expect(
        canvas.getByText('bb-test-db-step', { selector: '.reqore-tag-content span' })
      ).toBeInTheDocument();
    });
    await _testsQodexCanBePublished();
  },
};

export const NewForState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewWhileState.play({ canvasElement, blockType: 'for', stateName: 'For', ...rest });
  },
};

export const NewForEachState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewWhileState.play({
      canvasElement,
      blockType: 'foreach',
      stateName: 'Foreach',
      ...rest,
    });
  },
};

export const NewTransactionState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'transaction' });

    // The submit button needs to be disabled
    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.system-option').length).toBe(1);
      },
      {
        timeout: 10000,
      }
    );

    await sleep(200);

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('factory'));

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(1);
      },
      {
        timeout: 10000,
      }
    );

    await fireEvent.click(document.querySelector('.provider-selector'));
    await fireEvent.click(canvas.getAllByText('db')[0]);

    await waitFor(
      () => expect(document.querySelector('.system-option .reqore-textarea')).toBeInTheDocument(),
      {
        timeout: 10000,
      }
    );
    await fireEvent.change(document.querySelector('.system-option .reqore-textarea'), {
      target: {
        value: 'omquser',
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
        await expect(document.querySelectorAll('.provider-selector').length).toBe(2);
      },
      {
        timeout: 10000,
      }
    );

    await sleep(1500);

    await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
    const withinSelectDialog = within(document.querySelector('.q-select-dialog'));
    await fireEvent.click(withinSelectDialog.getAllByText('bb_local')[0]);

    await sleep(1500);

    await fireEvent.click(document.querySelector('.state-next-button'));

    await _testsAddNewVariableState('trans', canvas, 'Transaction');

    await sleep(500);
    await _testsSelectItemFromDropdown(canvas, 'transaction')();
    await sleep(1000);
    await _testsSelectItemFromCollection(canvas, 'begin-transaction')();
    await sleep(1500);

    await waitFor(_testsSubmitFSMState('state-trans-submit-button'), { timeout: 5000 });
    await expect(document.querySelectorAll('.fsm-state-detail').length).toBe(2);

    await sleep(1500);

    await waitFor(() => expect(canvas.getByText('trans', { selector: 'h4' })).toBeInTheDocument());

    await waitFor(_testsSubmitFSMState('state-transaction-submit-button'), { timeout: 5000 });
    await _testsCloseStateDetail();
    await sleep(200);
    await expect(size(document.querySelectorAll('.fsm-state-detail'))).toBe(0);
    await waitFor(() => expect(canvas.getByText('transaction block (1)')).toBeInTheDocument());

    await _testsClickState('Transaction');

    await sleep(2000);

    await fireEvent.click(document.querySelector('.state-next-button'));

    await waitFor(() => expect(canvas.getByText('transaction')).toBeInTheDocument());
    await _testsQodexCanBePublished();
  },
};

export const NewIfState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'if' });

    await fireEvent.change(document.querySelector('#condition-field'), {
      target: { value: 'asfg condition' },
    });
    await sleep(1000);

    // Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 5000 });
    await sleep(200);

    await waitFor(() => expect(canvas.getByText('asfg condition')).toBeInTheDocument());
    await _testsQodexCanBePublished();
  },
};

export const NewApiCallState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'apicall' });

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
        await fireEvent.click(canvas.getAllByText('Util')[0]);
      },
      {
        timeout: 10000,
      }
    );

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelectorAll('.provider-selector')[2]);
        await fireEvent.click(canvas.getAllByText('Log Message')[0]);
      },
      {
        timeout: 10000,
      }
    );

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
    await _testsCloseStateDetail();
    await sleep(200);
    await expect(document.querySelector('.fsm-state-detail')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('factory/qorus-api/util/log-message'), {
      timeout: 10000,
    });

    // Check that state data were saved
    await _testsClickState('Call API');
    await waitFor(() => canvas.findByDisplayValue('logging some stuff'), { timeout: 10000 });
    await expect(document.querySelector('.system-option textarea')).toHaveValue(
      'logging some stuff'
    );
    await _testsQodexCanBePublished();
  },
};

export const NewMessageState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'send-message' });

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
    await sleep(200);
    await _testsCloseStateDetail();
    await expect(document.querySelector('.fsm-state-detail')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('factory/wsclient'), { timeout: 10000 });

    // Check that state data were saved
    await _testsClickState('Send Message');
    await waitFor(() => canvas.findByDisplayValue('Hello World'), { timeout: 10000 });
    await expect(document.querySelector('.provider-message-data textarea')).toHaveValue(
      'Hello World'
    );
    await _testsQodexCanBePublished();
  },
};

export const NewSingleSearchState: StoryFSM = {
  play: async ({ canvasElement, stateType, stateName = 'Single Search', ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: stateType || 'search-single' });

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('Omq')[0]);
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
    await _testsSelectItemFromCollection(canvas, 'audit_event_code', 'AddArgument (4)')();

    // Change the operator to logical not, which allows us to add second operator
    await _testsSelectItemFromCollection(canvas, 'logical not (!)', 'equals (=)')();

    // Add second operator like
    await waitFor(
      async () => await fireEvent.click(document.querySelectorAll('.operators .reqore-button')[1])
    );
    await _testsSelectItemFromCollection(canvas, 'like')();

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
    await _testsCloseStateDetail();
    await sleep(200);
    await expect(document.querySelector('.fsm-state-detail')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await _testsClickState(stateName);
    await waitFor(
      async () => {
        await expect(document.querySelector('.system-option .reqore-input')).toHaveValue(12);
      },
      { timeout: 5000 }
    );
    await _testsQodexCanBePublished();
  },
};

export const NewSearchState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewSingleSearchState.play({
      canvasElement,
      ...rest,
      stateType: 'search',
      stateName: 'Search',
    });
  },
};

export const NewDeleteState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewSingleSearchState.play({
      canvasElement,
      ...rest,
      stateType: 'delete',
      stateName: 'Delete',
    });
  },
};

export const NewUpdateState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'update' });

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('Omq')[0]);
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
    await _testsSelectItemFromCollection(canvas, 'description', 'AddArgument (4)')();

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
    await sleep(200);
    await _testsCloseStateDetail();
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await _testsClickState('Update');
    await waitFor(
      async () => {
        await expect(document.querySelector('.system-option .reqore-textarea')).toHaveValue(
          'Some description'
        );
      },
      { timeout: 5000 }
    );
    await _testsQodexCanBePublished();
  },
};

export const NewCreateFromFormState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'create' });

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('Omq')[0]);
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
    await _testsSelectItemFromCollection(canvas, 'description', 'AddArgument (4)')();

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
    await sleep(200);
    await _testsCloseStateDetail();
    await expect(document.querySelector('.fsm-state-detail')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await _testsClickState('Create');
    await waitFor(
      async () => {
        await expect(document.querySelector('.system-option .reqore-textarea')).toHaveValue(
          'Some description'
        );
      },
      { timeout: 5000 }
    );
    await _testsQodexCanBePublished();
  },
};

export const NewCreateFromTextState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await NewState.play({ canvasElement, ...rest, stateType: 'create' });

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));

    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('Omq')[0]);
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
        await fireEvent.change(document.querySelectorAll('.reqore-textarea')[0], {
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
    await sleep(200);
    await _testsCloseStateDetail();
    await expect(document.querySelector('.fsm-state-detail')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('datasource/omq/audit_event_codes'));

    // Check that state data were saved
    await _testsClickState('Create');
    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveDisplayValue(
          /- description: Some description/
        );
      },
      { timeout: 5000 }
    );
    await _testsQodexCanBePublished();
  },
};
