import { uuidv4 } from "../lib/helpers"
import { get, writable } from "svelte/store"

export const dreams = writable<Dream[]>([
  {
    id: uuidv4(),
    text: 'take care of my elderly Grandma',
    reason: "she's in a home that doesn't love her like I do",
    likes: 3,
  },
  {
    id: uuidv4(),
    text: 'plant trees around my apartment building',
    reason: "we gotta cool this city down",
    likes: 1,
  },
  {
    id: uuidv4(),
    text: 'eat out more',
    reason: "I haven't been able to afford anything other than ramen for the last 3 years",
    likes: 2,
  },
])

export const likedDreamIds = writable<Dream['id'][]>([])

export const addDream = (text: string, reason: string) => {
  dreams.update(dreams => [{
    id: uuidv4(),
    text: text,
    reason: reason,
    likes: 0,
  }, ...dreams])
}

export const likeDream = (id: Dream['id']) => {
  if (!get(likedDreamIds).includes(id)) {
    dreams.update(dreams => dreams.map(dream => {
      if (dream.id !== id) {
        return dream
      } else {
        return {
          ...dream,
          likes: dream.likes || 0 + 1,
        }
      }
    }))
    likedDreamIds.update(ids => [...ids, id])
  }
}