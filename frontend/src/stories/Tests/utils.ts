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
  itemLabel: string,
  dropdownLabel: string = 'PleaseSelect',
  className?: string
) {
  return async () => {
    await sleep(500);

    await fireEvent.click(
      className ? document.querySelectorAll(className)[0] : canvas.getAllByText(dropdownLabel)[1]
    );

    await sleep(1500);

    await fireEvent.click(canvas.getAllByText(itemLabel)[1]);
  };
}

export function _testsSelectItemFromCollection(
  canvas,
  itemLabel: string,
  collectionLabel: string = 'PleaseSelect'
) {
  return async () => {
    await sleep(500);
    await fireEvent.click(canvas.getAllByText(collectionLabel)[1]);
    await waitFor(() => expect(document.querySelector('.q-select-dialog')).toBeInTheDocument(), {
      timeout: 10000,
    });
    await sleep(500);
    await fireEvent.click(canvas.getByText(itemLabel));
  };
}
