import { Show } from '@clerk/react';
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  Leaf,
  Salad,
  ScanLine,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
} from 'lucide-react';
import { Link } from 'wouter';
import Brand from '@/components/Brand.jsx';

export default function Landing() {
  return (
    <main className="landing-page">
      <header className="landing-nav page-gutter">
        <Link className="brand-link" href="/" data-testid="link-home-brand"><Brand /></Link>
        <div className="landing-nav-actions">
          <Show when="signed-in">
            <Link href="/dashboard" className="nav-text-link" data-testid="link-dashboard">
              Open my kitchen <ArrowRight size={15} />
            </Link>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="nav-text-link" data-testid="link-sign-in">Sign in</Link>
            <Link href="/sign-up" className="button button-small" data-testid="link-sign-up">
              Get started <ArrowRight size={15} />
            </Link>
          </Show>
        </div>
      </header>

      <section className="landing-hero page-gutter">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> A little more clarity in every aisle</div>
          <h1>Know what’s<br />in your <em>food.</em></h1>
          <p className="hero-subtitle">
            A quick photo turns the nutrition label into something you can actually use — and put straight in your grocery cart.
          </p>
          <div className="hero-actions">
            <Show when="signed-out">
              <Link className="button" href="/sign-up" data-testid="button-start-free">
                Start with a label <ArrowRight size={17} />
              </Link>
              <Link className="button-quiet" href="/sign-in" data-testid="button-sign-in">
                I already have an account
              </Link>
            </Show>
            <Show when="signed-in">
              <Link className="button" href="/dashboard" data-testid="button-open-dashboard">
                Go to your kitchen <ArrowRight size={17} />
              </Link>
            </Show>
          </div>
          <div className="hero-trust">
            <ShieldCheck size={16} /> Your grocery list stays yours. Sign in to keep your cart.
          </div>
        </div>

        <div className="hero-art" aria-label="Illustration of a nutrition label being scanned">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="sun-disc" />
          <div className="leaf-stem leaf-stem-a"><span /><span /><span /></div>
          <div className="leaf-stem leaf-stem-b"><span /><span /><span /></div>
          <div className="hero-scan-card">
            <div className="scan-card-top">
              <span className="mini-brand"><Leaf size={12} /> NUTRITION FACTS</span>
              <span className="scan-bars">|||</span>
            </div>
            <div className="scan-line scan-line-bold" />
            <div className="scan-line scan-line-wide" />
            <div className="scan-divider" />
            <div className="scan-calories"><span>Calories</span><strong>•••</strong></div>
            <div className="scan-line" />
            <div className="scan-line scan-line-mid" />
            <div className="scan-line scan-line-wide" />
            <div className="scan-focus"><ScanLine size={18} /><span>label in focus</span></div>
          </div>
          <div className="hero-sticker sticker-top">
            <span className="sticker-icon"><Sparkles size={16} /></span>
            <span>Clear, not complicated</span>
          </div>
          <div className="hero-sticker sticker-bottom">
            <span className="sticker-check"><Check size={14} /></span>
            <span>Scan. Understand. Add.</span>
          </div>
          <div className="hero-number">01 <span>— the label, decoded</span></div>
        </div>
      </section>

      <section className="landing-ribbon" aria-label="NutriGo in three steps">
        <div className="ribbon-inner page-gutter">
          <span>THE GROCERY RUN, WITH A LITTLE MORE KNOW-HOW</span>
          <div><span>01</span> Photograph the label</div>
          <ArrowRight size={16} />
          <div><span>02</span> See the key numbers</div>
          <ArrowRight size={16} />
          <div><span>03</span> Add it to your cart</div>
        </div>
      </section>

      <section className="landing-story page-gutter">
        <div className="story-kicker">SMALL TOOL. REAL-LIFE USEFUL.</div>
        <div className="story-layout">
          <h2>Because grocery<br />decisions happen<br /><em>in the moment.</em></h2>
          <div className="story-note">
            <span className="note-scribble"><ArrowDown size={24} /></span>
            <p>
              Not a diet plan. Not a lecture. Just a friendly way to read what’s already on the package,
              then keep the things you’re considering together.
            </p>
            <Link href="/sign-up" className="story-link" data-testid="link-try-nutrigo">
              Try NutriGo <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="story-bottom">
          <div className="story-point">
            <span className="point-mark"><Camera size={17} /></span>
            <div><strong>Start with the package</strong><p>Upload a clear photo of its nutrition label.</p></div>
          </div>
          <div className="story-point">
            <span className="point-mark point-mark-peach"><Salad size={17} /></span>
            <div><strong>Keep the useful bits</strong><p>See the values returned for that label.</p></div>
          </div>
          <div className="story-point">
            <span className="point-mark point-mark-yellow"><ShoppingBasket size={17} /></span>
            <div><strong>Build your real cart</strong><p>Save items as you shop, all in one place.</p></div>
          </div>
        </div>
      </section>

      <footer className="landing-footer page-gutter">
        <Brand compact />
        <span>Good choices begin with knowing.</span>
        <Link href="/sign-up" data-testid="link-footer-start">
          Make your next shop a little clearer <ArrowRight size={14} />
        </Link>
      </footer>
    </main>
  );
}
