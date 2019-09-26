// @flow
import React from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames';
import map from 'lodash/map';
import Scroll from 'react-scrollbar';

import SidebarSection from './section';
import { Icon } from '@blueprintjs/core';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import { transformMenu } from '../../helpers/menu';

type SidebarProps = {
    isCollapsed: boolean;
    toggleMenu: Function;
    expandedSection: string;
    handleSectionToggle: Function;
    menu: Object;
};

const Sidebar: Function = ({ isCollapsed, toggleMenu, expandedSection, handleSectionToggle, menu }: SidebarProps) => (
    <div
        className={classnames('sidebar', 'dark', {
            expanded: !isCollapsed,
        })}
    >
        <Scroll horizontal={false} className="sidebarScroll">
            {map(menu, (menuData: Array<Object>, menuKey: string) => (
                <SidebarSection
                    sectionData={menuData}
                    key={menuKey}
                    isCollapsed={isCollapsed}
                    expandedSection={expandedSection}
                    onSectionToggle={handleSectionToggle}
                />
            ))}
        </Scroll>
        <div className="sidebarSection" id="menuCollapse">
            <div className="sidebarItem" onClick={toggleMenu}>
                <Icon icon={isCollapsed ? 'double-chevron-right' : 'double-chevron-left'} />{' '}
                {!isCollapsed && 'Collapse'}
            </div>
        </div>
    </div>
);

export default compose(
    withState('isCollapsed', 'toggleCollapsed', false),
    withState('expandedSection', 'toggleSectionExpand', null),
    withHandlers({
        handleSectionToggle: ({ toggleSectionExpand }): Function => (sectionId: string): void => {
            toggleSectionExpand(currentSectionId => {
                if (currentSectionId === sectionId) {
                    return null;
                }

                return sectionId;
            });
        },
        toggleMenu: ({ toggleCollapsed }) => () => {
            toggleCollapsed(value => !value);
        },
    }),
    mapProps(({ menu, favoriteItems, plugins, ...rest }) => ({
        menu: transformMenu(menu),
        favoriteItems,
        plugins,
        ...rest,
    })),
    onlyUpdateForKeys(['menu', 'favoriteItems', 'plugins'])
)(Sidebar);
