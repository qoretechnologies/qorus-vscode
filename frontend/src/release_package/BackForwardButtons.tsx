import { ReqoreButton, ReqoreSpacer } from '@qoretechnologies/reqore';
import withTextContext from '../hocomponents/withTextContext';

export const BackForwardButtons = withTextContext()((props) => (
  <>
    <div className={props.onBack ? 'flex-space-between' : 'flex-end'}>
      {props.onBack && (
        <ReqoreButton
          icon="ArrowLeftLine"
          onClick={props.onBack}
          disabled={props.pending}
          flat={false}
        >
          {props.t(props.backward_text_id || 'Back')}
        </ReqoreButton>
      )}
      {props.onForward && (
        <ReqoreButton
          rightIcon="ArrowRightLine"
          intent="info"
          onClick={props.onForward}
          disabled={props.pending || props.disabled}
        >
          {props.t(props.forward_text_id)}
        </ReqoreButton>
      )}
      {props.onClose && (
        <ReqoreButton icon="CloseLine" onClick={props.onClose} disabled={props.pending}>
          {props.t('Close')}
        </ReqoreButton>
      )}
    </div>
    <ReqoreSpacer height={20} />
  </>
));
