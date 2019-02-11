import React from 'react';
import { Button, Spinner } from '@blueprintjs/core';


export const BackForwardButtons = (props) => (
    <>
        <div style={{display: 'flex', flexFlow: 'row nowrap',
                     justifyContent: 'space-between', marginBottom: 20}} >
            <Button icon='arrow-left'
                onClick={props.onBack}
                disabled={props.pending}
            >
                {props.t('Back')}
            </Button>
            {props.onForward &&
                <Button icon={props.pending ? <Spinner size={18} /> : 'arrow-right'}
                    onClick={props.onForward}
                    disabled={props.pending}
                >
                    {props.forward_text}
                </Button>
            }
            {props.onClose &&
                <Button icon='selection'
                    onClick={props.onClose}
                    disabled={props.pending}
                >
                    {props.t('Close')}
                </Button>
            }
        </div>
        <hr />
    </>
);
