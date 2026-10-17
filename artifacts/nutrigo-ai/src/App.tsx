import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock3,
  FileImage,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Pencil,
  Plus,
  ScanLine,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
  Upload,
  Wifi,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import Brand from '@/components/Brand.jsx';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  addCartItem,
  checkApiConnection,
  deleteCartItem,
  getCart,
  scanLabel,
  updateCartItem,
  type CartItem,
  type CartItemUpdate,
  type NutritionLabelResponse,
} from '@/lib/api';
import Landing from '@/pages/Landing.jsx';
import NotFound from '@/pages/not-found';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: 'top' as const,
    socialButtonsVariant: 'blockButton' as const,
  },
  variables: {
    colorPrimary: '#367b5b',
    colorForeground: '#243a31',
    colorMutedForeground: '#728177',
    colorDanger: '#ba5146',
    colorBackground: '#fffdf7',
    colorInput: '#fffdf7',
    colorInputForeground: '#243a31',
    colorNeutral: '#dfded2',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'auth-card-surface rounded-[26px] w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'auth-title',
    headerSubtitle: 'auth-subtitle',
    socialButtonsBlockButtonText: 'auth-text',
    formFieldLabel: 'auth-label',
    footerActionLink: 'auth-link',
    footerActionText: 'auth-muted',
    dividerText: 'auth-muted',
    identityPreviewEditButton: 'auth-link',
    formFieldSuccessText: 'auth-text',
    alertText: 'auth-text',
    logoBox: 'auth-logo',
    logoImage: 'auth-logo-image',
    socialButtonsBlockButton: 'auth-social-button',
    formButtonPrimary: 'auth-primary-button',
    formFieldInput: 'auth-input',
    footerAction: 'auth-footer-action',
    dividerLine: 'auth-divider',
    alert: 'auth-alert',
    otpCodeFieldInput: 'auth-input',
    formFieldRow: 'auth-field-row',
    main: 'auth-main',
  },
};

function HomeRoute() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <div className="page-loading" data-testid="status-auth-loading"><span className="loading-orb" />Getting your kitchen ready…</div>;
  return isSignedIn ? <Redirect to="/dashboard" /> : <Landing />;
}

function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-page-top"><Link href="/" className="brand-link" data-testid="link-auth-brand"><Brand /></Link><span>Grocery clarity, one label at a time.</span></div>
      <div className="auth-content">
        <div className="auth-aside">
          <span className="auth-aside-label">WELCOME BACK</span>
          <h1>Your cart,<br />your way.</h1>
          <p>Pick up right where your next grocery run begins.</p>
          <div className="auth-decoration"><div className="auth-ring" /><div className="auth-leaf"><Leaf size={54} /></div><span>good food<br />starts with knowing</span></div>
        </div>
        <div className="auth-form-wrap"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>
      </div>
    </main>
  );
}

function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-page-top"><Link href="/" className="brand-link" data-testid="link-auth-brand"><Brand /></Link><span>Grocery clarity, one label at a time.</span></div>
      <div className="auth-content">
        <div className="auth-aside">
          <span className="auth-aside-label">A BETTER GROCERY HABIT</span>
          <h1>Less guesswork.<br /><em>More knowing.</em></h1>
          <p>Start with a label. Build a cart that makes sense to you.</p>
          <div className="auth-decoration"><div className="auth-ring" /><div className="auth-leaf"><Leaf size={54} /></div><span>simple tools<br />for everyday choices</span></div>
        </div>
        <div className="auth-form-wrap"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>
      </div>
    </main>
  );
}

function ConnectionStatus({ online, loading, error }: { online: boolean; loading: boolean; error: string }) {
  return (
    <div className={`connection-status ${loading ? 'is-checking' : online ? 'is-online' : 'is-offline'}`} data-testid="status-api-connection" aria-live="polite">
      <span className="connection-dot" />
      <span>{loading ? 'Checking NutriGo service' : online ? 'NutriGo service connected' : 'Service unavailable'}</span>
      {loading ? <LoaderCircle className="status-spin" size={14} /> : online ? <Wifi size={14} /> : <CircleAlert size={14} />}
      {error && <span className="status-tooltip" role="status">{error}</span>}
    </div>
  );
}

function Metric({ label, value, unit, tone }: { label: string; value: number; unit: string; tone: string }) {
  return <div className={`metric ${tone}`} data-testid={`metric-${label.toLowerCase()}`}><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>;
}

function NutritionCard({ data }: { data: NutritionLabelResponse }) {
  return (
    <div className="nutrition-result" data-testid="card-scan-result">
      <div className="result-header">
        <span className="result-icon"><BadgeCheck size={19} /></span>
        <div><span className="result-eyebrow">LABEL READ</span><h3 data-testid="text-result-name">{data.item_name}</h3></div>
      </div>
      <div className="result-calorie"><span>Calories</span><strong data-testid="text-result-calories">{data.calories}<small> kcal</small></strong></div>
      <div className="metric-grid">
        <Metric label="Protein" value={data.protein} unit="g" tone="metric-protein" />
        <Metric label="Carbs" value={data.carbs} unit="g" tone="metric-carbs" />
        <Metric label="Fat" value={data.fat} unit="g" tone="metric-fat" />
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const displayName = user?.firstName || 'there';
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState<NutritionLabelResponse | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanSuccess, setScanSuccess] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [connectionOnline, setConnectionOnline] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CartItemUpdate>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [quantityUpdatingId, setQuantityUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cartActionError, setCartActionError] = useState('');
  const [cartActionSuccess, setCartActionSuccess] = useState('');

  useEffect(() => {
    let active = true;
    checkApiConnection()
      .then((response) => {
        if (active) {
          setConnectionOnline(true);
          setConnectionError('');
        }
        return response;
      })
      .catch((error: unknown) => {
        if (active) {
          setConnectionOnline(false);
          setConnectionError(error instanceof Error ? error.message : 'Unable to reach the service.');
        }
      })
      .finally(() => { if (active) setConnectionLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded || !email) return;
    let active = true;
    setCartLoading(true);
    getCart(email)
      .then((items) => { if (active) { setCart(items); setCartError(''); } })
      .catch((error: unknown) => { if (active) setCartError(error instanceof Error ? error.message : 'Your cart could not be loaded.'); })
      .finally(() => { if (active) setCartLoading(false); });
    return () => { active = false; };
  }, [email, isLoaded]);

  useEffect(() => {
    if (!file) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!isLoaded) {
    return <div className="page-loading" data-testid="status-auth-loading"><span className="loading-orb" />Opening your kitchen…</div>;
  }
  if (!user) return <Redirect to="/" />;

  function chooseFile(next: File | null) {
    setFile(next);
    setResult(null);
    setScanError('');
    setScanSuccess('');
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0] ?? null);
    event.target.value = '';
  }

  async function submitScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || scanLoading) return;
    setScanLoading(true);
    setScanError('');
    setScanSuccess('');
    try {
      const response = await scanLabel(file);
      setResult(response);
      setQuantity(1);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'We could not read that label. Please try again.');
    } finally {
      setScanLoading(false);
    }
  }

  async function addResultToCart() {
    if (!result || !email) return;
    setScanSuccess('');
    setScanError('');
    setAddingToCart(true);
    try {
      const item = await addCartItem(result, email, quantity);
      setCart((current) => [...current, item]);
      setScanSuccess(`${item.item_name} added to your cart.`);
      setResult(null);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Could not add this item to your cart.');
    } finally {
      setAddingToCart(false);
    }
  }

  async function adjustQuantity(item: CartItem, delta: number) {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity < 1 || quantityUpdatingId) return;
    setCartActionError('');
    setCartActionSuccess('');
    setQuantityUpdatingId(item.id);
    try {
      await updateCartItem(item.id, { quantity: nextQuantity });
      setCart((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: nextQuantity } : entry));
    } catch (error) {
      setCartActionError(error instanceof Error ? error.message : 'Could not update quantity.');
    } finally {
      setQuantityUpdatingId(null);
    }
  }

  function beginEdit(item: CartItem) {
    setEditingId(item.id);
    setEditDraft({
      item_name: item.item_name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      quantity: item.quantity,
    });
    setCartActionError('');
  }

  function changeDraft(field: keyof CartItemUpdate, value: string) {
    setEditDraft((draft) => field === 'item_name' ? { ...draft, item_name: value } : { ...draft, [field]: Number(value) });
  }

  async function saveEdit(item: CartItem) {
    if (!editDraft.item_name?.trim() || !Number.isFinite(editDraft.quantity) || Number(editDraft.quantity) < 1) {
      setCartActionError('Enter an item name and a quantity of at least one.');
      return;
    }
    setSavingId(item.id);
    setCartActionError('');
    try {
      await updateCartItem(item.id, editDraft);
      setCart((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...editDraft, item_name: editDraft.item_name?.trim() || entry.item_name } : entry));
      setEditingId(null);
      setCartActionSuccess('Cart item updated.');
    } catch (error) {
      setCartActionError(error instanceof Error ? error.message : 'Could not save your changes.');
    } finally {
      setSavingId(null);
    }
  }

  async function removeItem(item: CartItem) {
    if (!window.confirm(`Remove ${item.item_name} from your cart?`)) return;
    setDeletingId(item.id);
    setCartActionError('');
    setCartActionSuccess('');
    try {
      await deleteCartItem(item.id);
      setCart((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) setEditingId(null);
      setCartActionSuccess(`${item.item_name} removed from your cart.`);
    } catch (error) {
      setCartActionError(error instanceof Error ? error.message : 'Could not remove this item.');
    } finally {
      setDeletingId(null);
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
      <Link href="/dashboard" className="brand-link" data-testid="link-dashboard-brand"><Brand /></Link>
        <div className="dashboard-header-right">
          <ConnectionStatus online={connectionOnline} loading={connectionLoading} error={connectionError} />
          <span className="user-greeting" data-testid="text-user-name">Hi, {displayName}</span>
          <button className="signout-button" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-sign-out">Sign out <ArrowRight size={14} /></button>
        </div>
      </header>

      <div className="dashboard-main">
        <section className="dashboard-intro">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR GROCERY SIDEKICK</span>
            <h1>Let’s make this<br /><em>label make sense.</em></h1>
            <p>Drop in a nutrition label photo, see its details, then add it to your cart.</p>
          </div>
          <div className="intro-stamp"><div className="stamp-circle"><Leaf size={20} /></div><span>SHOP<br />WITH<br />CLARITY</span></div>
        </section>

        <div className="dashboard-columns">
          <section className="scan-panel panel" aria-labelledby="scan-title">
            <div className="panel-heading">
              <div className="panel-heading-icon"><ScanLine size={19} /></div>
              <div><span className="section-overline">THE LABEL READER</span><h2 id="scan-title">Scan a product</h2></div>
              <span className="step-count">01 <span>/ 02</span></span>
            </div>
            <form onSubmit={submitScan}>
              <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" onChange={handleFileChange} data-testid="input-label-photo" aria-label="Choose a nutrition label photo" />
              {!file ? (
                <button type="button" className="upload-zone" onClick={() => fileInput.current?.click()} data-testid="button-upload-label">
                  <span className="upload-graphic"><Upload size={22} /></span>
                  <strong>Choose a label photo</strong>
                  <span>Use a clear image of the nutrition facts panel.</span>
                  <span className="upload-browse">Browse photos <ArrowRight size={14} /></span>
                  <span className="upload-formats"><FileImage size={13} /> Image files</span>
                </button>
              ) : (
                <div className="selected-photo" data-testid="card-selected-photo">
                  <div className="photo-preview">{previewUrl && <img src={previewUrl} alt="Selected nutrition label" data-testid="img-label-preview" />}<span className="photo-overlay"><Check size={15} /> Photo ready</span></div>
                  <div className="photo-details"><span className="photo-file-icon"><FileImage size={18} /></span><div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} MB · ready to scan</small></div><button type="button" aria-label="Remove selected photo" className="icon-button" onClick={() => chooseFile(null)} data-testid="button-clear-photo"><X size={16} /></button></div>
                </div>
              )}
              {scanError && <div className="inline-message message-error" role="alert" data-testid="status-scan-error"><CircleAlert size={16} />{scanError}</div>}
              {scanSuccess && <div className="inline-message message-success" role="status" data-testid="status-scan-success"><CircleCheck size={16} />{scanSuccess}</div>}
              <button type="submit" disabled={!file || scanLoading} className="button scan-submit" data-testid="button-scan-label">
                {scanLoading ? <><LoaderCircle className="status-spin" size={17} /> Reading label…</> : <><ScanLine size={17} /> Read this label <ArrowRight size={16} /></>}
              </button>
            </form>
            {scanLoading && <div className="scan-progress" role="status" data-testid="status-scan-loading"><span className="scan-progress-line" /><span>Sending your photo for a label read…</span></div>}
            {result ? (
              <div className="result-wrap">
                <div className="result-divider"><span>YOUR LABEL RESULT</span></div>
                <NutritionCard data={result} />
                <div className="add-to-cart-row">
                  <div className="quantity-picker" aria-label="Quantity">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} data-testid="button-result-quantity-minus"><Minus size={14} /></button>
                    <span data-testid="text-result-quantity">{quantity}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)} data-testid="button-result-quantity-plus"><Plus size={14} /></button>
                  </div>
                  <button type="button" className="button add-cart-button" disabled={addingToCart} onClick={addResultToCart} data-testid="button-add-to-cart">{addingToCart ? <LoaderCircle className="status-spin" size={16} /> : <ShoppingBasket size={17} />}{addingToCart ? 'Adding item…' : 'Add to cart'} {!addingToCart && <ArrowRight size={15} />}</button>
                </div>
              </div>
            ) : !scanLoading && (
              <div className="scan-hint"><LockKeyhole size={14} /><span>NutriGo reads the label photo you choose. We don’t fill in missing values.</span></div>
            )}
          </section>

          <section className="cart-panel panel" aria-labelledby="cart-title">
            <div className="panel-heading cart-heading">
              <div className="panel-heading-icon panel-icon-peach"><ShoppingBasket size={19} /></div>
              <div><span className="section-overline">YOUR SHOPPING LIST</span><h2 id="cart-title">Grocery cart <span className="cart-count" data-testid="text-cart-count">{totalItems}</span></h2></div>
              <span className="cart-email" title={email}><span className="email-dot" /> Saved to your account</span>
            </div>
            <div className="cart-content">
              {cartLoading ? (
                <div className="cart-skeleton" data-testid="status-cart-loading"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
              ) : cartError ? (
                <div className="cart-empty-state cart-error-state" data-testid="status-cart-error"><span className="empty-icon"><CircleAlert size={23} /></span><h3>Cart didn’t load</h3><p>{cartError}</p><button className="text-action" onClick={() => {
                  setCartLoading(true);
                  getCart(email).then((items) => { setCart(items); setCartError(''); }).catch((error: unknown) => setCartError(error instanceof Error ? error.message : 'Your cart could not be loaded.')).finally(() => setCartLoading(false));
                }} data-testid="button-retry-cart">Try again <ArrowRight size={14} /></button></div>
              ) : cart.length === 0 ? (
                <div className="cart-empty-state" data-testid="status-cart-empty"><span className="empty-icon"><ShoppingBasket size={23} /></span><h3>Your cart is ready</h3><p>Scan a product label and add the item here. Your list will build as you shop.</p><div className="empty-nudge"><span>Start with a photo</span><ArrowLeft size={15} /></div></div>
              ) : (
                <div className="cart-list" data-testid="list-cart-items">
                  {cart.map((item) => (
                    <article className={`cart-item ${editingId === item.id ? 'cart-item-editing' : ''}`} key={item.id} data-testid={`card-cart-item-${item.id}`}>
                      {editingId === item.id ? (
                        <div className="cart-edit-form">
                          <div className="edit-topline"><span>EDIT CART ITEM</span><button type="button" className="icon-button" onClick={() => setEditingId(null)} aria-label="Cancel editing" data-testid={`button-cancel-edit-${item.id}`}><X size={15} /></button></div>
                          <label className="edit-field edit-name">Item name<input value={String(editDraft.item_name ?? '')} onChange={(event) => changeDraft('item_name', event.target.value)} data-testid={`input-edit-name-${item.id}`} /></label>
                          <div className="edit-nutrition-fields">
                            {(['calories', 'protein', 'carbs', 'fat', 'quantity'] as const).map((field) => (
                              <label className="edit-field" key={field}>{field === 'calories' ? 'Calories' : field === 'protein' ? 'Protein (g)' : field === 'carbs' ? 'Carbs (g)' : field === 'fat' ? 'Fat (g)' : 'Quantity'}<input type="number" min={field === 'quantity' ? 1 : 0} step="any" value={Number(editDraft[field] ?? 0)} onChange={(event) => changeDraft(field, event.target.value)} data-testid={`input-edit-${field}-${item.id}`} /></label>
                            ))}
                          </div>
                          <button className="button edit-save-button" type="button" disabled={savingId === item.id} onClick={() => saveEdit(item)} data-testid={`button-save-edit-${item.id}`}>{savingId === item.id ? <LoaderCircle className="status-spin" size={15} /> : <Check size={15} />} Save item</button>
                        </div>
                      ) : (
                        <>
                          <div className="cart-item-main">
                            <span className="cart-item-mark"><Leaf size={16} /></span>
                            <div className="cart-item-title"><h3 data-testid={`text-cart-item-name-${item.id}`}>{item.item_name}</h3><span>{item.calories} kcal · P {item.protein}g · C {item.carbs}g · F {item.fat}g</span></div>
                            <button type="button" className="icon-button item-edit-trigger" aria-label={`Edit ${item.item_name}`} onClick={() => beginEdit(item)} data-testid={`button-edit-item-${item.id}`}><Pencil size={15} /></button>
                          </div>
                          <div className="cart-item-footer">
                            <span className="quantity-label">Quantity</span>
                            <div className="quantity-picker cart-quantity">
                              <button type="button" aria-label={`Decrease ${item.item_name} quantity`} disabled={item.quantity <= 1 || quantityUpdatingId !== null} onClick={() => adjustQuantity(item, -1)} data-testid={`button-quantity-minus-${item.id}`}>{quantityUpdatingId === item.id ? <LoaderCircle className="status-spin" size={13} /> : <Minus size={13} />}</button>
                              <span data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                              <button type="button" aria-label={`Increase ${item.item_name} quantity`} disabled={quantityUpdatingId !== null} onClick={() => adjustQuantity(item, 1)} data-testid={`button-quantity-plus-${item.id}`}><Plus size={13} /></button>
                            </div>
                            <button type="button" className="remove-button" disabled={deletingId === item.id} onClick={() => removeItem(item)} data-testid={`button-remove-item-${item.id}`}>{deletingId === item.id ? <LoaderCircle className="status-spin" size={14} /> : <Trash2 size={14} />} Remove</button>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {(cartActionError || cartActionSuccess) && <div className={`inline-message cart-feedback ${cartActionError ? 'message-error' : 'message-success'}`} role={cartActionError ? 'alert' : 'status'} data-testid={cartActionError ? 'status-cart-action-error' : 'status-cart-action-success'}>{cartActionError ? <CircleAlert size={15} /> : <CircleCheck size={15} />}{cartActionError || cartActionSuccess}<button className="feedback-dismiss" onClick={() => { setCartActionError(''); setCartActionSuccess(''); }} aria-label="Dismiss message" data-testid="button-dismiss-cart-message"><X size={13} /></button></div>}
              {cart.length > 0 && <div className="cart-footnote"><ShieldCheck size={14} /><span>Cart saved for <strong>{email}</strong></span><ChevronDown size={14} /></div>}
            </div>
            <div className="cart-panel-footer"><Clock3 size={14} /><span>Items stay in your cart until you remove them.</span></div>
          </section>
        </div>

        <footer className="dashboard-footer"><span>NutriGo AI</span><span>Clarity for the everyday shop.</span><Link href="/" data-testid="link-back-home">About NutriGo <ArrowRight size={13} /></Link></footer>
      </div>
    </main>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/dashboard"><Dashboard /></Route>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/login"><Redirect to="/sign-in" /></Route>
        <Route path="/signup"><Redirect to="/sign-up" /></Route>
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Your grocery list is right where you left it.' } },
        signUp: { start: { title: 'Make grocery choices clearer', subtitle: 'A little more know-how, one label at a time.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </ClerkProvider>
  );
}

function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}

export default App;
