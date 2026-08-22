from pydantic import BaseModel
from typing import List, Dict, Optional

class ProductAttributes(BaseModel):
    performance: int
    battery: int
    portability: int
    longevity: int
    build_quality: int

class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    attributes: ProductAttributes
    goal_tags: List[str]

class UserPreferences(BaseModel):
    budget: float
    mandatory_categories: List[str]
    optional_categories: List[str]
    existing_items: List[str]
    goals: List[str]
    weights: Dict[str, float] # e.g., {"performance": 0.4, "price": 0.2, ...}

class Bundle(BaseModel):
    id: str
    products: List[Product]
    total_cost: float
    remaining_budget: float
    total_utility: float
    strategy_label: str
