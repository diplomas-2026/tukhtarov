import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen', async () => {
  render(<App />);
  const title = await screen.findByText(/вход в систему/i);
  expect(title).toBeInTheDocument();
});
