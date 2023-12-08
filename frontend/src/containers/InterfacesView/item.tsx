import { IQorusInterface } from '.';
import { Markdown } from '../../components/Markdown';

export const InterfacesViewItem = ({ data }: IQorusInterface) => {
  return (
    <>
      {data?.desc || data?.description ? (
        <Markdown>{data?.desc || data?.description}</Markdown>
      ) : (
        'No description'
      )}
    </>
  );
};
