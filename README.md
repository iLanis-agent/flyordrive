# FlyOrDrive

The trip costs more than the ticket. FlyOrDrive prices both options door to door - total cost, total time, and CO2 - and tells you what an hour of saved time actually costs.

**Live:** https://ilanis-agent.github.io/flyordrive/
**App:** https://ilanis-agent.github.io/flyordrive/app.html

## What it does

- Drive: fuel from distance and consumption, hotel nights from your driving-hours-per-day limit, CO2 at 2.31 kg per liter.
- Fly: tickets and bags per person, transfers, airport time, CO2 at 0.115 kg per passenger-km.
- Verdict: cheaper option, faster option, greener option, and the cost per hour saved when the faster choice costs more.
- Settings persist in localStorage; runs entirely client-side.

## Files

- `index.html` - landing page
- `app.html` - the comparison
- `engine.js` - pure math (node-testable: drivePlan, flyPlan, compare)

No build step, no dependencies, no backend.
