// Privacy Policy for HappyPix.
//
// Adapted from Foto Master's privacy policy (fotomaster.com), rewritten
// around what HappyPix actually runs: MongoDB Atlas, Cloudinary, Razorpay,
// SendGrid, and the AI providers named in the backend. Where Foto Master
// describes hardware sales and a US showroom, this describes a Sydney
// software business — the structure is theirs, the facts are ours.

export const privacySections = [
  {
    id: 'overview',
    heading: 'Overview',
    lead: 'How HappyPix collects, uses, shares and protects personal information.',
    paragraphs: [
      'HappyPix ("HappyPix", "we", "us" or "our") operates happypix.com.au, the HappyPix CRM, the HappyPix booth software and the HappyPix demo booth. This policy explains how we handle personal information across all of them.',
      'It applies both to information we handle for our own business and to information we process on behalf of the operators who use our platform. Which role we are in depends on the context, as set out below.',
      'We are based in Sydney, Australia, and we handle personal information in line with the Australian Privacy Principles. Where the GDPR applies, we also act consistently with it.',
    ],
  },
  {
    id: 'what-we-collect',
    heading: 'Information we collect',
    subsections: [
      'Information you give us',
      'Information collected automatically',
      'Payment information',
      'Event and guest content',
    ],
    paragraphs: [
      'We collect information you provide directly. That includes your name, business name, email address, billing address, phone number, account credentials, device and licence identifiers, and the content of your communications with us.',
      'We also collect information automatically when the software and websites run: device and browser details, IP address, operating system, approximate location derived from IP, pages and features used, session duration, errors, performance data and security events. This is what keeps a booth working at 11pm at an event.',
      'Payments are processed by third-party providers. We do not store full card numbers. We receive limited transaction information such as payment status, card type, billing contact and a transaction identifier.',
      'Operators use HappyPix to capture, store and share photos and event content. That content can contain personal information and images of faces. The operator is responsible for the notices, signage, permissions and consents required for what it captures and how it uses it.',
    ],
  },
  {
    id: 'how-we-use',
    heading: 'How we use information',
    paragraphs: [
      'We use personal information to provide, operate, secure and support the service; to process orders, payments, plans and account changes; to verify identity and prevent fraud and abuse; to provide support and service notices; to personalise features and understand performance; and to comply with law.',
      'Where the GDPR or similar law applies, our legal bases may include performance of a contract, compliance with a legal obligation, legitimate interests that are not overridden by your rights, and consent.',
    ],
    list: [
      'Providing the service — running the CRM, the booth, galleries and downloads.',
      'Billing — plans, renewals, invoices and payment reconciliation.',
      'Support — answering you, diagnosing problems and keeping a record of what was agreed.',
      "Safety — detecting abuse, spam and unauthorised access, and protecting accounts.",
      'Improvement — understanding which features are used and where they fail.',
    ],
  },
  {
    id: 'sharing',
    heading: 'How we share information',
    paragraphs: [
      'We share personal information with service providers who process it on our behalf, and in the limited circumstances below. We do not sell personal information for money.',
    ],
    list: [
      { strong: 'MongoDB Atlas.', text: 'Hosts the operational database — accounts, events, devices, photos metadata.' },
      { strong: 'Cloudinary.', text: 'Stores and serves event photos and rendered prints.' },
      { strong: 'Amazon S3.', text: 'Stores generated assets where it is configured.' },
      { strong: 'Razorpay.', text: 'Processes payments and subscriptions.' },
      { strong: 'SendGrid.', text: 'Delivers transactional email such as receipts and download links.' },
      { strong: 'AI providers.', text: 'Process prompts and imagery when you use an AI feature that requires them.' },
      { strong: 'Hosting and infrastructure.', text: 'Serve the applications and their logs.' },
      { strong: 'Legal and safety.', text: 'Courts, regulators or advisers where reasonably necessary to comply with law or protect rights and safety.' },
      { strong: 'Business transfers.', text: 'Parties involved in a merger, acquisition or sale of all or part of the business.' },
    ],
    paragraphsAfter: [
      'Where we act as a processor for an operator, current subprocessor information and the process for notice of intended changes are available to covered customers through the applicable data processing agreement.',
    ],
  },
  {
    id: 'ai',
    heading: 'AI features and your content',
    lead: 'This is the section to read closely if you use templates or effects generated by AI.',
    paragraphs: [
      'You keep ownership of the content you submit, subject to third-party rights. By submitting content, you grant HappyPix and its service providers a worldwide, non-exclusive licence to host, copy, transmit, display, transform and process it as needed to provide, secure, support and improve the service.',
      'Where you explicitly enable template generation, prompts and reference images are sent to the AI provider that performs that generation. We use those requests to return your result. We do not use customer event photos to train models unless you have agreed to that in writing.',
      'AI output can be inaccurate, incomplete, or resemble output produced for someone else. Review it before you use it at an event. You are responsible for holding the rights, notices and consents required for anything you upload, and for the people shown in it.',
      'You may not use AI features for unlawful impersonation, deceptive deepfakes, building biometric identification databases, harassment, discrimination or infringement.',
    ],
    notes: [
      {
        tone: 'warn',
        title: 'Where AI processing happens.',
        text: 'Template generation and image effects may be processed by providers outside Australia, including in the United States and the European Union. If a particular deployment must keep processing in Australia, contact us before enabling those features.',
      },
    ],
  },
  {
    id: 'photos-faces',
    heading: 'Photos, faces and children',
    paragraphs: [
      'HappyPix is built for business customers and adult operators, and is not directed to children under 13. We do not knowingly allow a child under 13 to create an account or submit personal information directly to us.',
      'Operators may capture event media that depicts children. They may do so only where they have lawful authority and any parental or guardian permission required.',
      'Photos and videos may contain faces, and some features analyse visual characteristics to produce a requested effect. HappyPix must not be used to identify or authenticate individuals, to build a biometric identification database, or to process biometric identifiers — unless that use is expressly authorised by us in writing and complies with all applicable notice, consent, retention and deletion requirements.',
    ],
  },
  {
    id: 'retention',
    heading: 'How long we keep information',
    paragraphs: [
      'We keep personal information only as long as reasonably necessary for the purposes in this policy, including legal, accounting, fraud-prevention and dispute-resolution obligations. Retention depends on the kind of information:',
    ],
    list: [
      'Account, billing and transaction records are kept for the life of the account, and longer where tax or accounting law requires.',
      'Support and sales communications are kept as needed to maintain the relationship and the record of what was agreed.',
      'Cloud and event content is kept while the plan is active, subject to deletion controls, storage limits and any grace period.',
      'Security, diagnostic and analytics information is kept for the period appropriate to the purpose it was collected for.',
      'After an account deletion, payment records and audit logs are retained as financial and compliance records. Everything else is deleted.',
    ],
    notes: [
      {
        tone: 'info',
        title: 'Deleting your account.',
        text: 'You can request deletion from the account deletion page. It takes effect after 7 days, and signing in to the CRM during that window stops it. We keep a complete record of what was removed, but not the event content itself.',
      },
    ],
  },
  {
    id: 'rights',
    heading: 'Your rights and choices',
    paragraphs: [
      'Depending on where you live, you may have the right to access a copy of your personal information, ask us to correct or delete it, restrict or object to certain processing, receive it in a portable format, withdraw consent, and opt out of targeted advertising.',
      'We will need to verify your identity before acting on a request, and some rights are subject to legal exceptions. To exercise any of them, write to hello@happypix.com.au.',
      'You can unsubscribe from marketing using the link in any message. Transactional and service messages — security, billing, support and renewal notices — may still be sent when necessary.',
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies and tracking',
    paragraphs: [
      'We use cookies and similar technologies to operate the service, remember your preferences, understand performance, prevent fraud, measure campaigns and deliver advertising where permitted.',
      'You can manage non-essential technologies through your browser and through any choices presented on the site. Disabling them may affect some features.',
    ],
  },
  {
    id: 'security',
    heading: 'Security',
    paragraphs: [
      'We use administrative, technical and organisational safeguards designed to protect personal information, including encryption in transit, hashed passwords, scoped session tokens and access controls.',
      'No system is completely secure. Operators are responsible for safeguarding credentials, managing who has administrator access, configuring sharing settings, and reporting suspected unauthorised access to us promptly.',
    ],
  },
  {
    id: 'transfers',
    heading: 'International transfers',
    paragraphs: [
      'HappyPix operates internationally, and information may be processed in Australia, the United States, the European Union and other countries with different data-protection laws. Where required, we use appropriate transfer mechanisms, which may include contractual safeguards or standard contractual clauses.',
    ],
  },
  {
    id: 'controller',
    heading: 'Controller, processor and agreements',
    paragraphs: [
      'HappyPix generally acts as the controller for our website, accounts, sales, support, security, analytics and service development. We act as a processor when an operator uses HappyPix to process event or guest content on that operator\'s documented instructions.',
      'Where required, we make a data processing agreement available on request to business customers. The DPA is a separate binding agreement. To request one, write to hello@happypix.com.au.',
      'Business customers remain responsible for their own notices, legal bases, participant consents, event signage, privacy requests and retention choices. We provide the tools and assistance, but you should obtain your own legal advice about your use of the service.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes and contact',
    paragraphs: [
      'We may update this policy to reflect changes in the service, the law or our practices. We will post the updated version and revise the date at the top, and give additional notice where required.',
      'To ask a privacy question, exercise a right, report a concern or request a DPA, contact HappyPix at hello@happypix.com.au. We are based in Sydney, Australia.',
    ],
  },
]
