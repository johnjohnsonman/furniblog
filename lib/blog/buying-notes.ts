type BlogBuyingNotes = {
  productId: string
  name: string
  heading: string
  description: string
  related: { href: string; label: string }[]
}

const size = 'herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c'
const controls = 'how-to-use-the-herman-miller-aeron-a-complete-control-guide'
const leap = 'steelcase-leap-v2-review-the-chair-that-hugs-your-body'
const notes: Record<string, BlogBuyingNotes> = {
  [size]: {
    productId: 'herman-miller-aeron',
    name: 'Herman Miller Aeron',
    heading: 'Compare Aeron buying options',
    description: 'Check the listed size, Classic or Remastered version, condition and return terms before choosing an offer. Search results may include other models and accessories.',
    related: [{ href: `/blog/${controls}`, label: 'Check Aeron adjustment options' }],
  },
  [controls]: {
    productId: 'herman-miller-aeron',
    name: 'Herman Miller Aeron',
    heading: 'Considering a replacement Aeron?',
    description: 'If you are comparing a replacement, check its size and installed adjustments against your current chair. Search results may include other models and accessories.',
    related: [{ href: `/blog/${size}`, label: 'Compare Aeron sizes before buying' }],
  },
  [leap]: {
    productId: 'steelcase-leap-v2',
    name: 'Steelcase Leap V2',
    heading: 'Check a Leap V2 offer',
    description: 'Confirm the seller, selected condition, delivery, return terms and warranty on Amazon. A listing is not a claim of manufacturer authorization.',
    related: [{ href: '/products/steelcase-leap-v2', label: 'Explore Steelcase Leap V2 details' }],
  },
}

export function getBlogBuyingNotes(slug: string): BlogBuyingNotes | null {
  return Object.prototype.hasOwnProperty.call(notes, slug) ? notes[slug] : null
}
