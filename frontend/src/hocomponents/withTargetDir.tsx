import { FunctionComponent, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import compose from 'recompose/compose';
import { Messages } from '../constants/messages';
import withMessageHandler, { TMessageListener, TPostMessage } from './withMessageHandler';

export interface IEnhancedComponent {
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  setTargetDir: (dir: string) => void;
}

// define the props that will be injected by redux
const mapStateToProps = (state: any) => ({
  targetDir: state.create_iface_target_dir,
});

const mapDispatchToProps = (dispatch: any) => ({
  setTargetDir: (targetDir: string) =>
    dispatch({
      type: 'create_iface_target_dir',
      payload: targetDir,
    }),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

function withTargetDir(
  Component: FunctionComponent<IEnhancedComponent & PropsFromRedux>
): FunctionComponent {
  const EnhancedComponent: FunctionComponent<IEnhancedComponent & PropsFromRedux> = ({
    addMessageListener,
    postMessage,
    setTargetDir,
    ...rest
  }) => {
    useEffect(() => {
      // Request the target dir
      postMessage(Messages.GET_OPENING_PATH);
      // Register the listener for the target dir
      addMessageListener(Messages.RETURN_OPENING_PATH, (data: any) => {
        setTargetDir(data.path);
      });
    }, [addMessageListener, postMessage, setTargetDir]);

    // Return the enhanced component
    return (
      <Component
        {...rest}
        addMessageListener={addMessageListener}
        postMessage={postMessage}
        setTargetDir={setTargetDir}
      />
    );
  };

  return compose(connector, withMessageHandler())(EnhancedComponent);
}

export default withTargetDir;
