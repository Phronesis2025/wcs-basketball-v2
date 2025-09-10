# WCSv2.0 UI Components

## Component List

- **Navbar**: Responsive nav with logo, links, auth state.
  - Props: None yet.
  - Styling: Navy bg, white text, Bebas font, mobile hamburger.
- **Hero**: Full-width section with action shot, CTAs.
  - Props: Image URL, text.
  - Styling: Navy gradient, animated text (Framer Motion).
- **TeamCard**: Preview card for teams.
  - Props: name, age_group, logo_url.
  - Styling: Card layout, navy/red accents.
- **ScheduleCard**: Event preview.
  - Props: date, location, type.
  - Styling: Color-coded (e.g., red for games).

## Design Notes

- Palette: Navy (#1C2526), Red (#D91E18), White (#FFFFFF), Accent (#002C51 light #004080).
- Fonts: Bebas Neue (headings), Inter (body), local TTFs in public/fonts.
- Animations: Framer Motion for Hero fade, TeamCard hover effects.
- Layout: Card-based, mobile-first, 80% width max.

## Notes

- Mobile-first approach.
- Use Tailwind utility classes.
- Plan animations for Hero, TeamCard hover.
