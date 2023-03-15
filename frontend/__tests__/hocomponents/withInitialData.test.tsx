import withInitialData from '../../src/hocomponents/withInitialData';

describe('withInitialData', () => {
  let Component;
  let setTheme;
  let props;
  let addNotification;
  let initialData;
  let setTexts;
  let setT;

  beforeEach(() => {
    Component = () => null;
    setTheme = jest.fn();
    addNotification = jest.fn();
    setTexts = jest.fn();
    setT = jest.fn();
    initialData = {
      qorus_instance: {
        url: 'https://qorus.example.com',
      },
    };
    props = { setTheme };
  });

  it('renders the component', () => {
    const EnhancedComponent = withInitialData()(Component);
    const wrapper = EnhancedComponent(props);
    expect(wrapper).toBeDefined();
  });
});
