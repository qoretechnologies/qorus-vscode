import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, screen } from '@testing-library/react';
import withTargetDir from '../../src/hocomponents/withTargetDir';

// Create a mock store
const mockStore = configureStore([]);

describe('withTargetDir', () => {
  it('should render the enhanced component', () => {
    const store = mockStore({ create_iface_target_dir: '' });
    const EnhancedComponent = () => <div>Enhanced Component</div>;
    const ComponentWithTargetDir = withTargetDir(EnhancedComponent);
    const { getByText } = render(
      <Provider store={store}>
        <ComponentWithTargetDir />
      </Provider>
    );
    expect(screen.getByText('Enhanced Component')).toBeDefined();
  });
});
