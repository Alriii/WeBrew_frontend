import { Coffee, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { Notice } from '../../common/Notice'
import { PageHeading } from '../../common/PageHeading'
import { categoryLabel, formatDate, money } from '../../../lib/format'
import type { Category, Sale, Weather } from '../../../lib/types'
import { useProducts } from '../../../context/useProducts'
import { createSale, deleteSale, listSales, updateSale, type SaleInput } from '../../../services/sales.service'

interface SalesFormProps {
  sale?: Sale
  saving: boolean
  products: ReturnType<typeof useProducts>['products']
  onCancel: () => void
  onSubmit: (input: SaleInput) => Promise<void>
}

function toLocalDateTime(date?: string) {
  const value = date ? new Date(date) : new Date()
  const offset = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offset).toISOString().slice(0, 16)
}

function SaleForm({ sale, saving, products, onCancel, onSubmit }: SalesFormProps) {
  const existingProduct = sale?.productId
    ? products.find((product) => product.id === sale.productId)
    : undefined
  const [productValue, setProductValue] = useState(existingProduct ? String(existingProduct.id) : 'manual')
  const [name, setName] = useState(sale?.productName ?? '')
  const [category, setCategory] = useState<Category>(sale?.category ?? 'coffee')
  const [price, setPrice] = useState(sale ? String(sale.price) : '')
  const [quantity, setQuantity] = useState(sale ? String(sale.quantity) : '1')
  const [rating, setRating] = useState(sale?.customerRating ? String(sale.customerRating) : '')
  const [weather, setWeather] = useState<Weather | ''>(sale?.weatherCondition ?? '')
  const [saleDate, setSaleDate] = useState(toLocalDateTime(sale?.saleDate))
  const [error, setError] = useState<string | null>(null)
  const selectedProduct = products.find((product) => String(product.id) === productValue)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const parsedQuantity = Number(quantity)
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setError('Quantity must be a whole number above zero.')
      return
    }

    const payload: SaleInput = {
      quantity: parsedQuantity,
      saleDate: new Date(saleDate).toISOString(),
      customerRating: rating ? Number(rating) : null,
      weatherCondition: weather || null,
    }

    if (selectedProduct) {
      payload.productId = selectedProduct.id
    } else {
      const parsedPrice = Number(price)
      if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0 || !Number.isInteger(parsedPrice * 100)) {
        setError('Add a drink name and a valid price with up to two decimals.')
        return
      }
      payload.productName = name.trim()
      payload.category = category
      payload.price = parsedPrice
    }

    try {
      await onSubmit(payload)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save the sale.')
    }
  }

  return (
    <form className="form-stack" onSubmit={(event) => void handleSubmit(event)}>
      {error && <Notice message={error} />}
      <label className="field-label">Menu item<select value={productValue} onChange={(event) => setProductValue(event.target.value)}><option value="manual">Enter a one-off drink</option>{products.filter((product) => product.active).map((product) => <option value={product.id} key={product.id}>{product.name} · {money.format(product.price)}</option>)}</select></label>
      {productValue === 'manual' && <><label className="field-label">Drink name<input required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Iced latte" /></label><div className="form-grid-two"><label className="field-label">Category<select value={category} onChange={(event) => setCategory(event.target.value as Category)}><option value="coffee">Coffee</option><option value="milk_tea">Milk tea</option></select></label><label className="field-label">Price per cup<input required type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="4.50" /></label></div></>}
      <div className="form-grid-two"><label className="field-label">Quantity<input required type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label className="field-label">Sale date and time<input required type="datetime-local" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} /></label></div>
      <div className="form-grid-two"><label className="field-label">Guest rating <span className="optional-label">optional</span><select value={rating} onChange={(event) => setRating(event.target.value)}><option value="">No rating</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>)}</select></label><label className="field-label">Weather <span className="optional-label">optional</span><select value={weather} onChange={(event) => setWeather(event.target.value as Weather | '')}><option value="">Not recorded</option><option value="sunny">Sunny</option><option value="cloudy">Cloudy</option><option value="rainy">Rainy</option></select></label></div>
      <div className="modal-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : sale ? 'Save changes' : 'Record sale'}</Button></div>
    </form>
  )
}

export function SalesPage() {
  const { products } = useProducts()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [editing, setEditing] = useState<Sale | null>(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  async function refreshSales() {
    setLoading(true)
    try {
      setSales(await listSales())
      setError(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load sales.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshSales(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => sales.filter((sale) => {
    return sale.productName.toLowerCase().includes(query.toLowerCase())
      && (filter === 'all' || sale.category === filter)
  }), [filter, query, sales])

  async function saveSale(input: SaleInput) {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateSale(editing.id, input)
        setSuccess('Sale details updated.')
      } else {
        await createSale(input)
        setSuccess('Sale recorded. One more lovely little detail saved.')
      }
      setAdding(false)
      setEditing(null)
      await refreshSales()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save sale.')
      throw requestError
    } finally {
      setSaving(false)
    }
  }

  async function removeSale(sale: Sale) {
    if (!window.confirm(`Delete the ${sale.productName} sale record? This cannot be undone.`)) return
    setError(null)
    setSuccess(null)
    try {
      await deleteSale(sale.id)
      setSuccess('Sale record deleted.')
      await refreshSales()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete sale.')
    }
  }

  const shownRevenue = filtered.reduce((total, sale) => total + sale.quantity * sale.price, 0)

  return (
    <div className="page-stack">
      {error && <Notice message={error} onRetry={() => void refreshSales()} />}
      {success && <Notice message={success} success />}
      <section className="surface-card catalog-card">
        <PageHeading kicker="EVERY LITTLE SALE" title="Sales ledger" description="A clear, cozy log of what’s been poured and shared." action={<Button icon={<Plus size={17} />} onClick={() => { setSuccess(null); setAdding(true) }}>Record a sale</Button>} />
        <div className="ledger-summary"><span><strong>{filtered.length}</strong> records shown</span><span><strong>{money.format(shownRevenue)}</strong> revenue in view</span></div>
        <div className="catalog-toolbar">
          <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a drink…" aria-label="Search sales" /></label>
          <div className="filter-pills">{(['all', 'coffee', 'milk_tea'] as const).map((value) => <button type="button" key={value} className={filter === value ? 'filter-pill filter-pill-active' : 'filter-pill'} onClick={() => setFilter(value)}>{value === 'all' ? 'Everything' : categoryLabel(value)}</button>)}</div>
        </div>
        {loading ? <div className="loading-panel ledger-loading"><span /></div> : filtered.length ? (
          <div className="table-scroll"><table className="sales-table"><thead><tr><th>Drink</th><th>Category</th><th>Date & time</th><th>Qty</th><th>Rating</th><th>Weather</th><th>Revenue</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((sale) => <tr key={sale.id}><td><span className="table-product"><span className={`table-product-icon ${sale.category}`}><Coffee size={15} /></span><strong>{sale.productName}</strong></span></td><td><span className={`category-tag ${sale.category === 'coffee' ? 'category-coffee' : 'category-tea'}`}>{categoryLabel(sale.category)}</span></td><td>{formatDate(sale.saleDate, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td><td>{sale.quantity}</td><td>{sale.customerRating ? <span className="table-rating"><span>★</span> {sale.customerRating}</span> : <span className="table-muted">—</span>}</td><td className="table-capitalize">{sale.weatherCondition ?? '—'}</td><td><strong>{money.format(sale.quantity * sale.price)}</strong></td><td><div className="table-actions"><button className="icon-button" type="button" aria-label={`Edit ${sale.productName} sale`} onClick={() => { setSuccess(null); setEditing(sale) }}><Pencil size={14} /></button><button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${sale.productName} sale`} onClick={() => void removeSale(sale)}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
        ) : <div className="empty-state"><span className="empty-icon"><Coffee size={20} /></span><h3>{sales.length ? 'Nothing in the ledger matches.' : 'The first cup is waiting.'}</h3><p>{sales.length ? 'Try a different drink name or category.' : 'Record a sale to start your café’s story.'}</p>{!sales.length && <Button icon={<Plus size={16} />} onClick={() => setAdding(true)}>Record your first sale</Button>}</div>}
      </section>
      {(adding || editing) && <Modal title={editing ? 'Update a sale' : 'Add a little moment'} description="Record what went out to a happy guest." onClose={() => { if (!saving) { setAdding(false); setEditing(null) } }}><SaleForm sale={editing ?? undefined} saving={saving} products={products} onCancel={() => { setAdding(false); setEditing(null) }} onSubmit={saveSale} /></Modal>}
    </div>
  )
}
