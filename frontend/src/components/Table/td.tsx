/* @flow */
import React from 'react';
import updateOnlyForKeys from 'recompose/onlyUpdateForKeys';
import compose from 'recompose/compose';

const Td = ({ colspan, className, children, title, style }) => (
    <td colSpan={colspan} className={className} title={title} style={style}>
        {children || '-'}
    </td>
);

export default compose(updateOnlyForKeys(['className', 'children', 'colspan', 'title', 'style']))(Td);
