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

const Loader = ({ text = 'Loading...' }: any) => (
  <StyledLoader>
    <div>{text ? <p>{text}</p> : null}</div>
  </StyledLoader>
);

export default Loader;
