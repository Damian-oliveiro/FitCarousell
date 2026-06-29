import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateListingForm from './CreateListingForm'

// Mock useAuth
const mockUser = { id: 'user-123' }
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isMerchant: true,
  }),
}))

// Mock useData
const mockCreateListing = vi.fn()
vi.mock('../context/DataContext', () => ({
  useData: () => ({
    createListing: mockCreateListing,
  }),
}))

describe('CreateListingForm', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateListing.mockResolvedValue({ id: 'listing-1', title: 'Test' })
  })

  function renderForm() {
    return render(
      <CreateListingForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
  }

  it('renders the form with all required fields', () => {
    renderForm()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/condition/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/image url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows "Title is required" when submitting with empty title', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Running' } })
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'Good' } })
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://img.com/a.jpg' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(mockCreateListing).not.toHaveBeenCalled()
  })

  it('shows "Title must be under 100 characters" when title exceeds 100', async () => {
    renderForm()
    const longTitle = 'a'.repeat(101)
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: longTitle } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Running' } })
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'Good' } })
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://img.com/a.jpg' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    expect(await screen.findByText('Title must be under 100 characters')).toBeInTheDocument()
  })

  it('shows "Price must be greater than zero" when price is 0', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Item' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Running' } })
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'Good' } })
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://img.com/a.jpg' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    expect(await screen.findByText('Price must be greater than zero')).toBeInTheDocument()
  })

  it('shows "Price must be greater than zero" when price is negative', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Item' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '-5' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Running' } })
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'Good' } })
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://img.com/a.jpg' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    expect(await screen.findByText('Price must be greater than zero')).toBeInTheDocument()
  })

  it('shows category error when no category is selected', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'Good' } })
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://img.com/a.jpg' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    expect(await screen.findByText('Please select a valid category')).toBeInTheDocument()
  })

  it('shows condition error when no condition is selected', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Running' } })
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://img.com/a.jpg' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    expect(await screen.findByText('Please select a valid condition')).toBeInTheDocument()
  })

  it('shows image error when image URL is empty', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Running' } })
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'Good' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    expect(await screen.findByText('Image URL is required')).toBeInTheDocument()
  })

  it('preserves form data on validation failure', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My Running Shoes' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '50' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Great shoes' } })
    // Don't select category/condition so validation fails

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    // Form values should be preserved
    expect(screen.getByLabelText(/title/i)).toHaveValue('My Running Shoes')
    expect(screen.getByLabelText(/price/i)).toHaveValue(50)
    expect(screen.getByLabelText(/description/i)).toHaveValue('Great shoes')
  })

  it('calls createListing and onClose on successful submission', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Running Shoes' } })
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '75.50' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Running' } })
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'Like New' } })
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://img.com/shoes.jpg' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Barely used' } })

    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))

    await waitFor(() => {
      expect(mockCreateListing).toHaveBeenCalledWith({
        title: 'Running Shoes',
        description: 'Barely used',
        price: 75.50,
        category: 'Running',
        condition: 'Like New',
        image: 'https://img.com/shoes.jpg',
      })
    })

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('calls onClose when close button is clicked', () => {
    renderForm()
    fireEvent.click(screen.getByLabelText(/close form/i))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when cancel button is clicked', () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('clears field error when user starts typing', async () => {
    renderForm()
    // Submit with empty to trigger errors
    fireEvent.click(screen.getByRole('button', { name: /publish listing/i }))
    expect(await screen.findByText('Title is required')).toBeInTheDocument()

    // Start typing in title
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'A' } })
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
  })
})
