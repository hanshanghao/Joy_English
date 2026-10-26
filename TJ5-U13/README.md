# Tales of Joy 5 · Unit 13 · The Magic Hen

Interactive classroom lesson for **bored, excited, poor, rich** and the pattern **I am / He is / She is**.

No build step and no server are required. Open `index.html` in a current version of Chrome or Edge.

## Quick start

1. Open `index.html`.
2. Click the speaker icon before the first spoken activity so the browser allows audio.
3. Use **Teacher** to open the timer, team scores, student picker, voice settings, answer controls and teacher script.
4. Project the page full screen and use the nine tabs in lesson order.

An internet connection is needed for the Google Fonts. All lesson content, images and interactivity are local. Speech uses the browser's built-in text-to-speech voices; no recorded audio is sent anywhere.

If your browser restricts local files, run a small local server from this folder instead:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Lesson flow

| Tab | Use |
| --- | --- |
| Lesson Plan | Objectives, two-hour timetable, preparation notes, materials and homework |
| Dialogue | Story scenes, line-by-line audio, group role-play and completion tracking |
| Vocabulary | Illustrated, photo and private textbook artwork; cards, spelling and opposites |
| Patterns | Build `I am`, `He is` and `She is` sentences with the pattern machine |
| Listen, Look & Say | Scene prompts and class repetition practice |
| Listen, Point & Say | Timed team game with teacher and random modes |
| Puzzles & Write | Sentence puzzles, editable practice bank and writing relay timer |
| Games | Story ordering and memory matching |
| Review Quiz | Twelve questions with team scoring, feedback and answer reveals |

The **Teacher** dashboard also provides:

- Full lesson, 5-minute, 15-minute and short timers
- Four-team scoreboard
- Random student picker with an optional no-repeat pool
- British-English voice selection and speech-rate control
- Show-answers, textbook-artwork and reduced-motion switches
- Activity navigation and the full teacher script
- A lesson-end footer with section jumps, previous/next controls, progress and a link to the Joy English lesson library
- Floating Home and Back-to-top buttons that make way for the footer

Team scores, voice settings, practice progress, the custom puzzle bank and display settings are stored in this browser's `localStorage`.

## Content and privacy

- The files in `assets/reference/` are scans from the supplied textbook and Teacher's Manual.
- Those scans are intended for **private classroom reference only**. Do not publish them on a public website or redistribute them.
- Original illustrations in `assets/img/svg/`, the interface and all supplementary practice sentences are teacher-created. They are not official textbook content.
- The speaker of “What can it do?” is not named in the supplied dialogue. The lesson labels that line **Friend** and marks it as an unidentified speaker.
- The lesson uses no analytics, accounts, external audio services or uploaded student data.
- Photographs are used only in the optional **Photo** artwork mode.

## Photo credits

The following images are licensed under **CC BY 2.0**:

| Word | Image | Creator | Source |
| --- | --- | --- | --- |
| bored | `assets/img/photos/photo-bored.jpg` | blmurch | [Bored child](https://www.flickr.com/photos/82439748@N00/8528992186) |
| poor | `assets/img/photos/photo-poor.jpg` | chascow | [empty wallet](https://live.staticflickr.com/7547/27487863966_3b622a10d4_b.jpg) |

The images for **excited** and **rich** were also obtained from Flickr under CC BY 2.0, but their original creator and photo-page URLs were not retained in the source files. Their embedded Flickr share links are no longer resolvable.

Before publishing this lesson publicly or redistributing those two image files, either:

- re-confirm and record the original creator and Flickr photo page for each one, or
- replace them with images that have complete attribution.

Private classroom use can continue with the current files. When replacing an image, keep the same filename and aspect ratio so the existing CSS continues to work:

- `assets/img/photos/photo-excited.jpg`
- `assets/img/photos/photo-rich.jpg`

## File map

```text
index.html                 Main lesson page
assets/css/lesson.css      Theme, layout and responsive styles
assets/js/lesson.js        All lesson interactivity
assets/img/svg/            Original characters, vocabulary art and props
assets/img/photos/         CC BY photo artwork
assets/reference/          Private textbook scans and Teacher's Manual pages
```

## Browser notes

- Best experience: current Chrome or Edge on a desktop or laptop.
- Choose **Friendly female** or **Friendly male** in **Teacher → Friendly British voice**. The lesson automatically prefers natural online British voices such as Google UK English or Microsoft natural voices, then falls back to the best British voice installed on the device.
- Chrome and Edge generally provide the warmest results when online voices are enabled. Older local Windows voices such as Microsoft Hazel or George sound more synthetic.
- Speech requires a user interaction first. Use **Hear female** or **Hear male** to preview the selected voice.
- Press `Escape` to close the teacher dashboard or an image lightbox.
- Use **Teacher → Display and answers → Reduce motion** if the animated background is distracting.
- Printing is available from the Lesson Plan and Teacher dashboard.

## Printing and backup

- **Print Plan** on the Lesson Plan prints the teaching plan and notes.
- Keep a copy of the whole folder together; all paths are relative.
- Clearing browser site data resets saved scores, settings and the custom puzzle bank.
