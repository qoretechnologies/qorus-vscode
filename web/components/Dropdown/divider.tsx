// @flow
import React from 'react';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import { MenuDivider } from '@blueprintjs/core';

type DropdownDividerProps = {
    title: string;
    className?: string;
};

const DropdownDivider: Function = ({ title, className }: DropdownDividerProps) => (
    <MenuDivider title={title} className={className} />
);

export default compose(onlyUpdateForKeys(['title', 'className']))(DropdownDivider);
