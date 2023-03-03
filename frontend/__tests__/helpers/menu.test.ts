import {
  createPluginsMenu,
  getPluginIcon,
  isActive,
  isActiveMulti,
  transformMenu,
} from '../../src/helpers/menu';

test('getPluginIcon should return the appropiate icon name', () => {
  const iconName = getPluginIcon('oauth2');
  expect(iconName).toEqual('id-number');
  const iconNameDefault = getPluginIcon('help');
  expect(iconNameDefault).toEqual('help');
});

test('createPluginsMenu should create a menu object for the provided plugins array', () => {
  const pluginObj = createPluginsMenu(['oauth2', 'help']);
  const result = [
    { name: 'Oauth2', link: '/plugins/oauth2', icon: 'id-number' },
    { name: 'Help', link: '/plugins/help', icon: 'help' },
  ];
  expect(pluginObj).toEqual(result);
});

test('isActive should check if the tab is active', () => {
  const active = isActive('active', 'activeTab');
  expect(active).toEqual(true);

  const notActive = isActive('active', 'tab');
  expect(notActive).toEqual(false);
});

test('isActiveMulti should check if all the provided tabs are active', () => {
  const active = isActiveMulti({ tab: 'tab', subtab: 'subtab' }, 'tab', 'subtab');
  expect(active).toEqual(true);

  const notActive = isActiveMulti({ tab: 'tab', subtab: 'subtab' }, 'tab', 'sub');
  expect(notActive).toEqual(false);
});

test('transformMenu should transform the menu object with included plugins and favorite items', () => {
  const tranformed = transformMenu([1, 2, 3], [], ['oauth2', 'help']);
  const result = {
    '0': 1,
    '1': 2,
    '2': 3,
    Plugins: [
      {
        name: 'Plugins',
        icon: 'helper-management',
        activePaths: ['/plugins'],
        submenu: [
          { name: 'Oauth2', link: '/plugins/oauth2', icon: 'id-number' },
          { name: 'Help', link: '/plugins/help', icon: 'help' },
        ],
      },
    ],
  };
  expect(tranformed).toEqual(result);
});
