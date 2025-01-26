import {globals} from '$lib/db'

export async function load({url}) {
  let collection = null
  let collectionId = url.searchParams.get('collection')
  if (collectionId) {
    collection = (await globals.db?.documents.findOne({
      selector: {id: collectionId, type: 'collection'}
    }).exec())?.toMutableJSON()
  }
  return {
    collection
  };
}
