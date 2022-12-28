import { Spinner } from '@blueprintjs/core';
import { ReqoreP } from '@qoretechnologies/reqore';
import styled from 'styled-components';

const StyledLoader = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;

  p {
    margin-top: 20px;
    font-size: 17px;
  }
`;

const Loader = ({ text }) => (
  <StyledLoader>
    <div>
      <Spinner size={60} />
      <ReqoreP>{text}</ReqoreP>
    </div>
  </StyledLoader>
);

export default Loader;
