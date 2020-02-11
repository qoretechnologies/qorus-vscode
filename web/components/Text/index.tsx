// @flow
import React from 'react';
import compose from 'recompose/compose';
import pure from 'recompose/onlyUpdateForKeys';
import Flex from '../Flex';
import Tree from '../Tree';
import ContentByType from '../ContentByType';

const Text = ({ text, hasAlerts, expanded, caseSensitiveTree, noControls }) =>
    text && typeof text === 'object' ? (
        <Tree data={text} noControls={noControls} compact caseSensitive={caseSensitiveTree} />
    ) : (
        <Flex flexFlow="row" title={text}>
            <div
                className={`text-component ${expanded && 'text-component-expanded'} ${hasAlerts && 'has-alerts'}`}
                title={text}
            >
                <ContentByType content={text} />
            </div>
        </Flex>
    );

export default compose(pure(['text', 'expanded', 'hasAlerts']))(Text);
