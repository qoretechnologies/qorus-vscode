/* @flow */
import React from 'react';
import mapProps from 'recompose/mapProps';
import updateOnlyForKeys from 'recompose/onlyUpdateForKeys';
import setDisplayName from 'recompose/setDisplayName';
import compose from 'recompose/compose';
import classNames from 'classnames';
import Flex from '../Flex';

let Section: Function = ({ type, hover, striped, children, className, fixed, Tag, bordered, height, clean }) => {
    if (!fixed) {
        return <Tag>{children}</Tag>;
    }

    if (type === 'header') {
        return (
            <Flex flex="0 1 auto" className="table-header-wrapper">
                {children}
            </Flex>
        );
    }

    if (type === 'body') {
        return (
            <Flex
                className="table-body-wrapper"
                scrollY
                style={{
                    maxHeight: height || 'auto',
                }}
            >
                <table
                    className={classNames(
                        'table table-condensed table--data table-body',
                        {
                            'table-hover': hover,
                            'table-striped': striped,
                            'table-clean': clean,
                            'table-bordered-our': bordered,
                            'fixed-table': true,
                        },
                        className
                    )}
                >
                    <tbody
                        style={{
                            maxHeight: height || 'auto',
                        }}
                    >
                        {children}
                    </tbody>
                </table>
            </Flex>
        );
    }

    return (
        <Flex flexStyle="0 1 auto" className="table-footer-wrapper">
            {children}
        </Flex>
    );
};

Section = updateOnlyForKeys(['children', 'height'])(Section);

const Thead = compose(
    setDisplayName('Thead'),
    mapProps(props => ({ ...props, type: 'header', Tag: 'thead' }))
)(Section);

const Tbody = compose(
    setDisplayName('Tbody'),
    mapProps(props => ({ ...props, type: 'body', Tag: 'tbody' }))
)(Section);

const Tfooter = compose(
    setDisplayName('Tfoot'),
    mapProps(props => ({ ...props, type: 'footer', Tag: 'tfoot' }))
)(Section);

export { Thead, Tbody, Tfooter };
