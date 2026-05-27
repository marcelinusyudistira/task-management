import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskModal from '@/components/TaskModal';
import api from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('TaskModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form when no task provided', () => {
    render(<TaskModal task={null} onClose={mockOnClose} onSaved={mockOnSaved} />);
    expect(screen.getByText('New Task')).toBeTruthy();
    expect(screen.getByText('Create')).toBeTruthy();
  });

  it('renders edit form with task data', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: 'Test desc',
      status: 'in_progress' as const,
      priority: 'high' as const,
      due_date: '2024-06-15T00:00:00.000000Z',
      assigned_user_id: null,
      created_by: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    render(<TaskModal task={task} onClose={mockOnClose} onSaved={mockOnSaved} />);
    expect(screen.getByText('Edit Task')).toBeTruthy();
    expect(screen.getByDisplayValue('Test Task')).toBeTruthy();
    expect(screen.getByDisplayValue('2024-06-15')).toBeTruthy();
  });

  it('calls onClose when cancel clicked', () => {
    render(<TaskModal task={null} onClose={mockOnClose} onSaved={mockOnSaved} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits create form', async () => {
    mockedApi.post.mockResolvedValue({ data: { success: true } });

    render(<TaskModal task={null} onClose={mockOnClose} onSaved={mockOnSaved} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'New Task' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({ title: 'New Task' }));
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });

  it('submits update form', async () => {
    mockedApi.put.mockResolvedValue({ data: { success: true } });

    const task = {
      id: 5,
      title: 'Existing',
      description: '',
      status: 'pending' as const,
      priority: 'medium' as const,
      due_date: null,
      assigned_user_id: null,
      created_by: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    render(<TaskModal task={task} onClose={mockOnClose} onSaved={mockOnSaved} />);
    fireEvent.change(screen.getByDisplayValue('Existing'), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith('/tasks/5', expect.objectContaining({ title: 'Updated' }));
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });
});
