import { FC } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import { StyledMapperField } from '.';
import AddFieldButton from './add';

export interface IMapperInputProps {
  id: number;
  types: string[];
  name: string;
  isChild: boolean;
  level: number;
  lastChildIndex: number;
  onClick: any;
  type: any;
  field: any;
  isCustom: boolean;
  path: string;
  hasAvailableOutput: boolean;
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
  isChild,
  level,
  isCustom,
  lastChildIndex,
  onClick,
  type,
  path,
  hasAvailableOutput,
  usesContext,
  isWholeInput,
  hasError,
}) => {
  const [{ opacity }, dragRef] = useDrag({
    type: 'input',
    item: { type: 'input', types, id: path, usesContext, isWholeInput },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.2 : 1,
    }),
  });

  const finalOpacity = hasAvailableOutput ? opacity : 0.5;

  return (
    <StyledMapperField
      style={{ opacity }}
      input
      isChild={isChild}
      isInputHash={isWholeInput}
      isDisabled={!hasAvailableOutput || hasError}
      hasError={hasError}
      level={level}
      childrenCount={lastChildIndex}
      title={field?.desc}
      name="diagram-field"
    >
      <StyledDragHandle
        ref={hasAvailableOutput ? dragRef : undefined}
        style={{ opacity: finalOpacity }}
      >
        <h4 style={{ fontSize: isWholeInput ? '16px' : '14px' }}>
          {typeof name === 'string' ? name.replace(/\\./g, '.') : name}
        </h4>
        {!isWholeInput && (
          <p className={`${types.join(' ').replace(/</g, '').replace(/>/g, '')} type`}>
            {`${types.includes('nothing') ? '*' : ''}${type.base_type}`}
          </p>
        )}
      </StyledDragHandle>
      {!usesContext && field && (
        <AddFieldButton
          field={field}
          isCustom={isCustom}
          canManageFields={type.can_manage_fields}
          onClick={onClick}
        />
      )}
    </StyledMapperField>
  );
};

export default MapperInput;
