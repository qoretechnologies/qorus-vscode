import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreModal,
  ReqoreSpacer,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { find, isEqual, map, size } from 'lodash';
import { useState } from 'react';
import Connectors, { IConnectorFieldProps, IProviderType } from '.';
import Field from '..';
import { submitControl } from '../../../containers/InterfaceCreator/controls';
import { validateField } from '../../../helpers/validations';
import {
  IDataProviderFavorite,
  TDataProviderFavorites,
  useGetDataProviderFavorites,
} from '../../../hooks/useGetDataProviderFavorites';
import { FieldWrapper } from '../../FieldWrapper';
import {
  NegativeColorEffect,
  PositiveColorEffect,
  SaveColorEffect,
  SelectorColorEffect,
} from '../multiPair';

export interface IDaraProviderFavoritesProps extends Partial<IConnectorFieldProps> {
  currentProvider?: IProviderType;
  onFavoriteApply?: (provider: IProviderType) => void;
  defaultFavorites?: TDataProviderFavorites;
  localOnly?: boolean;
}

export interface IDataProviderFavoritesDetailsProps {
  onClose: () => void;
  onSubmit: (name?: string, desc?: string) => void;
}

export const DataProviderFavoritesAddModal = ({
  onClose,
  onSubmit,
}: IDataProviderFavoritesDetailsProps) => {
  const [name, setName] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  return (
    <ReqoreModal
      label="Add new favorite"
      isOpen
      onClose={onClose}
      bottomActions={[
        submitControl(() => onSubmit(name, desc), {
          position: 'right',
          className: 'data-provider-favorite-submit-details',
        }),
      ]}
    >
      <FieldWrapper
        label="Name"
        collapsible={false}
        type="optional"
        isValid={!name || validateField('string', name)}
      >
        <Field
          type="string"
          name="name"
          value={name}
          onChange={(_n, value) => setName(value)}
          placeholder="Give your data provider a unique name"
        />
      </FieldWrapper>
      <ReqoreVerticalSpacer height={10} />
      <FieldWrapper
        label="Description"
        collapsible={false}
        type="optional"
        isValid={!desc || validateField('string', desc)}
      >
        <Field
          type="long-string"
          name="desc"
          value={desc}
          onChange={(_n, value) => setDesc(value)}
          placeholder="Describe your data provider for easier identification"
        />
      </FieldWrapper>
    </ReqoreModal>
  );
};

export const DataProviderFavorites = ({
  currentProvider,
  onFavoriteApply,
  defaultFavorites,
  localOnly,
  ...rest
}: IDaraProviderFavoritesProps) => {
  const confirmAction = useReqoreProperty('confirmAction');
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { addNewFavorite, count, deleteAllFavorites, deleteFavorite, favorites, loading } =
    useGetDataProviderFavorites(defaultFavorites, localOnly);

  const existsInFavorites = find(favorites, (favorite) => isEqual(favorite.value, currentProvider));
  const isBuiltInFavorite = existsInFavorites?.builtIn;

  const handleAddNewFavorite = () => {
    setIsAdding(true);
  };

  const handleRemoveFavorite = () => {
    if (existsInFavorites && !existsInFavorites.builtIn) {
      deleteFavorite(existsInFavorites.id);
    }
  };

  return (
    <>
      {isAdding && (
        <DataProviderFavoritesAddModal
          onClose={() => setIsAdding(false)}
          onSubmit={(name, desc) => {
            addNewFavorite({
              name,
              desc,
              value: currentProvider,
            });
            setIsAdding(false);
          }}
        />
      )}
      {showFavorites && (
        <ReqoreModal label="Data provider favorites" isOpen onClose={() => setShowFavorites(false)}>
          <ReqoreCollection
            filterable
            sortable
            paging="buttons"
            items={map(
              favorites,
              (favoriteData: IDataProviderFavorite, id): IReqoreCollectionItemProps => ({
                id,
                label: favoriteData.name || id,
                flat: false,
                className: 'data-provider-favorite',
                content: (
                  <>
                    {favoriteData.desc && (
                      <>
                        <ReqoreMessage intent="info">{favoriteData.desc}</ReqoreMessage>
                        <ReqoreSpacer height={10} />
                      </>
                    )}
                    <Connectors
                      value={favoriteData.value}
                      readOnly
                      {...rest}
                      disableMessageOptions
                      disableSearchOptions
                      disableTransactionOptions
                    />
                  </>
                ),
                actions: [
                  {
                    icon: 'CheckLine',
                    label: 'Apply',
                    onClick: () => {
                      onFavoriteApply?.(favoriteData.value);
                      setShowFavorites(false);
                    },
                    className: 'data-provider-favorite-apply',
                    effect: SaveColorEffect,
                  },
                  {
                    icon: 'DeleteBinLine',
                    className: 'data-provider-favorite-delete',
                    onClick: () => {
                      confirmAction({
                        title: 'Delete favorite',
                        onConfirm: () => deleteFavorite(id),
                      });
                    },
                    show: !favoriteData.builtIn,
                    effect: NegativeColorEffect,
                  },
                ],
              })
            )}
          />
        </ReqoreModal>
      )}
      <ReqoreControlGroup>
        {size(favorites) ? (
          <ReqoreButton
            badge={count}
            disabled={count === 0}
            onClick={() => setShowFavorites(true)}
            className="data-provider-show-favorites"
          >
            Select from favorites
          </ReqoreButton>
        ) : null}
        {currentProvider && (
          <ReqoreButton
            icon={
              isBuiltInFavorite ? 'StarHalfFill' : existsInFavorites ? 'DeleteBinLine' : 'StarFill'
            }
            effect={
              isBuiltInFavorite
                ? PositiveColorEffect
                : existsInFavorites
                ? NegativeColorEffect
                : SelectorColorEffect
            }
            onClick={
              isBuiltInFavorite
                ? undefined
                : existsInFavorites
                ? handleRemoveFavorite
                : handleAddNewFavorite
            }
            className="data-provider-add-favorite"
            disabled={isBuiltInFavorite}
          >
            {existsInFavorites
              ? isBuiltInFavorite
                ? 'Built in template'
                : 'Remove from favorites'
              : 'Add to favorites'}
          </ReqoreButton>
        )}
      </ReqoreControlGroup>
      {size(favorites) || currentProvider ? <ReqoreSpacer height={18} lineSize="tiny" /> : null}
    </>
  );
};
