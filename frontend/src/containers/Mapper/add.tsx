import { ReqoreButton, ReqoreControlGroup } from '@qoretechnologies/reqore';
import { FC, useCallback, useContext } from 'react';
import { TTranslator } from '../../App';
import { InitialContext } from '../../context/init';
import withTextContext from '../../hocomponents/withTextContext';

export interface IAddFieldProps {
  onClick: any;
  isCustom: boolean;
  canManageFields: boolean;
  field: any;
  t: TTranslator;
}

const AddFieldButton: FC<IAddFieldProps> = ({
  onClick,
  isCustom,
  canManageFields,
  field,
  t,
  ...rest
}) => {
  const initContext = useContext(InitialContext);

  const onAddClick = useCallback(() => {
    onClick(field);
  }, [field]);

  const onEditClick = useCallback(() => {
    onClick(field, true);
  }, [field]);

  const onDeleteClick = useCallback(() => {
    onClick(field, false, true);
  }, [field]);

  if (!canManageFields && !isCustom) return null;

  return (
    <ReqoreControlGroup {...rest} stack fixed>
      {isCustom ? (
        <ReqoreButton onClick={onEditClick} icon="EditLine" tooltip={t('EditMapperField')} fixed />
      ) : null}
      {isCustom && (
        <ReqoreButton
          onClick={() => initContext.confirmAction('ConfirmRemoveField', onDeleteClick)}
          icon="DeleteBinLine"
          intent="danger"
          tooltip={t('RemoveMapperField')}
          fixed
        />
      )}
      {canManageFields && (
        <ReqoreButton onClick={onAddClick} icon="AddLine" tooltip={t('AddNewMapperField')} fixed />
      )}
    </ReqoreControlGroup>
  );
};

export default withTextContext()(AddFieldButton);
