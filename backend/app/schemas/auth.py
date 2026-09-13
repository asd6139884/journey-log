from pydantic import BaseModel


# ========================================
# Login
# ========================================

class LoginRequest(BaseModel):
    username: str
    password: str


# ========================================
# Token
# ========================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# ========================================
# Current User
# ========================================

class UserResponse(BaseModel):
    id: int
    username: str
    permissions: list[str]