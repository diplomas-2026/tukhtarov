import { render, screen } from '@testing-library/react';
import App from './App';

test('renders workspace title', () => {
  render(<App />);
  const title = screen.getByText(/управление заказами/i);
  expect(title).toBeInTheDocument();
});
