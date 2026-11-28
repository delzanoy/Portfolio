# Kushari — Design, Interaction & Motion Review

**Reviewed:** 21 Nov 2026 · **App:** https://kushari-next.onrender.com (live, demo mode) · **Reviewer:** Claude, with Delanoy Kunil · **Revision:** 2 (after a full click-through)

> **For the Claude project picking this up:** this is the starting brief for taking Kushari forward. Findings have IDs (`K-01`…) so tasks and commits can reference them. Each has what was observed, why it matters, a recommendation and a "done when" check. Severity: 🔴 critical (fix before anyone sees it) · 🟡 moderate · 🟢 minor.

---

## 1. Context

**What Kushari is:** a crypto treasury tool for teams. It brings MPC vaults, Gnosis Safe multisigs and tracked wallets into one workspace. Outgoing transfers go through multi-party approvals governed by per-vault policies. Delanoy designed and built it solo, after the agency client project it's based on (Koshance) didn't launch.

**Who it's for right now:** hiring managers and designers viewing it from Delanoy's portfolio. Kushari is the lead case study. The bar is "credible to a crypto/fintech product team in two minutes of clicking".

**Product decisions to respect (confirmed by Delanoy):**
- **Desktop only.** Kushari isn't designed for phones, so mobile is out of scope.
- **Hashes are deliberate.** Transaction hashes and addresses are shown for transparency where they help verification. Saved addresses should show as names in transactions.
- **Demo mode is safe to click.** Nothing in demo mode has real effects.

**What's next:** the portfolio case study is moving to a **tile grid, one idea per tile**, each tile a short clip of the real product. The clips will be **captured automatically** (a Playwright script drives the app, frames are encoded to WebM), not recorded by hand. So the app's interactions and motion *are* the case study.

**What was covered (desktop, 1440×900):**
- **Screens:** Wallets, Vault detail (`/wallets/1`, including the Policy tab), Assets, Transactions, Proposals (all three tabs, "Show my actions", Filter), Addresses, Groups, Design Tokens and Motion System.
- **Proposal flows:** Review proposal → Approve → 2FA → Confirm; Reject → 2FA.
- **Transfer flow:** Propose transfer (Source → Recipient → Review), stopped before submitting.
- **Wallet modals:** Connect Safe, Track wallet, Create Vault.
- **Motion:** modal-open animation measured frame by frame.

**Not covered:**
- Export CSV and Make deposit
- Submitting Propose transfer
- Address-book and group creation
- Execution of a fully-approved transfer, since none was available with all approvals

---

## 2. Summary

The product has more depth than a first look suggests:
- **Policies:** a per-vault Policy (3 of 6 approvers, a $5,000 per-transaction limit, network and asset limits).
- **Proposing:** a staged Propose transfer flow.
- **Approving:** an approval flow with signer states and a 2FA confirm step.
- **Motion:** a documented motion system built on Framer Motion.

The design thinking is there. What lets it down is **integrity of the demo**:
1. **Create Vault crashes the app** (K-01).
2. **Review proposal shows the same hardcoded recipient, note and gas for every proposal** (K-22). The list doesn't update after you approve (K-23).
3. **The demo data uses real public figures and contradicts itself** (K-02, K-03).
4. **The rules aren't connected:** the policy limit, the approvers and the "ready to execute" state don't agree with one another (K-24 to K-26).
5. **The motion system is documented but only partly used** in the product (section 6).

The **top five actions**:
1. Fix the K-01 crash.
2. Bind the proposal modal to real row data (K-22).
3. Write a coherent, invented seed dataset (K-02, K-03).
4. Make policy, approvals and execution one connected story (K-24 to K-26).
5. Apply the existing motion tokens to the trust moments (section 6).

---

## 3. Findings

### 3.1 Stability and data binding

#### K-01 🔴 Create Vault crashes the app
- **Seen:** Wallets → **Create Vault** replaces the whole app with "Application error: a client-side exception has occurred". It reproduces every time.
- **Console:** `Uncaught TypeError: Cannot read properties of undefined (reading 'length')` inside an `Array.map` while rendering. A list the form expects is undefined on first render.
- **Why it matters:** it's the first creation action on the landing screen, and a reviewer's first click can be a crash.
- **Recommendation:** default the list to `[]` and handle loading. Add an error boundary around modals, so a failure shows a message instead of killing the app. Add a smoke test that opens every modal.
- **Done when:** Create Vault opens and can be completed or cancelled, and an error inside any modal no longer blanks the app.

#### K-22 🔴 Review proposal shows hardcoded details
- **Seen:** opening different proposals always shows:
  - **Recipient:** Charles Hoskinson (`0xb424…52135`)
  - **Note:** "Payroll for the month of Feb."
  - **Source address:** `0x91C5…D057F1`
  - **Gas:** `0.0000000041 Eth`, whether the chain is Polygon or Solana

  This holds even when the list row shows a different recipient (Cheng Xue, Abigail Johnson). Only the proposer, amount, asset, chain and classification change.
- **Why it matters:** the review screen is the heart of the product. Reviewers compare the row with the detail, and when they don't match, they stop trusting everything else.
- **Recommendation:** bind every field to the proposal's data. Show gas in the chain's native token.
- **Done when:** every field in the modal matches its row, for every proposal.

#### K-23 🟡 Approving doesn't update the list, and Approve stays visible
- **Seen:**
  - After Approve → Confirm, the modal shows "Delanoy Kunil ✓ Approved via 2FA, 1/4 confirmed". Good.
  - But the Approve and Reject buttons stay visible after you've approved.
  - The row in the list still says "Action required" after closing.
- **Recommendation:** after your approval, swap the actions for your status ("You approved · waiting on 3 others") and update the row status and the tab counts straight away.
- **Done when:** the list, the tab counts and the modal all agree right after an approval.

#### K-24 🟡 "Ready to execute" doesn't look ready
- **Seen:**
  - Items in **Ready to execute** open with 0/4 or 0/6 confirmed and still offer Approve/Reject. There's no Execute action.
  - The statuses "Awaiting nonce", "Executing", "Failed" and "Ready" mix technical states with user states.
  - "Failed" items give no reason and no retry.
- **Recommendation:**
  - A ready item should show approvals met (e.g. 3/3 ✓) and one primary **Execute** action.
  - Write statuses for people: "Ready to send", "Sending…", "Failed — insufficient gas · Retry".
  - Keep the technical detail (nonce, hash) in a details row, for transparency.
- **Done when:** a ready proposal can be executed end to end in demo mode, and a failed one says why and offers a retry.

#### K-25 🟡 Counts disagree
- **Seen:**
  - The Ready to execute tab badge says **6**, while the list says "Showing 1–25 of **30** proposals". "Show my actions" then shows 6.
  - In Review proposal, the source wallet reads **0/4** while the approvals header reads **0/6 confirmed**.
- **Recommendation:** derive every count from one source. Show the threshold from the vault's policy (e.g. "0 of 3 required · 6 approvers").

### 3.2 Policy and rules

#### K-26 🟡 The policy exists, but proposals ignore it
- **Seen:**
  - **Advertising → Policy:** "Requires 3 of 6 approvers" (Delanoy, Sandeep Nailwal, Elon Musk, Robert Kiyosaki, Donald Trump, Brian Armstrong), a **$5,000 limit per transaction**, network limits, and blocked assets (OKB, Filecoin, NEAR).
  - Yet that vault has proposals of $4.6M and more, with no flag.
  - The signers shown in proposals (Zhao Yan, Christy Walton, Diane Hendricks…) aren't the policy's approvers.
- **Why it matters:** policy-driven approvals are Kushari's strongest differentiator, and the case study claims a "unified policy & signature layer". Right now it's a settings page that has no visible effect.
- **Recommendation:**
  - **Show the policy where decisions happen.** In Review proposal, add a line like "Policy: 3 of 6 approvers · limit $5,000". Flag breaches: "Exceeds limit — needs admin override", or route over-limit transfers to more approvers.
  - **Enforce it in Propose transfer:** the form already shows "Limit per transaction: $5,000". Warn or route when the amount goes over.
  - **Keep approvers consistent:** the people who sign must be the policy's approvers.
- **Done when:** every proposal shows the policy that governs it, and over-limit amounts are visibly handled.

### 3.3 Demo data and content credibility

#### K-02 🔴 Demo data uses real public figures
- **Seen:** these real names appear as proposers, approvers, policy members and group editors:
  - Vitalik Buterin, Brian Armstrong, Charles Hoskinson
  - Donald Trump, Vladimir Putin, Elon Musk
  - Robert Kiyosaki, Christy Walton, Nancy Walton Laurie
- **Why it matters:** it reads as a joke or as political, and it attaches real people to payments. For a portfolio piece that's a reputational risk that adds nothing.
- **Recommendation:** use an invented cast with believable roles, for example a finance lead, an ops manager, two approvers and a contractor. Keep "Delanoy Kunil (You)" as the admin.
- **Done when:** no real public figure appears anywhere.

#### K-03 🔴 Demo data contradicts itself
- **Seen:**
  - Every row in **Addresses** has the same address (`0x0688bd1b30b41ff24409454ad7068b5da459e2ed`), and "Delanoy Kunil" is listed twice.
  - DOT is sent on **Polygon**, and SOL on **Solana**, with gas shown in **ETH**.
  - ETH 1,562.83 is shown as worth **$1,537.98**, which puts ETH at about $1.
  - The same note, "Payroll for Feb", sits on proposals classified as Customer Refund, Travel Expenses and Community Grants.
  - Many outgoing amounts are **$0.00**. The Funding tracked wallet ($224M) dwarfs all the vaults.
  - The "Interacted" transaction type isn't explained.
- **Recommendation:** write one **seed dataset** as a single source of truth. Its wallets, chains, assets, people, policies, proposals and transactions should all reference each other consistently. Keep amounts plausible for a mid-size team treasury, within the policies. Make it deterministic, so the same data loads every time; automated capture depends on this.
- **Done when:**
  - Every asset is valid on its chain, and gas uses the chain's native token.
  - Prices are plausible, notes match classifications, and addresses are unique per contact.

#### K-04 🟡 Saved contacts sometimes still show as hex
- **Product intent:** saved addresses show as names; hashes appear where transparency needs them.
- **Seen:**
  - In the Proposals list, the row whose detail shows recipient **Charles Hoskinson** (a saved contact) shows `0x60A3Ae3Af49139bB…` in the To column.
  - Most counterparties in the demo data are unsaved, so hex dominates the Transactions and Proposals tables.
- **Recommendation:**
  - Resolve names consistently in lists and details.
  - Seed the address book so most counterparties are known. A few unknown ones then become a deliberate story ("Unknown address — add to address book?").
  - Keep full hashes behind a copy or "view on explorer" affordance.
- **Case-study wording:** the "0% raw hex" claim overstates the intent. Prefer "**Names first, hashes for verification**".

#### K-05 🟡 Copy that doesn't say anything
- **Seen:**
  - Connect Safe's subtitle is "Improve your multi-sig experience". Track wallet's is "Build visibility by tracking your wallets".
  - The proposal statuses "No action", "Actioned" and "Action required" are ambiguous: whose action?
- **Recommendation:**
  - Write subtitles that say what happens, for example "Link an existing Safe so its balances and approvals show up here".
  - Phrase statuses from the viewer's side: **Waiting on you**, **You approved**, **Waiting on 2 others**, **Ready to send**.

### 3.4 Forms in a demo (validation)

> **Should a demo validate forms at all? Viewers will type random data.**
> Don't block them, but don't drop the checks either. In Kushari, the checks *are* the product: "is this address safe?", "does this exceed policy?" and "has 2FA been confirmed?" are what the case study sells. Make the checks **demo-friendly**:
> - **Pre-fill or suggest valid values,** so exploring is easy. Track wallet already does this with "Use 0xda8…".
> - **Prefer soft warnings to hard stops** for typed data: "This doesn't look like an Ethereum address".
> - **Keep the showcase checks visible,** such as the policy limit, the unknown-address warning and 2FA. Make them easy to pass in demo mode, for example "Demo: any 6 digits".
> - **Label demo shortcuts,** so viewers understand them as deliberate choices, not missing work.

#### K-27 🟡 Gaps in the Propose transfer form
- **Seen (Source → Recipient → Review):**
  - **Asset list isn't filtered by network:** with Ethereum selected, the list still offers SOL, XRP, ZEC and GRAM.
  - **Gas unit:** the network picker shows BSC gas in ETH.
  - **No address-book search:** the recipient field says "Search or paste address", but typing a saved name ("Bla…") brings up no suggestions.
  - **Invalid input reaches Review:** Review accepted the address "Bla", and an amount I typed didn't appear in the token field.
  - **No summary before submitting:** the Review step asks for a comment and a classification, but never shows "You're sending X USDT ($Y) to Z, needs 3 approvals".
- **Recommendation:**
  - Filter assets by the chosen network.
  - Suggest address-book matches as you type.
  - Warn softly on invalid input.
  - Make Review a real summary: amount, recipient (name and short address), network fee, the policy check, and who must approve.
- **Done when:** someone can propose a transfer in demo mode, and the Review step reads like a confirmation they'd trust.

#### K-11 🟢 Submit buttons look enabled when the form is empty
- **Seen:**
  - "Track wallet" is a full-width teal button with the fields empty.
  - "Confirm approve" accepted an **empty 2FA code**.
- **Recommendation:** in demo mode, accept any 6-digit code but still need *something*, and say so: "Demo: any 6 digits". That keeps 2FA as a visible trust step.

#### K-28 🟢 Reject has no reason and no destructive styling
- **Seen:** Reject → 2FA → "Confirm reject". There's no reason field, and the confirm button looks the same as "Confirm approve".
- **Recommendation:** ask for a reason (shown to the proposer), and give the confirm button a destructive style.

### 3.5 Usability

#### K-06 🟡 Approve and Reject have equal weight
- **Seen:** in Review proposal, Reject and Approve are identical outlined buttons side by side.
- **Recommendation:** make Approve the primary button and Reject a secondary destructive style, kept apart.

#### K-07 🟡 Escape doesn't close modals
- **Seen:** Escape does nothing in **Review proposal** or **Connect Safe**.
- **Recommendation:** use one shared modal: close on Escape, close on a backdrop click (unless the user is mid-signing), trap focus inside, and return focus to whatever opened it.

#### K-08 🟡 Key actions aren't buttons
- **Seen:** "Create Vault", "Connect Safe", "Track Wallet", "Approve" and "Reject" are generic elements, not `<button>`s. The data tables are built from `div`s, with no table semantics.
- **Recommendation:** use real buttons with visible focus. Give tables `role="table"` (or real `<table>` markup). Make rows focusable, opening on Enter.

#### K-09 🟡 Assets lists the same token once per wallet
- **Seen:** Ethereum appears twice and Solana three times, as one row per wallet holding it.
- **Recommendation:** group by token, showing total holdings and value, and expand a row to see the wallets inside. Keep the per-wallet view as a toggle.

#### K-10 🟡 Empty vault isn't designed
- **Seen:** the Marketing vault shows a greyed "$0.00" and "0.00%".
- **Recommendation:** add an empty state, for example "No funds yet" with a Make deposit action. Hide the 24h change when there's nothing to compare against.

#### K-12 🟢 Hover-only actions on vault cards
- **Seen:** the QR (receive) and send icons appear on hover, unlabelled. Clicking near them opens the vault page instead, so the targets are easy to miss.
- **Recommendation:** add tooltips ("Receive", "Send"), make the targets bigger, and stop clicks on them from also opening the card.

#### K-29 🟢 Two tab systems side by side on the vault page
- **Seen:** the vault page has a "Proposals" group (Needs approval / Ready / Discarded) sitting next to separate tabs for Assets, Transactions and Policy. It reads as one row of tabs but behaves as two.
- **Recommendation:** use one top-level tab row (Proposals · Assets · Transactions · Policy), with the proposal states as a secondary filter inside Proposals.

### 3.6 Visual hierarchy and layout

#### K-13 🟡 Wallets amounts don't line up
- **Seen:** balance figures in the Gnosis Safe and Tracked wallet rows sit at different horizontal positions.
- **Recommendation:** right-align amounts in a fixed column across all rows and sections.

#### K-14 🟢 The currency sign is nearly invisible
- **Seen:** the "$" is tiny and grey next to large balances.
- **Recommendation:** raise the sign's contrast and size, or move the currency into the label.

#### K-15 🟢 Faint section labels; half-empty landing screen
- **Seen:** the "VAULTS", "GNOSIS SAFE" and "TRACKED WALLETS" labels are very low contrast. On Wallets, the content ends about 40% of the way down a 900px screen.
- **Recommendation:**
  - Raise the labels' contrast.
  - Use the space for a treasury summary, such as total balance, **pending approvals waiting on you** and recent activity. That answers "what needs my attention?" and gives a strong first tile.

### 3.7 Consistency

| ID | Element | Issue | Recommendation |
|---|---|---|---|
| K-16 🟡 | Number format | Wallets uses thousands separators; Proposals and Transactions don't ($4613863.19). Prices show 6 decimals ($1,690.382981). | One money formatter everywhere: separators always, 2 decimals for fiat, sensible precision for tokens. |
| K-17 🟡 | Modal placement | Connect Safe and Propose transfer are pinned near the top with a side stepper; Track wallet is centred. | Use one modal system. A stepper layout for multi-step flows is fine, but make the size and position deliberate. |
| K-18 🟢 | Demo mode toggle | It showed **on** on some pages and **off** on others in the same session. | Keep its state global, and say what demo mode changes. |
| K-19 🟢 | Classification chips | Long labels are cut off ("Product Develop…"). | Use shorter category names, or show the full name on hover. |
| K-20 🟡 | Design system site | It's branded "Token Docs / Tokens Archive / Token ecosystem", not Kushari, with very low contrast. | Rebrand it as Kushari, match the app's type and colour, and fix the contrast. It's linked from the case study. |

### 3.8 Accessibility
- **Contrast:**
  - The section labels, secondary table text, placeholders (search, comment, 2FA) and the design-system site are likely below WCAG AA's 4.5:1. Measure them and fix.
  - Red and green carry the 24h change; that passes only because the arrows are there too. Keep the arrows.
- **Keyboard and semantics:** see K-07 and K-08.
- **Reduced motion:** the app has no `prefers-reduced-motion` handling (no CSS rules for it). Framer Motion's `useReducedMotion` or `MotionConfig reducedMotion="user"` would cover the JS-driven animations.
- **Target sizes:** the icon buttons (close, QR, send) look about 24–28px. Aim for at least 32px on desktop.

---

## 4. Case-study claims vs the live app

| Claim on the case study | What the app shows today | Action |
|---|---|---|
| "0% Raw Hex — Humanized Intent" | Names resolve for saved contacts in some places, not consistently (K-04). Hashes are intentional for transparency. | Reword to "Names first, hashes for verification"; fix K-04 |
| "Motion v2 — Spring Physics" | A full motion system is documented (6 transitions, 3 springs, 10 variants, 8 interactions). Modals animate. Hovers, lists, approvals and amounts mostly don't. | Section 6 |
| "6 Spatial Flows — Interactive Inspector" | The old flow grid had 1 module; it's now replaced by the tile grid | Drop or rewrite |
| "100% Custom — Zero UI kit lock-in" | Plausible, but the design-system site is branded "Token" | K-20 |
| "Unified policy & signature layer" | Policies exist per vault (approvers, a limit, network and asset rules) but aren't enforced or shown in proposals | K-26 |

---

## 5. What works well (keep)
- **Policy model:** per-vault approvers (3 of 6), a per-transaction limit, network restrictions and blocked assets. That's a serious treasury model, ready to be surfaced.
- **Propose transfer:**
  - A 3-step stepper (Source → Recipient → Review); finished steps lock and fade.
  - Approvers are shown up front, and gas is shown per network in the picker.
  - The policy limit sits inline, "Pay to few" and "Mass transfer" are separate modes, and Continue stays disabled until the step is valid.
- **Approval flow:**
  - Signer avatars with live states, and a confirmed counter.
  - A separate confirm step with 2FA.
  - "Approved via 2FA" is written into the record. Excellent trust design: make it the hero tile.
- **Information architecture:**
  - The sidebar groups are clear, with vault detail behind each card and breadcrumbs.
  - "Accounting: Coming soon" sets expectations honestly.
- **Data typography:** mono figures with smaller decimals; red and green 24h change with arrows.
- **Connect Safe:** a stepper (Connect wallet → Locate safe → Assign owners).
- **Reviewer conveniences:** the Demo mode toggle, the ⌘K hint in search, "Show my actions", nested filters, and Export CSV.
- **The motion system docs:** clear presets, a duration philosophy (imperceptible, perceptible, dramatic) and spring anatomy. The groundwork is done.

---

## 6. Motion: apply the system that already exists

**What exists (from `/designsystem/motion`):**
- **Transitions:** `fast` 150ms, `standard` 200ms, `smooth` 300ms, `gentle` 500ms, `slow` 800ms, `page` 500ms.
- **Springs:** `spring` (500/30/0.7), `springBouncy` (400/15/1), `springStiff` (700/40/0.5).
- **Variants:** `fadeIn`, `slideUp`, `slideUpSm`, `scaleIn` (0.95 → 1)…
- **Library:** Framer Motion.

**What the product does (measured):**
- **Modal open:** the backdrop fades over about 180ms, and the panel scales from **0.76 → 1** while fading in, settling at about 400ms. That's much larger than the documented `scaleIn` of 0.95 → 1, so it reads as a "zoom" rather than a quiet entrance. Use `scaleIn` + `smooth`.
- **Elsewhere:** CSS hover and selection states mostly change instantly (78 of 80 interactive elements had no CSS transition). I saw no animated feedback when approving (list and counts don't move), on tab switches, or on balance updates. The Approve → 2FA step wasn't measured.

**The gap is adoption, not design.** Map the trust moments to existing tokens:

| # | Moment | Behaviour | Token |
|---|---|---|---|
| M1 | **Signature lands** (hero tile) | The approver's avatar fills with a check; the counter ticks up ("2 of 3"); a progress segment fills. At threshold, the status becomes "Ready to send" with one soft highlight. | `spring` for the check, `standard` for the counter |
| M2 | Modal open / close | Use the documented `scaleIn` (0.95), not 0.76. Exit faster than entry. | `scaleIn` + `smooth` in, `fast` out |
| M3 | Approve → 2FA step | The 2FA field expands in place (height animation); focus moves to it. | `smooth` |
| M4 | List reacts to an approval | The row's status chip cross-fades to "You approved"; tab counts tick. | `standard` |
| M5 | Balance updates | Digits roll on a price refresh; the 24h change flashes briefly. Tabular numbers, so nothing shifts. | `gentle` |
| M6 | Vault card hover | The card lifts with a border highlight; receive and send fade in with tooltips. | `fast` |
| M7 | Tab switch | An underline indicator slides; the list cross-fades. | `springStiff` + `standard` |
| M8 | Execute transfer | Signing, then sending, then confirmed, as a 3-step progress, ending on a success state with a "View on explorer" link (the hash, for transparency). | `standard` per step |
| M9 | Policy check in Review | When an amount exceeds the limit, a policy row slides in: "Over $5,000 limit — needs admin approval". | `slideUpSm` |
| M10 | Unknown recipient | The field gets a gentle pulse: "Unknown address — add to address book?". | `springBouncy`, one cycle |

**Implementation:**
- Import the presets from the design-system module instead of writing animations inline.
- Wrap the app in `<MotionConfig reducedMotion="user">`.
- Move CSS hover states onto the `fast` timing (150ms).

---

## 7. Preparing for automated capture (tiles)

1. **Deterministic demo mode:** a fixed seed dataset (K-03), frozen prices during capture, and fixed "now" timestamps.
2. **Stable hooks:** add `data-capture` attributes on the elements each flow touches: the approve button, signer avatars, vault cards, Propose transfer fields and the policy rows.
3. **Run locally for capture:** `next start` on localhost, which avoids Render cold starts and gives consistent timing.
4. **Capture settings:** a 1440×900 viewport at deviceScaleFactor 2 and real-speed animations, with an optional synthetic cursor. Encode to WebM (VP9) at ~1 MB per 6–10 s loop, with a first-frame poster.
5. **Planned tiles, one idea each:**
   1. Treasury overview
   2. A policy you can read (Policy tab)
   3. Propose a transfer (stepper)
   4. Policy check on an over-limit amount (M9)
   5. Signature lands (M1)
   6. Approve with 2FA (M3)
   7. Names first, hashes for verification (K-04)
   8. Execute and confirm (M8)

---

## 8. Suggested order of work

1. **Stabilise:** K-01, an error boundary for modals, K-22 (bind modal data), K-23 (state sync), and K-07/K-08 (one shared modal component with keyboard support).
2. **Credible data:** the seed dataset (K-02, K-03), then K-04 name resolution, K-16 number formatting and K-05 status wording.
3. **Connect the rules:** K-26 (policy in proposals and transfers), K-24 (an executable ready state), K-25 (counts).
4. **Demo-friendly forms:** K-27, K-11, K-28.
5. **Hierarchy polish:** K-06, K-09, K-10, K-12 to K-15, K-17 to K-20, K-29.
6. **Motion layer:** section 6, using the existing tokens.
7. **Capture setup:** section 7, then generate the tiles for the portfolio.

---

## 9. Open questions for Delanoy
- **Over-limit transfers:** should they be blocked, routed to more approvers, or need an admin override? This decides how M9 and K-26 behave.
- **Design-system branding:** is the "Token" branding on `/designsystem/*` from a template or another project? Rebrand it as Kushari, or keep it separate?
- **"Interacted":** what does this transaction type mean? Contract interactions? It needs a clearer label or a tooltip.
- **2FA in demo mode:** accept any 6 digits, or pre-fill a code?

---

## Appendix A — Routes reviewed
- `/wallets`: vaults, Gnosis Safe and tracked wallets
  - Create Vault (crashes), Connect Safe (3-step), Track wallet
- `/wallets/1`: vault detail
  - Proposal states, Assets, Transactions, Policy
  - Make deposit (not opened), Send tokens → Propose transfer
- `/assets`
- `/transactions/view-all`: Export CSV (not used), Filter, pagination
- `/transactions/proposals`: tabs, Show my actions, Filter (Wallet, Network, Address, Classification, Status)
  - Review proposal → Approve/Reject → 2FA
- `/address-book/addresses`, `/address-book/groups`
- `/designsystem/tokens`, `/designsystem/motion`

## Appendix B — Crash trace (K-01)
```
Uncaught TypeError: Cannot read properties of undefined (reading 'length')
    at $ (/_next/static/chunks/cba1f7b2052f35a8.js:1:18293)
    at /_next/static/chunks/cba1f7b2052f35a8.js:1:22477
    at Array.map (<anonymous>)
    at V (/_next/static/chunks/cba1f7b2052f35a8.js:1:22324)
```
These are minified production chunk names. Reproduce locally in dev mode to get the real component and line.

## Appendix C — Modal open animation (measured)
These are frame samples of opacity and scale after clicking a proposal row:
```
  2ms  backdrop 0.00   panel 0.00 scale 0.765
 49ms  backdrop 0.42   panel 0.34 scale 0.846
 97ms  backdrop 0.72   panel 0.67 scale 0.921
147ms  backdrop 0.93   panel 0.86 scale 0.967
197ms  backdrop 1.00   panel 0.95 scale 0.987
396ms                  panel 1.00 scale 1.000
```
