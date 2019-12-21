/**
 * The Freecell
 */

var Freecell = function() {
    this.free = [null, null, null, null];
    this.suits = [null, null, null, null];
    this.columns = [[], [], [], [], [], [], [], []];
    this.deck = new this.Deck();
};

/*
 * Initialise the Freecell object.
 */

Freecell.prototype.init = function() {
    var card;

    // shuffle the deck
    this.deck.shuffle();

    for (var i = 0; i < 52; i++) {
        // add the cards to the columns
        card = this.deck.cards[i];
        this.columns[i % 8].push(card);
    }
};

/*
 * Reset the Freecell
 */

Freecell.prototype.reset = function() {
    var i, col;

    this.free = [null, null, null, null];
    this.suits = [null, null, null, null];

    for (i = 0; i < 8; i++) {
        col = this.columns[i];
        col.length = 0;
    }

    this.init();
};

/*
 * Create an array of ids of the valid draggable cards.
 */

Freecell.prototype.validDragIds = function() {
    var dragIds, i, card, col, colLen;

    dragIds = [];

    // add cards in freecell spaces
    for (i = 0; i < 4; i++) {
        card = this.free[i];
        if (card !== null) {
            dragIds.push(card.id.toString());
        }
    }
    // add cards at the bottom of columns
    for (i = 0; i < 8; i++) {
        col = this.columns[i];
        colLen = col.length;
        if (colLen > 0) {
            card = col[colLen - 1];
            dragIds.push(card.id.toString());
        }
    }

    return dragIds;
};

/*
 * Create an array of ids of valid drop locations for the card. The ids are
 * the id attribute string in the DOM.
 */

Freecell.prototype.validDropIds = function(cardId) {
    var dropIds, i, free, suitCard, dragCard, bottomCards, card, col;

    dropIds = [];

    // the card being dragged
    dragCard = this.deck.getCard(cardId);

    // add empty freecells
    for (i = 0; i < 4; i++) {
        free = this.free[i];
        if (free === null) {
            dropIds.push('freeSection' + i.toString());
        }
    }

    // add a valid suit cell (if any)
    for (i = 0; i < 4; i++) {
        suitCard = this.suits[i];
        if (suitCard === null) {
            // if the card being dragged is an ace then this is a valid drop
            if (dragCard.value === 1) {
                dropIds.push('suit' + i.toString());
            }
        } else {
            // is the card being dragged the next in the suit sequence to the
            // card in the suit cell - then valid drop
            if ((dragCard.suit === suitCard.suit) &&
                (dragCard.value === suitCard.value + 1)) {
                dropIds.push('suit' + i.toString());
            }
        }
    }

    // add a valid card at the bottom of a column
    bottomCards = this.colBottomCards();
    for (i = 0; i < bottomCards.length; i++) {
        card = bottomCards[i];

        if ((card.value === dragCard.value + 1) &&
            (card.colour !== dragCard.colour)) {
            dropIds.push(card.id.toString());
        }
    }

    // add an empty column as a valid drop location
    for (i = 0; i < 8; i++) {
        col = this.columns[i];
        if (col.length === 0) {
            dropIds.push('col' + i.toString());
        }
    }

    return dropIds;
};

/*
 * Return an array of the cards that are at the bottom of columns
 */

Freecell.prototype.colBottomCards = function() {
    var i, col, cardCount, bottomCards;

    bottomCards = [];

    for (i = 0; i < 8; i++) {
        col = this.columns[i];
        cardCount = col.length;
        if (cardCount > 0) {
            bottomCards.push(col[cardCount - 1]);
        }
    }

    return bottomCards;
};

/**
 * Move a card to a new location
 */

Freecell.prototype.moveCard = function(dragId, dropId) {
    var dragCard, colIndex, dropDiv;

    // pop the card from its current location
    dragCard = this.popCard(dragId);
    console.log('dragCard: ' + JSON.stringify(dragCard));

    if (dropId.length <= 2) {
        // dropping this card on another card in column
        dropId = parseInt(dropId, 10);
        this.pushCard(dragCard, dropId);
        dropDiv = document.getElementById(dropId);
        dropDiv.className += ' ui-draggable ';
        // console.log('1' + ' dropId: ' + JSON.stringify(this.deck.getCard(dropId)));
    } else {
        // dropping on a freecell or suit cell or empty column
        // the index of
        colIndex = parseInt(dropId.charAt(dropId.length - 1), 10);
        if (dropId.slice(0, 1) === 'f') {
            // dropping on a freecell
            this.free[colIndex] = dragCard;
        } else if (dropId.slice(0, 1) === 's') {
            // dropping on a suit cell
            this.suits[colIndex] = dragCard;
        } else {
            // dropping on an empty column
            this.columns[colIndex].push(dragCard);
        }
    }
};

/*
 * Return the card object and remove it from its current location
 * cardId is an integer.
 */

Freecell.prototype.popCard = function(cardId) {
    var i, col, card;

    // check the bottom of each column
    for (i = 0; i < 8; i++) {
        col = this.columns[i];
        if (col.length === 0) {
            continue;
        }
        card = col[col.length - 1];
        if (card.id === cardId) {
            return col.pop();
        }
    }

    // check the freecells
    for (i = 0; i < 4; i++) {
        card = this.free[i];
        if ((card !== null) && (card.id === cardId)) {
            this.free[i] = null;
            return card;
        }
    }

    return null;
};

/*
 * Push the card onto the end of a column based on the id of the bottom card
 */

Freecell.prototype.pushCard = function(card, dropId) {
    var i, col, colLen, bottomCard;

    for (i = 0; i < 8; i++) {
        col = this.columns[i];
        colLen = col.length;
        if (colLen === 0) {
            continue;
        }
        bottomCard = col[col.length - 1];
        if (bottomCard.id === dropId) {
            col.push(card);
            return;
        }
    }
};

/*
 * Has the Freecell been won?
 */

Freecell.prototype.isGameWon = function() {
    var i, card;
    for (i = 0; i < 4; i++) {
        card = this.suits[i];
        if (card === null || card.value !== 13) {
            return false;
        }
    }
    return true;
};

/*
 * Deck object - contains an array of Cards.
 */

Freecell.prototype.Deck = function() {
    var suits, logos, values, titles, colours, i, suit, logo, value, title;

    suits = ['clubs', 'spades', 'hearts', 'diamonds'];
    logos = ['♣', '♠', '♥', '♦'];
    values = [1, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    titles = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5','4', '3', '2'];
    colours = {'clubs': 'black',
               'spades': 'black',
               'hearts': 'red',
               'diamonds': 'red'};

    this.cards = [];
    for (i = 0; i < 52; i++) {
        suit = suits[i % 4];
        logo =  logos[i % 4];
        value = values[Math.floor(i / 4)];
        title = titles[Math.floor(i / 4)];
        this.cards.push(new this.Card(i + 1, suit, logo, value, title, colours[suit]));
    }
};

/*
 * shuffle the deck of cards
 */

Freecell.prototype.Deck.prototype.shuffle = function() {
    var len, i, j, itemJ;

    len = this.cards.length;
    for (i = 0; i < len; i++) {
        j = Math.floor(len * Math.random());
        itemJ = this.cards[j];
        console.log('cards' + i + ': ' + JSON.stringify(itemJ));
        this.cards[j] = this.cards[i];
        this.cards[i] = itemJ;
    }
};

/*
 * Get the card by its id
 */

Freecell.prototype.Deck.prototype.getCard = function(cardId) {
    var i, card;

    for (i = 0; i < 52; i++) {
        card = this.cards[i];
        if (cardId === card.id) {
            console.log("card: " + JSON.stringify(card));
            return card;
        }
    }
    
    return null;
};

/*
 * Card object
 */

Freecell.prototype.Deck.prototype.Card = function(id, suit, logo, value, title, colour) {
    this.id = id;
    this.suit = suit;
    this.logo = logo;
    this.value = value;
    this.title = title;
    this.colour = colour;
};

/*
 * The user interface
 */

var Interface = function(game) {
    this.game = game;
    // an array of all the draggables
    this.drag = [];
    // an array of all the droppables
    this.drop = [];
};

/**
 * Initialise the user interface
 */
Interface.prototype.init = function() {
    this.game.init();

    this.addCards();

    this.newGame();

    this.createDraggables();
};

/*
 * Add cards to the user interface
 */

Interface.prototype.addCards = function() {
    var i, j, cards, numCards, colDiv, card, img, cardDiv;

    for (i = 0; i < 8; i++) {
        cards = this.game.columns[i];
        numCards = cards.length;

        colDiv = document.getElementById('col' + i.toString());

        for (j = 0; j < numCards; j++) {
            // add card divs to the column div
            card = cards[j];

            cardDiv = document.createElement('div');
            cardDiv.className = 'card ' + card.suit + ' ' + card.colour;
            cardDiv.id = card.id;
            cardDiv.style.top = (25 * j).toString() + 'px';
            cardDiv.innerHTML = '<span class="top">' + card.title  + ' ' + card.logo + '</span><span class="center">' + card.logo + '</span>';
            
            colDiv.appendChild(cardDiv);
        }
    }
};

/*
 * Remove the cards from the user interface
 */

Interface.prototype.removeCards = function() {
    var i;
    for (i = 0; i < 8; i++)
    {
        $('#col' + i.toString()).empty();
    }
};

/*
 * Create draggables: cards in the freecells and at the bottoms of all the
 * columns can be dragged.
 */

Interface.prototype.createDraggables = function() {
    var cardIds, cardCount, i, id, cardDiv, thisInterface;

    cardIds = this.game.validDragIds();
    cardCount = cardIds.length;
    thisInterface = this;

    for (i = 0; i < cardCount; i++) {
        id = cardIds[i];
        cardDiv = $('#' + id);

        // add to the list of draggables
        thisInterface.drag.push(cardDiv);

        cardDiv.draggable({
            stack: '.card',
            containment: '#main-table',
            revert: 'invalid',
            revertDuration: 200,
            start: thisInterface.createDroppables(),
            stop: thisInterface.clearDrag()
        });
        cardDiv.draggable('enable');

        // add double-click event handling to all draggables
        cardDiv.bind('dblclick', {thisInterface: thisInterface}, thisInterface.dblclickDraggable);

        cardDiv.hover(
            // hover start
            function(event) {
                $(this).addClass('highlight');
            },
            // hover end
            function(event) {
                $(this).removeClass('highlight');
            }
        );
    }
};

/**
 * When a draggable card is at the bottom of a column and it is double-clicked,
 * check if it can be moved to a foundation column or empty freecell. If it can,
 * then move it.
 */
Interface.prototype.dblclickDraggable = function(event) {
    var thisInterface, dropIds, cardId, dropLen, i, dropId, dropDiv;
    thisInterface = event.data.thisInterface;

    // the valid drop locations for this card
    cardId = parseInt(this.id, 10);
    dropIds = thisInterface.game.validDropIds(cardId);
    dropLen = dropIds.length;

    // can the card be moved to a suit cell
    for (i = 0; i < dropLen; i++) {
        dropId = dropIds[i];
        if (dropId.substr(0, 4) === 'suit') {
            thisInterface.dblclickMove(cardId, dropId, thisInterface);
            return;
        }
    }

    // can the card be moved to an empty freecell
    for (i = 0; i < dropLen; i++) {
        dropId = dropIds[i];
        if (dropId.substr(0, 4) === 'free') {
            thisInterface.dblclickMove(cardId, dropId, thisInterface);
            return;
        }
    }
};

Interface.prototype.dblclickMove = function(cardId, dropId, thisInterface) {
    var offsetEnd, offsetCurrent, dropDiv, leftEnd, topEnd, leftMove,
        topMove, card, leftCurrent, topCurrent, maxZ;

    card = $('#' + cardId);
    dropDiv = $('#' + dropId);
    offsetEnd = dropDiv.offset();
    offsetCurrent = card.offset();
    console.log("card: " + JSON.stringify(card.html()));
    console.log("dropDiv: " + JSON.stringify(dropDiv.html()));

    leftEnd = offsetEnd['left'];
    topEnd = offsetEnd['top'];
    leftCurrent = offsetCurrent['left'];
    topCurrent = offsetCurrent['top'];

    // add 3 for border
    leftMove = leftEnd - leftCurrent + 3;
    topMove = topEnd - topCurrent + 3;

    // before moving the card, stack it on top of all other cards
    maxZ = thisInterface.cardMaxZindex();
    card.css('z-index', maxZ + 1);

    card.animate({top: '+=' + topMove, left: '+=' + leftMove},
                  250,
                  function() {
                        // tell the game the card has moved
                        thisInterface.game.moveCard(cardId, dropId);
                        thisInterface.clearDrag()();
                        thisInterface.isWon();

    });
};

Interface.prototype.cardMaxZindex = function() {
    var maxZ = 0;
    $('.card').each(function(i, el) {
        zIndex = parseInt($(el).css('z-index'), 10);
        if (!isNaN(zIndex) && zIndex > maxZ) {
            maxZ = zIndex;
        }
    });
    return maxZ;
};

/*
 * Create droppables
 */
 
Interface.prototype.createDroppables = function() {
    var thisInterface;
    thisInterface = this;

    var droppers = function(event, ui) {
        var dropIds, i, dropId, dragId, dropDiv;

        dragId = parseInt($(this).attr('id'), 10);
        dropIds = thisInterface.game.validDropIds(dragId);

        for (i = 0; i < dropIds.length; i++) {
            dropId = dropIds[i];
            dropDiv = $('#' + dropId.toString());
            // add to array of droppables
            thisInterface.drop.push(dropDiv);
            dropDiv.droppable({
                // callback for drop event
                drop: function(event, ui) {
                    var cardOffset, thisId;

                    thisId = $(this).attr('id');
                    if (thisId.length <= 2) {
                        // this is a card
                        cardOffset = '0 25';
                    } else if (thisId.charAt(0) === 'c') {
                        // this is an empty column
                        cardOffset = '1 1';
                    } else {
                        // this is a freecell or suit cell
                        cardOffset = '3 3';
                    }

                    // move the droppable to the correct position
                    ui.draggable.position({
                        of: $(this),
                        my: 'left top',
                        at: 'left top',
                        offset: cardOffset
                    });

                    // tell the game that the card has moved
                    thisInterface.game.moveCard(dragId, thisId);

                    // has the game been completed
                    thisInterface.isWon();

                    // reset ui so that there are no droppables
                    thisInterface.clearDrop();
                }
            });
            dropDiv.droppable('enable');
        }
    };

    return droppers;
};

/*
 * Clear all drag items
 */

Interface.prototype.clearDrag = function() {
    var thisInterface;
    thisInterface = this;

    return function(event, ui) {
        var i, item;

        for (i = 0; i < thisInterface.drag.length; i++) {
            item = thisInterface.drag[i];
            // remove hover classes
            item.unbind('mouseenter').unbind('mouseleave');
            // force removal of highlight of cards that are dropped on the
            // suit cells
            $(this).removeClass('highlight');
            // remove double-click handler
            item.unbind('dblclick');
            item.draggable('destroy');
        }
        // empty the draggable array
        thisInterface.drag.length = 0;

        thisInterface.clearDrop();

        // create new draggables
        thisInterface.createDraggables();
    };
};

Interface.prototype.clearDrop = function() {
    var i, item;

    for (i = 0; i < this.drop.length; i++) {
        item = this.drop[i];
        item.droppable('destroy');
        //item.droppable('disable');
    }
    // empty the droppably array
    this.drop.length = 0;
};

Interface.prototype.isWon = function() {
    if (this.game.isGameWon()) {
        $('#main-table section.main').css('z-index', 0);
        $('#main-table section.end').css('z-index', 10);
    }
};

Interface.prototype.newGame = function() {
    var thisInterface = this;

    $('#playgame').click(function() {
        thisInterface.game.reset();
        thisInterface.removeCards();
        thisInterface.addCards();
        thisInterface.createDraggables();
        $('#main-table section.start').css('z-index', 0);
        $('#main-table section.main').css('z-index', 10);
    });

    $('#playagain').click(function() {
        thisInterface.game.reset();
        thisInterface.removeCards();
        thisInterface.addCards();
        thisInterface.createDraggables();
        $('#main-table section.main').css('z-index', 10);
        $('#main-table section.end').css('z-index', 0);
    });
    
};

var myUi;
$(document).ready(function() {
    var game;
    game = new Freecell();
    myUi = new Interface(game);
    myUi.init();
});