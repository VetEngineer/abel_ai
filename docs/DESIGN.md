# Design System & UI/UX Guidelines - Blog Content Automation Platform

## 1. Design Philosophy
- **Modern & Professional:** Clean, minimalist aesthetic suitable for a professional "SaaS" product.
- **Content-Focused:** The UI should prioritize the content being generated and the workflow status.
- **Trust & Reliability:** Use colors and typography that convey stability and intelligence (AI).
- **Not "AI-Generated":** Avoid generic "robot" imagery or excessive neon/cyberpunk aesthetics unless meaningful. Focus on "Productivity" and "Automation" metaphors.

## 2. Color Palette (Tailwind CSS variables)
We utilize `shadcn/ui`'s CSS variable system with a **Green Jade** theme.

### Light Theme
| Token | HSL Value | Description |
|-------|-----------|-------------|
| `--background` | `150 20% 98.5%` | 매우 맑고 깨끗한 그린빛 화이트 |
| `--foreground` | `160 25% 12%` | 깊은 차콜 그린 |
| `--primary` | `158 45% 42%` | 세련된 제이드 그린 |
| `--secondary` | `150 15% 94%` | 은은한 그린 그레이 |
| `--accent` | `22 75% 58%` | 차분하면서도 생기 있는 테라코타 |
| `--muted` | `150 12% 95%` | 차분한 뮤트 톤 |
| `--destructive` | `0 84% 60%` | Red for errors |

### Dark Theme
| Token | HSL Value | Description |
|-------|-----------|-------------|
| `--background` | `165 25% 6%` | 아주 깊은 어둠 속의 그린 |
| `--primary` | `158 50% 55%` | 어두운 배경에서 빛나는 제이드 그린 |
| `--accent` | `22 70% 62%` | Terracotta accent |

## 3. Typography
- **Font Family:** `Inter`, `Pretendard` (for Korean compatibility), system-ui, sans-serif.
- **Headings:** `font-extrabold`, `tracking-tight` for modern feel.
- **Body:** Generous `leading-relaxed` for readability.
- **Utility Classes:** `.heading-hero`, `.text-subtle`

## 4. Component System (shadcn/ui)
We rely on `shadcn/ui` components for consistency.

### Utility Classes (defined in `globals.css`)
- `.card-enhanced`: Cards with subtle shadow and hover effects.
- `.input-enhanced`: Input fields with focus ring.
- `.btn-primary-enhanced`: Primary buttons with glowing shadow.

### Common Patterns
- **Cards (`Card`):** Used for wrapping agent steps, outputs, and forms.
- **Buttons:** `default`, `secondary`, `ghost/outline` variants.
- **Badges:** To show Agent Status (e.g., "Thinking", "Completed", "Failed").

## 5. Layout & Spacing
- **Container:** `max-w-7xl` centered.
- **Spacing:** Generous padding (`p-6`, `p-8`).
- **Grid:** Responsive grids (e.g., `grid-cols-1 lg:grid-cols-2`).

## 6. Iconography
- Library: `lucide-react`
- Style: Consistent stroke width (2px), rounded caps.

## 7. Motion & Feedback
- **Transitions:** `transition-all duration-200 ease-in-out`
- **Loading States:** Skeletons or spinners.
- **Micro-interactions:** Hover states, pulse animations for active agents.

