import bcrypt
from database import get_user
import jwt
from datetime import datetime, timedelta
from typing import Optional

# Secret key for JWT token generation - in production, this should be in a secure environment variable
SECRET_KEY = "your-secret-key-here"  # TODO: Move to environment variable
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """
    Authenticate a user with their username (email) and password.
    Returns the user object if authentication is successful, None otherwise.
    """
    user = get_user(username)
    if not user:
        return None
    
    if not verify_password(password, user['hashed_password']):
        return None
    
    # Remove sensitive information before returning
    user.pop('hashed_password', None)
    return user

def create_access_token(data: dict) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hours
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify a JWT token and return the decoded payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None 