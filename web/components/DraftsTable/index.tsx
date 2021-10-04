import { size } from 'lodash';
import React, { useContext, useState } from 'react';
import { useMount } from 'react-use';
import { Messages } from '../../constants/messages';
import { TextContext } from '../../context/text';
import { callBackendBasic } from '../../helpers/functions';

export const DraftsTable = ({ interfaceKind }: any) => {
    const t = useContext(TextContext);
    const [drafts, setDrafts] = useState<any[]>([]);

    useMount(() => {
        (async () => {
            const fetchedDrafts = await callBackendBasic(Messages.GET_DRAFTS, undefined, {
                iface_kind: interfaceKind === 'service-methods' ? 'service' : interfaceKind,
            });

            setDrafts(fetchedDrafts);
        })();
    });

    return (
        <div>
            <h3>{`${interfaceKind} ${t('Drafts')}`}</h3>
            {size(drafts) ? (
                <>
                    {drafts.map((draft) => (
                        <div>{}</div>
                    ))}
                </>
            ) : (
                <p> Loading ... </p>
            )}
        </div>
    );
};
