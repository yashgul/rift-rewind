You are generating a League of Legends "Wrapped" summary (like Spotify Wrapped) for a player.

CRITICAL: You MUST return ONLY valid JSON matching this EXACT structure. No markdown, no explanation, no text outside the JSON.

{
    "wrapped": {
        "tagline": "string (3-5 words, creative title for their playstyle)",
        "summary": "string (2 sentences about player personality)",
        "archetype": "string (their playstyle archetype)"
    },
    "stats": {
        "games": number,
        "winrate": number,
        "hours": number,
        "peakTime": "string",
        "bestMonth": "string"
    },
    "highlights": [
        {
            "title": "string (catchy title)",
            "description": "string (what they did)",
            "flavor": "string (Wrapped-style comment)",
            "big": "string (the number to display big)",
            "label": "string (what the number represents)",
            "percentile": "string (optional, like 'Top 5%')",
            "icon": "string (optional, champion name)"
        }
        // EXACTLY 5 highlights
    ],
    "champions": {
        "main": {
            "name": "string",
            "games": number,
            "winrate": number,
            "kda": number,
            "insight": "string (interesting fact about this champ)"
        },
        "top3": [
            {"name": "string", "games": number, "wr": number}
            // EXACTLY 3 champions
        ],
        "hiddenGem": {
            "name": "string",
            "games": number,
            "winrate": number,
            "insight": "string"
        } OR null
    },
    "playstyle": {
        "traits": [
            {"name": "string", "score": number (0-100)}
            // EXACTLY 4 traits
        ],
        "summary": "string (one sentence)"
    },
    "memorable": {
        "bestStreak": number,
        "clutchestComeback": "string",
        "bestMonth": "string"
    },
    "funFacts": [
        "string"
        // EXACTLY 4 facts
    ],
    "closing": {
        "message": "string (2 sentences, hype them up)",
        "year": "string"
    }
}

PLAYER DATA:
${JSON.stringify(aggregatedStats, null, 2)}

INSTRUCTIONS:
1. Choose the 5 MOST INTERESTING highlights from the data
2. Prioritize: rare achievements (baron steals, pentakills, comeback wins), extreme stats (very high/low), personality quirks (play time patterns)
3. For percentiles: Use "Top X%" for impressive stats. Only include if the stat is genuinely notable.
4. Tone: Positive and celebratory like Spotify Wrapped. Acknowledge quirks warmly, not harshly.
5. Make the "big" number eye-catching (round if needed, add K for thousands)
6. hiddenGem should be null if no champion has <20 games AND >70% WR
7. For traits, score based on the data: high CS/min = high "Farming", baron steals = high "Objective Control", etc.
8. funFacts should be surprising or amusing observations from the data

CRITICAL RULES:
- Return ONLY the JSON object, nothing else
- ALL array lengths must match exactly (5 highlights, 3 top3, 4 traits, 4 funFacts)
- All numbers must be actual numbers, not strings (except percentiles)
- If a player has no baron steals, pentakills, etc., focus on other interesting patterns
- DO NOT make up stats - only use provided data
    