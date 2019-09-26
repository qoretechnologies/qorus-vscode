// @flow
import React from 'react';
import map from 'lodash/map';

import SidebarItem from './item';
import size from 'lodash/size';

type SidebarSectionProps = {
    favoriteItems: Array<Object>;
    sectionData: Array<Object>;
    isCollapsed: boolean;
    expandedSection: string;
    onSectionToggle: Function;
};

const SidebarSection: Function = ({
    sectionData,
    isCollapsed,
    expandedSection,
    onSectionToggle,
    favoriteItems,
}: SidebarSectionProps) =>
    size(sectionData) ? (
        <div className="sidebarSection">
            {map(sectionData, (itemData: Object, key: number) => (
                <SidebarItem
                    itemData={itemData}
                    key={key}
                    isCollapsed={isCollapsed}
                    expandedSection={expandedSection}
                    onSectionToggle={onSectionToggle}
                    favoriteItems={favoriteItems}
                />
            ))}
        </div>
    ) : null;

export default SidebarSection;
