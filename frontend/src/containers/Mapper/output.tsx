import { useReqoreTheme } from '@qoretechnologies/reqore';
import { IReqoreEffect } from '@qoretechnologies/reqore/dist/components/Effect';
import size from 'lodash/size';
import { FC } from 'react';
import { useDrop } from 'react-dnd';
import { StyledMapperField, StyledMapperFieldWrapper, TYPE_COLORS } from '.';
import { TTranslator } from '../../App';

export interface IMapperOutputProps {
  onDrop: (
    inputPath: string,
    outputPath: string,
    usesContext?: boolean,
    isInputHash?: boolean
  ) => any;
  id: number;
  accepts: string[];
  name: string;
  isChild: boolean;
  level: number;
  onClick: any;
  onManageClick: any;
  lastChildIndex: number;
  type: any;
  field: any;
  isCustom: boolean;
  path: string;
  hasRelation: boolean;
  highlight?: boolean;
  t: TTranslator;
  hasError?: boolean;
}

const MapperOutput: FC<IMapperOutputProps> = ({
  onDrop,
  id,
  accepts,
  name,
  isMapperChild,
  level,
  onClick,
  onManageClick,
  lastChildIndex,
  type,
  field,
  isCustom,
  path,
  hasRelation,
  hasData,
  hasError,
  highlight,
  t,
}) => {
  const [{ canDrop, isDragging }, dropRef] = useDrop({
    accept: 'input',
    drop: (item) => {
      onDrop(item.id, path, item.usesContext, item.isWholeInput);
    },
    canDrop: (item) => {
      if (
        !hasRelation &&
        (item.types.includes('any') ||
          accepts.includes('any') ||
          (size(item.types) <= size(accepts) &&
            accepts.some((type: string) => item.types.includes(type))))
      ) {
        return true;
      }
      return false;
    },
    collect: (monitor) => ({
      isDragging: !!monitor.getItem(),
      canDrop: monitor.canDrop(),
    }),
  });
  const theme = useReqoreTheme();

  return (
    <StyledMapperFieldWrapper
      style={{
        opacity: isDragging ? (canDrop ? 1 : 0.3) : 1,
        transform: `translateX(${isDragging ? (canDrop ? '-50px' : '0') : '0'})`,
      }}
      flat={false}
      stack
      fill
      isMapperChild={isMapperChild}
      level={level}
      childrenCount={lastChildIndex}
      fluid
      input
      theme={theme}
    >
      <StyledMapperField
        onClick={onClick}
        tooltip={{
          content: field?.desc,
          delay: 200,
        }}
        ref={dropRef}
        textAlign="center"
        icon={hasRelation ? 'ArrowLeftFill' : hasData ? 'CodeLine' : undefined}
        rightIcon="DragDropLine"
        leftIconColor={`${hasRelation ? 'success' : hasData ? 'info' : undefined}:lighten:2`}
        effect={
          !hasRelation
            ? hasData
              ? ({
                  gradient: {
                    colors: {
                      130: 'main:lighten',
                      50: 'main',
                      0: 'info:darken',
                    },
                  },
                } as IReqoreEffect)
              : undefined
            : ({
                gradient: {
                  colors: {
                    130: 'main:lighten',
                    50: 'main',
                    0: 'success:darken',
                  },
                },
              } as IReqoreEffect)
        }
        badge={{
          label: `${type.types_returned.includes('nothing') ? '*' : ''}${type.base_type}`,
          color: TYPE_COLORS[`${type.types_returned[0].replace(/</g, '').replace(/>/g, '')}`],
        }}
      >
        {typeof name === 'string' ? name.replace(/\\./g, '.') : name}
      </StyledMapperField>
    </StyledMapperFieldWrapper>
  );
};

export default MapperOutput;
