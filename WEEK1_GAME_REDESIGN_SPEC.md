# Week 1 Game Redesign Spec

This document turns Week 1 into a buildable, animation-first game system mapped to the current codebase.

Core rule for every room:

`player action -> animation -> system reaction -> feedback`

Week 1 should feel like repairing a living machine, not answering questions.

## Product Goal

Transform Week 1 from card-based interactions into a sequence of spatial microgames inside **The Living Lab**.

Every lesson must:

- show visible cause and effect
- use motion and space, not just buttons and text
- teach through manipulation
- be readable for ages 8 to 14
- stay lightweight enough to ship in the current React and Next app

## Keep vs Change

Keep these foundations:

- route structure in `src/app/week/[id]/lesson/[lessonIndex]/page.tsx`
- lesson lookup in `src/lib/game-map.ts`
- progress and XP flow already used by the lesson shell
- sound, drag, particle, companion, and stability primitives already in `src/lib/game/*` and `src/components/game/*`

Change these product assumptions:

- stop treating each lesson as a quiz or matching card
- stop leading with explanatory copy before the player acts
- stop making success feel like a text state change
- make the scene itself the main UI

## Week 1 Room Map

| Slot | Current File | New Room | Keep / Replace | Primary Concept |
|---|---|---|---|---|
| 1 | `src/components/games/BinaryCountingGame.tsx` | Binary Door System | evolve | bits, binary |
| 2 | `src/components/games/ComponentMatchGame.tsx` | Computer Builder | replace interaction | CPU, RAM, storage, input, output |
| 3 | `src/components/games/CodeSortingGame.tsx` | Spaceship Command Game | replace interaction | sequencing |
| 4 | `src/components/games/CodeExecutionChainGame.tsx` | 3D Code Terminal | replace interaction | code execution |
| 5 | `src/components/games/CodeEverywhereQuiz.tsx` | Code Detective | replace interaction | where code exists |
| 6 | `src/components/games/ByteForgeGame.tsx` | Byte Forge | evolve | byte = 8 bits |
| 7 | `src/components/games/SignalTunnelGame.tsx` | Input -> Process -> Output Machine | evolve | IPO |
| 8 | `src/components/games/MemoryVaultGame.tsx` | Memory Sorting Vault | evolve | RAM vs storage |
| 9 | `src/components/games/LiteralBotTestGame.tsx` | Precision Bot | evolve | precise instructions |
| 10 | `src/components/games/LaunchTheLabGame.tsx` | Boot the System | replace structure | final synthesis |

## Shared System Work

These changes should happen before or alongside the room rewrites.

### 1. Lesson Shell

Primary file:

- `src/components/game/GameScene.tsx`

Current role:

- themed wrapper with title, description, companion, stability, and status

New role:

- reusable mission shell with layout presets, HUD, subtitle lane, reaction lane, control dock, and reward state

Add support for:

- `missionTitle`
- `missionObjective`
- `sceneLayout`
- `controlsSlot`
- `reactionSlot`
- `subtitle`
- `hint`
- `rewardPreview`
- `reducedMotion`

Design rules:

- description text becomes secondary and short
- the scene should occupy at least 65 percent of the vertical focus
- companion bubble should never cover the main interaction target

### 2. Companion System

Primary files:

- `src/lib/game/use-companion.ts`
- `src/components/game/Companion.tsx`

Required upgrades:

- support both `byte` and `echo` in the same room
- support event-driven dialogue keys such as `intro`, `firstSuccess`, `mistake`, `combo3`, `hint`, `complete`
- support age-mode tone variants
- allow player name injection

Implementation note:

Use short lines only. Echo explains the concept. Byte reacts emotionally.

### 3. Stability and Combo

Primary file:

- `src/components/game/StabilityBar.tsx`

Required upgrades:

- add a recovery animation when players fix a mistake
- add visible combo charge, not just text
- add safe-failure messaging such as `System wobble` instead of punitive language

Behavior:

- mistakes reduce stability a little
- hints cost no stability
- retries are instant
- combo breaks softly and never creates a fail screen

### 4. Scene Runtime

Recommended new files:

- `src/lib/game/use-mission-state.ts`
- `src/lib/game/use-timeline.ts`
- `src/lib/game/motion.ts`

Purpose:

- standardize room flow
- centralize tween durations
- avoid each game inventing its own timing logic

Recommended mission states:

- `intro`
- `ready`
- `interacting`
- `reacting`
- `success`
- `reward`
- `complete`

### 5. Accessibility Layer

Required global support:

- reduce motion toggle
- subtitles for sound cues
- non-color feedback for correctness
- large hit targets
- tap alternatives for drag actions

Recommended new helper:

- `src/lib/game/use-accessibility.ts`

## Room Specs

## 1. Binary Door System

Current file:

- `src/components/games/BinaryCountingGame.tsx`

New fantasy:

- a sealed blast door blocks the Bit Reactor corridor
- the player flips wall switches to match a target decimal number
- energy travels through wires and unlocks the physical door

Interaction:

- 5 to 8 switches depending on difficulty
- each switch controls a glowing power rail
- toggling a switch immediately updates wire flow and door lock state

Layout:

- left: large blast door with three lock bolts
- center: live wire network and bit rails
- bottom: switch deck with values
- right: target display and current power readout

Animation beats:

- tap switch: `120ms` push and glow
- correct contribution: wire pulse travels upward
- exact match: locks disengage one by one, then door opens
- wrong overshoot: meter flickers, small steam burst, no hard fail

State machine:

- `ready`
- `flipping`
- `matched`
- `doorOpening`
- `complete`

Acceptance criteria:

- players can understand the target through the moving system, not a paragraph
- every toggle changes a visible system state within `120ms`
- success ends with the door opening, not just a message

## 2. Computer Builder

Current file:

- `src/components/games/ComponentMatchGame.tsx`

New fantasy:

- The Core has a broken workstation shell
- the player drags physical parts into a chassis and watches the machine boot

Interaction:

- drag CPU, RAM, storage, input, and output parts into snap zones on a motherboard
- once placed, the player taps `Power Test`

Layout:

- center: open machine chassis
- bottom tray: draggable parts
- side panel: small mission prompts and part hints

Animation beats:

- hover near slot: slot ring magnetizes
- correct drop: part snaps in, label pulses, connected traces light up
- wrong drop: part bounces out, tiny spark, Byte says a correction line
- power test: fan spins, monitor wakes, keyboard lights, output screen boots

Learning behavior:

- after each correct placement, Echo gives a single concept line
- example: `CPU runs the instructions.` or `RAM holds what you're using now.`

Acceptance criteria:

- no left-right matching columns remain
- the player learns by placing and activating parts
- each part has a functional wake-up animation

## 3. Spaceship Command Game

Current file:

- `src/components/games/CodeSortingGame.tsx`

New fantasy:

- a scout ship must cross an obstacle grid above The Core
- the player builds a short command sequence and then watches execution in real time

Interaction:

- commands: `forward`, `turn left`, `turn right`, `boost`, `scan`
- player drags or taps commands into a sequence rail
- ship executes after pressing `Run`

Layout:

- top: bird's-eye map with hazards, walls, and target beacon
- bottom: command rail and available instruction chips

Animation beats:

- placing a command snaps into the queue
- run starts with a countdown and thruster ignition
- each step animates clearly with pause beats between actions
- wrong sequence causes a crash, spin, or loop and auto-resets to planning state
- success ends with a dramatic docking beam and map repair

Acceptance criteria:

- the player watches the algorithm run, step by step
- wrong order produces a funny but clear failure
- planning and execution are visually distinct phases

## 4. 3D Code Terminal Experience

Current file:

- `src/components/games/CodeExecutionChainGame.tsx`

New fantasy:

- the player restores a terminal tower that shows how code becomes machine activity

Interaction:

- player chooses or types a tiny command such as `print HELLO`
- then presses `Execute`

Visual sequence:

1. source code appears on the terminal
2. line breaks into glowing tokens
3. tokens convert into binary pulses
4. pulses travel into the CPU core
5. screen wall shows the output

Layout:

- center: cinematic terminal stage
- left: source input
- right: output monitor and CPU chamber

Animation beats:

- tokenization should feel magical, like code shattering into parts
- binary pulses should move physically across a pipe or data rail
- CPU chamber should visibly react with spinning cores or light rings

Acceptance criteria:

- the player sees all five transformation stages
- this room feels more cinematic than the others
- explanation appears after each stage in one short Echo line, never as a long paragraph

## 5. Code Detective

Current file:

- `src/components/games/CodeEverywhereQuiz.tsx`

New fantasy:

- the player sweeps a diagnostic scanner across objects in the lab and nearby world artifacts
- code is discovered through x-ray overlays and hidden circuitry

Interaction:

- drag a scanner beam across objects
- tap `contains code` or `no code`
- reveal layer shows chips, sensors, screens, firmware, or plain physical material

Layout:

- main scene with 3 to 4 objects placed in a room
- scanner lens overlay follows the pointer or finger
- evidence tags appear after scanning

Animation beats:

- scan line hum and glow
- hidden circuitry lights up under digital objects
- non-code items reveal wood, paper, or simple mechanics instead

Acceptance criteria:

- remove the quiz-card feeling entirely
- players inspect objects before deciding
- the reveal itself teaches the answer

## 6. Byte Forge

Current file:

- `src/components/games/ByteForgeGame.tsx`

New fantasy:

- the player forges byte capsules by filling 8 physical bit sockets around a capsule chamber

Interaction:

- drag or tap energy bits into 8 slots
- once full, the chamber seals and compresses into a byte capsule

Layout:

- center: circular forge chamber
- lower tray: bit orbs
- upper shelf: completed capsules

Animation beats:

- dropped bit falls into a slot with a satisfying clack
- chamber glow increases with each filled slot
- slot eight triggers a seal ring and capsule launch

Acceptance criteria:

- the idea that one byte equals eight bits is shown physically
- kids can count the eight slots at a glance
- completion feels collectible and satisfying

## 7. Input -> Process -> Output Machine

Current file:

- `src/components/games/SignalTunnelGame.tsx`

New fantasy:

- a visible machine transforms inputs into outputs through a central processor chamber

Interaction:

- player selects an input object and feeds it into the machine
- player chooses or configures the process
- output visibly emerges from the exit bay

Example rounds:

- button press -> CPU checks signal -> door opens
- camera image -> processor analyzes -> alert icon appears
- audio clap -> machine detects -> lights flash

Layout:

- left intake zone
- center process chamber with moving gears or scanner
- right output bay

Animation beats:

- object enters with conveyor motion
- process chamber lights, spins, or scans
- result pops out of the right bay with a label and effect

Acceptance criteria:

- input, process, and output are always visible on screen at the same time
- the player manipulates the system, not just labels

## 8. Memory Sorting Vault

Current file:

- `src/components/games/MemoryVaultGame.tsx`

New fantasy:

- the player sorts live files into RAM shelves or permanent storage lockers
- then triggers a shutdown to see what survives

Interaction:

- drag cards or file capsules into `Active Memory` or `Storage Vault`
- after sorting a small batch, hit `Power Off`

Animation beats:

- RAM shelf glows hot and fast
- storage vault doors close with a heavy lock sound
- on shutdown, RAM shelves empty and fade
- on reboot, storage lockers reopen with saved files still inside

Acceptance criteria:

- persistence is taught by the shutdown event, not by text
- kids can immediately compare what disappears and what remains

## 9. Precision Bot

Current file:

- `src/components/games/LiteralBotTestGame.tsx`

New fantasy:

- a helper robot follows instructions exactly and creates funny failures when commands are vague

Interaction:

- present a small room with physical objects
- offer 2 to 3 instruction options, or let older players edit one keyword
- run the bot after selection

Animation beats:

- vague command produces a literal but wrong action
- precise command produces the exact intended result
- misunderstood word gets highlighted after the failure

Examples:

- `Turn it on` lights the nearest lamp, not the blue lamp
- `Put the cube over there` places it in the wrong zone
- `Charge the battery` picks the wrong battery

Acceptance criteria:

- failure should be funny, not shame-based
- concept should land through the bot's behavior
- older players get slightly more open-ended phrasing challenges

## 10. Boot the System

Current file:

- `src/components/games/LaunchTheLabGame.tsx`

New fantasy:

- final multi-stage boss room where the player restarts the entire Core

Structure:

- stage 1: unlock the binary gate
- stage 2: place missing hardware parts
- stage 3: route an input through the machine
- stage 4: send code through the terminal
- stage 5: issue one precise final command

Visual payoff:

- citywide blackout turns into a full power cascade
- rails light up across the skyline
- large doors open
- companion duo flies across the scene

Acceptance criteria:

- this should reuse previous mechanics, not invent a new quiz
- the ending must feel cinematic and climactic
- completion should visibly restore the whole map for Week 1

## UI System

Week 1 should use three layout families only.

### Bird's-eye Gameplay

Use for:

- Spaceship Command Game
- Motherboard Builder follow-up work
- final boss overview beats

Rules:

- map is the hero
- controls stay docked at bottom
- line of sight to consequences must be clear

### Scene + Control Panel

Use for:

- Computer Builder
- Memory Sorting Vault
- Input -> Process -> Output Machine
- Binary Door System

Rules:

- system occupies the left or center
- controls stay nearby and never replace the world view

### Cinematic Sandbox

Use for:

- 3D Code Terminal
- Code Detective
- Byte Forge

Rules:

- explanation overlays are small and reactive
- motion and transformation teach the concept

## Motion and Feedback Tokens

Use shared motion tokens rather than one-off timings per room.

Recommended tokens:

- `tapFast = 120ms`
- `snap = 220ms`
- `move = 420ms`
- `doorHeavy = 650ms`
- `successBurst = 700ms`
- `errorShake = 220ms`

Success feedback should combine:

- particles
- glow sweep
- sound cue
- companion reaction
- HUD update

Failure feedback should combine:

- shake or wobble
- spark or flicker
- short sound
- immediate retry opportunity

## Art Direction Notes

Use the provided reference style:

- rounded robots with expressive eyes
- toy-like hardware silhouettes
- bright cyan, teal, blue, lime, and amber effects
- clear hardware metaphors for CPU, RAM, storage, and motherboard parts

Avoid:

- flat generic cards
- too much small body text
- realistic industrial darkness with no warmth
- static icon-only teaching

## Recommended Build Order

Phase 1:

1. Upgrade `GameScene` into a true mission shell
2. Upgrade companion and stability systems
3. Ship the easiest high-impact rewrites:
4. `BinaryCountingGame.tsx`
5. `MemoryVaultGame.tsx`
6. `ByteForgeGame.tsx`

Phase 2:

1. Rewrite the card-based games into spatial scenes:
2. `ComponentMatchGame.tsx`
3. `CodeSortingGame.tsx`
4. `CodeEverywhereQuiz.tsx`
5. `LiteralBotTestGame.tsx`

Phase 3:

1. Build the more cinematic rooms:
2. `CodeExecutionChainGame.tsx`
3. `SignalTunnelGame.tsx`
4. `LaunchTheLabGame.tsx`

## Definition of Done

Week 1 is complete when:

- every room contains a primary visual system, not a list of answers
- every player input creates an immediate physical reaction
- every concept is taught through transformation, routing, placement, or execution
- companions feel alive and contextual
- the final boss reuses earlier mechanics and pays off the full story world

## Immediate Next Step

If implementation starts now, begin with:

1. `src/components/game/GameScene.tsx`
2. `src/components/games/BinaryCountingGame.tsx`
3. `src/components/games/MemoryVaultGame.tsx`

Those three changes will establish the shell, the motion language, and the first two strongest examples of cause-and-effect learning.
