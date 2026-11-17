// ─────────────────────────────────────────────────────────────────
//  Booth walkthrough content.
//
//  The step order and screen names below are the real ones, taken
//  from client-app/apps/booth/App.tsx — not an invented flow:
//
//    Login → Waiting → Start → Orientation → Templates → Prints
//    → Payment → Camera → Photos → Customize → OrderSuccess
//
//  Each step is rendered by components/BoothScreen.jsx as a working
//  mock of that screen. Tapping the highlighted control on the mock
//  advances the walkthrough, so the guide can be clicked through
//  exactly as a guest would click through the booth.
// ─────────────────────────────────────────────────────────────────

export const BOOTH_STEPS = [
  {
    id: 'login',
    screen: 'Login',
    who: 'operator',
    title: 'Sign the booth in',
    action: 'Sign in',
    what: 'The booth belongs to an organisation and an event. This is where it says which of each it is serving tonight.',
    guests: 'Guests never see this screen.',
    you: 'Booth sign-in uses your organisation credentials. One booth signs in once and stays signed in between events.',
    tip: 'On a Windows PC or a Nikon setup, this screen is also where you point a tablet at the PC — open "Windows USB camera host" and enter the PC address.',
    mock: { kind: 'login' },
  },
  {
    id: 'waiting',
    screen: 'Waiting',
    who: 'operator',
    title: 'Everything is connected',
    action: 'Go to the welcome screen',
    what: 'A quiet status screen. It tells you the camera is live, the printer is ready and the event is the right one — before guests are watching.',
    guests: 'Guests see the welcome screen instead. This is your pre-flight check.',
    you: 'Check camera, printer and paper here. If the printer reports paper low, this is the moment to fix it, not halfway through a wedding.',
    tip: 'Make this screen part of your setup ritual. Thirty seconds here prevents most event-day calls.',
    mock: { kind: 'waiting' },
  },
  {
    id: 'start',
    screen: 'Start',
    who: 'guest',
    title: 'The welcome screen',
    action: 'Tap to start',
    what: 'The attract screen. It sits there looking good until someone walks up, and it carries the event branding your guests see first.',
    guests:
      'A full-screen welcome with the event name and one obvious button. There should never be a question about what to press.',
    you: 'Event name, branding and the photos guests will see come from the event you created in the CRM.',
    tip: 'Stand three metres back. If you cannot tell what to press from there, the booth is not finished.',
    mock: {
      kind: 'start',
      headline: 'Sunset Weddings',
      sub: 'Aanya & Rohan · 12 December',
      cta: 'Tap to start',
    },
  },
  {
    id: 'orientation',
    screen: 'Orientation',
    who: 'guest',
    title: 'Pick the shape of the print',
    action: 'Choose portrait',
    what: 'Guests choose the format first, because everything after it — the frame, the layout, the paper — depends on the shape.',
    guests:
      'A simple choice between portrait and landscape, shown as the actual print shapes rather than as words.',
    you: 'Which formats are on offer is set per event in the CRM.',
    tip: 'Fewer choices here means a faster queue. Most events run happily on portrait alone.',
    mock: { kind: 'orientation' },
  },
  {
    id: 'templates',
    screen: 'Templates',
    who: 'guest',
    title: 'Choose a design',
    action: 'Use this design',
    what: "The branded frame the photos will sit in. This is the screen your client's logo lives on.",
    guests: 'A row of designs to scroll through, each previewed with the event branding already applied.',
    you: 'Templates, logos, colours and captions are set on the event in the CRM. Change them there and every booth picks them up.',
    tip: 'Two or three designs beats twelve. Guests pick faster and the prints look more consistent across the night.',
    mock: { kind: 'templates' },
  },
  {
    id: 'prints',
    screen: 'Prints',
    who: 'guest',
    title: 'How many copies',
    action: 'Continue',
    what: 'Copies per guest. It matters because it is the number that decides how fast your media disappears.',
    guests: 'A simple quantity choice, with the price shown if the event charges.',
    you: 'Included copies and any paid extras are set on the event.',
    tip: 'Know your media cost per print before the event. It is the one number that decides whether the night made money.',
    mock: { kind: 'prints' },
  },
  {
    id: 'payment',
    screen: 'Payment',
    who: 'guest',
    title: 'Pay, or use a code',
    action: 'I have paid',
    what: 'Only appears when the event charges. Guests scan, pay, and carry on — nobody has to fetch an operator.',
    guests: 'A payment QR code and a coupon field. Free events skip this screen entirely.',
    you: 'Pricing, coupons and whether payment is required at all are all event settings in the CRM.',
    tip: 'Put a small sign next to the booth saying payment is by phone. It stops the queue forming while someone finds their card.',
    mock: { kind: 'payment' },
  },
  {
    id: 'camera',
    screen: 'Camera',
    who: 'guest',
    title: 'Lights, countdown, capture',
    action: 'Take the shots',
    what: 'The moment everyone came for. Live view, a countdown, and the shots taken in sequence.',
    guests: 'Themselves on the big screen, a countdown, and a flash of confirmation after each shot.',
    you: 'How many shots, how long the countdown runs and which camera the booth uses are all configurable.',
    tip: 'Aim the booth light at the guests, not the background. It is the difference between a photo and a keepsake.',
    mock: { kind: 'camera' },
  },
  {
    id: 'photos',
    screen: 'Photos',
    who: 'guest',
    title: 'Pick the best ones',
    action: 'Use these photos',
    what: 'Guests choose which captures go on the print. The one step that turns an average strip into one they keep.',
    guests: 'Every shot just taken, laid out to tap and choose from.',
    you: 'How many guests pick, and whether they pick at all, is an event setting.',
    tip: 'Keep this quick. A guest who deliberates holds up the queue behind them.',
    mock: { kind: 'photos' },
  },
  {
    id: 'customize',
    screen: 'Customize',
    who: 'guest',
    title: 'Finishing touches',
    action: 'Finish my print',
    what: 'Filters, stickers and a caption. The playful step — and the one that gets posted.',
    guests: 'A short set of finishing options and a preview of the finished print updating as they go.',
    you: 'Which finishing options are available is set on the event.',
    tip: 'Offer less here than you think. The print, not the sticker, is what ends up on a fridge.',
    mock: { kind: 'customize' },
  },
  {
    id: 'success',
    screen: 'OrderSuccess',
    who: 'guest',
    title: 'Print, and a QR to take it away',
    action: 'Back to welcome',
    what: "The print comes out and a QR code offers the digital copies. This is where one guest becomes everyone else's photos.",
    guests:
      'Their print, and a code to scan for the full set on their phone. The download link is time-limited for privacy.',
    you: 'Gallery settings, how long the download stays live, and whether digital copies are offered at all are platform and event settings.',
    tip: 'Angle the screen so the QR is easy to photograph. Guests will take a picture of it if scanning is awkward.',
    mock: { kind: 'success' },
  },
];

// Operator-side help that sits under the walkthrough.
export const BOOTH_OPERATOR_NOTES = [
  {
    title: 'If the booth will not sign in',
    body: 'Check the event is active and that the device is paired to the right organisation. Then check the booth has internet — sign-in needs it, even though capture and printing do not.',
  },
  {
    title: 'If the camera shows nothing',
    body: 'Look at the Waiting screen first — it reports the camera state. For a Wi-Fi Canon, the camera has to be on the booth network at the address the app looks for. For a wired Nikon, the cable and the PC matter, not the Wi-Fi.',
  },
  {
    title: 'If a print fails',
    body: 'The booth keeps the digital photos even when the printer does not cooperate, and offers Retry Print. Check paper and ribbon first, then the printer queue on the PC.',
  },
  {
    title: 'If guests cannot get their photos',
    body: 'The download link is time-limited by design. Check the booth had connectivity at the end of the session, and that guest downloads are enabled for the event.',
  },
];
