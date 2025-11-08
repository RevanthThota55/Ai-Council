# 📋 AI COUNCIL - ONE-PAGE CHEAT SHEET

**Keep this open while working with Claude Code!**

---

## 🎯 QUICK START (RIGHT NOW)

```cmd
cd E:\Ai-Council
claude code
```

Then paste the **FIRST PROMPT** from `AI-COUNCIL-MEGA-PROMPT.md` (section: "🚦 START HERE")

---

## 💬 DAILY COMMANDS

### What to Say to Claude Code:

**Starting your day:**
```
Show me today's plan
```

**After feature is done:**
```
Works perfectly! Next?
```
or
```
Got error: [paste error message]
```

**To check progress:**
```
npm run progress:report
```

**When confused:**
```
Explain this in simpler terms
```

**To take a break:**
```
Saving progress. Continuing later.
```

---

## 🛠️ USEFUL NPM COMMANDS

### Testing:
```bash
npm run dev              # Start development server
npm run build            # Test if everything builds
npm run test             # Run all tests
```

### Checks:
```bash
npm run check:types      # TypeScript errors
npm run check:lint       # Code quality
npm run check:all        # Run all checks
npm run progress:report  # Show progress
```

### Safety Net:
```bash
npm run checkpoint:save     # Save current state
npm run checkpoint:restore  # Go back to last good state
npm run error:search        # Find similar errors
```

---

## 🚨 EMERGENCY COMMANDS

**If everything is broken:**
```bash
npm run checkpoint:restore
```

**If you need to start fresh:**
```bash
npm run emergency:reset
```

**If dependencies are messed up:**
```bash
npm run deps:check
npm run deps:install
```

---

## 🤖 MULTI-AGENT SYSTEM QUICK REF

**Always 3 agents per task!**

### Common Agent Combinations:

| Task | Agents |
|------|--------|
| New Page | nextjs-architect, react-specialist, ui-designer |
| API Endpoint | api-architect, database-specialist, type-guardian |
| AI Integration | ai-integration-expert, api-architect, state-manager |
| Real-time | websocket-specialist, api-architect, react-specialist |
| Database | database-specialist, type-guardian, api-architect |

---

## ✅ SUCCESS CHECKLIST (Every Feature)

Before marking "Done":
- [ ] Builds successfully (`npm run build`)
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] Manual testing passed
- [ ] Git committed
- [ ] Progress updated

---

## 📊 PROJECT PHASES (25 DAYS)

```
Days 1-3:  Foundation ⚙️ (Setup + Bulletproof Systems)
Days 4-6:  Auth 🔐 (Login/Signup)
Days 7-10:  AI Agents 🤖 (OpenAI/Claude Integration)
Days 11-14: Chat UI 💬 (5-agent council interface)
Days 15-17: Memory 🧠 (Vector DB, context)
Days 18-20: Outputs 📄 (Docs, code, images)
Days 21-25: Polish ✨ (Testing, deployment)
```

**Today you're on:** _____________

---

## 🔥 GOLDEN RULES

1. ✅ **Always 3 agents per task**
2. ✅ **0 TypeScript errors tolerance**
3. ✅ **Test after every feature**
4. ✅ **Commit working code**
5. ✅ **One feature at a time**
6. ✅ **Backend before frontend**
7. ✅ **Ask for simple explanations**
8. ✅ **Trust Claude Code's decisions**

---

## 📁 PROJECT STRUCTURE QUICK MAP

```
E:\Ai-Council\
├── apps/
│   ├── web/           ← Next.js frontend (port 3000)
│   └── api/           ← Express backend (port 5001)
├── packages/
│   ├── shared-types/  ← TypeScript types
│   └── ai-agents/     ← Agent definitions
├── .data-center/      ← Error logs, patterns
├── docs/              ← Documentation
│   └── PROGRESS.md    ← Check this daily!
└── scripts/           ← Helper commands
```

---

## 🎯 DECISION MATRIX

### Claude Code Decides:
- File structure
- Component names
- API routes
- Styling details
- Helper functions
- Bug fixes

### You Decide:
- Major feature priorities
- UI/UX preferences
- Testing feedback
- When to take breaks!

### Ask You First:
- Paid services (costs money)
- Breaking changes (removes features)
- Major architecture shifts

---

## 💡 COMMUNICATION EXAMPLES

### ✅ GOOD:
```
"Works perfectly!"
"Error: Cannot find module 'react'"
"Explain authentication in simple terms"
"Show me what's completed so far"
```

### ❌ BAD:
```
"Make it better" (too vague)
"Fix everything" (which errors?)
"I think maybe we should..." (don't guess, ask)
```

---

## 🐛 DEBUGGING QUICK GUIDE

**When you hit an error:**

1. **Copy the EXACT error message**
2. **Tell Claude Code:** 
   ```
   Got error: [paste full error]
   ```
3. **Claude Code will:**
   - Search error database
   - Try known solutions
   - Fix the issue
   - Explain what happened

**If error persists after 2 attempts:**
- Use `npm run checkpoint:restore`
- Tell Claude Code to try a different approach

---

## 📈 TRACKING PROGRESS

### Daily Check-in:
```
npm run progress:report
```

Shows:
- Current phase
- Completed features
- Today's achievements
- Next up
- Overall % complete

### Weekly Review:
Check `docs/PROGRESS.md` for detailed breakdown

---

## 🎓 LEARNING NOTES

**After each feature, Claude Code will provide:**
- Simple explanation of what was built
- Why certain choices were made
- How the code works (in plain English)
- What you can learn from it

**Save these in:** `E:\Ai-Council\docs\LEARNING-LOG.md`

---

## 🆘 WHEN TO COME BACK TO CLAUDE.AI

Only return to Claude.ai if:
1. ❓ Claude Code is stuck for 4+ hours
2. ❓ You want to change the entire project direction
3. ❓ Major blocker that Claude Code can't solve
4. 🎉 Milestone celebration! (20%, 50%, 80%, 100%)

**95% of the time, Claude Code handles everything!**

---

## 🚀 NEXT STEPS RIGHT NOW

1. [ ] Open Claude Code
2. [ ] Paste the first prompt (from mega prompt file)
3. [ ] Wait 10-15 minutes for initialization
4. [ ] Test the setup
5. [ ] Tell Claude Code: "Works! Next phase?"
6. [ ] Watch the magic happen! ✨

---

## 💪 MOTIVATIONAL REMINDER

**You've got this because:**
- ✅ You completed Rydon V4 (85% in 5 weeks!)
- ✅ You learned Multi-Agent System
- ✅ You know bulletproof systems work
- ✅ You're more experienced now
- ✅ Claude Code is your autonomous teammate

**This is easier than Rydon V4!** 🎯

---

## 🔗 QUICK LINKS TO FILES

- `AI-COUNCIL-MEGA-PROMPT.md` - Complete guide
- `QUICK-START-GUIDE.md` - Step-by-step start
- `RYDON-VS-AI-COUNCIL.md` - Detailed comparison
- `AI-Council-MVP-Plan.md` - Original vision
- `E:\Ai-Council\docs\PROGRESS.md` - Daily progress

---

**🎯 START NOW! Open Claude Code and begin! 🚀**

---

## 📝 NOTES SECTION

**Use this space for quick notes while working:**

Today's Date: _______________

Current Phase: _______________

Last Feature Completed: _______________

Blockers: _______________

Questions for Next Session: _______________

---

**Keep this file open in a separate window for quick reference!** 📌
