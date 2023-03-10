import { render, screen } from '@testing-library/react';
import { TextContext } from '../../src/context/text';
import withText from '../../src/hocomponents/withTextContext';
import '@testing-library/jest-dom'; // import jest-dom library to use toBeInTheDocument


describe('withText', () => {
  it('should render the wrapped component with a `t` prop', () => {
    const TestComponent = ({ t }) => <div>{t('hello')}</div>;
    const WrappedComponent = withText()(TestComponent);
    render(<WrappedComponent />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('should pass additional props through to the wrapped component', () => {
    const TestComponent = ({ t, name }) => <div>{t(`Hello, ${name}`)}</div>;
    const WrappedComponent = withText()(TestComponent);
    render(<WrappedComponent name="Alice" />);
    expect(screen.getByText('Hello, Alice')).toBeInTheDocument();
  });

  it('should use the text function from the TextContext', () => {
    const TestComponent = ({ t }) => <div>{t('hello')}</div>;
    const WrappedComponent = withText()(TestComponent);
    render(
      <TextContext.Provider value={(key) => `translated ${key}`}>
        <WrappedComponent />
      </TextContext.Provider>
    );
    expect(screen.getByText('translated hello')).toBeInTheDocument();
  });
});
