import React from 'react';
import { Button, Spinner } from '@blueprintjs/core';


export const BackForwardButtons = (props) => (
    <>
        <div style={{display: 'flex', flexFlow: 'row nowrap',
                     justifyContent: 'space-between', marginBottom: 20}} >
            <Button icon='arrow-left' onClick={props.onBack}>
                {props.t('Back')}
            </Button>
            {props.onForward &&
                <Button icon={props.pending ? <Spinner size={18} /> : 'arrow-right'} onClick={props.onForward}>
                    {props.forward_text}
                </Button>
            }
            {props.onClose &&
                <Button icon='selection' onClick={props.onClose}>
                    {props.t('Close')}
                </Button>
            }
        </div>
        <hr />
    </>
);
