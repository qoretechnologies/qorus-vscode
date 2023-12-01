import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqorePanel,
  ReqoreTag,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { IReqoreButtonProps } from '@qoretechnologies/reqore/dist/components/Button';
import {
  IReqoreEffect,
  ReqoreTextEffect,
  TReqoreEffectColor,
  TReqoreHexColor,
} from '@qoretechnologies/reqore/dist/components/Effect';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import { last } from 'lodash';
import size from 'lodash/size';
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { IApp } from '../../../components/AppCatalogue';
import { NegativeColorEffect, SaveColorEffect } from '../../../components/Field/multiPair';
import { ContextMenuContext } from '../../../context/contextMenu';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { insertAtIndex } from '../../../helpers/functions';
import { useGetAppActionData } from '../../../hooks/useGetAppActionData';
import { useGetInputOutputType } from '../../../hooks/useGetInputOutputType';
import { IFSMState, TAppAndAction, TVariableActionValue } from './';
import { FSMItemDescByType, FSMItemIconByType } from './toolbarItem';

export interface IFSMStateProps extends IFSMState {
  selected?: boolean;
  onDblClick: (id: string) => any;
  onClick: (id: string) => any;
  onDeleteClick: (id: string) => any;
  onUpdate: (id: string, data: any) => any;
  onTransitionOrderClick: (id: string) => any;
  onNewStateClick: () => any;
  onSelect: (id: string, fromMouseDown?: boolean) => void;
  startTransitionDrag: (id: string) => any;
  stopTransitionDrag: (id: string) => any;
  selectedState?: number | string;
  isAvailableForTransition: (stateId: string, id: string) => boolean;
  onExecutionOrderClick: () => void;
  id: string;
  isIsolated: boolean;
  category: TStateTypes;
  hasTransitionToItself?: boolean;
  zoom?: number;
  passRef?: (id: string, ref: any) => void;
  isInSelectedList: boolean;
  isBeingDragged?: boolean;
  isValid?: boolean;
  isActive?: boolean;
}

export interface IFSMStateStyleProps {
  x: number;
  y: number;
  selected?: boolean;
  type?: 'mapper' | 'connector' | 'pipeline' | 'fsm' | 'block' | 'if';
}

export type TStateTypes = 'interfaces' | 'logic' | 'api' | 'other' | 'variables' | 'action';

export const getCategoryColor = (category: TStateTypes): TReqoreHexColor => {
  switch (category) {
    case 'action':
      return '#0e041a';
    default:
      return '#950ea1';
  }
};

export const getStateColor = (
  stateType: TStateTypes,
  isInitial?: boolean
): IReqoreEffect['gradient'] => {
  const color: TReqoreEffectColor = isInitial
    ? 'success'
    : stateType !== 'action'
    ? '#6f1977'
    : 'info';
  return {
    colors: {
      0: `${color}:darken:2`,
      50: `${color}:darken`,
      100: `${color}:lighten`,
    },
    borderColor: isInitial
      ? 'success:lighten:2'
      : stateType !== 'action'
      ? '#6f1977:lighten:2'
      : 'info',
    animationSpeed: 1,
    direction: 'to right bottom',
  };
};

export const StyledStateTextWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
`;

const StyledAddNewStatebutton: React.FC<IReqoreButtonProps> = styled(ReqoreButton)`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);

  &:active {
    transform: translateX(-50%) scale(0.97) !important;
  }
`;

const StyledFSMState: React.FC<
  IReqorePanelProps & { isStatic?: boolean } & IFSMStateStyleProps
> = styled(ReqorePanel)`
  transition: none !important;
  overflow: unset;

  ${({ isStatic }) =>
    !isStatic
      ? css`
          left: ${({ x }) => `${x}px`};
          top: ${({ y }) => `${y}px`};
          width: 350px;

          position: absolute !important;
          z-index: 20;
        `
      : css`
          width: 350px;
        `}
`;

export const calculateFontSize = (name, isAction?: boolean) => {
  if (!name) {
    return undefined;
  }

  const len = name.length;

  if (len > 20) {
    return isAction ? '8px' : '12px';
  }

  return undefined;
};

export const getStateCategory = (type: string): TStateTypes => {
  if (type === 'mapper') {
    return 'interfaces';
  }

  if (type === 'connector') {
    return 'interfaces';
  }

  if (type === 'pipeline') {
    return 'interfaces';
  }

  if (type === 'fsm' || type === 'flow') {
    return 'logic';
  }

  if (
    type === 'block' ||
    type === 'if' ||
    type === 'while' ||
    type === 'for' ||
    type === 'foreach'
  ) {
    return 'logic';
  }

  if (type === 'var-action') {
    return 'variables';
  }

  if (type === 'apicall' || type === 'send-message') {
    return 'api';
  }

  if (type === 'appaction') {
    return 'action';
  }

  return 'other';
};

export const getStateType = ({ type, action, ...rest }: IFSMState, app?: IApp) => {
  if (type === 'block') {
    return `${rest['block-type'] || 'for'} block (${size(rest.states)})`;
  }

  if (type === 'fsm') {
    return `fsm`;
  }

  if (type === 'if') {
    return typeof rest.condition === 'string'
      ? rest.condition
      : `${rest.condition?.class}:${rest.condition?.connector}`;
  }

  if (!action || !action.type || !action.value) {
    return '';
  }

  if (action.type === 'appaction') {
    return app.display_name;
  }

  if (action.type === 'var-action') {
    return (action.value as TVariableActionValue).var_name;
  }

  if (action.value?.class) {
    return `${action.value.class}:${action.value.connector} ${action.type}`;
  }

  if (action.value?.path || action.value?.path === '') {
    return `${action.value.type}/${action.value.name}${action.value.path}`;
  }

  return action.value as string;
};

const FSMState: React.FC<IFSMStateProps> = ({
  position,
  id,
  selected,
  onClick,
  onDblClick,
  onDeleteClick,
  onTransitionOrderClick,
  onNewStateClick,
  name,
  desc,
  action,
  initial,
  is_event_trigger,
  final,
  type,
  onUpdate,
  selectedState,
  isAvailableForTransition,
  toggleDragging,
  onExecutionOrderClick,
  isIsolated,
  onMouseEnter,
  onMouseLeave,
  showStateIds,
  hasTransitionToItself,
  activateState,
  error,
  isStatic,
  zoom,
  getStateDataForComparison,
  passRef,
  onSelect,
  isInSelectedList,
  variableDescription,
  isBeingDragged,
  isValid,
  isActive,
  ...rest
}) => {
  const confirmAction = useReqoreProperty('confirmAction');
  const ref = useRef(null);
  const staticPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCompatible, setIsCompatible] = useState<boolean>(undefined);
  const [isLoadingCheck, setIsLoadingCheck] = useState<boolean>(false);
  const clicks = useRef(0);
  const { addMenu } = useContext(ContextMenuContext);
  const t = useContext(TextContext);
  const { qorus_instance } = useContext(InitialContext);
  const { inputType, outputType } = useGetInputOutputType(
    getStateDataForComparison?.({ action, ...rest }, 'input'),
    getStateDataForComparison?.({ action, ...rest }, 'output')
  );
  const clicksTimeout = useRef(null);
  const mouseDownPosition = useRef({ x: 0, y: 0 });
  const timeSinceMouseDown = useRef(0);
  const app = useGetAppActionData((action?.value as TAppAndAction)?.app || null);

  useEffect(() => {
    staticPosition.current.x = position?.x || 0;
    staticPosition.current.y = position?.y || 0;

    if (ref.current) {
      ref.current.style.left = `${staticPosition.current.x}px`;
      ref.current.style.top = `${staticPosition.current.y}px`;
    }
  }, [position?.x, position?.y]);

  // useWhyDidYouUpdate(`state-${id}`, {
  //   position,
  //   id,
  //   selected,
  //   onClick,
  //   onDblClick,
  //   onEditClick,
  //   onDeleteClick,
  //   onTransitionOrderClick,
  //   name,
  //   desc,
  //   action,
  //   initial,
  //   final,
  //   type,
  //   onUpdate,
  //   selectedState,
  //   isAvailableForTransition,
  //   toggleDragging,
  //   onExecutionOrderClick,
  //   isIsolated,
  //   onMouseEnter,
  //   onMouseLeave,
  //   showStateIds,
  //   hasTransitionToItself,
  //   activateState,
  //   error,
  //   isStatic,
  //   zoom,
  //   getStateDataForComparison,
  //   passRef,
  //   onSelect,
  //   isInSelectedList,
  //   variableDescription,
  //   ...rest,
  // });

  useEffect(() => {
    (async () => {
      if (selectedState) {
        setIsLoadingCheck(true);
        const isAvailable = await isAvailableForTransition(selectedState, id);

        if (selectedState) {
          setIsCompatible(isAvailable);
          setIsLoadingCheck(false);
        } else {
          setIsLoadingCheck(false);
          setIsCompatible(undefined);
        }
      } else {
        setIsLoadingCheck(false);
        setIsCompatible(undefined);
      }
    })();
  }, [selectedState]);

  const handleClick = (e) => {
    e.stopPropagation();

    clicks.current += 1;

    clearTimeout(clicksTimeout.current);
    clicksTimeout.current = null;
    clicksTimeout.current = setTimeout(() => {
      if (clicks.current === 1) {
        if (!selectedState || !isCompatible) {
          activateState?.(id, { inputType, outputType });
        } else {
          onClick?.(id);
        }
      } else {
        onDblClick?.(id);
      }

      clicks.current = 0;
    }, 300);
  };

  const getStateTypeLabel = () => {
    if (action?.type === 'var-action') {
      return 'variable';
    }

    if (action?.type === 'appaction') {
      return 'app';
    }

    return action?.type || type;
  };

  const handleMouseUp = (event) => {
    event.persist();

    if (event.isPropagationStopped() || event.shiftKey) {
      mouseDownPosition.current = { x: 0, y: 0 };
      timeSinceMouseDown.current = 0;

      return;
    }

    const startX = mouseDownPosition.current.x || 0;
    const startY = mouseDownPosition.current.y || 0;
    const x = event.clientX || 0;
    const y = event.clientY || 0;
    const diffX = Math.abs(x - startX);
    const diffY = Math.abs(y - startY);

    if (!isLoadingCheck) {
      // If the user has moved in ANY direction for more than 10 pixels, DO NOT HANDLE CLICK
      // Check if the user has moved at least 10 pixels in any direction
      if (
        (diffX === 0 && diffY === 0) ||
        (diffX < 10 && diffY < 10 && event.timeStamp - timeSinceMouseDown.current < 200)
      ) {
        handleClick(event);
      }
    }

    mouseDownPosition.current = { x: 0, y: 0 };
    timeSinceMouseDown.current = 0;
  };

  const handleMouseDown = (event) => {
    event.persist();
    event.stopPropagation();
    event.preventDefault();

    onSelect?.(id, true);

    mouseDownPosition.current.x = event.clientX;
    mouseDownPosition.current.y = event.clientY;
    timeSinceMouseDown.current = event.timeStamp;
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(id);
  };

  const handleMouseLeave = () => {
    onMouseLeave?.(undefined);
  };

  const stateActionDescription: string =
    (
      variableDescription ||
      (app ? app?.short_desc : undefined) ||
      (action?.value?.descriptions
        ? last(action?.value?.descriptions)
        : FSMItemDescByType[action?.type || rest['block-type'] || type])
    )?.slice(0, 100) || '' + '...';

  const stateColor = useMemo(
    () => getStateColor(getStateCategory(action?.type || type), is_event_trigger),
    [action, type, is_event_trigger]
  );

  return (
    <>
      {isInSelectedList && (
        <>
          <ReqoreTag
            size="tiny"
            label={Math.round(position.x)}
            style={{
              transition: 'none',
              position: 'absolute',
              left: position.x,
              top: position.y,
              zIndex: 100,
              transform: 'translateX(-100%)',
            }}
          />
          <ReqoreTag
            size="tiny"
            label={Math.round(position.y)}
            style={{
              transition: 'none',
              position: 'absolute',
              left: position.x,
              top: position.y,
              zIndex: 100,
              transform: 'translateY(-100%)',
            }}
          />
        </>
      )}
      <StyledFSMState
        width={300}
        id={`state-${id}`}
        ref={(r) => {
          ref.current = r;
          passRef?.(id, r);
        }}
        onMouseDown={(e) => {
          e.persist();
          e.stopPropagation();
          e.preventDefault();
          // If the user was holding CMD / CTRL, we don't want to drag the state
          if (e.shiftKey) {
            onSelect?.(id);

            return;
          }

          if (isInSelectedList) {
            return;
          }

          handleMouseDown(e);
        }}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
        flat={false}
        isStatic={isStatic}
        disabled={isCompatible === false}
        contentEffect={
          {
            gradient: {
              ...stateColor,
              borderColor: !isValid ? 'danger' : `${stateColor.borderColor}`,
              animate: isActive ? 'always' : 'never',
            },
            glow: isBeingDragged
              ? {
                  color: '#000000',
                  size: 0.1,
                  blur: 30,
                }
              : isInSelectedList
              ? {
                  color: '#ffed91',
                  size: 2,
                  blur: 20,
                }
              : undefined,
            grayscale: selectedState && !isCompatible,
          } as IReqoreEffect
        }
        icon={isLoadingCheck ? 'Loader5Fill' : FSMItemIconByType[action?.type || type]}
        iconImage={app?.logo}
        className="fsm-state"
        responsiveActions={false}
        responsiveTitle={false}
        x={position?.x}
        y={position?.y}
        selected={selected}
        size="small"
        iconProps={{ size: '25px', animation: isLoadingCheck ? 'spin' : undefined, rounded: true }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        minimal
        label={showStateIds ? `[${id}] ${name}` : name}
        badge={
          !!(is_event_trigger || isIsolated || final)
            ? {
                effect: is_event_trigger
                  ? SaveColorEffect
                  : isIsolated
                  ? NegativeColorEffect
                  : undefined,
                icon: is_event_trigger ? 'PlayLine' : isIsolated ? 'ErrorWarningFill' : undefined,
                tooltip: !isValid ? 'This state is invalid and needs to be fixed' : undefined,
              }
            : undefined
        }
        actions={[
          {
            as: ReqoreTag,
            props: {
              icon: 'HistoryLine',
              tooltip: 'This state has a transition to itself',
            },
            show: !!hasTransitionToItself,
          },
          {
            show: isInSelectedList ? false : 'hover',
            group: [
              {
                icon: 'DeleteBin4Fill' as IReqoreIconName,
                onMouseDown: (e) => {
                  e?.stopPropagation();
                  onDeleteClick?.(id);
                },
                intent: 'danger',
                minimal: true,
                flat: true,
                size: 'small',
                tooltip: 'Delete state',
                show: !!onDeleteClick ? 'hover' : false,
              },
            ],
          },
        ]}
        onContextMenu={(event) => {
          event.persist();
          event.preventDefault();

          let menuData = [
            {
              title: name,
            },
            {
              title: t('Actions'),
            },
            {
              item: 'Make transition',
              onClick: () => {
                onDblClick();
              },
              icon: 'LinkUnlink' as IReqoreIconName,
            },
            {
              item: t('ManageTransitions'),
              onClick: () => {
                onTransitionOrderClick(id);
              },
              icon: 'LinksLine',
            },
            {
              item: t('RemoveAllTransitions'),
              onClick: () => {
                onUpdate(id, { transitions: null });
              },
              icon: 'CloseLine',
            },
            {
              item: t('Edit'),
              icon: 'EditLine',
              disabled: type === 'block' && !qorus_instance,
              intent: 'warning',
            },
            {
              item: t('Delete'),
              onClick: () => onDeleteClick(id),
              icon: 'DeleteBinLine',
              intent: 'danger',
            },
          ];

          if (is_event_trigger) {
            menuData = insertAtIndex(menuData, 3, {
              item: t('ManageExecutionOrder'),
              onClick: () => {
                onExecutionOrderClick();
              },
              icon: 'property',
            });
          }

          addMenu({
            event,
            data: menuData,
          });
        }}
      >
        {desc ? (
          <>
            <ReqoreTextEffect effect={{ textSize: 'small', opacity: 0.8 }}>{desc}</ReqoreTextEffect>
            <ReqoreVerticalSpacer height={10} />
          </>
        ) : null}
        <ReqoreControlGroup size="small" wrap fluid fill vertical stack>
          <ReqoreControlGroup stack fill fluid>
            <ReqoreTag
              wrap
              fixed
              width="100px"
              minimal
              effect={{ weight: 'thick', uppercase: true, textSize: 'tiny' }}
              label={getStateTypeLabel()}
            />
            <ReqoreTag wrap minimal label={getStateType({ type, action, id, ...rest }, app)} />
          </ReqoreControlGroup>
          {action?.type === 'var-action' ? (
            <ReqoreControlGroup stack fill fluid>
              <ReqoreTag
                wrap
                fixed
                width="100px"
                minimal
                effect={{ weight: 'thick', uppercase: true, textSize: 'tiny' }}
                label="Action type"
              />
              <ReqoreTag wrap label={(action.value as TVariableActionValue)?.action_type} minimal />
            </ReqoreControlGroup>
          ) : null}
          <ReqoreTag
            icon="InformationLine"
            size="small"
            wrap
            minimal
            label={stateActionDescription}
            labelEffect={{
              weight: 'light',
            }}
          />
        </ReqoreControlGroup>
        <StyledAddNewStatebutton
          size="small"
          customTheme={{
            main: is_event_trigger
              ? 'success:darken'
              : getStateCategory(action?.type || type) !== 'action'
              ? '#6f1977'
              : 'info',
          }}
          icon="AddLine"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNewStateClick?.();
          }}
        />
      </StyledFSMState>
    </>
  );
};

export default memo(FSMState);
