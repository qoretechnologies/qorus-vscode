import styled from 'styled-components';

const StyledSidePanel = styled.div`
  overflow: none;
  display: flex;
  flex-flow: column;
`;

const SidePanel = ({ children, title }: any) => (
  <StyledSidePanel>
    {title && <h3>{title}</h3>}
    {children}
  </StyledSidePanel>
);

export default SidePanel;
