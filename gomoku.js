Games = new Meteor.Collection("games");

function empty_board(){
    var board = [];
    for (var i = 0; i < 15; i++){
        board.push(Array(15));
    }
    return board;
}

if (Meteor.is_server){
    Meteor.startup(function() {
        if (Games.find().count() === 0) {
            Games.insert({
                number: 1,
                board: empty_board(),
                turn: true})
        }
    });
}

if (Meteor.is_client){
    // Page
    Template.page.game_selected = function(){
        return Session.get("game_selected") && Games.find({}).count();
    }
    Template.page.games = function(){
        return Games.find({});
    }
    Template.page.events = {
        'click .games a': function(){
            Session.set("game_selected", this._id);
        },
        'click .newgame': function(){
            var latest = Games.findOne({}, {sort: {number: -1}});
            var number = (latest)? latest.number+1: 1;
            var game_id = Games.insert({
                number: number,
                board: empty_board(),
                turn: true
            });
            Session.set("game_selected", game_id);
        }
    };

    // Board
    Template.board.game = function() {
        return Games.findOne(Session.get("game_selected"));
    };
    Template.board.events = {
        'click td': function(event) {
            var cell = event.currentTarget;
            var row = cell.parentNode;
            var r = $(row).parent().children().index(row);
            var c = $(cell).parent().children().index(cell);

            var game = Games.findOne(Session.get("game_selected"));
            if (game.board[r][c]){ return }
            game.board[r][c] = (game.turn)? "X": "O";
            game.turn = !game.turn;
            Games.update(Session.get("game_selected"), {
                $set: { board: game.board, turn: game.turn }
            });
        },
        'click .leave': function(){
            Session.set("game_selected", undefined);
        }
    };
}
