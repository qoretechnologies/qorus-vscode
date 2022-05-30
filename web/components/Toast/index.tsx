import { Position, Toaster } from '@blueprintjs/core';

/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster = Toaster.create(
  {
    position: Position.TOP,
  },
  document?.getElementById('toastContainer') || document.body
);
