import { Coffee, Leaf, PackagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { Notice } from '../../common/Notice'
import { PageHeading } from '../../common/PageHeading'
import { categoryLabel, money } from '../../../lib/format'
import type { Category, Product } from '../../../lib/types'
import { createProduct, deleteProduct, updateProduct, type ProductInput } from '../../../services/products.service'
import { useProducts } from '../../../context/useProducts'

interface ProductFormProps {
  product?: Product
  saving: boolean
  onCancel: () => void
  onSubmit: (input: ProductInput) => Promise<void>
}

function ProductForm({ product, saving, onCancel, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState<Category>(product?.category ?? 'coffee')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const parsedPrice = Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0 || !Number.isInteger(parsedPrice * 100)) {
      setError('Enter a price with up to two decimal places.')
      return
    }
    try {
      await onSubmit({ name: name.trim(), category, price: parsedPrice })
    } catch (formError) {
      setError(formError instanceof Error ? formError.message : 'Could not save product.')
    }
  }

  return (
    <form className="form-stack" onSubmit={(event) => void handleSubmit(event)}>
      {error && <Notice message={error} />}
      <label className="field-label">Drink name<input autoFocus maxLength={255} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Honey oat latte" /></label>
      <label className="field-label">Category<select value={category} onChange={(event) => setCategory(event.target.value as Category)}><option value="coffee">Coffee</option><option value="milk_tea">Milk tea</option></select></label>
      <label className="field-label">Price per drink<input required min="0.01" step="0.01" type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="4.50" /></label>
      <div className="modal-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Add to menu'}</Button></div>
    </form>
  )
}

export function ProductsPage() {
  const { products, loading, error, refreshProducts } = useProducts()
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all')
  const [editing, setEditing] = useState<Product | null>(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filtered = useMemo(() => products.filter((product) => {
    const matchesText = product.name.toLowerCase().includes(query.toLowerCase())
    return matchesText && (categoryFilter === 'all' || product.category === categoryFilter)
  }), [categoryFilter, products, query])
  const coffeeCount = products.filter((product) => product.category === 'coffee').length
  const teaCount = products.filter((product) => product.category === 'milk_tea').length

  async function saveProduct(input: ProductInput) {
    setSaving(true)
    setPageError(null)
    try {
      if (editing) {
        await updateProduct(editing.id, input)
        setSuccess('Your menu item has been updated.')
      } else {
        await createProduct(input)
        setSuccess('A new drink is on the menu.')
      }
      setAdding(false)
      setEditing(null)
      await refreshProducts()
    } catch (saveError) {
      setPageError(saveError instanceof Error ? saveError.message : 'Could not save product.')
      throw saveError
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Remove ${product.name} from the menu? Existing sale records will keep their saved details.`)) return
    setPageError(null)
    setSuccess(null)
    try {
      await deleteProduct(product.id)
      setSuccess(`${product.name} has been removed from the menu.`)
      await refreshProducts()
    } catch (deleteError) {
      setPageError(deleteError instanceof Error ? deleteError.message : 'Could not delete product.')
    }
  }

  return (
    <div className="page-stack">
      {(pageError || error) && <Notice message={pageError ?? error ?? 'Could not load the product list.'} onRetry={() => void refreshProducts()} />}
      {success && <Notice message={success} success />}
      <div className="catalog-banner"><span className="catalog-banner-icon"><PackagePlus size={21} /></span><div><strong>A menu made your way.</strong><p>Add every little favorite, set the price and keep your café menu feeling fresh.</p></div><span className="catalog-count">{products.length}<small>menu items</small></span></div>

      <section className="surface-card catalog-card">
        <PageHeading kicker="THE MENU BOARD" title="All drinks" description={`${coffeeCount} coffee${coffeeCount === 1 ? '' : 's'} and ${teaCount} milk tea${teaCount === 1 ? '' : 's'} on your menu.`} action={<Button icon={<Plus size={17} />} onClick={() => { setSuccess(null); setAdding(true) }}>Add a drink</Button>} />
        <div className="catalog-toolbar">
          <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a drink…" aria-label="Search products" /></label>
          <div className="filter-pills" aria-label="Filter by category">
            {(['all', 'coffee', 'milk_tea'] as const).map((filter) => <button type="button" className={categoryFilter === filter ? 'filter-pill filter-pill-active' : 'filter-pill'} key={filter} onClick={() => setCategoryFilter(filter)}>{filter === 'all' ? 'Everything' : categoryLabel(filter)}</button>)}
          </div>
        </div>

        {loading ? <div className="products-grid">{Array.from({ length: 4 }, (_, index) => <div className="product-skeleton" key={index} />)}</div>
          : filtered.length ? <div className="products-grid">{filtered.map((product, index) => {
            const isCoffee = product.category === 'coffee'
            const Icon = isCoffee ? Coffee : Leaf
            return <article className={`product-card product-card-${index % 4}`} key={product.id}>
              <div className="product-card-top"><span className={`product-art ${isCoffee ? 'product-art-coffee' : 'product-art-tea'}`}><Icon size={24} /></span><div className="product-actions"><button type="button" className="icon-button" aria-label={`Edit ${product.name}`} onClick={() => { setSuccess(null); setEditing(product) }}><Pencil size={15} /></button><button type="button" className="icon-button icon-button-danger" aria-label={`Delete ${product.name}`} onClick={() => void handleDelete(product)}><Trash2 size={15} /></button></div></div>
              <span className={`category-tag ${isCoffee ? 'category-coffee' : 'category-tea'}`}>{categoryLabel(product.category)}</span>
              <h3>{product.name}</h3>
              <div className="product-card-bottom"><strong>{money.format(product.price)}</strong><span>per cup</span></div>
            </article>
          })}</div>
          : <div className="empty-state"><span className="empty-icon"><Coffee size={20} /></span><h3>{products.length ? 'No drinks match that search.' : 'Your menu is waiting.'}</h3><p>{products.length ? 'Try another name or category.' : 'Add your first drink to give your café its own flavor.'}</p>{!products.length && <Button icon={<Plus size={16} />} onClick={() => setAdding(true)}>Add your first drink</Button>}</div>}
      </section>
      {(adding || editing) && <Modal title={editing ? 'A little menu edit' : 'Add a new favorite'} description="Make it yours. You can update these details anytime." onClose={() => { if (!saving) { setAdding(false); setEditing(null) } }}><ProductForm product={editing ?? undefined} saving={saving} onCancel={() => { setAdding(false); setEditing(null) }} onSubmit={saveProduct} /></Modal>}
    </div>
  )
}
