import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatisticsGrid } from '../../components/StatisticsGrid';

const defaultProps = {
  totalErrorCount: 0,
  consecutiveCorrect: 0,
  highestStreak: 0,
  justBrokeRecord: false,
  wpm: 0,
  accuracy: 100,
  timeElapsed: 0,
  textLength: 20,
  formatTime: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`,
};

describe('StatisticsGrid', () => {
  it('renders all four stat cards', () => {
    render(<StatisticsGrid {...defaultProps} />);
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
    expect(screen.getByText('WPM')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('displays correct error count', () => {
    render(<StatisticsGrid {...defaultProps} totalErrorCount={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('displays correct streak', () => {
    render(<StatisticsGrid {...defaultProps} consecutiveCorrect={12} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('displays correct highest streak', () => {
    render(<StatisticsGrid {...defaultProps} highestStreak={25} />);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('displays WPM', () => {
    render(<StatisticsGrid {...defaultProps} wpm={45} />);
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('displays accuracy percentage', () => {
    render(<StatisticsGrid {...defaultProps} accuracy={92} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('displays formatted time', () => {
    render(<StatisticsGrid {...defaultProps} timeElapsed={90} />);
    expect(screen.getByText('1:30')).toBeInTheDocument();
  });

  it('shows crown emoji on Best card', () => {
    render(<StatisticsGrid {...defaultProps} />);
    expect(screen.getByText('👑')).toBeInTheDocument();
  });

  it('applies scale animation when justBrokeRecord is true', () => {
    const { container } = render(<StatisticsGrid {...defaultProps} justBrokeRecord={true} />);
    expect(container.querySelector('.scale-125')).toBeInTheDocument();
  });
});
