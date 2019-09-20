/* @flow */
import React from 'react';
import updateOnlyForKeys from 'recompose/onlyUpdateForKeys';
import compose from 'recompose/compose';
import classnames from 'classnames';

import { Thead, Tbody, Tfooter } from './section';
import Tr from './row';
import FixedRow from './fixed_row';
import Th from './th';
import Td from './td';
import Flex from '../Flex';

let Table: Function = ({
    children,
    fixed,
    striped,
    hover,
    condensed,
    bordered,
    clean,
    className,
    height,
    marginBottom,
    info,
    width,
}) =>
    fixed ? (
        <Flex className="table-wrapper">
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    fixed,
                    striped,
                    hover,
                    condensed,
                    bordered,
                    className,
                    height,
                    clean,
                    marginBottom: marginBottom || 0,
                })
            )}
        </Flex>
    ) : (
        <table
            tabIndex={1}
            className={classnames(
                'table',
                {
                    'table--data': !info,
                    'table-striped': striped,
                    'table-condensed': condensed,
                    'table-hover': hover,
                    'table-bordered-our': bordered,
                    'table--info': info,
                    'table-clean': clean,
                },
                className
            )}
            style={{
                width,
            }}
        >
            {React.Children.map(children, child => React.cloneElement(child, { fixed }))}
        </table>
    );

Table = compose(updateOnlyForKeys(['children', 'className', 'marginBottom', 'height', 'width']))(Table);

export { Table, Thead, Tbody, Tfooter, Tr, Th, Td, FixedRow };
