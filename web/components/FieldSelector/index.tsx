import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { upperFirst, replace } from 'lodash';
import { Tooltip, Position } from '@blueprintjs/core';
import { TextContext } from '../../context/text';

const StyledFieldSelector = styled.div`
    width: 100%;
    height: 50px;
    padding: 5px;
    border: 1px solid #eee;
    border-radius: 3px;
    &:not(:first-child) {
        margin-top: 5px;
    }
    cursor: pointer;
    transition: all 0.1s ease-in;
    position: relative;

    &:hover {
        border-color: #ccc;

        div {
            opacity: 0.7;
            transform: translateY(-50%) rotateZ(90deg);

            &:after,
            &:before {
                background-color: green;
            }
        }
    }
`;

const FieldName = styled.h4`
    margin: 0;
    padding: 0;
    color: #333;
    line-height: 20px;
`;

const FieldType = styled.p`
    margin: 0;
    padding: 0;
    color: #aaa;
    font-size: 12px;
    line-height: 20px;
`;

const FieldButton = styled.div`
    transition: all 0.3s ease-in;
    position: absolute;
    right: 15px;
    top: 50%;
    width: 16px;
    height: 16px;
    transform: translateY(-50%);
    opacity: 0;

    &:after,
    &:before {
        position: absolute;
        content: '';
        display: block;
        background-color: #eee;
    }

    &:after {
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: 100%;
    }

    &:before {
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        height: 2px;
    }
`;

export interface IFieldSelector {
    name: string;
    type: string;
    onClick: (name: string) => any;
}

const FieldSelector: FunctionComponent<IFieldSelector> = ({ name, type: type = 'string', onClick }) => (
    <TextContext.Consumer>
        {t => (
            <StyledFieldSelector onClick={() => onClick(name)}>
                <FieldName>{t(`field-label-${name}`)}</FieldName>
                <FieldType>{`<${type}>`}</FieldType>
                <FieldButton />
            </StyledFieldSelector>
        )}
    </TextContext.Consumer>
);

export default FieldSelector;
