// @flow
import React from 'react';

const Flex: Function = ({
    children,
    display: display = 'flex',
    flexFlow: flexFlow = 'column',
    flex: flex = '1 1 auto',
    height,
    style,
    className,
    scrollX,
    scrollY,
    flexRef,
    id,
    title,
}) => (
    <div
        title={title}
        style={{
            ...style,
            display,
            flexFlow,
            flex,
            height,
            overflowX: scrollX ? 'auto' : 'hidden',
            overflowY: scrollY ? 'auto' : 'hidden',
        }}
        id={id || undefined}
        ref={ref => flexRef && flexRef(ref)}
        className={className}
    >
        {children}
    </div>
);

export default Flex;
