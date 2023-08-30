import { expect } from '@storybook/jest';
import { fireEvent, waitFor } from '@storybook/testing-library';

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function _testsSubmitFSMState(buttonId?: string) {
  return async () => {
    await expect(
      document.querySelector(buttonId ? `#${buttonId}` : '.state-submit-button')
    ).toBeEnabled();
    await fireEvent.click(
      document.querySelector(buttonId ? `#${buttonId}` : '.state-submit-button')
    );
  };
}

export function _testsSelectItemFromDropdown(
  canvas,
  itemLabel: string | number,
  dropdownLabel: string = 'PleaseSelect',
  className?: string
) {
  return async () => {
    if (className) {
      await waitFor(() => expect(document.querySelectorAll(className)[0]).toBeInTheDocument(), {
        timeout: 10000,
      });
      await fireEvent.click(document.querySelectorAll(className)[0]);
    } else {
      await waitFor(async () => await canvas.getAllByText(dropdownLabel)[0], {
        timeout: 10000,
      });
      // HOW TO GET RID OF THIS SLEEP?????????????
      await sleep(100);

      await fireEvent.click(canvas.getAllByText(dropdownLabel)[0]);
    }

    await waitFor(() => expect(document.querySelector('.q-select-input')).toBeInTheDocument(), {
      timeout: 10000,
    });

    await waitFor(async () => await canvas.getAllByText(itemLabel)[1], { timeout: 10000 });
    await fireEvent.click(canvas.getAllByText(itemLabel)[1]);
  };
}

export function _testsSelectItemFromCollection(
  canvas,
  itemLabel: string,
  collectionLabel: string = 'PleaseSelect'
) {
  return async () => {
    await waitFor(async () => await canvas.getAllByText(collectionLabel)[0], { timeout: 30000 });

    await fireEvent.click(canvas.getAllByText(collectionLabel)[1]);

    await waitFor(() => expect(document.querySelector('.q-select-dialog')).toBeInTheDocument(), {
      timeout: 10000,
    });
    await waitFor(async () => await canvas.getByText(itemLabel), { timeout: 10000 });

    await fireEvent.click(canvas.getByText(itemLabel));
  };
}

export async function _testsClickState(id) {
  await fireEvent.mouseDown(document.querySelector(`#${id}`));
  await fireEvent.mouseUp(document.querySelector(`#${id}`));
}

export async function _testsClickStateByLabel(canvas, label) {
  await fireEvent.mouseDown(canvas.getAllByText(label)[0]);
  await fireEvent.mouseUp(canvas.getAllByText(label)[0]);
}
