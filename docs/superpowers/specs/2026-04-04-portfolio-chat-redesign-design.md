# Portfolio Builder Chat Redesign

Redesign the `/chat/[agentId]` page into a split-panel experience: conversational chatbot on the left with clickable predefined options, and a dynamic summary panel on the right that progressively reveals the user's profile, contextual insights, and a final allocation pie chart.

## Agent Response Format

The zeroclaw agent's SKILL.md files are updated so every response is a JSON envelope:

```json
{
  "text": "What's your investment time horizon?",
  "options": ["1-3 years", "3-7 years", "7-15 years", "15+ years"],
  "profile_update": { "time_horizon": "15+ years" },
  "insight": "With 15+ years you can ride out market cycles and compound aggressively.",
  "allocation": [
    { "asset": "Stocks (OGM)", "pct": 55 },
    { "asset": "WETH", "pct": 30 },
    { "asset": "Cash (bIB01)", "pct": 15 }
  ]
}
```

Field rules:

- `text` — always present. The conversational message displayed in the chat bubble.
- `options` — present when the agent is asking a question with predefined choices. Omitted for open-ended follow-ups or the final summary.
- `profile_update` — present when a previous answer resolved a profile fact. Key is the fact name (e.g. `time_horizon`, `risk_tolerance`, `primary_goal`, `emergency_fund`, `strategy`), value is the user's answer. Omitted on the very first question before any answers exist.
- `insight` — present when the agent has a contextual takeaway from the last answer. Omitted when there's nothing meaningful to add.
- `allocation` — present only in the final response. Array of `{ asset, pct }` objects that trigger the pie chart render.

## API Route Changes

File: `app/api/chat/[agentId]/route.ts`

Currently streams raw text chunks character-by-character. Changes:

1. Buffer the full agent response instead of streaming character-by-character. This means the user sees a "Thinking..." spinner until the full response arrives, then the message and options appear together. This is a deliberate tradeoff: structured options require the complete JSON before rendering.
2. Parse the JSON envelope once the response is complete.
3. Send structured parts to the frontend via the UI message stream:
   - A `text-delta` part for the message text.
   - A `data` part containing `{ options, profile_update, insight, allocation }` for the frontend to render as UI elements.

## Frontend Layout

The chat page (`app/chat/[agentId]/page.tsx`) is restructured from a single centered column into a full-width split layout.

### Component Tree

```
ChatPage
├── ChatPanel (left, flex: 1)
│   ├── ChatHeader ("Croisette Advisor" label)
│   ├── MessageList (scrollable)
│   │   ├── AgentMessage (text bubble, surface background, left-aligned)
│   │   ├── OptionPills (clickable pill-shaped choices rendered after agent message)
│   │   └── UserMessage (right-aligned, primary color background)
│   └── ChatInput (free-text input + gradient send button)
│
└── SummaryPanel (right, fixed ~340px width, inverse-surface "engine" background)
    ├── PanelHeader ("Your Profile" label + "Portfolio Blueprint" heading)
    ├── ProfileFacts (progressive reveal — rows appear one by one as answered)
    ├── InsightCard (latest contextual insight, replaced each turn)
    └── AllocationChart (SVG donut pie chart, appears only when `allocation` arrives)
```

### State Management

All state lives in the ChatPage component:

- `profileFacts: Array<{ key: string, label: string, value: string }>` — built up via `profile_update` from each agent response. New facts are appended; existing keys are updated.
- `currentInsight: string | null` — replaced each turn when a new `insight` arrives.
- `currentOptions: string[] | null` — rendered as pills below the latest agent message. Cleared when the user responds.
- `allocation: Array<{ asset: string, pct: number }> | null` — null until the final response. Triggers pie chart render.

### Option Pills Behavior

- Rendered as horizontal flex-wrap row of pill-shaped buttons below the agent's latest message.
- Clicking a pill sends its text as the user's message (identical to typing it and pressing send).
- Once the user responds (via pill click or free text), the option pills for that question are removed from the chat. Only the user's selected answer remains as a right-aligned user message.
- Free-text input is always available at the bottom as an alternative to clicking pills.

### Styling

Follows the Croisette design system (`design/CROISSETE_DESIGN.md`):

- **Chat panel:** Surface background (`#fef8f6`), agent bubbles in surface-container-low (`#f5f0ee`), user bubbles in primary (`#af1c57`) with white text.
- **Option pills:** White background with subtle border, primary background on hover/active. Rounded-full shape.
- **Summary panel:** Inverse-surface (`#32302f`) background. Profile fact rows use `rgba(255,255,255,0.06)` background. Fact values in primary color. Insight card in `rgba(175,28,87,0.1)` tinted background.
- **Input bar:** Surface-container background, no visible border, gradient primary send button (arrow icon).
- **No solid borders** anywhere — use background color shifts per the design system's "No-Line" rule.

## Pie Chart

Pure SVG donut chart — no external library.

- Donut style (hollow center) rendered via SVG circles with `stroke-dasharray` and `stroke-dashoffset`.
- Circumference calculation: `2 * π * radius` with percentage-proportional dash lengths.
- Center label shows "100% Allocated".
- Color palette for slices:
  - Largest slice: Data Pink `#af1c57`
  - Second slice: Warm tan `#d4956a`
  - Third slice: Muted surface `rgba(254,248,246,0.35)`
  - Additional slices (if needed): derive from Croisette palette.
- Legend below the chart: colored dot + asset name + bold percentage, one row per asset.
- Slides in with a CSS animation (fade + translate-up) when `allocation` data first arrives.

## Agent SKILL.md Changes

The `portfolio-allocation` skill (`/.zeroclaw/agents/portfolio-builder-deepseek/workspace/skills/portfolio-allocation/SKILL.md`) and any other conversational skills get a new "Response Format" instruction block:

```markdown
## Response Format
Always respond with a JSON object containing these fields:
- "text": your conversational message (always required)
- "options": array of predefined choices for the user (omit if open-ended)
- "profile_update": object with { "key": "value" } for any profile fact learned from the user's last answer (omit if no new fact)
- "insight": a contextual takeaway sentence about the user's last answer (omit if nothing to add)
- "allocation": array of { "asset": "name", "pct": number } objects (only in your final response with the recommended portfolio)
```

The agent already asks one question at a time per existing skill instructions — this change only structures the output format.

## Mobile Responsiveness

On screens < 768px:

- The summary panel is hidden by default and accessible via a floating "View Profile" button (bottom-right) that slides up a bottom sheet overlay.
- The chat panel takes full width.
- Option pills wrap naturally due to flex-wrap.
- Pie chart scales down proportionally within the bottom sheet.
- When the final allocation arrives, the bottom sheet auto-opens to reveal the pie chart.

## Files to Modify

| File | Change |
|------|--------|
| `app/chat/[agentId]/page.tsx` | Split layout, state management, wire up components |
| `app/_components/chat-box.tsx` | Refactor into ChatPanel with structured message rendering, option pills |
| `app/api/chat/[agentId]/route.ts` | Buffer response, parse JSON envelope, send structured parts |
| `.zeroclaw/agents/portfolio-builder-deepseek/workspace/skills/portfolio-allocation/SKILL.md` | Add JSON response format instructions |
| New: `app/_components/summary-panel.tsx` | Summary panel with profile facts, insight, allocation chart |
| New: `app/_components/allocation-chart.tsx` | SVG donut chart component |
| New: `app/_components/option-pills.tsx` | Clickable pill-shaped option buttons |
