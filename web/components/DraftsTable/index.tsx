import { Button, Classes } from '@blueprintjs/core';
import { size, sortBy } from 'lodash';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { useMount } from 'react-use';
import { DATE_FORMATS } from '../../constants/dates';
import { Messages } from '../../constants/messages';
import { TextContext } from '../../context/text';
import { callBackendBasic } from '../../helpers/functions';
import { StyledDialogSelectItem } from '../Field/select';

export const DraftsTable = ({ interfaceKind, onClick }: any) => {
    const t = useContext(TextContext);
    const [drafts, setDrafts] = useState<any[]>([]);

    useMount(() => {
        (async () => {
            const fetchedDrafts = await callBackendBasic(Messages.GET_DRAFTS, undefined, {
                iface_kind: interfaceKind === 'service-methods' ? 'service' : interfaceKind,
            });

            if (fetchedDrafts.ok) {
                setDrafts(fetchedDrafts.data.drafts);
            }
        })();
    });

    const getNameFromData = (data) => {
        const nameField = data.find(
            (field) =>
                field.name === 'name' || field.name === 'Name' || field.name === 'class-class-name'
        );

        return nameField?.value || t('UnnamedInterface');
    };

    const onDeleteClick = async (interfaceId) => {
        await callBackendBasic(Messages.DELETE_DRAFT, undefined, {
            iface_kind: interfaceKind === 'service-methods' ? 'service' : interfaceKind,
            iface_id: interfaceId,
        });

        const fetchedDrafts = await callBackendBasic(Messages.GET_DRAFTS, undefined, {
            iface_kind: interfaceKind === 'service-methods' ? 'service' : interfaceKind,
        });

        if (fetchedDrafts.ok) {
            setDrafts(fetchedDrafts.data.drafts);
        }
    };

    const sortedDrafts = sortBy(drafts, (draft) => draft.date).reverse();

    return (
        <div>
            {size(sortedDrafts) ? (
                <>
                    {sortedDrafts.map(({ date, data, methods, interfaceId }) => (
                        <StyledDialogSelectItem onClick={() => onClick(interfaceId, data, methods)}>
                            <h5>
                                {getNameFromData(data)}{' '}
                                <Button
                                    style={{ float: 'right' }}
                                    intent="danger"
                                    icon="trash"
                                    small
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteClick(interfaceId);
                                    }}
                                />{' '}
                            </h5>
                            <p className={Classes.TEXT_MUTED}>
                                {moment(date).format(DATE_FORMATS.DISPLAY)}
                            </p>
                        </StyledDialogSelectItem>
                    ))}
                </>
            ) : (
                <p> No drafts found for this interface type </p>
            )}
        </div>
    );
};
