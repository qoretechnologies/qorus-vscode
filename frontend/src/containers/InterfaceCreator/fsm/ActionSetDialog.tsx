import { ReqoreModal } from '@qoretechnologies/reqore';
import { IReqoreModalProps } from '@qoretechnologies/reqore/dist/components/Modal';
import { useContext, useState } from 'react';
import shortid from 'shortid';
import { IFSMStates } from '.';
import Options, { IOptions, IOptionsSchema } from '../../../components/Field/systemOptions';
import { AppsContext } from '../../../context/apps';
import { changeStateIdsToGenerated, removeTransitionsFromStateGroup } from '../../../helpers/fsm';
import { validateField } from '../../../helpers/validations';
import { submitControl } from '../controls';

export interface IActionSetDialogProps extends IReqoreModalProps {
  states: IFSMStates;
  withOptions?: boolean;
  name?: string;
  shortDescription?: string;
}

export interface IActionSet {
  id: string;
  options: IOptions;
  states: IFSMStates;
}

const schema: IOptionsSchema = {
  name: {
    type: 'string',
    required: true,
    display_name: 'Name',
    sort: 1,
    short_desc: 'Name of your action set',
    focusRules: {
      type: 'auto',
    },
  },
  shortDescription: {
    type: 'string',
    preselected: true,
    display_name: 'Description',
    sort: 2,
    short_desc: 'Short description of your action set',
  },
  withOptions: {
    type: 'bool',
    display_name: 'With Options',
    sort: 3,
    preselected: true,
    short_desc: 'Whether to include options of each action in your action set',
    default_value: true,
  },
};

export const ActionSetDialog = ({
  name,
  states,
  withOptions,
  shortDescription,
  ...rest
}: IActionSetDialogProps) => {
  const apps = useContext(AppsContext);
  const [options, setOptions] = useState<IOptions>({
    name: {
      type: 'string',
      value: name,
    },
    shortDescription: {
      type: 'string',
      value: shortDescription,
    },
    withOptions: {
      type: 'bool',
      value: withOptions,
    },
  });

  const areOptionsValid = () => {
    return validateField('options', options, { optionSchema: schema });
  };

  const handleSubmitClick = () => {
    // Fix the states
    let fixedStates = changeStateIdsToGenerated(states);
    // Remove non existing transitions
    fixedStates = removeTransitionsFromStateGroup(states);

    apps.addNewActionSet({
      id: shortid.generate(),
      options,
      states: fixedStates,
    });

    rest.onClose();
  };

  return (
    <ReqoreModal
      label="Save Action Set"
      isOpen
      bottomActions={[
        submitControl(handleSubmitClick, { disabled: !areOptionsValid(), id: 'submit-action-set' }),
      ]}
      {...rest}
    >
      <Options
        sortable={false}
        label="Details"
        value={options}
        options={schema}
        onChange={(name, value) => setOptions(value)}
        name="action-set"
        allowTemplates={false}
      />
    </ReqoreModal>
  );
};
