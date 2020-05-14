import React, { FC, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { StyledMapperField } from '.';
import AddFieldButton from './add';
import styled from 'styled-components';
import { Tooltip } from '@blueprintjs/core';
import { IMapperField, hasDuplicateSiblings } from '../../helpers/mapper';

export interface IMapperInputProps {
    id: number;
    types: string[];
    name: string;
    isChild: boolean;
    level: number;
    lastChildIndex: number;
    onClick: any;
    type: any;
    field: IMapperField;
    isCustom: boolean;
    path: string;
    hasAvailableOutput: boolean;
    usesContext?: boolean;
    isWholeInput?: boolean;
    updateErrorCount?: (decrease?: boolean) => any;
    allFields?: IMapperField[];
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
    updateErrorCount,
    allFields,
}) => {
    const [{ opacity }, dragRef] = useDrag({
        item: { type: 'input', types, id: path, usesContext, isWholeInput },
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.2 : 1,
        }),
    });
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        //console.log(allFields);
        //console.log(hasDuplicateSiblings(allFields, field));
    });

    useUpdateEffect(() => {
        //console.log('hasError updated');
        // Update the total error count
        //updateErrorCount(!hasError);
    }, [hasError]);

    const finalOpacity = hasAvailableOutput ? opacity : 0.5;

    return (
        <StyledMapperField
            style={{ opacity }}
            input
            isChild={isChild}
            isInputHash={isWholeInput}
            isDisabled={!hasAvailableOutput}
            level={level}
            childrenCount={lastChildIndex}
            title={field?.desc}
        >
            <StyledDragHandle ref={hasAvailableOutput ? dragRef : undefined} style={{ opacity: finalOpacity }}>
                <h4 style={{ fontSize: isWholeInput ? '16px' : '14px' }}>{name}</h4>
                {!isWholeInput && (
                    <p className={`${types.join(' ').replace(/</g, '').replace(/>/g, '')} type`}>
                        {`${types.includes('nothing') ? '*' : ''}${type.base_type}`}
                    </p>
                )}
            </StyledDragHandle>
            {!usesContext && field && (
                <AddFieldButton
                    field={field}
                    isCustom={isCustom && !field.isExtender}
                    canManageFields={type.can_manage_fields}
                    onClick={onClick}
                />
            )}
        </StyledMapperField>
    );
};

export default MapperInput;
