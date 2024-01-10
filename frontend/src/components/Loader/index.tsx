import { ReqoreSpinner } from '@qoretechnologies/reqore';
import { IReqoreSpinnerProps } from '@qoretechnologies/reqore/dist/components/Spinner';
import styled from 'styled-components';

export interface ILoaderProps extends IReqoreSpinnerProps {
  text?: string;
  inline?: boolean;
}

const StyledLoader = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Loader = ({ text = 'Loading...', inline, ...rest }: ILoaderProps) => (
  <StyledLoader>
    <ReqoreSpinner
      type={5}
      iconColor="info:lighten:2"
      size="huge"
      centered={!inline}
      labelEffect={{ uppercase: true, spaced: 2, textSize: 'small' }}
      {...rest}
    >
      {text}
    </ReqoreSpinner>
  </StyledLoader>
);

export default Loader;
