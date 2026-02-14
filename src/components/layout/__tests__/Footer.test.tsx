import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// The labels returned by our mock next-intl (in jest.setup.ts) are the keys themselves.
// e.g. t('dashboards') -> 'dashboards'

describe('Footer Component', () => {
  it('renders footer sections with translated keys', () => {
    render(<Footer />);
    
    // Check for dashboard title (key: dashboards)
    expect(screen.getByText('dashboards')).toBeInTheDocument();
    
    // Check for copyright (key: copyright)
    // next-intl mock returns 'copyright'
    expect(screen.getByText('copyright')).toBeInTheDocument();
    
    // Check for brand name
    expect(screen.getByText('NovaTrend')).toBeInTheDocument();
  });
});
