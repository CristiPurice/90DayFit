import { db, type ReviewEntry } from '../db'

export async function putReview(entry: ReviewEntry): Promise<void> {
  if (!Number.isInteger(entry.weekNo) || entry.weekNo < 1) throw new RangeError('Săptămâna trebuie să fie un întreg pozitiv')
  await db.reviews.put(entry)
}

export function getReview(weekNo: number): Promise<ReviewEntry | undefined> {
  return db.reviews.get(weekNo)
}

export function listReviews(): Promise<ReviewEntry[]> {
  return db.reviews.orderBy('weekNo').toArray()
}
