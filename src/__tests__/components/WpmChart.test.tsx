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

describe('WpmChart – best record', () => {
  const current = [
    { time: 1, wpm: 40 },
    { time: 2, wpm: 50 },
  ];
  const best = [
    { time: 1, wpm: 60 },
    { time: 2, wpm: 70 },
    { time: 3, wpm: 65 },
  ];

  it('renders two polylines when both datasets have >= 2 points', () => {
    const { container } = render(<WpmChart wpmHistory={current} bestWpmHistory={best} />);
    expect(container.querySelectorAll('polyline')).toHaveLength(2);
  });

  it('renders only one polyline when only current data (no bestWpmHistory)', () => {
    const { container } = render(<WpmChart wpmHistory={current} />);
    expect(container.querySelectorAll('polyline')).toHaveLength(1);
  });

  it('renders SVG when only best data exists (no current data yet)', () => {
    const { container } = render(<WpmChart wpmHistory={[]} bestWpmHistory={best} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders one polyline (best) when only best data exists', () => {
    const { container } = render(<WpmChart wpmHistory={[]} bestWpmHistory={best} />);
    expect(container.querySelectorAll('polyline')).toHaveLength(1);
  });

  it('"Best" legend label is visible when bestWpmHistory is provided', () => {
    render(<WpmChart wpmHistory={current} bestWpmHistory={best} />);
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('"Current" legend label is visible when current data is present', () => {
    render(<WpmChart wpmHistory={current} bestWpmHistory={best} />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('total circle count equals current + best when both provided', () => {
    const { container } = render(<WpmChart wpmHistory={current} bestWpmHistory={best} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(current.length + best.length);
  });

  it('shows "Start typing to race your best" when only best exists', () => {
    render(<WpmChart wpmHistory={[]} bestWpmHistory={best} />);
    expect(screen.getByText(/start typing to race your best/i)).toBeInTheDocument();
  });

  it('shows "Start typing to see your WPM trend" when neither has data', () => {
    render(<WpmChart wpmHistory={[]} />);
    expect(screen.getByText(/start typing to see your wpm trend/i)).toBeInTheDocument();
  });
});
