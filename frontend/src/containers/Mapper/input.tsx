import { useReqoreTheme } from '@qoretechnologies/reqore';
import { IReqoreEffect } from '@qoretechnologies/reqore/dist/components/Effect';
import { FC } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import { StyledMapperField, StyledMapperFieldWrapper, TYPE_COLORS } from '.';

export interface IMapperInputProps {
  id: number;
  types: string[];
  name: string;
  isMapperChild: boolean;
  level: number;
  lastChildIndex: number;
  onClick: any;
  type: any;
  field: any;
  isCustom: boolean;
  path: string;
  hasAvailableOutput: boolean;
  hasRelation: boolean;
  usesContext?: boolean;
  isWholeInput?: boolean;
  hasError?: boolean;
}

const StyledDragHandle = styled.div`
  width: 100%;
  height: 100%;
`;

const MapperInput: FC<IMapperInputProps> = ({
  id,
  field,
  types,
  name,
  isMapperChild,
  level,
  isCustom,
  lastChildIndex,
  onClick,
  type,
  path,
  hasAvailableOutput,
  hasRelation,
  usesContext,
  isWholeInput,
  description,
  hasError,
}) => {
  const [{ opacity }, dragRef] = useDrag({
    type: 'input',
    item: { type: 'input', types, id: path, usesContext, isWholeInput },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.2 : 1,
    }),
  });
  const theme = useReqoreTheme();

  return (
    <StyledMapperFieldWrapper
      stack
      fill
      isMapperChild={isMapperChild}
      isInputHash={isWholeInput}
      level={level}
      childrenCount={lastChildIndex}
      fluid
      flat={false}
      input
      theme={theme}
    >
      <StyledMapperField
        maxWidth="300px"
        icon={hasRelation ? 'CheckLine' : hasAvailableOutput ? 'DragMoveLine' : 'ForbidLine'}
        rightIcon={
          hasRelation ? 'ArrowRightFill' : hasAvailableOutput ? 'DragMoveLine' : 'ForbidLine'
        }
        rightIconColor={hasRelation ? 'success:lighten:2' : undefined}
        textAlign="left"
        onClick={onClick}
        effect={
          !hasRelation
            ? undefined
            : ({
                gradient: {
                  colors: {
                    0: 'main',
                    50: 'main',
                    130: 'success:darken',
                  },
                },
              } as IReqoreEffect)
        }
        intent={hasError ? 'danger' : undefined}
        tooltip={{
          content: field?.desc,
          delay: 200,
        }}
        ref={hasAvailableOutput ? dragRef : undefined}
        badge={{
          label: `${types.includes('nothing') ? '*' : ''}${type.base_type}`,
          color: TYPE_COLORS[`${types[0].replace(/</g, '').replace(/>/g, '')}`],
        }}
        description={description}
      >
        {typeof name === 'string' ? name.replace(/\\./g, '.') : name}
      </StyledMapperField>
    </StyledMapperFieldWrapper>
  );
};

export default MapperInput;
