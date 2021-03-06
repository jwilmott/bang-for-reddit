import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Deck } from '../../models/deck.model';
import * as fromDeck from '../actions/deck.action';

export interface State extends EntityState<Deck> {
  currentDeckId: string | null;
}

export const adapter: EntityAdapter<Deck> = createEntityAdapter<Deck>();

export const initialState: State = adapter.getInitialState({
  currentDeckId: null,
  ids: ['default'],
  entities: {
    default: {
      id: 'default',
      name: 'Default Deck',
      subredditIds: ['all', 'politics'],
      subredditSettings: {
        all: {
          type: 'top'
        },
        politics: {
          type: 'rising'
        }
      }
    }
  }
});

export function reducer(
  state = initialState,
  action: fromDeck.DeckActions
): State {
  switch (action.type) {
    case fromDeck.ADD_DECK: {
      return adapter.addOne(action.payload, state);
    }

    case fromDeck.REMOVE_DECK: {
      return adapter.removeOne(action.payload, state);
    }

    case fromDeck.ACTIVATE_DECK: {
      return {
        ...state,
        currentDeckId: action.payload
      };
    }

    case fromDeck.SET_DECK_SUBREDDIT_TYPE: {
      const id = state.currentDeckId;
      const { subredditId, type } = action.payload;
      const deck = state.entities[id];
      const subredditSettings = { ...deck.subredditSettings };
      const settings = { ...subredditSettings[subredditId], type };
      subredditSettings[subredditId] = settings;

      const update = {
        id,
        changes: { ...deck, subredditSettings }
      };

      return adapter.updateOne(update, state);
    }

    case fromDeck.ADD_SUBREDDIT_TO_DECK: {
      const { subredditId, id = state.currentDeckId } = action.payload;
      const deck = state.entities[id];
      let subredditSettings = { ...deck.subredditSettings };
      let subredditIds = [...deck.subredditIds];

      subredditSettings[subredditId] = { type: 'rising' };
      subredditIds.push(subredditId);

      const update = {
        id,
        changes: { ...deck, subredditIds, subredditSettings }
      };

      return adapter.updateOne(update, state);
    }

    case fromDeck.REMOVE_SUBREDDIT_FROM_DECK: {
      const { subredditId, id = state.currentDeckId } = action.payload;
      const deck = state.entities[id];
      const subredditIds = deck.subredditIds.filter(id => subredditId != id);
      let subredditSettings = { ...deck.subredditSettings };

      delete subredditSettings[subredditId];

      const update = {
        id,
        changes: { ...deck, subredditIds, subredditSettings }
      };

      return adapter.updateOne(update, state);
    }

    default: {
      return state;
    }
  }
}
