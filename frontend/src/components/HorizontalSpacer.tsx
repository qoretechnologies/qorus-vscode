import React from 'react';

export interface IHorizontalSpacerProps {
  size: number;
}

export default ({ size }: IHorizontalSpacerProps) => (
  <div style={{ height: '1px', width: `${size}px`, display: 'inline-block' }} />
);
