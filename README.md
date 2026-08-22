# reThink

Don't just know what you can buy. Know what you're giving up.

reThink is a decision-support tool for constrained budgets. It scores feasible kits against your goals, requirements, and priorities, then shows the opportunity cost of each strategy — what you gain, what you give up, and what else that money could have become.

The optimizer is deterministic. Language models only explain results or parse "what if" questions into structured constraints. The product works without them.

##  Tech Stack

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

## What do we bring to the Table 

We often have to choose between items with a restrictive budget. We are here to solve that problem. For your budget and needs, we assign weights to the products you want and use a formula to find the most optimal buying strategies using the concept of opportunity cost. 

## How it Works 

User Input
   ↓
Budget + Requirements + Wants + Priorities
   ↓
Product Data (JSON)
   ↓
Constraint Engine
   ↓
Scoring & Utility Calculation
   ↓
Optimization Engine
   ↓
Best Strategies + Alternatives
   ↓
Opportunity Cost Analysis
   ↓
Gemini AI → Human-readable explanation
   ↓
Recommendation + What You Gain + What You Give Up


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

## Project Structure/Architecture

<img width="1536" height="1024" alt="ChatGPT Image Aug 22, 2026, 02_34_59 PM" src="https://github.com/user-attachments/assets/c9e3f479-fac7-45d8-8cd0-030b00926c8d"/>



