// @flow
import React from 'react';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import { getType } from '../../helpers/functions';
import { Icon, Intent } from '@blueprintjs/core';
import Text from '../Text';
import Date from '../Date';
import Flex from '../Flex';
import { isDate } from '../../helpers/date';

const emptyTypeToString = {
    object: '{ }',
    array: '[ ]',
};

const ContentByType: Function = ({ content, inTable, noControls }) => {
    const type: string = getType(content);
    const className: string = `content-by-type ${type}`;

    if (type === 'string') {
        const isContentDate: boolean = isDate(content);

        let newContent = inTable ? <Text text={content} noControls={noControls} /> : content;
        newContent = isContentDate ? <Date date={content} /> : newContent;

        return inTable ? (
            <Flex className={className} title={content}>
                {newContent}
            </Flex>
        ) : (
            <div className={className}>{newContent}</div>
        );
    }

    if (type === 'number') {
        return <div className={className}>{content}</div>;
    }

    if (type === 'object' || type === 'array') {
        return <div className={className}>{emptyTypeToString[type]}</div>;
    }

    if (type === 'boolean') {
        return (
            <div className={className}>
                <Icon icon={content ? 'small-tick' : 'cross'} />
            </div>
        );
    }

    return <div className={className}>-</div>;
};

export default compose(onlyUpdateForKeys(['type', 'content']))(ContentByType);
