import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Collaborative Editor heading', () => {
  render(<App />);
  const heading = screen.getByText(/Collaborative Editor/i);
  expect(heading).toBeInTheDocument();
});
