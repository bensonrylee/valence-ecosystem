import React from 'react'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '@/components/ui/primitives/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')

    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
  })

  it('renders with different colors', () => {
    const { rerender } = render(<LoadingSpinner color="white" />)
    expect(screen.getByRole('status')).toHaveClass('text-white')

    rerender(<LoadingSpinner color="gray" />)
    expect(screen.getByRole('status')).toHaveClass('text-gray-400')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    const srText = screen.getByText('Loading...')
    
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    expect(srText).toHaveClass('sr-only')
  })
}) 