import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { FunctionComponent } from 'react';
import withFields from '../../src/hocomponents/withFields';

const DummyComponent: FunctionComponent<any> = ({ name, value = 'test', onChange }) => (
  <div>
    <input type="text" value={value} onChange={onChange} />
  </div>
);

describe('withFields', () => {
  it('renders the enhanced component correctly', () => {
    const EnhancedDummyComponent = withFields()(DummyComponent);
    render(<EnhancedDummyComponent />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue('test');
  });
});
