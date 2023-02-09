import {
  IReqorePanelAction,
  IReqorePanelBottomAction,
} from '@qoretechnologies/reqore/dist/components/Panel';
import { PositiveColorEffect, SaveColorEffect } from '../../components/Field/multiPair';

export const cancelControl = (
  onClick: () => void,
  otherData?: IReqorePanelAction
): IReqorePanelBottomAction => ({
  label: 'Cancel',
  icon: 'CloseLine',
  onClick,
  ...otherData,
});

export const resetControl = (
  onClick: () => void,
  otherData?: IReqorePanelAction
): IReqorePanelBottomAction => ({
  label: 'Reset',
  icon: 'HistoryLine',
  onClick,
  ...otherData,
});

export const backControl = (
  onClick: () => void,
  otherData?: IReqorePanelAction
): IReqorePanelBottomAction => ({
  label: 'Back',
  icon: 'ArrowLeftLine',
  onClick,
  ...otherData,
});

export const nextControl = (
  onClick: () => void,
  otherData?: IReqorePanelBottomAction
): IReqorePanelAction => ({
  label: 'Next',
  icon: 'CheckLine',
  effect: PositiveColorEffect,
  position: 'right',
  onClick,
  ...otherData,
});

export const submitControl = (
  onClick: () => void,
  otherData?: IReqorePanelBottomAction
): IReqorePanelAction => ({
  label: 'Submit',
  icon: 'CheckDoubleLine',
  effect: SaveColorEffect,
  position: 'right',
  onClick,
  ...otherData,
});
