import datetime
from flask_jwt_extended import create_access_token

def generate_token(identity):
    return create_access_token(identity=identity, expires_delta=datetime.timedelta(days=1))

MENTOR_QUOTES = [
    "Great job! You’re one step closer to your certificate!",
    "Keep going! Every task you finish builds your career.",
    "Pro tip: Break big problems into smaller tasks.",
    "Remember: Consistency beats intensity!"
]

def get_random_quote():
    import random
    return random.choice(MENTOR_QUOTES)
