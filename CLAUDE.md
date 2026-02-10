# work.krd — AI Learnings

## Rules
- Commit only, don't push — wait for Alan to say "push"
- Netlify auto-builds on push (credit-based: 20 free deploys/month, batch changes)
- Always test mobile AND desktop after CSS changes

## Patterns
- Hugo static site with Tailwind CSS
- Templates in layouts/, content in content/
- Mobile-first responsive design (sm: breakpoint for desktop)

## Mistakes & Fixes
- [Feb 9] Mobile toolbar had horizontal scroll → Changed overflow-x-auto to flex-wrap, smaller icons/text on mobile
- [Feb 9] LTE carriers in Iraq can't load site (Netlify CDN routing) — Wi-Fi works fine. Potential fix: Cloudflare proxy

## Dependencies
- Hugo (static site generator)
- Tailwind CSS
- Deployed on Netlify (main branch)

## Upcoming Work
- RTL support for Kurdish/Arabic — text gets cut out, mixed, RTL not implemented
- Full template redesign — better design + consistency across all templates
- This is a FULL reimplementation, not patches

## Notes
- Resume builder PWA — users create CVs/resumes online
- Target audience includes Kurdish/Arabic speakers — RTL is critical
- Photo crop, AI language matching, date format still need testing
