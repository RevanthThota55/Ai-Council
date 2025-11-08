# LOCAL PROMPT STRUCTURE RULES
**How to Structure Every Task (Claude Code Internal Guide)**

---

## 🎯 MANDATORY 4-PART STRUCTURE

Every task you (Claude Code) execute MUST follow this structure internally:

### Part 1: Agent Selection
```
Agents: [agent1-name], [agent2-name], [agent3-name]
```

### Part 2: Agent Task Assignment
```
Agent Tasks:
- [agent1-name]: [Specific responsibility]
- [agent2-name]: [Specific responsibility]
- [agent3-name]: [Specific responsibility]
```

### Part 3: Implementation Plan
```
Implementation:
1. [Step 1 with file path]
2. [Step 2 with file path]
3. [Step 3 with file path]
4. [Testing steps]
```

### Part 4: Validation Commands
```
Validation:
- npx tsc --noEmit (0 errors)
- npm run lint (0 warnings)
- npm run build (success)
- npm run test (all pass)
- [Manual testing steps]
```

---

## 📋 COMPLETE EXAMPLE

### Task: Create User Registration API Endpoint

```
=== TASK: User Registration API Endpoint ===

Agents: api-architect, database-specialist, type-guardian

Agent Tasks:
- api-architect: Design RESTful endpoint structure and Express route
- database-specialist: Create Prisma schema and database operations
- type-guardian: Define TypeScript interfaces and ensure type safety

Implementation:
1. Create apps/api/src/types/auth.types.ts
   - Define RegisterRequest interface
   - Define RegisterResponse interface
   - Define User type

2. Update apps/api/prisma/schema.prisma
   - Add User model with id, email, password, createdAt fields
   - Run: npx prisma migrate dev --name add_user_model

3. Create apps/api/src/routes/auth.ts
   - POST /register endpoint
   - Validate email format (regex)
   - Validate password (min 8 chars)
   - Hash password with bcrypt (10 rounds)
   - Create user in database with Prisma
   - Generate JWT token (24h expiry)
   - Return { token, user } object
   - Handle errors: duplicate email, validation failures

4. Create apps/api/src/middleware/validation.ts
   - Email validation function
   - Password validation function

5. Update apps/api/src/index.ts
   - Import and mount auth routes at /api/auth

Validation:
- npx tsc --noEmit → 0 errors
- npm run lint → 0 warnings
- npm run dev → Server starts on port 5001
- Test with curl:
  curl -X POST http://localhost:5001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password123"}'
- Should return: { "token": "jwt...", "user": {...} }
- Test duplicate: Same curl should return 409 error
- Check database: User record should exist in DB

Success Criteria:
✓ TypeScript: 0 errors
✓ Build: successful
✓ Registration: works with valid data
✓ Validation: rejects invalid email
✓ Validation: rejects short password
✓ Duplicate: returns proper error
✓ Database: user saved correctly
✓ Token: JWT generated and valid

Next Task: Create login endpoint
```

---

## 🔑 KEY PRINCIPLES

### 1. Specificity Over Generality

**Bad (too vague):**
```
Create authentication system
```

**Good (specific):**
```
Create POST /api/auth/register endpoint in apps/api/src/routes/auth.ts
that accepts email and password, validates them, hashes password,
saves to database, and returns JWT token
```

### 2. Exact File Paths Always

**Bad:**
```
Create a types file
```

**Good:**
```
Create apps/api/src/types/auth.types.ts
```

### 3. One Task = One Feature

**Bad (multiple features):**
```
Create login, logout, and password reset
```

**Good (single feature):**
```
Create POST /api/auth/login endpoint
[COMPLETE]
Then: Create POST /api/auth/logout endpoint
[COMPLETE]
Then: Create POST /api/auth/reset-password endpoint
```

### 4. Testing is Part of the Task

**Bad:**
```
Create endpoint
[Done]
```

**Good:**
```
Create endpoint
Test with curl
Verify database entry
Check error handling
[Only then: Done]
```

---

## 🤖 AGENT SELECTION GUIDE

### Available Agents (10 Total):

1. **nextjs-architect** (92%) - Next.js App Router, routing, SSR
2. **react-specialist** (88%) - React components, hooks, patterns
3. **api-architect** (92%) - Express APIs, REST, authentication
4. **database-specialist** (90%) - Prisma, PostgreSQL, migrations
5. **ai-integration-expert** (85%) - OpenAI/Claude API, prompts
6. **ui-designer** (87%) - Tailwind, shadcn/ui, responsive design
7. **state-manager** (89%) - Zustand stores, state patterns
8. **websocket-specialist** (84%) - Socket.io, real-time features
9. **type-guardian** (91%) - TypeScript, type safety, schemas
10. **system-architect** (93%) - Project structure, tooling, CI/CD

### Selection Matrix:

| Task Type | Agent Combination | Success Rate |
|-----------|------------------|--------------|
| New Page/Route | nextjs-architect, react-specialist, ui-designer | 89% |
| API Endpoint | api-architect, database-specialist, type-guardian | 92% |
| AI Feature | ai-integration-expert, api-architect, state-manager | 86% |
| Real-time | websocket-specialist, api-architect, react-specialist | 85% |
| UI Component | ui-designer, react-specialist, nextjs-architect | 88% |
| Database | database-specialist, type-guardian, api-architect | 91% |
| Auth System | api-architect, database-specialist, type-guardian | 92% |
| State | state-manager, react-specialist, type-guardian | 89% |
| Setup | system-architect, nextjs-architect, api-architect | 93% |

**Always pick the combination with highest success rate for the task type!**

---

## ✅ VALIDATION CHECKLIST

Before marking any task as "Done", verify:

### Code Quality:
- [ ] TypeScript: npx tsc --noEmit → 0 errors
- [ ] ESLint: npm run lint → 0 warnings
- [ ] Build: npm run build → success
- [ ] Tests: npm run test → all pass

### Functionality:
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] No console errors

### Documentation:
- [ ] Code comments added (WHY, not WHAT)
- [ ] API endpoint documented (if API)
- [ ] PROGRESS.md updated
- [ ] Types documented (if complex)

### Safety:
- [ ] Git commit with clear message
- [ ] Checkpoint saved
- [ ] Pattern logged to .data-center
- [ ] No breaking changes to existing code

---

## 🚨 COMMON MISTAKES TO AVOID

### Mistake 1: Skipping Agent Selection
❌ "Just create the feature"
✅ "Agents: api-architect, database-specialist, type-guardian"

### Mistake 2: Vague Steps
❌ "Add validation"
✅ "Create src/middleware/validation.ts with email regex and password length check"

### Mistake 3: No Testing Plan
❌ "Create endpoint [Done]"
✅ "Create endpoint → Test with curl → Verify DB → Check errors [Then Done]"

### Mistake 4: Skipping Type Safety
❌ Using 'any' type
✅ Defining explicit TypeScript interfaces

### Mistake 5: No Rollback Point
❌ Work for hours without committing
✅ Commit after each working feature

---

## 📊 TASK COMPLEXITY LEVELS

### Simple Task (30-60 min):
```
- Single file creation
- Simple function
- Basic UI component
```
Example: Create a button component

### Medium Task (1-3 hours):
```
- Multiple related files
- API endpoint with validation
- Page with state management
```
Example: User registration endpoint

### Complex Task (3-8 hours):
```
- Multiple interconnected parts
- Database migrations
- Frontend + Backend integration
```
Example: Complete authentication system

**Break complex tasks into multiple medium/simple tasks!**

---

## 🎯 COMPLETION CRITERIA

### Feature is "Done" when:

1. **Builds Successfully**
   ```bash
   npm run build
   # Output: Build completed successfully
   ```

2. **No Type Errors**
   ```bash
   npx tsc --noEmit
   # Output: No errors found
   ```

3. **Passes Linting**
   ```bash
   npm run lint
   # Output: No warnings or errors
   ```

4. **Tests Pass**
   ```bash
   npm run test
   # Output: All tests passed
   ```

5. **Manual Testing Done**
   - Feature works as expected
   - Edge cases tested
   - Error handling verified

6. **Documented**
   - Code has comments
   - API docs updated (if applicable)
   - PROGRESS.md updated

7. **Checkpointed**
   - Git commit created
   - Pattern saved to .data-center
   - Can rollback if needed

**Only mark "Done" when ALL criteria met!**

---

## 💬 COMMUNICATION FORMAT

### When Task Complete:

```
✅ Feature Complete: [Feature Name]

What was built:
- [File 1]: [Purpose]
- [File 2]: [Purpose]

How it works:
[Simple explanation with analogy]

Testing done:
- [Test 1]: ✅ Passed
- [Test 2]: ✅ Passed

Learning note:
[Simple explanation of key concepts]

Next task:
[What comes next]

---
Test it yourself:
[Commands for Revanth to run]
```

### When Error Occurs:

```
⚠️ Hit an issue but solved it!

Error: [Simple description]
Cause: [Why it happened]
Solution: [How I fixed it]
Lesson: [What we learned]

Status: ✅ Fixed and working now
```

---

## 🔥 FINAL REMINDERS

### Always Remember:
1. **Exactly 3 agents** per task
2. **Specific file paths** in every step
3. **Test before "Done"** - no exceptions
4. **Explain simply** for Revanth's learning
5. **Commit frequently** - save progress
6. **0 error tolerance** - fix immediately

### Never Do:
1. ❌ Skip agent selection
2. ❌ Combine multiple features
3. ❌ Mark done without testing
4. ❌ Use technical jargon without explanation
5. ❌ Accumulate errors
6. ❌ Forget to commit

---

## 📚 QUICK REFERENCE

### Starting a Task:
```
1. Read requirement
2. Select 3 agents
3. Plan implementation steps
4. Code
5. Test
6. Commit
7. Communicate
```

### If Error Occurs:
```
1. Don't panic
2. Read error carefully
3. Search error database
4. Apply known solution OR reason through it
5. Fix
6. Test
7. Log solution
8. Continue
```

### Finishing a Task:
```
1. Run all validation checks
2. Manual testing
3. Git commit
4. Update PROGRESS.md
5. Log pattern
6. Communicate clearly to Revanth
7. Move to next task
```

---

**FOLLOW THIS STRUCTURE FOR EVERY TASK!**  
**86-93% SUCCESS RATE GUARANTEED!**

---

**END OF PROMPT STRUCTURE RULES**
