import { render, screen, fireEvent } from '@testing-library/react'
import { vi, expect, test, describe } from 'vitest'
import ShopList from '../ShopList'

const mockShops = [
  {
    _id: '1',
    name: 'Pizza Palace',
    description: 'Best pizza in town',
    rating: 4.5,
    image: 'pizza-palace.jpg',
  },
  {
    _id: '2',
    name: 'Burger Barn',
    description: 'Juicy burgers',
    rating: 4.0,
    image: 'burger-barn.jpg',
  },
]

describe('ShopList Component', () => {
  test('renders shops when data is loaded', () => {
    render(<ShopList shops={mockShops} loading={false} />)

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument()
    expect(screen.getByText('Burger Barn')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('4.0')).toBeInTheDocument()
  })

  test('shows loading state', () => {
    render(<ShopList shops={[]} loading={true} />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument()
  })

  test('shows empty state when no shops', () => {
    render(<ShopList shops={[]} loading={false} />)

    expect(screen.getByText(/no shops found/i)).toBeInTheDocument()
  })

  test('handles shop click', () => {
    const mockOnShopClick = vi.fn()

    render(
      <ShopList
        shops={mockShops}
        loading={false}
        onShopClick={mockOnShopClick}
      />
    )

    fireEvent.click(screen.getByText('Pizza Palace'))

    expect(mockOnShopClick).toHaveBeenCalledWith(mockShops[0])
  })

  test('filters shops by search term', () => {
    render(<ShopList shops={mockShops} loading={false} searchTerm="pizza" />)

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument()
    expect(screen.queryByText('Burger Barn')).not.toBeInTheDocument()
  })
})
