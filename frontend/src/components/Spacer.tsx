import React from 'react';

export interface ISpacerProps {
    size: number;
}

export default ({ size }: ISpacerProps) => <div style={{ width: '1px', height: `${size}px` }} />;
