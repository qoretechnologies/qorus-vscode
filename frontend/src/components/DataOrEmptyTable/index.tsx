import React from 'react';
import { Tbody, Tr, Td } from '../Table';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';

const DataOrEmptyTable: Function = ({
    cols,
    condition,
    children,
    small,
    ...rest
}: {
    cols: number;
    condition: boolean;
    children: Function;
    small: boolean;
}) =>
    condition ? (
        <Tbody {...rest} className="tbody-empty-table">
            <Tr first className="placeholder-row">
                {[...Array(cols)].map(col => (
                    <Td key={col} />
                ))}
            </Tr>
            <Tr>
                <Td colspan={cols}>
                    <div className="no-data-table-wrapper">
                        <p> No data found </p>
                    </div>
                </Td>
            </Tr>
        </Tbody>
    ) : (
        children(rest)
    );

export default onlyUpdateForKeys(['cols', 'children', 'condition'])(DataOrEmptyTable);
