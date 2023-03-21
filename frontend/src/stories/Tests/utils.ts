import { expect } from '@storybook/jest';
import { fireEvent } from '@storybook/testing-library';

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function _testsSubmitFSMState() {
  await expect(document.querySelector('.state-submit-button')).toBeEnabled();
  await fireEvent.click(document.querySelector('.state-submit-button'));
}

export function _testsSelectItemFromDropdown(
  canvas,
  itemLabel: string,
  dropdownLabel: string = 'PleaseSelect'
) {
  return async () => {
    await expect(canvas.findAllByText(dropdownLabel)).toBeTruthy();
    await fireEvent.click(canvas.getAllByText(dropdownLabel)[1]);
    await expect(document.querySelector('.reqore-popover-content')).toBeInTheDocument();
    await fireEvent.click(canvas.getAllByText(itemLabel)[1]);
  };
}

export function _testsSelectItemFromCollection(
  canvas,
  itemLabel: string,
  collectionLabel: string = 'PleaseSelect'
) {
  return async () => {
    await expect(canvas.findAllByText(collectionLabel)).toBeTruthy();
    await fireEvent.click(canvas.getAllByText(collectionLabel)[1]);
    await expect(document.querySelector('.q-select-dialog')).toBeInTheDocument();
    await fireEvent.click(canvas.getByText(itemLabel));
  };
}
