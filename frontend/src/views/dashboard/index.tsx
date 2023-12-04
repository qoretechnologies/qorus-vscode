import {
  ReqoreColumns,
  ReqoreH1,
  ReqoreH3,
  ReqoreInput,
  ReqorePanel,
  ReqoreSpinner,
  ReqoreTextEffect,
  ReqoreTimeAgo,
} from '@qoretechnologies/reqore';
import { IReqoreCustomTheme } from '@qoretechnologies/reqore/dist/constants/theme';
import { capitalize, reduce } from 'lodash';
import { useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { callBackendBasic } from '../../helpers/functions';

export const Dashboard = () => {
  const { changeTab, changeDraft } = useContext(InitialContext);
  const draft = useAsyncRetry(async () => {
    const data = await callBackendBasic(Messages.GET_LATEST_DRAFT, undefined);

    return data?.data?.draft;
  }, []);

  const interfaces = useAsyncRetry(async () => {
    const data = await callBackendBasic(Messages.GET_ALL_INTERFACES, undefined);

    return data?.data;
  }, []);

  const theme: IReqoreCustomTheme = { main: '#000000' };

  if (draft.loading || interfaces.loading) {
    return <ReqoreSpinner centered>Loading dashboard...</ReqoreSpinner>;
  }

  return (
    <ReqorePanel flat>
      <ReqoreColumns minColumnWidth="100%" columnsGap="10px">
        <ReqoreColumns columnsGap="10px">
          <ReqorePanel
            onClick={() => changeTab('CreateInterface', 'fsm')}
            customTheme={{ main: '#000000' }}
            contentEffect={{
              gradient: {
                type: 'radial',
                shape: 'ellipse',
                //direction: 'to right bottom',
                colors: {
                  0: 'main',

                  150: '#023a27',
                },
                animate: 'hover',
                animationSpeed: 5,
              },
            }}
            contentStyle={{
              display: 'flex',
              flexFlow: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ReqoreH1 effect={{ textAlign: 'center' }}>
              Create New <br />
              <ReqoreTextEffect
                effect={{
                  gradient: {
                    colors: {
                      0: '#16805d',
                      50: '#66efc1',
                      100: '#06d590',
                    },
                    animationSpeed: 5,
                    animate: 'always',
                  },
                  textSize: '40px',
                }}
              >
                Automation
              </ReqoreTextEffect>
            </ReqoreH1>
          </ReqorePanel>
          <ReqoreColumns columnsGap="10px" minColumnWidth="100%">
            <ReqoreInput
              size="big"
              placeholder="Search away..."
              effect={{
                gradient: {
                  colors: {
                    0: '#443306',
                    100: '#000000',
                  },
                  borderColor: 'warning',
                },
                textSize: '20px',
              }}
            />
            <ReqoreColumns columnsGap="10px" minColumnWidth="150px">
              <ReqoreColumns
                columnsGap="10px"
                minColumnWidth="150px"
                style={{ gridAutoRows: 'auto' }}
              >
                <ReqorePanel customTheme={theme} fill>
                  Row 2 Column 3 Row 2
                </ReqorePanel>
                <ReqorePanel customTheme={theme} fill>
                  Row 2 Column 3 Row 3
                </ReqorePanel>
              </ReqoreColumns>
              <ReqorePanel
                customTheme={theme}
                contentStyle={{
                  display: 'flex',
                  flexFlow: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                contentEffect={{
                  gradient: {
                    type: 'radial',
                    shape: 'ellipse',
                    //direction: 'to right bottom',
                    colors: {
                      100: 'main',

                      0: '#43065b',
                    },
                    animate: 'hover',
                    animationSpeed: 5,
                  },
                }}
                onClick={() => changeTab('Interfaces')}
              >
                <ReqoreTextEffect
                  effect={{ textAlign: 'center', textSize: '20px', weight: 'bold' }}
                >
                  Browse All <br />{' '}
                  <ReqoreTextEffect
                    effect={{
                      gradient: {
                        colors: {
                          0: '#501680',
                          50: '#ef66e1',
                          100: '#2806d5',
                        },
                        animationSpeed: 5,
                        animate: 'always',
                      },
                      textSize: '20px',
                      weight: 'thick',
                    }}
                  >
                    {reduce(
                      interfaces.value,
                      (count, ifaceList) => count + ifaceList.length,
                      0
                    ).toString()}
                  </ReqoreTextEffect>{' '}
                  Objects
                </ReqoreTextEffect>
              </ReqorePanel>
            </ReqoreColumns>
          </ReqoreColumns>
        </ReqoreColumns>
        <ReqoreColumns columnsGap="10px">
          {draft.value && (
            <ReqorePanel
              customTheme={theme}
              minimal
              icon="Edit2Line"
              contentEffect={{
                gradient: {
                  direction: 'to right bottom',
                  colors: {
                    100: 'main',

                    0: '#3e2d04',
                  },
                  animate: 'hover',
                  animationSpeed: 5,
                },
              }}
              label="Open latest draft"
              onClick={() => {
                changeDraft({
                  interfaceKind: draft.value.interfaceKind,
                  interfaceId: draft.value.interfaceId,
                });
              }}
            >
              {capitalize(draft.value.interfaceKind)} "{draft.value.name}" created{' '}
              <ReqoreTimeAgo time={draft.value.date} />
            </ReqorePanel>
          )}
          <ReqorePanel
            customTheme={theme}
            contentEffect={{
              gradient: {
                direction: 'to left',
                colors: {
                  100: 'main',

                  0: '#042d3e',
                },
                animate: 'hover',
                animationSpeed: 5,
              },
            }}
            onClick={() => changeTab('ReleasePackage')}
          >
            <ReqoreH3>Create A Release</ReqoreH3>
          </ReqorePanel>
        </ReqoreColumns>
      </ReqoreColumns>
    </ReqorePanel>
  );
};
