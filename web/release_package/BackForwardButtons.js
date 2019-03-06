import React from 'react';
import { Button, Spinner } from '@blueprintjs/core';
import { T } from '../common/Translate';


export const BackForwardButtons = props => (
    <>
        <div className={props.onBack ? 'flex-space-between' : 'flex-end'}>
            {props.onBack &&
                <Button icon='arrow-left'
                    onClick={props.onBack}
                    disabled={props.pending}
                >
                    <T t={props.backward_text_id || 'Back'} />
                </Button>
            }
            {props.onForward &&
                <Button icon={props.pending ? <Spinner size={18} /> : 'arrow-right'}
                    onClick={props.onForward}
                    disabled={props.pending}
                >
                    <T t={props.forward_text_id} />
                </Button>
            }
            {props.onClose &&
                <Button icon='selection'
                    onClick={props.onClose}
                    disabled={props.pending}
                >
                    <T t='Close' />
                </Button>
            }
        </div>
        <hr style={{marginTop: 20, marginBottom: 20}} />
    </>
);
