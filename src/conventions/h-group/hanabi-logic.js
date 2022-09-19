const { CLUE } = require('../../basics/helper.js');
const { logger } = require('../../logger.js');
const Utils = require('../../util.js');

function find_chop(hand, options = {}) {
	for (let i = hand.length - 1; i >= 0; i--) {
		if (hand[i].clued && (options.ignoreNew ? true : !hand[i].newly_clued)) {
			continue;
		}
		return i;
	}
	return -1;
}

function find_prompt(hand, suitIndex, rank, ignoreOrders = []) {
	for (const card of hand) {
		const { clued, newly_clued, order, inferred, possible, clues } = card;
		// Ignore unclued, newly clued, and known cards (also intentionally ignored cards)
		if (!clued || newly_clued || possible.length === 1 || ignoreOrders.includes(order)) {
			continue;
		}

		// Ignore cards that don't match the inference
		if (!inferred.some(p => p.matches(suitIndex, rank))) {
			continue;
		}

		// A clue must match the card
		if (clues.some(clue =>
			(clue.type === CLUE.COLOUR && clue.value === suitIndex) || (clue.type === CLUE.RANK && clue.value === rank))
		) {
			return card;
		}
	}
	return;
}

function find_finesse(hand, suitIndex, rank, ignoreOrders = []) {
	for (const card of hand) {
		// Ignore clued and finessed cards (also intentionally ignored cards)
		if (card.clued || card.finessed || ignoreOrders.includes(card.order)) {
			continue;
		}

		// Ignore cards that don't match the inference
		if (!card.inferred.some(p => p.matches(suitIndex, rank))) {
			continue;
		}

		return card;
	}
	return;
}

function determine_focus(hand, list, options = {}) {
	const chopIndex = find_chop(hand);
	logger.debug('determining focus with chopIndex', chopIndex, 'list', list, 'hand', Utils.logHand(hand));

	// Chop card exists, check for chop focus
	if (chopIndex !== -1 && list.includes(hand[chopIndex].order)) {
		return { focused_card: hand[chopIndex], chop: true };
	}

	// Check for leftmost newly clued
	for (const card of hand) {
		if ((options.beforeClue ? !card.clued : card.newly_clued) && list.includes(card.order)) {
			return { focused_card: card, chop: false };
		}
	}

	// Check for leftmost re-clued
	for (const card of hand) {
		if (list.includes(card.order)) {
			return { focused_card: card, chop: false };
		}
	}
}

function bad_touch_num(state, target, cards) {
	let count = 0;
	for (const card of cards) {
		let bad_touch = false;

		const { suitIndex, rank } = card;
		// Play stack is already at that rank or higher
		if (state.play_stacks[suitIndex] >= rank) {
			bad_touch = true;
		}
		// Someone has the card clued already
		else if (Utils.visibleFind(state, state.ourPlayerIndex, suitIndex, rank).some(c => c.clued)) {
			bad_touch = true;
		}
		// Cluing both copies of a card (only include < so we don't double count)
		else if (cards.some(c => c.matches(suitIndex, rank) && c.order < card.order)) {
			bad_touch = true;
		}
		else {
			// The card is inferred in our hand with high likelihood
			const our_hand = state.hands[state.ourPlayerIndex];

			for (const card of our_hand) {
				if (card.inferred.length <= 2 && card.inferred.some(c => c.matches(suitIndex, rank))) {
					bad_touch = true;
					break;
				}
			}
		}

		if (bad_touch) {
			count++;
		}
	}
	return count;
}

module.exports = { find_chop, find_prompt, find_finesse, determine_focus, bad_touch_num };
