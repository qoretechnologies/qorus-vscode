import { IQorusInterface } from '.';
import { Description } from '../../components/Description';

export const InterfacesViewItem = ({ data }: IQorusInterface) => {
  return (
    <Description
      longDescription={data?.desc || data?.description}
      shortDescription={data?.short_desc || 'No description'}
    />
  );
};
