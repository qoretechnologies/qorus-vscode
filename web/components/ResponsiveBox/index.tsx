// @flow
import React from 'react';
import pure from 'recompose/onlyUpdateForKeys';
import Flex from '../Flex';

type Props = {
    noPadding: boolean;
    top: boolean;
    noTransition: boolean;
    children: any;
    column: number;
    style?: Object;
    width: string | number;
    scrollX?: boolean;
    scrollY?: boolean;
    fill?: boolean;
};

const Box: Function = ({
    noPadding,
    children,
    top,
    column,
    noTransition,
    style,
    scrollX,
    scrollY,
    fill,
    width: width = 'initial',
}: Props) =>
    noTransition ? (
        <div
            className="white-box"
            style={{
                padding: noPadding ? 0 : null,
                marginTop: top ? 0 : null,
                width: column ? `${100 / column - 0.3 * column}%` : width,
                overflowX: scrollX ? 'auto' : 'initial',
                overflowY: scrollY ? 'auto' : 'initial',
                ...style,
            }}
        >
            {children}
        </div>
    ) : (
        <Flex
            className="white-box"
            flex={fill ? '1 1 auto' : '0 1 auto'}
            scrollX={scrollX}
            scrollY={scrollY}
            style={{
                padding: noPadding ? 0 : null,
                marginTop: top ? 0 : null,
                width: column ? `${100 / (column + column * 0.1)}%` : width,
                ...style,
            }}
        >
            {children}
        </Flex>
    );

export default pure(['noPadding', 'children', 'top'])(Box);
