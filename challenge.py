import hashlib
import time

class Move:
    NONE = 0
    ROCK = 1
    PAPER = 2
    SCISSORS = 3

    def __init__(self, commitment, move=0):
        self.commitment = commitment
        self.move = move

    @classmethod
    def move_to_str(cls, move):
        return {
            cls.NONE: "None",
            cls.ROCK: 'Rock',
            cls.PAPER: "Paper",
            cls.SCISSORS: "Scissors"
        }[move]

class Challenge:
    def __init__(self, creator_address, _id, commitment):
        self.creator_address = creator_address
        self.opponent_address = None

        self.commitments = {
            self.creator_address: Move(commitment)
        }

        self.id = _id

        self.winner_address = None
        self.created_at = time.time()

    @staticmethod
    def generate_hash(input):
        return hashlib.sha256(input.encode()).hexdigest()

    def add_opponent(self, address, commitment):
        self.opponent_address = address
        self.commitments[address] = Move(commitment)

    def reveal(self, address, move, nonce):
        check_address = self.opponent_address
        if address == self.opponent_address:
            check_address = self.creator_address
        
        opponent_commitment = self.commitments.get(check_address)
        if not opponent_commitment:
            raise Exception("Opponent has not committed yet.")
    
        committed_move = self.commitments.get(address)
        if not committed_move:
            raise Exception("You have not committed yet.")

        reveal_hash = Challenge.generate_hash(nonce + move)
        if committed_move.commitment != reveal_hash:
            raise Exception("Move does not match committed move.")
        
        self.commitments[address] = Move(committed_move.commitment, int(move))
        print("Reveal complete")

    def both_revealed(self):
        opponent_move = self.commitments[self.opponent_address].move != 0
        creator_move = self.commitments[self.creator_address].move != 0
        return opponent_move and creator_move

    def evaluate_winner(self):
        # generate notice and vouchers for winner
        opponent_move = self.commitments[self.opponent_address].move
        creator_move = self.commitments[self.creator_address].move

        # Rock beats Scissors
        if creator_move == Move.ROCK and opponent_move == Move.SCISSORS:
            self.winner_address = self.creator_address
        elif opponent_move == Move.ROCK and creator_move == Move.SCISSORS:
            self.winner_address = self.opponent_address

        # Scissors beats Paper
        elif creator_move == Move.SCISSORS and opponent_move == Move.PAPER:
            self.winner_address = self.creator_address
        elif opponent_move == Move.SCISSORS and creator_move == Move.PAPER:
            self.winner_address = self.opponent_address

        # Paper beats Rock
        elif creator_move == Move.PAPER and opponent_move == Move.ROCK:
            self.winner_address = self.creator_address
        elif opponent_move == Move.PAPER and creator_move == Move.ROCK:
            self.winner_address = self.opponent_address

        # Return the winner's address
        return self.winner_address # if none no winner/draw

    def has_opponent_committed(self):
        opponent_commitment = self.commitments.get(self.opponent_address)
        return opponent_commitment != None