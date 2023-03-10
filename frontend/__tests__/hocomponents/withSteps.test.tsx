import { render } from '@testing-library/react';
import withSteps from '../../src/hocomponents/withSteps';

describe('withSteps', () => {
  const Component = () => <div>Test Component</div>;
  const EnhancedComponent = withSteps()(Component);

  it('should render without crashing', () => {
    render(<EnhancedComponent initialSteps={[]} />);
  });
});
