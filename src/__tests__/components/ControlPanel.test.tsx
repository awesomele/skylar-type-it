import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlPanel } from '../../components/ControlPanel';

const defaultProps = {
  practiceMode: 'typing' as const,
  onPracticeModeChange: vi.fn(),
  passageLength: 15,
  maxPassageLength: 100,
  onPassageLengthChange: vi.fn(),
  speakEnabled: true,
  onSpeakEnabledChange: vi.fn(),
};

describe('ControlPanel', () => {
  it('renders Practice Mode label', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getByText(/practice mode/i)).toBeInTheDocument();
  });

  it('shows Typing Mode and Memorize Mode options', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getByLabelText(/typing mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/memorize mode/i)).toBeInTheDocument();
  });

  it('has typing mode selected by default', () => {
    render(<ControlPanel {...defaultProps} practiceMode="typing" />);
    expect((screen.getByLabelText(/typing mode/i) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/memorize mode/i) as HTMLInputElement).checked).toBe(false);
  });

  it('has memorize mode selected when prop is memorize', () => {
    render(<ControlPanel {...defaultProps} practiceMode="memorize" />);
    expect((screen.getByLabelText(/memorize mode/i) as HTMLInputElement).checked).toBe(true);
  });

  it('calls onPracticeModeChange when memorize radio is clicked', async () => {
    const onPracticeModeChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlPanel {...defaultProps} onPracticeModeChange={onPracticeModeChange} />);
    await user.click(screen.getByLabelText(/memorize mode/i));
    expect(onPracticeModeChange).toHaveBeenCalledWith('memorize');
  });

  it('renders passage length slider', () => {
    render(<ControlPanel {...defaultProps} />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.value).toBe('15');
  });

  it('calls onPassageLengthChange when slider changes', () => {
    const onPassageLengthChange = vi.fn();
    render(<ControlPanel {...defaultProps} onPassageLengthChange={onPassageLengthChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(onPassageLengthChange).toHaveBeenCalledWith(20);
  });

  it('renders speak toggle in on state', () => {
    render(<ControlPanel {...defaultProps} speakEnabled={true} />);
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('renders speak toggle in off state', () => {
    render(<ControlPanel {...defaultProps} speakEnabled={false} />);
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('calls onSpeakEnabledChange when toggle clicked', async () => {
    const onSpeakEnabledChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlPanel {...defaultProps} onSpeakEnabledChange={onSpeakEnabledChange} />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(onSpeakEnabledChange).toHaveBeenCalledWith(false);
  });
});
