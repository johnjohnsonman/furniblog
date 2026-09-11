type BlogBuyingNotes = {
  productId: string
  name: string
  heading: string
  description: string
  related: { href: string; label: string }[]
  additionalProducts?: { productId: string; name: string }[]
}

const size = 'herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c'
const controls = 'how-to-use-the-herman-miller-aeron-a-complete-control-guide'
const tilt = 'herman-miller-aeron-tilt-lock-why-your-chair-still-moves-and-why-that-s-normal'
const leap = 'steelcase-leap-v2-review-the-chair-that-hugs-your-body'
const leapGesture = 'steelcase-leap-vs-gesture-which-high-end-ergonomic-chair-is-right-for-you'
const notes: Record<string, BlogBuyingNotes> = {
  [size]: {
    productId: 'herman-miller-aeron',
    name: 'Herman Miller Aeron',
    heading: 'Compare Aeron buying options',
    description: 'Check the listed size, Classic or Remastered version, condition and return terms before choosing an offer. Search results may include other models and accessories.',
    related: [
      { href: `/blog/${controls}`, label: 'Check Aeron adjustment options' },
      { href: `/blog/${tilt}`, label: 'Understand the Aeron tilt limiter' },
    ],
  },
  [controls]: {
    productId: 'herman-miller-aeron',
    name: 'Herman Miller Aeron',
    heading: 'Considering a replacement Aeron?',
    description: 'If you are comparing a replacement, check its size and installed adjustments against your current chair. Search results may include other models and accessories.',
    related: [
      { href: `/blog/${size}`, label: 'Compare Aeron sizes before buying' },
      { href: `/blog/${tilt}`, label: 'Check tilt resistance versus recline range' },
    ],
  },
  [tilt]: {
    productId: 'herman-miller-aeron',
    name: 'Herman Miller Aeron',
    heading: 'Comparing a replacement Aeron?',
    description: 'Check the adjustments on your current chair before deciding to replace it. For another Aeron, confirm size, Classic or Remastered version, installed controls, condition and return terms. Amazon search results may include accessories and other models; availability is not verified.',
    related: [
      { href: `/blog/${controls}`, label: 'Review Aeron adjustment controls' },
      { href: `/blog/${size}`, label: 'Compare Aeron sizes' },
    ],
  },
  [leap]: {
    productId: 'steelcase-leap-v2',
    name: 'Steelcase Leap V2',
    heading: 'Check a Leap V2 offer',
    description: 'Confirm the seller, selected condition, delivery, return terms and warranty on Amazon. A listing is not a claim of manufacturer authorization.',
    related: [
      { href: '/products/steelcase-leap-v2', label: 'Explore Steelcase Leap V2 details' },
      { href: `/blog/${leapGesture}`, label: 'Compare Leap with Gesture' },
    ],
  },
  [leapGesture]: {
    productId: 'steelcase-leap-v2',
    name: 'Steelcase Leap V2',
    heading: 'Compare Leap and Gesture offers',
    description: 'Compare the selected configurations, not just the listed prices. Check arm and lumbar options, condition, seller, delivery and return terms for each offer. Warranty coverage depends on the purchase and is not established by this comparison.',
    additionalProducts: [{ productId: 'steelcase-gesture', name: 'Steelcase Gesture' }],
    related: [
      { href: `/blog/${leap}`, label: 'Read the Leap V2 overview' },
      { href: '/products/steelcase-gesture', label: 'Explore Steelcase Gesture details' },
    ],
  },
  'herman-miller-x-logitech-g-embody-gaming-chair-materials-and-features-explained': {
    productId: 'herman-miller-embody-gaming',
    name: 'Herman Miller x Logitech G Embody Gaming Chair',
    heading: 'Look for the Embody Gaming edition',
    description: 'Confirm that an offer is for the Logitech G Gaming edition rather than the standard Embody. Check the selected upholstery, condition, seller and return terms. Search results may also include accessories and other chairs; availability is not verified.',
    related: [{ href: '/products/herman-miller-embody-gaming', label: 'Explore Embody Gaming details' }],
  },
  'libernovo-lineup-explained-omni-omni-se-omni-pro-maxis-compared': {
    productId: 'libernovo-omni',
    name: 'LiberNovo Omni',
    heading: 'Looking for the original LiberNovo Omni?',
    description: 'This search is for the original Omni, not a confirmed offer for every model in the lineup. Check the exact model, regional specifications, delivery and return terms. Availability and current prices are not verified; results may include accessories or other chairs.',
    related: [
      { href: '/products/libernovo-omni', label: 'Explore the original LiberNovo Omni' },
      { href: '/blog/libernovo-complete-lineup-guide-omni-omni-se-omni-pro-maxis-compared', label: 'Check model, fit and seller before ordering' },
    ],
  },
  'libernovo-complete-lineup-guide-omni-omni-se-omni-pro-maxis-compared': {
    productId: 'libernovo-omni',
    name: 'LiberNovo Omni',
    heading: 'Search for the original LiberNovo Omni',
    description: 'Confirm the exact generation, seat configuration, seller and return terms on the destination listing. This search does not verify availability for Omni Gen, SE, Pro or Maxis and may include other chairs or accessories.',
    related: [{ href: '/blog/libernovo-lineup-explained-omni-omni-se-omni-pro-maxis-compared', label: 'Compare LiberNovo model differences' }],
  },
}

export function getBlogBuyingNotes(slug: string): BlogBuyingNotes | null {
  return Object.prototype.hasOwnProperty.call(notes, slug) ? notes[slug] : null
}
