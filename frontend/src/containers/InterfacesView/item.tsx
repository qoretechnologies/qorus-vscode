import { ReqoreTag, ReqoreTagGroup, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { IReqoreTagProps } from '@qoretechnologies/reqore/dist/components/Tag';
import { size } from 'lodash';
import { useCallback } from 'react';
import { IQorusInterface } from '.';
import { Markdown } from '../../components/Markdown';

export const InterfacesViewItem = ({
  name,
  data,
  isDraft,
  hasDraft,
  selectedFields,
  selectedMethods,
  steps,
  isValid,
  ...rest
}: IQorusInterface) => {
  const badges = useCallback(() => {
    let badges: IReqoreTagProps[] = [];

    if (isDraft) {
      badges = [
        {
          label: 'New Draft',
          minimal: false,
          intent: 'success',
        },
        {
          labelKey: 'Fields',
          label: size(selectedFields),
        },
      ];

      if (size(selectedMethods) > 0) {
        badges.push({
          labelKey: 'Methods',
          label: size(selectedMethods),
        });
      }

      if (size(steps) > 0) {
        badges.push({
          labelKey: 'Steps',
          label: size(steps.steps),
        });
      }
    }

    if (hasDraft) {
      badges.push({
        label: 'Draft',
        minimal: false,
        intent: 'pending',
      });
    }

    if (isDraft || hasDraft) {
      badges.push({
        labelKey: 'Status',
        label: isValid ? 'Valid' : 'Invalid',
        intent: isValid ? 'success' : 'danger',
        minimal: false,
      });
    }

    return badges.map((badge) => <ReqoreTag {...badge} />);
  }, [isDraft, hasDraft, isValid, selectedFields, selectedMethods, steps]);

  return (
    <>
      {data?.desc || data?.description ? (
        <Markdown>{data?.desc || data?.description}</Markdown>
      ) : (
        'No description'
      )}
      {size(badges()) ? (
        <>
          <ReqoreVerticalSpacer height={10} />
          <ReqoreTagGroup size="small">{badges()}</ReqoreTagGroup>
        </>
      ) : null}
    </>
  );
};
