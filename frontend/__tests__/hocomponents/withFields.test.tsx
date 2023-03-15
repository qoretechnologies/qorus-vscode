import { render, screen } from '@testing-library/react';
import withState from '../../src/hocomponents/withFields';

describe('withState', () => {
  it('should reset all data on calling resetAllData', () => {
    const component = () => <div>Test Component</div>;
    const EnhancedComponent = withState()(component);
    render(<EnhancedComponent />);

    const resetAllDataMock = jest.fn();
    const instances = screen.getAllByRole('generic', { hidden: true }) as any[];
    const instance = instances[0];
    instance.resetAllData = resetAllDataMock;
    instance.resetAllData();

    expect(resetAllDataMock).toHaveBeenCalled();
  });
});
