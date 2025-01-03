
# Champion Recommender App - Product Requirements Document (PRD)

> **File:** `champion-recommender-prd.md`  
> **How to Download:** Copy the content of this code block into a file named `champion-recommender-prd.md`.  
> **Last Updated:** 2025-01-02

---

## Table of Contents
1. [Purpose and Objectives](#1-purpose-and-objectives)
2. [Product Overview](#2-product-overview)
3. [Features and Functionality](#3-features-and-functionality)
4. [User Stories and Use Cases](#4-user-stories-and-use-cases)
5. [Technical Requirements](#5-technical-requirements)
6. [Design Requirements](#6-design-requirements)
7. [Dependencies and Constraints](#7-dependencies-and-constraints)
8. [Detailed Requirements](#8-detailed-requirements)
9. [File Structure](#9-file-structure)
10. [Documentation and References](#10-documentation-and-references)
11. [LLM Usage Examples](#11-llm-usage-examples)
12. [Change Log](#12-change-log)

---

## 1. Purpose and Objectives

### Purpose
The **Champion Recommender App** is a desktop application powered by a Large Language Model (LLM) intended to assist League of Legends players in making better decisions during champion select. By providing real-time recommendations based on bans, picks, and team compositions, the app empowers users to choose optimal champions, runes, items, summoner spells, and skill orders.

### Objectives
1. **Champion Selection Guidance**: Recommend the most suitable champion picks to complement an existing team composition or counter specific enemy picks.
2. **Post-Select Optimization**: Provide optimized rune pages, summoner spells, item builds, and skill orders after the champion is locked in.
3. **Enhanced User Experience**: Automate champion select detection and deliver advice seamlessly, reducing the manual effort players need to invest in analysis.

---

## 2. Product Overview

### Target Audience
- **Casual to Competitive League of Legends Players**: Suitable for all skill levels, from beginner to pro.
- **Team-Oriented Players**: Individuals who care about synergy, counters, and meta efficacy.
- **Champion Enthusiasts**: Players aiming to master new champions with the best possible setups.

### Key Features
- **Real-time Champion Select Detection**: Automatic detection when champion select begins.
- **LLM-Powered Recommendations**: Intelligent suggestions for champions based on team synergy, bans, and enemy picks.
- **Post-Select Setup**: In-depth guidance for runes, summoner spells, item builds, and skill order.

---

## 3. Features and Functionality

### Core Features

#### 1. Champion Select Detection
- **Automatic Detection**: The app recognizes when the user enters champion select (via Riot API or process hook).
- **Real-Time Monitoring**: Continuously monitors bans and picks as they happen.

#### 2. Champion Recommendation
- **Team Composition Analysis**: Evaluates synergy among allied champions and identifies potential gaps (e.g., lack of frontline, damage type balance).
- **Opponent Counter Logic**: Suggests champions that counter or mitigate enemy threats.
- **Ban Awareness**: Excludes banned or already-picked champions from the recommendation pool.

#### 3. Post-Select Optimization
- **Rune Setup**: Suggests runes based on current meta, champion role, and synergy with team composition.
- **Summoner Spells**: Recommends optimal summoner spells based on champion, role, matchup, and user preferences.
- **Item Builds**: Provides a suggested item path focusing on early-game advantage and late-game scaling.
- **Skill Order**: Offers the best skill maxing sequence based on champion, lane matchup, and current meta strategies.

#### 4. User Interface
- **Welcoming Screen**: A straightforward home screen when the app is launched.
- **Minimalist Overlay**: During champion select, shows champion recommendations in a compact view so as not to clutter the screen.
- **Post-Select Screen**: Detailed breakdown of recommended runes, items, and skill order after champion lock-in.

#### 5. Customizability
- **Champion Filter**: Users can limit suggestions to champions they own or are proficient with.
- **Meta vs. Niche**: Toggle between highly popular (meta) picks and off-meta or niche strategies.
- **User Preferences**: Store personal preference data for future recommendations (e.g., user’s top roles or playstyle).

#### 6. Dynamic Updates for Changing Meta
- **Patch-Based Updates**: Automated system to update champion and item data whenever Riot publishes a new patch.
- **LLM Supplementation**: The LLM’s static knowledge is refined and adjusted via rule-based or data-driven updates, ensuring recommendations remain relevant over time.

---

## 4. User Stories and Use Cases

### User Stories
1. **Synergy Seeking**: “As a League player, I want the app to suggest a champion that synergizes with my team’s composition.”
2. **Counterpicking**: “As a user, I want the app to recommend champions that effectively counter enemy picks.”
3. **Post-Pick Guidance**: “As a player, I want detailed recommendations for runes, summoner spells, and item builds tailored to the champion I select.”
4. **Automatic Detection**: “As a user, I want the app to detect champion select so I don’t have to activate it manually each time.”
5. **Meta Relevance**: “As a user, I want the app to stay up-to-date with the shifting meta, champion changes, and new items.”

### Use Cases
1. **Real-Time Champion Picks**: A user enters champion select, the app displays a list of recommended champions based on current bans and picks.
2. **Team-Focused Guidance**: When a user hovers over each champion suggestion, they see synergy reasons or counter-arguments (why a particular champion is recommended).
3. **Post-Selection Advice**: Once a champion is locked in, the app immediately shows recommended rune pages, summoner spells, item paths, and skill order.
4. **Meta Updates**: The app detects a new patch release, updates local data, and modifies the recommendations accordingly.

---

## 5. Technical Requirements

### Platform
- **Desktop Application**: Windows (primary support).

### Integration
- **Riot Games API**: Real-time data fetch for champion select phases, champion stats, ban/pick data, etc.

### AI Model
- **Large Language Model (LLM)**:
  - Generating synergy and counter advice.
  - Processing champion-specific roles and item interactions.
  - Handling user queries in a more conversational or flexible manner.

### Key Functionalities
- **Real-Time Data Parsing**: Read champion select data from Riot’s API or game client in real-time.
- **LLM Decision-Making**: Generate recommendations using synergy/counter logic plus dynamic data updates.
- **Dynamic Updates**: Continuously track game patches and adjust logic or partial data to maintain accuracy.

---

## 6. Design Requirements

### User Interface
- **Home Screen**: Welcoming UI with relevant instructions or patch notes.
- **Overlay**: Minimalistic display overlay during champion select with recommended champions.
- **Post-Select Screen**: Detailed panel featuring runes, summoner spells, items, and skill order suggestions.

### User Experience
- **Non-Intrusive**: App overlay should not obstruct the game client and should adapt to screen size/resolution.
- **Transitions**: Smooth transitions from champion select overlay to post-select screen once the champion is locked in.
- **Customization**: UI elements allowing toggles for personal favorites or specific champion pools.

---

## 7. Dependencies and Constraints

### Dependencies
1. **Riot Games’ API**: Must be used under Riot’s policies for third-party tools.
2. **Reliable LLM**: The model must be well-trained or fine-tuned on League-specific data and updated as needed.
3. **[Next.js 13+](https://nextjs.org/docs)**: For building the UI in a minimal, modern environment (if using a web-based approach or Electron for a desktop wrap).
4. **[Tailwind CSS 3+](https://tailwindcss.com/docs)**: For a minimal overhead styling solution (optional but recommended).
5. **[TypeScript 4+](https://www.typescriptlang.org/docs/)**: Ensures type safety in the project, strongly recommended for large-scale code.

### Constraints
1. **Performance**: Must provide recommendations instantly or near real-time without causing lag.
2. **Compliance**: Must follow Riot’s third-party guidelines, ensuring the tool doesn’t violate the Terms of Service.
3. **Security & Privacy**: Must handle any user data (e.g., API keys, personal champion lists) securely and privately.

### Solution to LLM Update Problem
1. **Modular Updates**: The LLM’s core knowledge is enhanced via rule-based or data-driven modules that reflect the latest champion/item changes.
2. **Patch Monitoring System**: Automates detection of new patches and updates the internal database (champion stats, item stats, synergy logic).

---

## 8. Detailed Requirements

1. **Champion Select Detection**
   - **Requirement**: Must automatically detect when champion select begins within 1-2 seconds after it starts.
   - **Data Source**: Riot API for real-time ban/pick events.

2. **Recommendation Engine**
   - **LLM Integration**: 
     - The system must generate synergy and counter recommendations using an LLM fine-tuned on at least the last 3 major patches.
   - **Synergy Logic**:
     - The synergy scoring system must factor in champion role, type of damage (physical vs. magical), and potential synergy with allies (e.g., wombo combo).
   - **Counter Logic**:
     - Must consider lane matchups, champion classes, and user skill level (optional advanced feature).
   - **Ban Awareness**:
     - If the recommended champion is banned or picked, the system re-generates recommendations within 1 second.

3. **Post-Select Optimization**
   - **Rune Recommender**:
     - Must output a recommended primary and secondary path within 1 second.
   - **Summoner Spells**:
     - Must consider champion role, e.g., typical Top-lane picks (Teleport vs Ignite) or Jungle (Smite).
   - **Item Build Path**:
     - Must detail at least one standard build (core items) and one situational build (counter items).
   - **Skill Order**:
     - Must provide recommended ability maxing priority and brief rationale if possible.

4. **UI/UX Requirements**
   - **Overlay**:
     - Non-blocking overlay that automatically resizes based on screen resolution.
   - **Customization**:
     - A user should be able to filter out certain roles or champions if they prefer.
   - **Error Handling**:
     - If the app cannot retrieve data from Riot API, display a friendly warning with retry options.

5. **Patch Monitoring & Meta Updates**
   - **Auto-check**:
     - Every 24 hours (configurable), the app should check for new patch data.
   - **Data Refresh**:
     - If a new patch is detected, automatically download champion/item changes and integrate them into the synergy/counter logic.

6. **Performance & Security**
   - **Latency**:
     - Total recommendation response time during champion select should be under 2 seconds.
   - **API Key Management**:
     - The user’s Riot API key should be stored securely (encrypted on disk if applicable).

---

## 9. File Structure

The following is a **minimal** yet **technically valid** file structure that merges multiple configurations and documentation into as few files as possible. For a larger or production-scale application, files would typically be split out for clarity. For now, the structure is:

```bash
champion-recommender/
 ┣ .git/                  # Git folder (invisible, no changes needed)
 ┣ .gitignore             # Minimal .gitignore 
 ┣ package.json           # Merged config for dependencies, ESLint, scripts, partial docs
 ┣ next.config.mjs        # Combine Next.js, Tailwind, and PostCSS configs (if needed)
 ┣ tsconfig.json          # Minimal TS config
 ┗ app/
    ┗ page.tsx            # Single Next.js route; all UI & synergy logic if desired
```

**Notes**:
- `.gitignore` includes `node_modules`, `.next`, `.env*`, and any other sensitive or build-related files.
- `package.json` holds dependencies (e.g., `next`, `react`, `react-dom`, `tailwindcss`, etc.), scripts (`dev`, `build`, `start`), and can embed your ESLint config and partial docs.
- `next.config.mjs` can be omitted if no custom Next.js or PostCSS/Tailwind config is required.
- `tsconfig.json` is minimal but sufficient to run Next.js with TypeScript.
- `app/page.tsx` can contain all UI, synergy logic, and example code for champion selection, bridging the LLM with the UI for recommendation suggestions.

---

## 10. Documentation and References

To ensure developers have quick access to official documentation:

1. **Next.js 13+**  
   - [Next.js Documentation](https://nextjs.org/docs)  
   - Key points: app directory structure, server/client components, built-in routing.

2. **Tailwind CSS 3+**  
   - [Tailwind Documentation](https://tailwindcss.com/docs)  
   - Key points: utility classes, theming, responsive design.

3. **TypeScript 4+**  
   - [TypeScript Documentation](https://www.typescriptlang.org/docs/)  
   - Key points: type annotations, compiler options, advanced typing features.

4. **Riot Games Developer Portal**  
   - [Riot Developer Portal](https://developer.riotgames.com/)  
   - Key points: champion data endpoints, usage restrictions, rate limits.

5. **OpenAI or Other LLM Provider** (If Using an LLM API)  
   - [OpenAI Documentation](https://platform.openai.com/docs/introduction)  
   - Key points: API usage, rate limits, token management, fine-tuning guidelines.

---

11. LLM Usage Examples
The following section demonstrates the standard prompt structure and expected responses for the LLM component.
Standard Prompt Template
pythonCopyprompt = (
    f"You are an expert League of Legends coach. Based on my picked champion, "
    f"allies, and enemies, recommend the optimal runes and items for this match. "
    f"Here is the context:\n\n"
    f"**My Champion:** {champion['champion_name']}\n"
    f"**Allies:** {', '.join(allies) if allies else 'None'}\n"
    f"**Enemies:** {', '.join(enemies) if enemies else 'None'}\n\n"
    f"Please don't use asterisks and give every rune its own line and give every item its own line and provide a concise response in the following structured format:\n"
    f"- Runes:\n"
    f"  Keystone: <Keystone Rune>\n"
    f"  Primary Tree: <Primary Tree Runes>\n"
    f"  Secondary Tree: <Secondary Tree Runes>\n"
    f"  Stat Shards: <Stat Shards>\n"
    f"- Items:\n"
    f"  Starting Items: <Starting Items>\n"
    f"  Core Items: <Core Items>\n"
    f"  Situational Items: <Situational Items>\n"
    f"- Explanation: <Brief Explanation of Choices>"
    f"YOU MUST GIVE EACH RUNE ITS OWN LINE. YOU MUSTI GIVE EACH ITEM ITS OWN LINE. for the stat shard only say the name of it (dont add the +8). Write nothing else"
)
Example Usage Scenarios
Scenario 1: Full Team Composition Analysis
Input:
CopyMy Champion: Yasuo
Allies: Amumu, Leona, Miss Fortune, Lulu
Enemies: Garen, Sejuani, Ahri, Jinx, Nautilus
Expected Response:
Copy- Runes:
  Keystone: Conqueror
  Primary Tree:
    Triumph
    Legend: Alacrity
    Last Stand
  Secondary Tree:
    Second Wind
    Unflinching
  Stat Shards:
    Attack Speed
    Adaptive Force
    Armor

- Items:
  Starting Items:
    Doran's Blade
    Health Potion
  Core Items:
    Immortal Shieldbow
    Infinity Edge
    Bloodthirster
  Situational Items:
    Death's Dance
    Guardian Angel
    Mortal Reminder

- Explanation: This build maximizes survivability against the heavy CC composition while maintaining high damage output. Conqueror provides sustained damage, while Second Wind and Unflinching help survive the laning phase against Garen. Shieldbow into IE provides core damage, with situational defensive items against their heavy engage composition.

Scenario 2: Counter Pick Analysis
Input:
CopyMy Champion: Darius
Allies: None
Enemies: Garen
Expected Response:
Copy- Runes:
  Keystone: Conqueror
  Primary Tree:
    Triumph
    Legend: Tenacity
    Last Stand
  Secondary Tree:
    Second Wind
    Unflinching
  Stat Shards:
    Attack Speed
    Adaptive Force
    Armor

- Items:
  Starting Items:
    Doran's Blade
    Health Potion
  Core Items:
    Stridebreaker
    Dead Man's Plate
    Black Cleaver
  Situational Items:
    Sterak's Gage
    Death's Dance
    Spirit Visage

- Explanation: Build focuses on early lane dominance and scaling against Garen's tankiness. Con
---

## 12. Change Log

| Date       | Description                                          | Author         |
|------------|------------------------------------------------------|----------------|
| 2025-01-02 | Added file structure details, example LLM responses, and references to external docs; integrated feedback to clarify developer alignment. | *Alessandro Moscardo*  |

---

**End of Document**
