import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WpmChart } from '../../components/WpmChart';

describe('WpmChart – placeholder state', () => {
  it('shows placeholder when history is empty', () => {
    render(<WpmChart wpmHistory={[]} />);
    expect(screen.getByText(/start typing to see your wpm trend/i)).toBeInTheDocument();
  });

  it('shows placeholder when history has only one data point', () => {
    render(<WpmChart wpmHistory={[{ time: 1, wpm: 40 }]} />);
    expect(screen.getByText(/start typing to see your wpm trend/i)).toBeInTheDocument();
  });

  it('always shows the WPM Trend heading', () => {
    render(<WpmChart wpmHistory={[]} />);
    expect(screen.getByText('WPM Trend')).toBeInTheDocument();
  });

  it('does not render an SVG in placeholder state', () => {
    const { container } = render(<WpmChart wpmHistory={[]} />);
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('WpmChart – chart rendering', () => {
  const twoPoints = [
    { time: 1, wpm: 40 },
    { time: 2, wpm: 50 },
  ];

  const manyPoints = [
    { time: 1, wpm: 30 },
    { time: 2, wpm: 45 },
    { time: 3, wpm: 60 },
    { time: 4, wpm: 55 },
    { time: 5, wpm: 70 },
  ];

  it('renders an SVG when at least 2 data points are present', () => {
    const { container } = render(<WpmChart wpmHistory={twoPoints} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('does not show placeholder text when chart is rendered', () => {
    render(<WpmChart wpmHistory={twoPoints} />);
    expect(screen.queryByText(/start typing/i)).toBeNull();
  });

  it('still shows WPM Trend heading when chart is rendered', () => {
    render(<WpmChart wpmHistory={twoPoints} />);
    expect(screen.getByText('WPM Trend')).toBeInTheDocument();
  });

  it('renders a polyline element for the line', () => {
    const { container } = render(<WpmChart wpmHistory={twoPoints} />);
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('renders one circle per data point', () => {
    const { container } = render(<WpmChart wpmHistory={manyPoints} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(manyPoints.length);
  });

  it('renders two circles for two data points', () => {
    const { container } = render(<WpmChart wpmHistory={twoPoints} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('renders X-axis time labels (seconds suffix)', () => {
    render(<WpmChart wpmHistory={twoPoints} />);
    // At least one "Xs" label should appear
    const labels = screen.getAllByText(/^\d+s$/);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('renders Y-axis WPM tick labels', () => {
    const { container } = render(<WpmChart wpmHistory={twoPoints} />);
    const texts = Array.from(container.querySelectorAll('text'));
    // Y ticks are plain numbers (no "s" suffix)
    const yTicks = texts.filter((t) => /^\d+$/.test(t.textContent ?? ''));
    expect(yTicks.length).toBeGreaterThan(0);
  });

  it('renders axis lines (at least 2 <line> elements)', () => {
    const { container } = render(<WpmChart wpmHistory={twoPoints} />);
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('has an aria-label on the SVG for accessibility', () => {
    const { container } = render(<WpmChart wpmHistory={twoPoints} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-label')).toBeTruthy();
  });

  it('polyline points attribute contains one coordinate pair per data point', () => {
    const { container } = render(<WpmChart wpmHistory={manyPoints} />);
    const polyline = container.querySelector('polyline');
    const pointPairs = polyline?.getAttribute('points')?.trim().split(' ');
    expect(pointPairs).toHaveLength(manyPoints.length);
  });
});

describe('WpmChart – edge cases', () => {
  it('handles all data points with the same WPM (flat line)', () => {
    const flat = [
      { time: 1, wpm: 50 },
      { time: 2, wpm: 50 },
      { time: 3, wpm: 50 },
    ];
    const { container } = render(<WpmChart wpmHistory={flat} />);
    expect(container.querySelector('polyline')).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(3);
  });

  it('handles a large WPM spike without crashing', () => {
    const spike = [
      { time: 1, wpm: 10 },
      { time: 2, wpm: 300 },
      { time: 3, wpm: 15 },
    ];
    const { container } = render(<WpmChart wpmHistory={spike} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles exactly 2 data points correctly', () => {
    const two = [
      { time: 5, wpm: 60 },
      { time: 10, wpm: 80 },
    ];
    const { container } = render(<WpmChart wpmHistory={two} />);
    expect(container.querySelectorAll('circle')).toHaveLength(2);
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });
});
