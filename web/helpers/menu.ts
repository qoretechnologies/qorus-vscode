import size from 'lodash/size';
import reduce from 'lodash/reduce';
import upperFirst from 'lodash/upperFirst';

export const isActive = (to, tab) => tab.startsWith(to);
export const isActiveMulti: Function = (item, tab: string, subtab: string) => {
    let matches = false;
    // Check if the tab matches
    if (item.tab === tab) {
        // Check if this item has subtab
        if (item.subtab) {
            // Check if the subtab matches
            matches = item.subtab === subtab;
        } else {
            matches = true;
        }
    } else {
        matches = false;
    }

    return matches;
};

export const transformMenu: Function = (menu: Object, favoriteItems: Array<Object>, plugins: Array<string>): Object => {
    let newMenu: Object = { ...menu };

    if (size(plugins)) {
        newMenu = {
            ...newMenu,
            Plugins: [
                {
                    name: 'Plugins',
                    icon: 'helper-management',
                    activePaths: ['/plugins'],
                    submenu: createPluginsMenu(plugins),
                },
            ],
        };
    }

    if (size(favoriteItems)) {
        newMenu = reduce(
            newMenu,
            (cur, menuSection: Array<Object>, name: string) => {
                let newSection = [...menuSection];

                newSection = newSection
                    .map((newSectionItem: Object) => {
                        const copySectionItem: Object = { ...newSectionItem };

                        if (copySectionItem.submenu) {
                            copySectionItem.submenu = copySectionItem.submenu.filter(
                                (submenuItem: Object) =>
                                    !favoriteItems.find(
                                        (favoriteItem: Object) => favoriteItem.name === submenuItem.name
                                    )
                            );

                            if (size(copySectionItem.submenu)) {
                                return copySectionItem;
                            }
                        } else {
                            if (
                                !favoriteItems.find(
                                    (favoriteItem: Object) => favoriteItem.name === copySectionItem.name
                                )
                            ) {
                                return copySectionItem;
                            }
                        }
                    })
                    .filter((newSectionItem: Object) => newSectionItem);

                return { ...cur, [name]: newSection };
            },
            {}
        );

        newMenu = { Favorites: favoriteItems, ...newMenu };
    }

    return newMenu;
};

export const createPluginsMenu: Function = (plugins: Array<string>): Array<Object> =>
    plugins.map((plugin: string) => ({
        name: upperFirst(plugin),
        link: `/plugins/${plugin}`,
        icon: getPluginIcon(plugin),
    }));

export const getPluginIcon: Function = (plugin: string): string => {
    switch (plugin) {
        case 'oauth2':
            return 'id-number';
        default:
            return 'help';
    }
};
