import itertools
from typing import List, Dict
from models import Product, UserPreferences, Bundle

class TradeOffEngine:
    def __init__(self, catalog: List[Product]):
        self.catalog = catalog

    def calculate_utility(self, product: Product, prefs: UserPreferences) -> float:
        """Calculates personalized utility score for a single product."""
        attrs = product.attributes.dict()
        score = 0.0
        
        # 1. Base attribute score
        for key, weight in prefs.weights.items():
            if key in attrs:
                score += (attrs[key] / 100.0) * weight
                
        # 2. Goal alignment bonus (0.1 per matching goal)
        goal_matches = set(product.goal_tags).intersection(set(prefs.goals))
        score += len(goal_matches) * 0.1
        
        # 3. Price efficiency (if price weight is provided)
        price_weight = prefs.weights.get("price", 0.0)
        if price_weight > 0 and product.price > 0:
             # Lower price = higher score (normalized roughly to a max expected budget)
             price_score = max(0, 1 - (product.price / prefs.budget))
             score += price_score * price_weight
             
        return score

    def generate_bundles(self, prefs: UserPreferences) -> List[Bundle]:
        """Generates valid combinations and categorizes them by strategy."""
        
        # 1. Filter catalog by requested categories (skip existing items)
        needed_cats = [c for c in prefs.mandatory_categories + prefs.optional_categories 
                      if c not in prefs.existing_items]
        
        grouped_products = {cat: [] for cat in needed_cats}
        for p in self.catalog:
            if p.category in grouped_products:
                grouped_products[p.category].append(p)

        # 2. Combinatorial Search (Brute force for MVP/small data)
        valid_bundles = []
        product_lists = [grouped_products[cat] for cat in needed_cats if grouped_products[cat]]
        
        for combo in itertools.product(*product_lists):
            total_cost = sum(p.price for p in combo)
            
            # Constraint: Must be under budget
            if total_cost > prefs.budget:
                continue
                
            # Constraint: Must contain all mandatory categories
            combo_cats = {p.category for p in combo}
            if not all(mc in combo_cats for mc in prefs.mandatory_categories if mc not in prefs.existing_items):
                continue
                
            total_utility = sum(self.calculate_utility(p, prefs) for p in combo)
            
            valid_bundles.append(Bundle(
                id="-".join([p.id for p in combo]),
                products=list(combo),
                total_cost=total_cost,
                remaining_budget=prefs.budget - total_cost,
                total_utility=total_utility,
                strategy_label="Standard"
            ))

        return self._rank_strategies(valid_bundles, prefs)

    def _rank_strategies(self, bundles: List[Bundle], prefs: UserPreferences) -> List[Bundle]:
        if not bundles:
            return []

        # 🏆 Best Overall (Max total utility based on user weights)
        best_overall = max(bundles, key=lambda b: b.total_utility)
        best_overall.strategy_label = "Best Overall"

        # 🚀 Performance First (Max utility ignoring price weight)
        temp_weights = prefs.weights.copy()
        prefs.weights["price"] = 0.0
        perf_bundles = sorted(bundles, key=lambda b: sum(self.calculate_utility(p, prefs) for p in b.products), reverse=True)
        best_perf = perf_bundles[0]
        best_perf.strategy_label = "Performance First"
        prefs.weights = temp_weights # restore

        # 💰 Best Value (Max utility per dollar)
        best_value = max(bundles, key=lambda b: b.total_utility / b.total_cost if b.total_cost > 0 else 0)
        best_value.strategy_label = "Best Value"

        # 🛡️ Conservative (Cheapest valid bundle that meets mandatory reqs)
        conservative = min(bundles, key=lambda b: b.total_cost)
        conservative.strategy_label = "Conservative"

        # Deduplicate bundles that might win multiple categories
        strategies = {}
        for b in [best_overall, best_perf, best_value, conservative]:
            if b.id not in strategies:
                strategies[b.id] = b

        return list(strategies.values())

    def calculate_opportunity_cost(self, selected_bundle: Bundle, alternatives: List[Bundle]) -> Dict:
        """Calculates exactly what is sacrificed by choosing this bundle."""
        if not alternatives:
            return {}

        selected_cats = {p.category for p in selected_bundle.products}
        
        # Find the best alternative bundle that we CANNOT afford anymore
        best_alt = next((a for a in alternatives if a.id != selected_bundle.id), None)
        
        if not best_alt:
            return {"sacrificed_items": [], "financial_cost": 0, "utility_diff": 0}

        alt_cats = {p.category for p in best_alt.products}
        
        # What do we explicitly give up?
        sacrificed_categories = alt_cats - selected_cats
        sacrificed_items = [p.name for p in best_alt.products if p.category in sacrificed_categories]

        return {
            "sacrificed_items": sacrificed_items,
            "financial_sacrifice_vs_cheapest": selected_bundle.total_cost - min(a.total_cost for a in alternatives),
            "foregone_alternative_name": ", ".join([p.name for p in best_alt.products]),
            "utility_difference": round(best_alt.total_utility - selected_bundle.total_utility, 2)
        }
