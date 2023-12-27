import {
  ReqoreH1,
  ReqoreH2,
  ReqoreH3,
  ReqoreH4,
  ReqoreH5,
  ReqoreH6,
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
        children: (
          <ReactMarkdown
            components={{
              p: ReqoreP,
              h1: ReqoreH1,
              h2: ReqoreH2,
              h3: ReqoreH3,
              h4: ReqoreH4,
              h5: ReqoreH5,
              h6: ReqoreH6,
            }}
          >
            {finalLongDescription}
          </ReactMarkdown>
        ),
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
            onClick={handleDescriptionClick}
          >
            [ more ]
          </ReqoreTextEffect>
        ) : null}
      </ReqoreP>
      {margin === 'both' || margin === 'bottom' ? <ReqoreVerticalSpacer height={10} /> : null}
    </>
  );
};
