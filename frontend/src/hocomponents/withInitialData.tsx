import { useReqore, useReqoreProperty } from '@qoretechnologies/reqore';
import { TReqoreIntent } from '@qoretechnologies/reqore/dist/constants/theme';
import set from 'lodash/set';
import { FunctionComponent, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import shortid from 'shortid';
import Loader from '../components/Loader';
import { interfaceKindTransform } from '../constants/interfaces';
import { Messages } from '../constants/messages';
import { InitialContext } from '../context/init';
import { callBackendBasic } from '../helpers/functions';
import withFieldsConsumer from './withFieldsConsumer';
import { addMessageListener, postMessage } from './withMessageHandler';

const pastTexts: { [id: string]: { isTranslated: boolean; text: string } } = {};

// A HoC helper that holds all the initial data
export default () =>
  (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
      const [isReady, setIsReady] = useState(false);
      const [initialData, setInitialData] = useState<any>({
        tab: 'ProjectConfig',
        sidebarOpen: false,
      });
      const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        onSubmit: () => any;
        onCancel?: () => any;
        text: string;
        btnText?: string;
        btnStyle?: string;
      }>({});
      const [draftData, setDraftData] = useState(null);
      const [isSavingDraft, setIsSavingDraft] = useState(false);
      const [lastDraft, setLastDraft] = useState(null);
      const confirmActionReqore = useReqoreProperty('confirmAction');
      const [texts, setTexts] = useState<{ [key: string]: string }[]>(null);
      const [t, setT] = useState<(text_id) => string>(undefined);
      const [tabHistory, setTabHistory] = useState<
        { tab: string; subtab?: string; iface_id?: string; name?: string; draftId?: string }[]
      >([]);
      const { addNotification } = useReqore();

      const changeTab: (tab: string, subtab?: string, force?: boolean) => void = (
        tab,
        subtab,
        force
      ) => {
        const setTabs = () => {
          setInitialData((current) => ({
            ...current,
            tab,
            subtab: subtab || null,
          }));
          setTabHistory((current) => {
            const newHistory = [...current];
            newHistory.push({ tab, subtab });
            return newHistory;
          });
        };

        setTabs();
      };

      useMount(() => {
        postMessage(Messages.GET_INITIAL_DATA);
      });

      useUpdateEffect(() => {
        if (!initialData.qorus_instance?.url) {
          setInitialData({
            image_path: initialData.image_path,
            tab: 'ProjectConfig',
          });
        } else {
          addNotification({
            content: 'Successfully logged in!',
            intent: 'success',
            duration: 3000,
            minimal: false,
            id: 'logged-in',
          });
        }
      }, [initialData?.qorus_instance?.url]);

      useEffect(() => {
        if (texts) {
          setT(() => {
            return (text_id) => {
              return texts.find((textItem) => textItem.id === text_id)?.text || text_id;
            };
          });
        }
      }, [texts]);

      useEffectOnce(() => {
        const listeners: any = [];
        // New text was received
        listeners.push(
          addMessageListener(Messages.TEXT_RECEIVED, (data: any): void => {
            setTexts((currentTexts) => {
              // Do not modify state if the text already
              // exists
              if (!currentTexts[data.text_id]) {
                pastTexts[data.text_id] = { isTranslated: true, text: data.text };
                return {
                  ...currentTexts,
                  [data.text_id]: data.text,
                };
              }
              // Return current state
              return currentTexts;
            });
          })
        );
        listeners.push(
          addMessageListener('return-all-text', ({ data }): void => {
            setTexts(data);
          })
        );
        postMessage('get-all-text');

        return () => {
          // remove all listeners
          listeners.forEach((l) => l());
        };
      });

      useEffect(() => {
        const initialDataListener = addMessageListener(Messages.RETURN_INITIAL_DATA, ({ data }) => {
          console.log(data);
          props.setTheme(data.theme);

          flushSync(() => setInitialData({}));

          let currentInitialData;

          flushSync(() =>
            setInitialData((current) => {
              currentInitialData = { ...current };
              return null;
            })
          );

          if (!data?.tab) {
            data.tab = data.is_hosted_instance ? 'Dashboard' : 'ProjectConfig';
          }

          if (data?.draftData) {
            setDraftData(data.draftData);
          }

          flushSync(() => {
            setInitialData({
              ...currentInitialData,
              ...data,
            });

            if (data?.tab) {
              changeTab(data.tab, data.subtab);
            }
          });

          setIsReady(true);
        });

        const interfaceDataListener = addMessageListener(
          Messages.RETURN_INTERFACE_DATA,
          ({ data }) => {
            // only set initial data if we are switching tabs
            if (data?.tab) {
              setInitialData((current) => ({
                ...current,
                ...data,
              }));
              changeTab(data.tab, data.subtab);
            }
          }
        );

        return () => {
          // removes the listeners
          initialDataListener();
          interfaceDataListener();
        };
      });

      if (!texts || !t || !isReady) {
        return <Loader text="Loading translations..." />;
      }

      // this action is called when the user clicks the confirm button
      /*
      This is a function that takes a string, a function, and two optional parameters and returns a function.
      */
      const confirmAction: (
        text: string,
        action: () => any,
        btnText?: string,
        btnIntent?: string,
        onCancel?: () => any,
        intent?: TReqoreIntent
      ) => void = (text, action, btnText, btnIntent, onCancel, intent) => {
        const blueprintIntentToReqoreMapper = {
          primary: 'info',
          danger: 'danger',
          success: 'success',
          warning: 'warning',
          default: undefined,
          muted: 'muted',
        };

        confirmActionReqore({
          onConfirm: action,
          onCancel,
          confirmLabel: btnText,
          description: t(text),
          intent,
          confirmButtonIntent: btnIntent ? blueprintIntentToReqoreMapper[btnIntent] : 'success',
        });
      };

      const setStepSubmitCallback: (callback: () => any) => void = (callback): void => {
        setInitialData((current) => ({
          ...current,
          stepCallback: callback,
        }));
      };

      const updateCurrentHistoryTab = (data: any) => {
        setTabHistory((current) => {
          const newHistory = [...current];
          const currentTab = newHistory.pop();

          newHistory.push({ ...currentTab, ...data });

          return newHistory;
        });
      };

      const onHistoryBackClick = async (index?: number) => {
        const newHistory = [...tabHistory];

        if (index) {
          newHistory.splice(index + 1);
        } else {
          newHistory.pop();
        }

        setTabHistory(newHistory);

        let newTab = newHistory[newHistory.length - 1];

        if (!newTab) {
          newTab = { tab: 'ProjectConfig' };
        }

        let data = {};

        if (newTab.draftId) {
          changeDraft({
            interfaceKind: newTab.subtab,
            interfaceId: newTab.draftId,
          });

          return;
        }

        if (newTab.iface_id) {
          ({ data } = await callBackendBasic(
            Messages.GET_INTERFACE_DATA,
            'return-interface-data-complete',
            {
              iface_kind: newTab.subtab,
              name: newTab.name,
            }
          ));
        }
        setInitialData((current) => ({
          ...current,
          ...data,
          tab: newTab.tab,
          subtab: newTab.subtab,
        }));
      };

      const resetInterfaceData: (iface: string) => void = (iface) => {
        setInitialData((current) => ({
          ...current,
          [iface]: null,
        }));
      };

      const setActiveInstance: (inst: any) => void = (inst) => {
        setInitialData((current) => ({
          ...current,
          qorus_instance: inst,
        }));
      };

      const changeInitialData: (path: string, value: any) => any = (path, value) => {
        setInitialData((current) => {
          const result = { ...current };
          set(result, path, value);
          return result;
        });
      };

      const toggleSidebar: (isCollapsed: boolean) => void = (isCollapsed) => {
        setInitialData((current) => {
          const result = { ...current };
          result.sidebarOpen = !isCollapsed;
          return result;
        });
      };

      /*
      We create a unique ID for each request, and then we listen for a message with the same ID. When we receive the message, we resolve the promise.
      */
      /*
      fetch data from the given url
      Args:
       - data

      */
      const fetchData: (url: string, method: string) => Promise<any> = async (
        url,
        method = 'GET'
      ) => {
        // Create the unique ID for this request
        const uniqueId: string = shortid.generate();

        return new Promise((resolve, reject) => {
          // Create a timeout that will reject the request
          // after 2 minutes
          let timeout: NodeJS.Timer | null = setTimeout(() => {
            reject({
              error: true,
              msg: 'Request timed out',
            });
          }, 120000);
          // Watch for the request to complete
          // if the ID matches then resolve
          const listener = addMessageListener('fetch-data-complete', (data) => {
            if (data.id === uniqueId) {
              clearTimeout(timeout);
              timeout = null;
              resolve(data);
              //* Remove the listener after the call is done
              listener();
            }
          });
          // Fetch the data
          postMessage('fetch-data', {
            id: uniqueId,
            url,
            method,
          });
        });
      };

      const callBackend: (
        getMessage: string,
        returnMessage: string,
        data: any,
        toastMessage?: string
      ) => Promise<any> = async (getMessage, returnMessage, data, toastMessage) => {
        // Create the unique ID for this request
        const uniqueId: string = shortid.generate();
        // Create new toast
        addNotification({
          content: toastMessage || 'Request in progress',
          intent: 'warning',
          duration: 30000,
          id: uniqueId,
        });

        return new Promise((resolve, reject) => {
          // Create a timeout that will reject the request
          // after 2 minutes
          let timeout: NodeJS.Timer | null = setTimeout(() => {
            addNotification({
              content: 'Request timed out',
              intent: 'danger',
              duration: 3000,
              id: uniqueId,
            });
            resolve({
              ok: false,
              message: 'Request timed out',
            });
          }, 30000);
          // Watch for the request to complete
          // if the ID matches then resolve
          addMessageListener(returnMessage || `${getMessage}-complete`, (data) => {
            if (data.request_id === uniqueId) {
              addNotification({
                content: data.message,
                intent: data.ok ? 'success' : 'danger',
                duration: 3000,
                id: uniqueId,
              });

              clearTimeout(timeout);
              timeout = null;
              resolve(data);
            }
          });

          // Fetch the data
          postMessage(getMessage, {
            request_id: uniqueId,
            ...data,
            recreate: initialData.isRecreate,
          });
        });
      };

      const saveDraft = async (interfaceKind, interfaceId, fileData, name?: string) => {
        setIsSavingDraft(true);

        await callBackendBasic(Messages.SAVE_DRAFT, undefined, {
          iface_id: interfaceId,
          iface_kind: interfaceKindTransform[interfaceKind],
          fileData: {
            name,
            ...fileData,
          },
        });

        updateCurrentHistoryTab({ draftId: interfaceId });

        setIsSavingDraft(false);
      };

      const changeDraft = (draftData) => {
        setInitialData({
          is_hosted_instance: initialData.is_hosted_instance,
          qorus_instance: initialData.qorus_instance,
        });
        setDraftData(draftData);
      };

      if (!initialData) {
        return null;
      }

      return (
        <InitialContext.Provider
          value={{
            ...initialData,
            changeTab,
            setStepSubmitCallback,
            resetInterfaceData,
            setActiveInstance,
            fetchData,
            changeInitialData,
            confirmDialog,
            setConfirmDialog,
            confirmAction,
            callBackend,
            toggleSidebar,
            draftData,
            setDraftData,
            saveDraft,
            isSavingDraft,
            lastDraft,
            setLastDraft,
            changeDraft,
            tabHistory,
            onHistoryBackClick,
            updateCurrentHistoryTab,
            t,
            texts,
            setTexts,
          }}
        >
          <InitialContext.Consumer>
            {(initialProps) => <Component {...initialProps} {...props} />}
          </InitialContext.Consumer>
        </InitialContext.Provider>
      );
    };

    return withFieldsConsumer()(EnhancedComponent);
  };
