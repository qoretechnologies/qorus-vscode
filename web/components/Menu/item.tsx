// @flow
import React from 'react';
import compose from 'recompose/compose';
import lifecycle from 'recompose/lifecycle';
import { Icon, Tooltip, Position, Button, ButtonGroup } from '@blueprintjs/core';
import map from 'lodash/map';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import mapProps from 'recompose/mapProps';
import { isActiveMulti } from '../../helpers/menu';
import classnames from 'classnames';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';

type SidebarItemProps = {
    itemData: Object;
    isCollapsed: boolean;
    isExpanded: boolean;
    subItem: boolean;
    onExpandClick: Function;
    handleExpandClick: Function;
    isActive: boolean;
    tooltip: string;
    children: any;
    expandedSection: string;
    isHovered: boolean;
    handleMouseEnter: Function;
    handleMouseLeave: Function;
    handleFavoriteClick: Function;
    handleUnfavoriteClick: Function;
    favoriteItems: Array<Object>;
};

const SidebarItemTooltip: Function = ({ isCollapsed, tooltip, children }: SidebarItemProps) =>
    isCollapsed ? (
        <Tooltip content={tooltip} position={Position.RIGHT}>
            {children}
        </Tooltip>
    ) : (
        <React.Fragment>{children}</React.Fragment>
    );

let SidebarItem: Function = ({
    itemData,
    isCollapsed,
    subItem,
    onExpandClick,
    isExpanded,
    isActive,
    handleMouseEnter,
    handleMouseLeave,
    initialData,
    t,
}: SidebarItemProps) =>
    !itemData.submenu ? (
        <SidebarItemTooltip isCollapsed={isCollapsed} tooltip={t(itemData.name)}>
            <div
                className={classnames('sidebarItem', {
                    sidebarSubItem: subItem,
                    active: isActive,
                })}
                onClick={() => {
                    initialData.changeTab(itemData.tab, itemData.subtab);
                }}
                name={itemData.name}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Icon icon={itemData.icon} /> {!isCollapsed && t(itemData.name)}
            </div>
        </SidebarItemTooltip>
    ) : (
        <SidebarItemTooltip isCollapsed={isCollapsed} tooltip={t(itemData.name)}>
            <div
                className={classnames('sidebarItem', {
                    sidebarSubItem: subItem,
                    active: isActive,
                    submenuCategory: onExpandClick,
                })}
                name={itemData.name}
                onClick={onExpandClick}
            >
                <Icon icon={itemData.icon} /> {!isCollapsed && t(itemData.name)}
                {onExpandClick && <Icon icon={isExpanded ? 'caret-up' : 'caret-down'} className="submenuExpand" />}
            </div>
        </SidebarItemTooltip>
    );

SidebarItem = compose(
    withInitialDataConsumer(),
    withTextContext(),
    withState('isHovered', 'changeHovered', false),
    mapProps(
        ({ itemData, initialData, ...rest }: SidebarItemProps): SidebarItemProps => ({
            isActive: isActiveMulti(itemData, initialData.tab, initialData.subtab),
            itemData,
            initialData,
            ...rest,
        })
    )
)(SidebarItem);

const SidebarItemWrapper: Function = ({ itemData, isCollapsed, isExpanded, handleExpandClick }: SidebarItemProps) => (
    <React.Fragment>
        <SidebarItem
            itemData={itemData}
            isCollapsed={isCollapsed}
            onExpandClick={itemData.submenu && handleExpandClick}
            isExpanded={isExpanded}
        />
        {isExpanded &&
            map(itemData.submenu, (subItemData: Object, key: number) => (
                <SidebarItem itemData={subItemData} key={key} isCollapsed={isCollapsed} subItem />
            ))}
    </React.Fragment>
);

export default compose(
    withInitialDataConsumer(),
    lifecycle({
        componentDidMount() {
            const { itemData, onSectionToggle, initialData } = this.props;

            if (isActiveMulti(itemData, initialData.tab, initialData.subtab)) {
                onSectionToggle(itemData.name);
            }
        },
    }),
    withHandlers({
        handleExpandClick: ({ onSectionToggle, itemData }): Function => (): void => {
            onSectionToggle(itemData.name);
        },
    }),
    mapProps(
        ({ expandedSection, itemData, ...rest }: SidebarItemProps): SidebarItemProps => ({
            isExpanded: expandedSection === itemData.name,
            expandedSection,
            itemData,
            ...rest,
        })
    )
)(SidebarItemWrapper);
