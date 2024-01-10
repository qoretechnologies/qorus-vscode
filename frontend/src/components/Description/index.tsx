import {
  ReqoreTextEffect,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { IReqoreParagraphProps, ReqoreP } from '@qoretechnologies/reqore/dist/components/Paragraph';
import ReactMarkdown from 'react-markdown';

export interface IDescriptionProps extends IReqoreParagraphProps {
  shortDescription?: string;
  longDescription: string;
  maxShortDescriptionLength?: number;
  margin?: 'top' | 'bottom' | 'both' | 'none';
}

export const Description = ({
  shortDescription,
  longDescription,
  maxShortDescriptionLength = 1000,
  margin = 'bottom',
  ...rest
}: IDescriptionProps) => {
  const addModal = useReqoreProperty('addModal');

  if (!shortDescription && !longDescription) {
    return null;
  }

  let finalShortDescription = shortDescription || longDescription;
  const isShortDescriptionTooLong = finalShortDescription?.length > maxShortDescriptionLength;

  finalShortDescription = isShortDescriptionTooLong
    ? `${finalShortDescription.slice(0, maxShortDescriptionLength)}...`
    : finalShortDescription;

  let finalLongDescription =
    longDescription || (isShortDescriptionTooLong ? shortDescription : null);

  const handleDescriptionClick = () => {
    if (finalLongDescription) {
      addModal({
        children: <ReactMarkdown>{finalLongDescription}</ReactMarkdown>,
        minimal: true,
        blur: 1,
      });
    }
  };

  return (
    <>
      {margin === 'both' || margin === 'top' ? <ReqoreVerticalSpacer height={10} /> : null}
      <ReqoreP {...rest}>
        {finalShortDescription}{' '}
        {finalLongDescription ? (
          <ReqoreTextEffect
            className="description-more"
            effect={{
              interactive: true,
              opacity: 0.5,
              gradient: { colors: { 0: 'info', 100: 'info:lighten' } },
              brightness: 180,
              weight: 'bold',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDescriptionClick?.();
            }}
          >
            [ more ]
          </ReqoreTextEffect>
        ) : null}
      </ReqoreP>
      {margin === 'both' || margin === 'bottom' ? <ReqoreVerticalSpacer height={10} /> : null}
    </>
  );
};
