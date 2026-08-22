# reThink

Don't just know what you can buy. Know what you're giving up.

reThink is a decision-support tool for constrained budgets. It scores feasible kits against your goals, requirements, and priorities, then shows the opportunity cost of each strategy — what you gain, what you give up, and what else that money could have become.

The optimizer is deterministic. Language models only explain results or parse "what if" questions into structured constraints. The product works without them.

## How a decision is scored

1. Product utility is a weighted sum of performance, value, longevity, portability, and quality.
2. Feasible kits cover every must-have, stay under budget, and skip categories you already own.
3. Four strategies are selected from the same feasible set: Best Overall, Performance First, Best Value, and Conservative.
4. Opportunity cost is computed against the cheapest must-have kit and against the other strategies.

## Demo brief

- Budget: $1,000
- Goals: programming + university
- Must have: laptop
- Want: monitor, headphones, keyboard
- Already own: mouse, backpack
- Priorities: performance 40%, longevity 25%, value 20%, portability 15%
