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

export async function _testsCreateSelectionBox(
  x: number,
  y: number,
  width: number,
  height: number,
  confirm?: boolean
) {
  await fireEvent.mouseOver(document.querySelector('#fsm-diagram'));

  await fireEvent.keyDown(document, {
    key: 'Meta',
    shiftKey: true,
  });

  await sleep(200);

  await fireEvent.mouseDown(document.querySelector('#fsm-diagram'), {
    clientX: x,
    clientY: y,
    shiftKey: true,
  });

  await sleep(200);

  await fireEvent.mouseMove(document.querySelector('#fsm-diagram'), {
    clientX: x + width,
    clientY: y + height,
    shiftKey: true,
  });

  await sleep(1000);

  if (confirm) {
    await fireEvent.mouseUp(document.querySelector('#fsm-diagram'), {
      clientX: x + width,
      clientY: y + height,
      shiftKey: true,
    });
  }
}

export async function _testsDeleteState(id) {
  await fireEvent.click(document.querySelectorAll(`#state-${id} .reqore-button`)[2]);
}

export async function _testsSelectState(id) {
  await _testsClickState(id, { shiftKey: true });
}

export async function _testsSelectStateByLabel(canvas, label) {
  await _testsClickStateByLabel(canvas, label, { shiftKey: true });
}

export async function _testsDoubleClickState(id, options = {}) {
  await fireEvent.mouseOver(document.querySelector(`#${id}`), options);
  await sleep(100);
  await fireEvent.mouseDown(document.querySelector(`#${id}`), {
    ...options,
    timeStamp: 0,
  });
  await fireEvent.mouseUp(document.querySelector(`#${id}`), {
    ...options,
    timeStamp: 100,
  });
  await fireEvent.mouseDown(document.querySelector(`#${id}`), {
    ...options,
    timeStamp: 0,
  });
  await fireEvent.mouseUp(document.querySelector(`#${id}`), {
    ...options,
    timeStamp: 100,
  });
}

export async function _testsClickState(id, options = {}) {
  await fireEvent.mouseOver(document.querySelector(`#${id}`), options);
  await sleep(100);
  await fireEvent.mouseDown(document.querySelector(`#${id}`), {
    ...options,
    timeStamp: 0,
  });
  await fireEvent.mouseUp(document.querySelector(`#${id}`), {
    ...options,
    timeStamp: 100,
  });
}

export async function _testsClickStateByLabel(canvas, label, options = {}) {
  await fireEvent.mouseOver(canvas.getAllByText(label)[0], options);
  await sleep(100);
  await fireEvent.mouseDown(canvas.getAllByText(label)[0], {
    ...options,
    timeStamp: 0,
  });
  await fireEvent.mouseUp(canvas.getAllByText(label)[0], {
    ...options,
    timeStamp: 100,
  });
}
