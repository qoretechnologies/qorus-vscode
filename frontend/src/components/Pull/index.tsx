import React from 'react';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import classnames from 'classnames';

const Pull = ({ right, Tag, children, className, handleRef, style }) => (
    <Tag className={classnames(className, `pull-${right ? 'right' : 'left'}`)} ref={handleRef} style={style}>
        {children}
    </Tag>
);

export default compose(
    mapProps(({ tag, ...rest }) => ({
        Tag: tag || 'div',
        ...rest,
    })),
    onlyUpdateForKeys(['left', 'right', 'tag', 'Tag', 'children'])
)(Pull);
