// @flow
import React from 'react';
import classnames from 'classnames';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';

const FixedRow = ({ children, sortData, onSortChange, className, hide }) =>
    !hide ? (
        <div className={classnames('table-fixed-row', className)}>
            {React.Children.map(
                children,
                child => child && React.cloneElement(child, { sortData, onSortChange, fixed: true })
            )}
        </div>
    ) : null;

export default compose(onlyUpdateForKeys(['children', 'sortData', 'onSortChange', 'className', 'hide']))(FixedRow);
