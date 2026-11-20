// Subscription & Cancellation Policy.
//
// Adapted from Foto Master's subscription policy, rewritten around the
// HappyPix plan model (trial, starter, professional, business, enterprise),
// AI credits, storage overages and self-service account deletion. The
// peak-storage rule and the distinction between "stop renewing",
// "downgrade" and "delete your account" are kept because they are the
// parts people actually get caught by.

export const subscriptionSections = [
  {
    id: 'summary',
    heading: 'The short version',
    lead: 'Plans renew until you cancel. Cancelling stops future charges but does not refund the period you are in.',
    paragraphs: [
      'HappyPix sells monthly and annual plans, AI credits, and storage above your plan allowance. This policy explains how each renews, how to cancel, what upgrading and downgrading do, and what happens when you delete your account.',
      'For licence and acceptable-use terms, see the Terms of Service. For how we handle your data, see the Privacy Policy.',
    ],
    list: [
      'Renewals happen automatically until you cancel in the CRM.',
      'We send a reminder before each renewal.',
      'Cancelling stops future charges. It does not refund the current period.',
      'AI credits are prepaid, non-refundable and have no cash value.',
      'Account deletion is irreversible and takes effect after 7 days.',
    ],
  },
  {
    id: 'plans',
    heading: 'Plans and payment',
    paragraphs: [
      'HappyPix plans are billed in the currency shown at checkout. Payment is taken in advance by card through our payment provider. We do not store your full card details.',
      'Every new organization starts on a trial. A plan becomes active when payment is confirmed, and its device and event allowances apply from that moment.',
    ],
    list: [
      { strong: 'Monthly plans.', text: 'Billed each month on the date you subscribed.' },
      { strong: 'Annual plans.', text: 'Billed once a year, usually at a lower effective monthly rate.' },
      { strong: 'Add-ons.', text: 'Purchased separately, and live for the period shown in your account.' },
      { strong: 'Enterprise.', text: 'Quoted individually. Contract terms in your quote or order override this policy where they conflict.' },
    ],
  },
  {
    id: 'renewal',
    heading: 'Automatic renewal',
    paragraphs: [
      'When you choose a plan and accept these terms at checkout, you authorise HappyPix to charge the recurring fee to your payment method until you cancel. We send a renewal reminder before the renewal date.',
      'You are responsible for keeping your payment details current. If a renewal fails, we retry, and the plan may be suspended until payment succeeds.',
      'You can stop future renewals at any time from the billing screen in the CRM. Cancelling before the renewal date prevents that renewal.',
    ],
    notes: [
      {
        tone: 'info',
        title: 'What cancelling does not do.',
        text: 'Cancelling stops future charges. It does not refund a period already paid for, cancel outstanding balances, or delete your events. Your access continues to the end of the paid period.',
      },
    ],
  },
  {
    id: 'ai-credits',
    heading: 'AI credits and usage pricing',
    paragraphs: [
      'AI features are billed per transaction, per experience or per generated result. AI credits are a prepaid balance used for those charges.',
      'Credits are non-refundable and have no cash value. They are not transferable between organizations.',
      'AI pricing varies by feature, by model and quality setting, and by your plan — the same feature can cost different amounts on different plans. Current rates are shown in the CRM before you run a job.',
      'Where a pricing change materially increases what you pay, we give at least 30 days notice. Continued use after the effective date means you accept the new rate.',
    ],
  },
  {
    id: 'storage',
    heading: 'Storage allowances and overage',
    lead: 'Overage is measured on your peak for the month, not your average and not your month-end figure.',
    paragraphs: [
      'Each plan includes a storage allowance for event photos and generated assets. If your account goes above it, extra storage is charged per additional GB at the rate for your plan. The rate per GB differs between plans.',
      'Your monthly storage figure is the highest amount your account reached at any point in the previous calendar month. Extra storage is the part of that peak above your allowance. The rate applied is the one for your plan during the period the storage was used.',
      'This is charged once, at the start of the following month, to your default payment method or deducted from available AI credits where enough exist.',
    ],
    notes: [
      {
        tone: 'warn',
        title: 'An example, because this one catches people.',
        text: 'If your plan includes 100 GB and your account reaches 120 GB mid-month, then you delete 40 GB before month end, you are still billed for 20 GB. Deleting files prevents future peaks; it does not erase a peak already reached.',
      },
    ],
  },
  {
    id: 'upgrades',
    heading: 'Upgrades',
    paragraphs: [
      'Upgrades take effect immediately. New limits, features and AI pricing apply straight away, and your existing events, data and credits are preserved.',
      'You are charged the prorated difference for the remainder of the current billing period. There is no refund or credit for unused time on the plan you left.',
    ],
  },
  {
    id: 'downgrades',
    heading: 'Downgrades',
    paragraphs: [
      'A downgrade takes effect at the end of your current paid period, not when you request it. Your current plan stays active until then.',
      'After a downgrade, features that belong only to the higher plan stop working. Your events, media and unused credits are kept, but they become subject to the lower plan\'s limits — which may mean storage overage charges for content that was previously within allowance.',
      'A downgrade does not delete anything on its own. Export anything you need before it takes effect.',
    ],
  },
  {
    id: 'cancellation',
    heading: 'Cancellation',
    paragraphs: [
      'You can cancel renewal from the billing screen in the CRM, or by writing to hello@happypix.com.au before the renewal date. Keep the confirmation.',
      'After cancelling, the service stays active until the end of the paid period. At that point the account becomes read-only, then enters the grace period below.',
      'Plan fees, AI credits and consumed usage are non-refundable once accessed or used, except where Australian Consumer Law or another applicable law requires otherwise.',
    ],
  },
  {
    id: 'grace',
    heading: 'Grace period',
    paragraphs: [
      'When a plan ends without renewal or cancellation, the account enters a grace period of up to 30 days.',
      'During the grace period, online galleries go offline and the booth cannot start new sessions, but your events and media are still stored. If you renew and settle any outstanding amount within the 30 days, access returns and galleries come back online.',
      'If the grace period ends without payment, the account may be terminated and its data deleted under the retention rules in the Privacy Policy.',
    ],
  },
  {
    id: 'deletion',
    heading: 'Deleting your account',
    lead: 'This is different from cancelling, and it cannot be undone.',
    paragraphs: [
      'You can request permanent deletion from the account deletion page on happypix.com.au. You will be asked to confirm your email address, your password, and to slide a confirmation control across.',
      'Deletion does not happen immediately. It is scheduled 7 days after you confirm, and during that window the account is frozen: nobody can sign in, but nothing has been destroyed yet.',
      'To stop the deletion, sign in to the CRM before the 7 days are up. Any successful sign-in by the organization owner cancels the scheduled deletion automatically and restores the account.',
      'After the 7-day window closes, every event, device, photo, gallery, template, coupon, ticket, setting and team member belonging to the organization is deleted. The removal runs in a daily maintenance job, so it may happen at any point in the 24 hours following the deadline, not at the exact minute the window ends. Your plan remains until the end of the paid period; no refund is issued for the time you did not use.',
      'Before anything is removed, we save a complete record of what was deleted. Payment records and audit logs are retained as financial and compliance records and are not deleted with the account.',
    ],
    notes: [
      {
        tone: 'warn',
        title: 'There is no undo once the window closes.',
        text: 'Download any events and media you want to keep before the 7 days are up. Once the deletion job has run, the event content cannot be recovered through the service.',
      },
    ],
  },
  {
    id: 'refunds',
    heading: 'Refunds and disputes',
    paragraphs: [
      'Plan fees, AI credits and consumed usage are generally non-refundable. If you believe you were charged in error, write to hello@happypix.com.au within 30 days of the charge with the invoice or transaction reference, and we will investigate.',
      'Nothing in this policy limits your rights under the Australian Consumer Law, including any right to a remedy where a service is not delivered with due care and skill.',
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    paragraphs: [
      'For questions about plans, credits, storage, grace periods or account deletion: hello@happypix.com.au. HappyPix, Sydney, Australia.',
    ],
  },
]
