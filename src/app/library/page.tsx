import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const colors = [
  { name: 'background', value: '#0a0a0a', textClass: 'text-foreground' },
  { name: 'surface', value: '#171717', textClass: 'text-foreground' },
  { name: 'border', value: '#262626', textClass: 'text-foreground' },
  { name: 'foreground', value: '#fafafa', textClass: 'text-background' },
  { name: 'muted', value: '#a3a3a3', textClass: 'text-background' },
  { name: 'muted-dark', value: '#737373', textClass: 'text-background' },
]

export default function LibraryPage() {
  return (
    <main className="px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-2xl font-medium text-foreground mb-2">Library</h1>
      <p className="text-muted mb-12">Design system components and tokens</p>

      {/* Colors */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Colors</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {colors.map((color) => (
            <div key={color.name}>
              <div
                className={`aspect-square rounded-lg border border-border ${color.textClass} flex items-end p-2`}
                style={{ backgroundColor: color.value }}
              >
                <span className="text-[10px] font-mono opacity-70">{color.value}</span>
              </div>
              <p className="text-xs text-muted mt-1.5">{color.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Typography</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-dark mb-1">Inter (sans) - Body</p>
            <p className="font-sans text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-dark mb-1">JetBrains Mono (mono) - Metadata</p>
            <p className="font-mono text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
        </div>
      </section>

      {/* Type Scale */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Type Scale</h2>
        <div className="space-y-3">
          <div className="flex items-baseline gap-4">
            <span className="text-xs text-muted-dark w-16 shrink-0">text-xs</span>
            <span className="text-xs text-foreground">12px - Labels, metadata</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-xs text-muted-dark w-16 shrink-0">text-sm</span>
            <span className="text-sm text-foreground">14px - Body text, buttons</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-xs text-muted-dark w-16 shrink-0">text-base</span>
            <span className="text-base text-foreground">16px - Large body</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-xs text-muted-dark w-16 shrink-0">text-lg</span>
            <span className="text-lg text-foreground">18px - Subtitles</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-xs text-muted-dark w-16 shrink-0">text-2xl</span>
            <span className="text-2xl text-foreground">24px - Section headers</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-xs text-muted-dark w-16 shrink-0">text-3xl</span>
            <span className="text-3xl text-foreground">30px - Page titles</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-xs text-muted-dark w-16 shrink-0">text-4xl</span>
            <span className="text-4xl text-foreground">36px - Hero text</span>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Buttons</h2>

        <div className="space-y-6">
          {/* Variants */}
          <div>
            <p className="text-xs text-muted-dark mb-3">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-xs text-muted-dark mb-3">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* States */}
          <div>
            <p className="text-xs text-muted-dark mb-3">States</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Inputs</h2>
        <div className="grid gap-4 max-w-sm">
          <Input placeholder="Default input" />
          <Input label="With label" placeholder="Enter text..." />
          <Input label="With error" placeholder="Invalid input" error="This field is required" />
          <Input placeholder="Disabled" disabled />
        </div>
      </section>

      {/* Skeleton */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Skeleton</h2>
        <div className="space-y-3 max-w-sm">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </section>

      {/* Card */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Card</h2>
        <div className="max-w-xs">
          <div className="relative aspect-video w-full rounded-[6px] hover:ring-1 hover:ring-white/[0.08]">
            <div className="absolute inset-0 overflow-hidden rounded-[6px] bg-surface" />
          </div>
          <div className="flex items-center justify-between pt-[14px] pb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Company</span>
              <span className="text-xs text-foreground">Video Title</span>
            </div>
            <span className="text-xs text-muted font-mono">1:32</span>
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1 border border-white/40 rounded-full text-foreground">Tag Style A</span>
          <span className="text-xs px-3 py-1 border border-border rounded-full text-muted">Tag Style B</span>
          <span className="text-xs px-3 py-1 bg-surface rounded-full text-muted">Tag Style C</span>
        </div>
      </section>
    </main>
  )
}
