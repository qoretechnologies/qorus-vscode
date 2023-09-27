import {
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTag,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import {
  IReqoreEffect,
  ReqoreTextEffect,
  TReqoreHexColor,
} from '@qoretechnologies/reqore/dist/components/Effect';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import { last } from 'lodash';
import size from 'lodash/size';
import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { NegativeColorEffect, PositiveColorEffect } from '../../../components/Field/multiPair';
import { ContextMenuContext } from '../../../context/contextMenu';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { insertAtIndex } from '../../../helpers/functions';
import { useGetInputOutputType } from '../../../hooks/useGetInputOutputType';
import { IFSMState, TVariableActionValue } from './';
import { FSMItemDescByType, FSMItemIconByType } from './toolbarItem';

export interface IFSMStateProps extends IFSMState {
  selected?: boolean;
  onDblClick: (id: string) => any;
  onClick: (id: string) => any;
  onEditClick: (id: string) => any;
  onDeleteClick: (id: string) => any;
  onUpdate: (id: string, data: any) => any;
  onTransitionOrderClick: (id: string) => any;
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
}

export interface IFSMStateStyleProps {
  x: number;
  y: number;
  selected?: boolean;
  type?: 'mapper' | 'connector' | 'pipeline' | 'fsm' | 'block' | 'if';
}

export type TStateTypes = 'interfaces' | 'logic' | 'api' | 'other' | 'variables';

export const getCategoryColor = (category: TStateTypes): TReqoreHexColor => {
  switch (category) {
    case 'interfaces':
      return '#e8970b';
    case 'logic':
      return '#3b3b3b';
    case 'api':
      return '#1914b0';
    case 'variables':
      return '#14b06f';
    default:
      return '#950ea1';
  }
};

export const getStateColor = (stateType: TStateTypes): IReqoreEffect['gradient'] => {
  let color;
  switch (stateType) {
    case 'interfaces':
      color = '#e8970b';
      break;
    case 'logic':
      color = '#0e041a';
      break;
    case 'api':
      color = '#1914b0';
      break;
    case 'variables':
      color = '#14b06f';
      break;
    default:
      color = '#950ea1';
      break;
  }

  return {
    colors: {
      0: 'main',
      100: color,
    },
    animate: 'hover',
    direction: 'to right bottom',
  };
};

export const StyledStateTextWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
`;

// IS ISOLATED
// SELECTED
// INITIAL
// FINAL
// TYPE
// IS AVAILABLE FOR TRANSITION
// IS INCOMPATIBLE
// ERROR
const StyledFSMState: React.FC<
  IReqorePanelProps & { isStatic?: boolean } & IFSMStateStyleProps
> = styled(ReqorePanel)`
  transition: none !important;
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

  if (type === 'fsm') {
    return 'logic';
  }

  if (type === 'block') {
    return 'logic';
  }

  if (type === 'if') {
    return 'logic';
  }

  if (type === 'var-action') {
    return 'variables';
  }

  if (type === 'apicall' || type === 'send-message') {
    return 'api';
  }

  return 'other';
};

export const getStateType = ({ type, action, ...rest }: IFSMState) => {
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

  if (action.type === 'var-action') {
    return (action.value as TVariableActionValue).var_name;
  }

  if (action.value?.class) {
    return `${action.value.class}:${action.value.connector} ${action.type}`;
  }

  if (action.value?.path || action.value?.path === '') {
    return `${action.value.type}/${action.value.name}${action.value.path}`;
  }

  return action.value;
};

const FSMState: React.FC<IFSMStateProps> = ({
  position,
  id,
  selected,
  onClick,
  onDblClick,
  onEditClick,
  onDeleteClick,
  onTransitionOrderClick,
  name,
  desc,
  action,
  initial,
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
  ...rest
}) => {
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

    return action?.type || type;
  };

  const handleMouseUp = (event) => {
    console.log('FUCKING MOUSE UP', event.timeStamp);
    event.persist();

    const startX = mouseDownPosition.current.x || 0;
    const startY = mouseDownPosition.current.y || 0;
    const x = event.clientX || 0;
    const y = event.clientY || 0;

    console.log({
      startX,
      startY,
      x,
      y,
      isLoadingCheck,
    });

    if (!isLoadingCheck) {
      // If the user has moved in ANY direction for more than 10 pixels, DO NOT HANDLE CLICK
      // Check if the user has moved at least 10 pixels in any direction
      if (
        Math.abs(x - startX) < 10 &&
        Math.abs(y - startY) < 10 &&
        event.timeStamp - timeSinceMouseDown.current < 200
      ) {
        handleClick(event);
      }
    }

    mouseDownPosition.current = { x: 0, y: 0 };
    timeSinceMouseDown.current = 0;
  };

  const handleMouseDown = (event) => {
    console.log('FUCKING MOUSE DOWN', event.timeStamp);
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
      (action?.value?.descriptions
        ? last(action?.value?.descriptions)
        : FSMItemDescByType[action?.type || rest['block-type'] || type])
    )?.slice(0, 100) || '' + '...';

  return (
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
      isStatic={isStatic}
      disabled={isCompatible === false}
      intent={
        isLoadingCheck
          ? 'pending'
          : selectedState === id
          ? 'info'
          : isCompatible
          ? 'success'
          : undefined
      }
      contentEffect={
        {
          gradient: {
            ...getStateColor(getStateCategory(action?.type || type)),
            animate: isCompatible || isInSelectedList ? 'always' : 'hover',
          },
          glow: isCompatible
            ? {
                color: selectedState === id ? 'info' : 'success',
                size: 5,
                blur: 10,
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
      className="fsm-state"
      responsiveActions={false}
      responsiveTitle={false}
      x={position?.x}
      y={position?.y}
      selected={selected}
      size="small"
      iconProps={{ size: '25px', animation: isLoadingCheck ? 'spin' : undefined }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      minimal
      label={showStateIds ? `[${id}] ${name}` : name}
      badge={
        !!(initial || isIsolated || final)
          ? {
              effect: initial ? PositiveColorEffect : isIsolated ? NegativeColorEffect : undefined,
              icon: initial ? 'PlayLine' : isIsolated ? 'AlarmWarningLine' : undefined,
              tooltip: initial
                ? 'Initial state'
                : isIsolated
                ? 'This state is isolated'
                : undefined,
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
              icon: 'InformationFill',
              minimal: true,
              flat: true,
              size: 'small',
              show: 'hover',
              tooltip:
                inputType && outputType && zoom === 1
                  ? {
                      title: name,
                      delay: 200,
                      icon: 'InformationFill',
                      content: (
                        <React.Fragment key={Date.now()}>
                          {desc || 'This state has no description'}
                          {size(inputType) ? (
                            <>
                              <ReqoreVerticalSpacer height={10} />
                              <ReqorePanel
                                label="Input type"
                                badge={[
                                  inputType.name,
                                  { labelKey: 'Fields', label: size(inputType.fields) },
                                ]}
                                size="small"
                              >
                                {inputType.desc}
                              </ReqorePanel>
                            </>
                          ) : null}

                          {size(outputType) ? (
                            <>
                              <ReqoreVerticalSpacer height={5} />
                              <ReqorePanel
                                label="Output type"
                                badge={[
                                  outputType.name,
                                  { labelKey: 'Fields', label: size(outputType.fields) },
                                ]}
                                size="small"
                              >
                                {outputType.desc}
                              </ReqorePanel>
                            </>
                          ) : null}
                          {size(outputType) || size(inputType) ? (
                            <>
                              <ReqoreVerticalSpacer height={5} />
                              <ReqoreMessage minimal flat intent="info" size="small">
                                Click the state for even more information
                              </ReqoreMessage>
                            </>
                          ) : null}
                        </React.Fragment>
                      ),
                    }
                  : 'Loading type information...',
            },
            {
              icon: 'Edit2Line' as IReqoreIconName,
              disabled: type === 'block' && !qorus_instance,
              onClick: (e) => {
                e?.stopPropagation();
                onEditClick?.(id);
              },
              minimal: true,
              flat: true,
              size: 'small',
              tooltip: 'Edit state',
              show: !!onEditClick ? 'hover' : false,
            },
            {
              icon: 'DeleteBin4Fill' as IReqoreIconName,
              onClick: (e) => {
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
            item: t('Initial'),
            onClick: () => {
              onUpdate(id, { initial: !initial });
            },
            icon: 'PlayLine',
            rightIcon: initial ? 'small-tick' : undefined,
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
            onClick: () => onEditClick(id),
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

        if (initial) {
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
            color={`${getCategoryColor(getStateCategory(action?.type || type))}:darken:2`}
            effect={{ weight: 'thick', uppercase: true, textSize: 'tiny' }}
            label={getStateTypeLabel()}
          />
          <ReqoreTag minimal wrap label={getStateType({ type, action, ...rest })} />
        </ReqoreControlGroup>
        {action?.type === 'var-action' ? (
          <ReqoreControlGroup stack fill fluid>
            <ReqoreTag
              wrap
              fixed
              color={`${getCategoryColor(getStateCategory(action?.type || type))}:darken:2`}
              effect={{ weight: 'thick', uppercase: true, textSize: 'tiny' }}
              label="Action type"
            />
            <ReqoreTag minimal wrap label={(action.value as TVariableActionValue)?.action_type} />
          </ReqoreControlGroup>
        ) : null}
        <ReqoreTag
          icon="InformationLine"
          size="small"
          wrap
          label={stateActionDescription}
          color={`${getCategoryColor(getStateCategory(action?.type || type))}:darken:2`}
          labelEffect={{
            weight: 'light',
          }}
        />
      </ReqoreControlGroup>
    </StyledFSMState>
  );
};

export default memo(FSMState);
