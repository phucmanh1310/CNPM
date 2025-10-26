import React from 'react'

function ShopList({
  shops = [],
  loading = false,
  onShopClick,
  searchTerm = '',
}) {
  if (loading) {
    return <div data-testid="loading-spinner">Loading...</div>
  }

  const filtered = shops.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!filtered.length) {
    return <p>No shops found</p>
  }

  return (
    <ul>
      {filtered.map((shop) => (
        <li key={shop._id}>
          <button type="button" onClick={() => onShopClick?.(shop)}>
            {shop.name}
          </button>
          <span>{Number(shop.rating).toFixed(1)}</span>
        </li>
      ))}
    </ul>
  )
}

export default ShopList
