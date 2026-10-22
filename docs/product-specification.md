# YourTrip: Product Specification & Requirements

## Core Philosophy
> **"AI should assist the traveler, not make the decisions for the traveler."**
> The user should always remain in control.
> The application should recommend, compare, explain, calculate, organize, and adapt, but should never silently make important decisions for the user.

---

## 1. Product Concept: The Personal Trip Operating System

When people travel, they currently have to juggle numerous fragmented tools:
- **Google Maps** for routes
- **Weather apps** for forecasts
- **Booking platforms** for hotels
- **Food platforms / TripAdvisor** for restaurants
- **Splitwise** for expenses
- **WhatsApp** for group coordination
- **Google Photos** for photos
- **Notes / Notion** for itineraries
- **Search engines** for places
- **Rental platforms** for vehicles
- **Separate websites** for tourist attractions and monuments

*YourTrip* unifies these into one cohesive web platform functioning as a **Personal Trip Operating System** across three distinct phases:

### Before the Trip
- Plan the trip with progressive personalization
- Build an interactive, flexible itinerary
- Estimate and categorize budget
- Find places, curated stays, and local food with dietary filters
- Compare transport options (Cab vs. Bus vs. Rentals)
- Understand weather and receive intelligent packing/wardrobe suggestions

### During the Trip
- Follow the live itinerary with bi-directional map synchronization
- Modify the itinerary seamlessly when delays occur
- Skip, replace, or shift activities with explicit cascade options
- Track expenses, split costs across members, and calculate debt settlements
- Timed, privacy-controlled location sharing
- Activity-tagged photo sharing
- Discover nearby places and adapt the plan dynamically

### After the Trip
- Review what was actually done vs. what was planned (**Planned vs. Actual**)
- Review and finalize expenses and group settlements
- Access photos organized by day and activity
- Maintain long-term trip history
- Export clean, printable, tabular vector PDFs
- Reuse trip information and templates for future travel

---

## 2. Platform Requirements
- **Web Application First:** No mandatory mobile application download or app store installation.
- **Zero Friction:** Open website $\rightarrow$ Enter trip details $\rightarrow$ Start using immediately.
- **Responsive Across Form Factors:** Desktop, Laptop, Tablet, and Mobile browsers.
- **Mobile Web Ergonomics:** Mobile browser usage is primary during travel. It must feel as smooth and fluid as a native app (touch targets, bottom sheets, bottom navigation docks).
- **PWA Ready:** Clean service worker architecture so installability remains optional.

---

## 3. Zero Mandatory Signup / Guest Mode
- **Guest mode is a first-class citizen**, not a crippled demo.
- Guest users can:
  - Create trips and build dynamic itineraries
  - Explore places and view transparent AI recommendations
  - Compare transport, stays, and dining
  - Check weather and packing recommendations
  - Manage budgets and add multi-payer expenses
  - Modify and reschedule itineraries
  - Export printable tabular PDFs
- **Local Persistence:** Local-first architecture using Zustand and `IndexedDB`. Data survives tab reloads and browser restarts.
- **Signup Philosophy:** *"Signup is a benefit, not a barrier."* Account creation is only encouraged for permanent cloud sync, cross-device access, and recovery.

---

## 4. Initial User Experience & Progressive Personalization
- **No 20-question questionnaires.**
- Ask only 4 essentials upfront:
  1. Destination
  2. Travel Dates
  3. Number of Travelers
  4. Approximate Budget per Person
- Instantly generate a functional baseline trip workspace.
- Allow optional refinements progressively (*"Want to personalize this?"*):
  - Trip style (Relaxed, Adventure, Food, Culture, Romantic, Backpacking, etc.)
  - Food preferences (Vegetarian, Vegan, Non-Veg, Spice levels, Local specialties)
  - Accommodation and transit preferences.

---

## 5. Main Trip Workspace Architecture
Centralized command center for the entire trip:
1. **Overview / HUD:** Next up countdown, today's weather glance, budget burn-rate gauge.
2. **Itinerary:** Time, travel legs, activity cards, cascade resolution.
3. **Map:** Interactive spatial canvas synchronized with itinerary cards.
4. **Explore:** Attractions, curated stays, and dining options.
5. **Transport & Rentals:** Side-by-side cost vs. time vs. comfort matrix.
6. **Budget & Splitwise:** Multi-payer ledger and debt minimization graph.
7. **Packing & Wardrobe:** Weather-adaptive clothing suggestions and checklists.
8. **Group & Photos:** Timed location sharing and photo rolls grouped by activity.
9. **Reality Check & What-If:** Feasibility audit and hypothetical scenario sandbox.
10. **PDF Studio:** High-contrast tabular export with revision drift detection.

---

## 6. The Dynamic Itinerary & User Ownership
- The itinerary is **interactive and user-controlled**, never a static AI brochure.
- Every activity item provides:
  - Time slot (planned vs. actual)
  - Duration and recommended visit duration
  - Travel time and transit mode from previous stop
  - Estimated cost
  - Crowd and opening hours where available
  - Weather forecast
  - Explainability badge: *"Why is this recommended at this time?"*
- **Strict User Control:** The application must **never silently rearrange activities**.

---

## 7. Real-Life Changes & The Cascade Resolver Engine
When real travel happens (waking up late, lingering at lunch, rain, heavy traffic):
- User adjusts time (e.g., shifts Activity A by +45m).
- Cascade engine detects downstream overlapping items.
- UI flags: *"3 activities affected."*
- UI provides explicit choices:
  - **Option A:** Shift all subsequent activities by +45m.
  - **Option B:** Shorten the delayed activity to keep the remaining schedule intact.
  - **Option C:** Move conflicting activities to the next day.
  - **Option D:** Remove/skip intermediate activities.
  - **Option E:** Manual fine-tuning.
- The user chooses what happens.

---

## 8. Planned vs. Actual Tracking
- Keeps planned schedule intact while recording actual execution times and notes.
- Enables post-trip comparison: What was planned vs. how it actually unfolded.

---

## 9. What-If Scenario Sandbox
- Allows testing hypothetical questions:
  - *"What if we increase the budget to ₹25,000?"*
  - *"What if it rains tomorrow?"*
  - *"What if we start at 11:00 AM instead of 9:00 AM?"*
  - *"What if we don't rent a scooter?"*
- Calculates impact on an immutable sandbox fork.
- Shows side-by-side diff: User explicitly clicks **"Apply Changes"** or **"Discard"**.

---

## 10. Data Provenance & Trust Labeling
Never fabricate live data. Every data point in the UI carries an explicit tag:
- 🟢 **LIVE:** Connected to a real-time data source.
- 🟡 **ESTIMATED:** Calculated via standard algorithms.
- 🔵 **AI RECOMMENDED:** Generated with an explainability tooltip.
- 🟣 **USER ENTERED:** Input directly by travelers.
- ⚪ **UNAVAILABLE:** Transparently noted when APIs are disconnected.

---

## 11. Budget Management & Group Expense Splitting
- Visual burn-rate gauges: Planned Budget vs. Estimated vs. Actual Spending vs. Remaining.
- Categories: Stays, Food, Transport, Activities, Shopping, Rentals, Other.
- Group Splitwise ledger:
  - Multi-payer expense logging (e.g., *Hotel ₹8,000 paid by Madhav; Cab ₹1,200 paid by Rahul*).
  - Split options: Equal, exact, or percentage.
  - Debt simplification algorithm to minimize repayment transactions.

---

## 12. Privacy-Conscious Group Collaboration
- Shareable links with granular permissions (`VIEW_ONLY`, `CAN_EDIT`, `OWNER`).
- Optional live location sharing with strict time-bounds (30 minutes, 2 hours, or manual stop).
- Never track location passively or continuously in the background.

---

## 13. PDF Export & Revision Snapshot Tracking
- Clean, table-based, high-contrast, printable vector PDF.
- Columns: Time, Activity, Location, Travel Time, Transport, Cost, Notes.
- Snapshot tracking: Flags if itinerary changes have been made since the last export:
  *"Itinerary changed since last export on Nov 15. [Export Updated PDF]"*.

---

## 14. Visual Design & Kinetic Animation System
- **No generic AI neon blue/purple gradients.**
- Warm, cinematic, travel-oriented aesthetic: Terracotta, Deep Slate, Sandstone, Sunset Amber, Forest Emerald.
- **Purposeful animations:** Movement, travel routes, timeline spring physics, number odometer tickers, and card-to-map camera transitions.
- Full support for `prefers-reduced-motion`.
