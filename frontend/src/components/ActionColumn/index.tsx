// @flow
import React from 'react';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import { Td, Th } from '../Table';
import withTextContext from '../../hocomponents/withTextContext';

const ActionColumn = compose(onlyUpdateForKeys(['children']))(({ children, className: className = 'normal' }) => (
    <Td className={className}>{children || '-'}</Td>
));

const ActionColumnHeader = compose(
    onlyUpdateForKeys(['children', 'sortData']),
    withTextContext()
)(({ children, icon: icon = 'wrench', t, ...rest }) => (
    <Th iconName={icon} {...rest}>
        {children || t('table.actions')}
    </Th>
));

export { ActionColumn, ActionColumnHeader };
