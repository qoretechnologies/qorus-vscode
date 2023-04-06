import {
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTag,
  ReqoreVerticalSpacer,
  useReqoreTheme,
} from '@qoretechnologies/reqore';
import {
  IReqoreEffect,
  ReqoreTextEffect,
  TReqoreHexColor,
} from '@qoretechnologies/reqore/dist/components/Effect';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import size from 'lodash/size';
import React, { useContext, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import styled, { css } from 'styled-components';
import { NegativeColorEffect, PositiveColorEffect } from '../../../components/Field/multiPair';
import { ContextMenuContext } from '../../../context/contextMenu';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { insertAtIndex } from '../../../helpers/functions';
import { useGetInputOutputType } from '../../../hooks/useGetInputOutputType';
import { IFSMState, STATE_ITEM_TYPE, TVariableActionValue } from './';
import { FSMItemIconByType } from './toolbarItem';

export interface IFSMStateProps extends IFSMState {
  selected?: boolean;
  onDblClick: (id: string) => any;
  onClick: (id: string) => any;
  onEditClick: (id: string) => any;
  onDeleteClick: (id: string) => any;
  onUpdate: (id: string, data: any) => any;
  onTransitionOrderClick: (id: string) => any;
  startTransitionDrag: (id: string) => any;
  stopTransitionDrag: (id: string) => any;
  selectedState?: number | string;
  isAvailableForTransition: (stateId: string, id: string) => boolean;
  onExecutionOrderClick: () => void;
  id: string;
  isIsolated: boolean;
  category: TStateTypes;
  hasTransitionToItself?: boolean;
}

export interface IFSMStateStyleProps {
  x: number;
  y: number;
  selected: boolean;
  initial: boolean;
  final: boolean;
  type: 'mapper' | 'connector' | 'pipeline' | 'fsm' | 'block' | 'if';
  isAvailableForTransition: boolean;
  isIsolated: boolean;
  isIncompatible?: boolean;
  error?: boolean;
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
      color = '#3b3b3b';
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
const StyledFSMState: React.FC<IReqorePanelProps> = styled(ReqorePanel)`
  ${({ isStatic }) =>
    !isStatic
      ? css`
          left: ${({ x }) => `${x}px`};
          top: ${({ y }) => `${y}px`};
          min-width: 250px;
          max-width: 350px !important;

          position: absolute !important;
          z-index: 20;
        `
      : css`
          min-width: 250px;
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
  stateInputProvider,
  stateOutputProvider,
  activateState,
  error,
  isStatic,
  ...rest
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [_, drag] = useDrag({
    type: STATE_ITEM_TYPE,
    item() {
      setIsDragging(true);
      return { name: 'state', type: STATE_ITEM_TYPE, id };
    },
    end: () => {
      setIsDragging(false);
    },
  });

  const [shouldWiggle, setShouldWiggle] = useState<boolean>(false);
  const [isCompatible, setIsCompatible] = useState<boolean>(null);
  const [isLoadingCheck, setIsLoadingCheck] = useState<boolean>(false);
  const { addMenu } = useContext(ContextMenuContext);
  const t = useContext(TextContext);
  const { qorus_instance } = useContext(InitialContext);
  const theme = useReqoreTheme();
  const { inputType, outputType } = useGetInputOutputType(stateInputProvider, stateOutputProvider);

  useEffect(() => {
    (async () => {
      if (selectedState) {
        setIsLoadingCheck(true);
        const isAvailable = await isAvailableForTransition(selectedState, id);

        if (selectedState) {
          setIsCompatible(isAvailable);
          setIsLoadingCheck(false);
          setShouldWiggle(true);
        } else {
          setShouldWiggle(false);
          setIsLoadingCheck(false);
          setIsCompatible(null);
        }
      } else {
        setShouldWiggle(false);
        setIsLoadingCheck(false);
        setIsCompatible(null);
      }
    })();
  }, [selectedState]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, func: (id: string) => any) => {
    func?.(id);
  };

  return (
    <StyledFSMState
      id={`state-${id}`}
      ref={drag}
      isStatic={isStatic}
      intent={selectedState === id ? 'info' : undefined}
      //customTheme={{ main: getStateColor(getStateCategory(type)) }}
      contentEffect={
        {
          gradient: {
            ...getStateColor(getStateCategory(action?.type || type)),
            animate: shouldWiggle ? 'always' : 'hover',
          },
          glow: shouldWiggle
            ? {
                color: selectedState === id ? 'info' : 'success',
                size: 5,
                blur: 10,
              }
            : undefined,
        } as IReqoreEffect
      }
      icon={FSMItemIconByType[action?.type || type]}
      name={`fsm-state-${name}`}
      responsiveActions={false}
      responsiveTitle={false}
      x={position?.x}
      y={position?.y}
      onDoubleClick={selectedState ? undefined : (e) => handleClick(e, onDblClick)}
      onClick={
        !selectedState || !shouldWiggle
          ? () => activateState?.(id, { inputType, outputType })
          : (e) => handleClick(e, onClick)
      }
      selected={selected}
      size="small"
      tooltip={
        inputType && outputType
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
          : 'Loading type information...'
      }
      onMouseDown={(e) => e.stopPropagation()}
      iconProps={{ size: '25px' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      minimal
      label={showStateIds ? `[${id}] ${name}` : name}
      actions={[
        {
          as: ReqoreTag,
          props: {
            effect: initial ? PositiveColorEffect : isIsolated ? NegativeColorEffect : undefined,
            icon: initial ? 'PlayLine' : isIsolated ? 'AlarmWarningLine' : undefined,
            tooltip: initial ? 'Initial state' : isIsolated ? 'This state is isolated' : undefined,
          },
          show: !!(initial || isIsolated || final),
        },
        {
          as: ReqoreTag,
          props: {
            icon: 'HistoryLine',
            tooltip: 'This state has a transition to itself',
          },
          show: !!hasTransitionToItself,
        },
        {
          group: [
            {
              icon: 'Edit2Line' as IReqoreIconName,
              disabled: type === 'block' && !qorus_instance,
              onClick: (e) => handleClick(e, onEditClick),
              minimal: true,
              flat: true,
              size: 'small',
              show: !!onEditClick,
            },
            {
              icon: 'DeleteBin4Fill' as IReqoreIconName,
              onClick: (e) => handleClick(e, onDeleteClick),
              intent: 'danger',
              minimal: true,
              flat: true,
              size: 'small',
              show: !!onDeleteClick,
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
      <ReqoreControlGroup size="small" wrap fluid fill vertical>
        <ReqoreControlGroup stack fill fluid>
          <ReqoreTag
            wrap
            fixed
            color={`${getCategoryColor(getStateCategory(action?.type || type))}:darken:2`}
            effect={{ weight: 'thick', uppercase: true, textSize: 'tiny' }}
            label={action?.type || type}
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
      </ReqoreControlGroup>
    </StyledFSMState>
  );
};

export default FSMState;
