// @flow
import { useContext } from 'react';
import compose from 'recompose/compose';

import { ReqoreH3, ReqoreSidebar, ReqoreSpacer } from '@qoretechnologies/reqore';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import styled from 'styled-components';
import { buildMenu } from '../../constants/menu';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { transformMenu } from '../../helpers/menu';
import QorusLogo from '../../images/qorus_logo_256.png';

type SidebarProps = {
  isCollapsed: boolean;
  projectFolder?: string;
  qorusInstance?: any;
};

const StyledSidebarHeader = styled.div`
  padding: 20px 10px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
`;

const Sidebar: Function = ({ projectFolder, qorusInstance }: SidebarProps) => {
  const initialData = useContext(InitialContext);
  const t = useContext(TextContext);

  return (
    <ReqoreSidebar
      customItems={[
        {
          element: ({ isCollapsed }) => (
            <StyledSidebarHeader>
              <img style={{ maxWidth: isCollapsed ? 30 : 50, maxHeight: 50 }} src={QorusLogo} />
              {!isCollapsed && (
                <>
                  <ReqoreSpacer height={20} />
                  <ReqoreH3
                    effect={{
                      textAlign: 'center',
                      glow: {
                        color: '#7e2d90',
                        blur: 0.1,
                      },
                    }}
                  >
                    Qorus Developer Tools
                  </ReqoreH3>
                </>
              )}
            </StyledSidebarHeader>
          ),
        },
      ]}
      items={buildMenu(initialData)}
      path="/"
    />
  );
};

export default compose(
  withState('expandedSection', 'toggleSectionExpand', null),
  withHandlers({
    handleSectionToggle:
      ({ toggleSectionExpand }): Function =>
      (sectionId: string): void => {
        toggleSectionExpand((currentSectionId) => {
          if (currentSectionId === sectionId) {
            return null;
          }

          return sectionId;
        });
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
