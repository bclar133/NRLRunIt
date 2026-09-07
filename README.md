# NRL Run It

A desktop and mobile browser rugby league game. Run the full field and score ten consecutive tries without being tackled or going into touch.

## Play locally

Download or clone this repository, then run `python -m http.server 8000` in its folder and open http://localhost:8000 in a desktop browser with WebGL enabled.

## Publish for testers

In this repository, open Settings → Pages. Under Build and deployment, choose Deploy from a branch, then select main and / (root) and save. GitHub Pages will provide the public play link once deployment finishes.

## Mobile play

Turn your phone sideways. Use the circular left thumbstick to move and the right-side Burst, Fend, Step, and Dive / Try buttons. Movement and skills work simultaneously. Push the stick left or right to choose step direction. Portrait mode pauses play; rotate back and tap Resume. Landscape locking and fullscreen are requested when supported by the browser.

## Controls

- WASD: move
- Shift: speed burst (limited uses per run)
- F: fend
- E: step; hold A or D to choose direction
- Q: dive or ground the ball for a try
- Escape: pause

## Attackers

| Player | Jersey | Bursts per run |
| --- | --- | --- |
| Reece Walsh | 1 | 2 |
| Addin Fonua-Blake | 8 | 2 |
| Latrell Mitchell | 3 | 1 |
| Sua Faalogo | 1 | 3 |

Attributes are fictional gameplay ratings. Opponents progress from Tigers, Titans, Dragons, Bulldogs, Raiders, Rabbitohs, Storm, Broncos and Roosters to Panthers. The final level has twelve line defenders and a fullback.

## Testing feedback

Please report your browser, attacker, level, and steps to reproduce a problem, ideally with a screenshot or video. Focus areas include movement and leg animation, tackles, difficulty, portrait switching, burst limits, and scoring.

The game uses HTML, CSS, and WebGL JavaScript without a build step. Player photos and club identifiers remain the property of their respective rights holders; this repository does not grant rights to those assets.

## Graphics and weather

Use the Sky selector before starting to choose Changing skies, Clear afternoon, Cloudy, Sunset, Storm, or Night under lights. Automatic conditions change smoothly over a 200-second cycle. Weather affects visuals only.

Players use shaped torsos and articulated limbs with photo-based facial textures from the supplied portraits. These are approximate game models, not scanned likenesses. The field uses detailed turf shading and mowing stripes. The stadium includes tiered seats, animated spectators, roof trusses, floodlights and scoreboards.

Detail defaults to Auto. High retains more geometry and resolution; Performance reduces distant detail and crowd density. Touch controls and the landscape requirement remain available on phones.

Run `node tests/graphics-smoke.cjs` to check generated geometry, weather transitions, and gameplay logic. The graphics API is mocked in this check; it does not replace browser shader compilation, visual review, or device performance testing.
