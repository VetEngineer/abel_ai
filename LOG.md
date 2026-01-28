# Work Log (2025-01-06)

## Context
- User reported: "콘텐츠 생성" 버튼 클릭 시 아무 반응 없음.
- Request: fix backend only; frontend edits are handled by Gemini and must not be touched.
- Follow-up: user requested sequential actions: (1) store content results, (2) update progress/executions, (3) test real API calls.

## Changes Made
### 1) Demo workflow routing in real endpoint
- File: `src/app/api/workflows/route.ts`
- Added demo storage to `/api/workflows`:
  - If `projectId === DEMO_PROJECT_ID` (default `550e8400-e29b-41d4-a716-446655440001`), create demo workflow, simulate agent steps, return `workflowId`.
  - `GET /api/workflows` now returns both demo + real workflows; `GET` by `workflowId` checks demo then real.
- Purpose: make demo flow work without touching frontend.

### 2) Real workflow progress + content persistence
- File: `src/lib/agents/agent-coordinator.ts`
  - Added `onStepUpdate` callback to `executeWorkflow` to emit processing/completed/error updates.
  - Added `getWorkflowSteps()` to expose outputs/errors per step.
- File: `src/app/api/workflows/route.ts`
  - Hooked `onStepUpdate` to update `agent_executions` and `current_step` in real workflows.
  - Collected step outputs via `getWorkflowSteps()` and stored `content_writing` output in `final_result.content` and `workflow.content`.

## Runtime Tests Performed
### Real workflow end-to-end
- `POST /api/workflows` with non-demo projectId
  - Result: workflow completed, `agent_executions` = 11, `current_step` = 11.
  - `workflow.content` now includes `fullContent`, `introduction`, `mainSections`, `conclusion`.

### Direct API connectivity checks
- Naver blog search: **401 Authentication failed**
- Claude messages: **200 OK**, response sample `pong`

## Known Issues / Follow-ups
1) Naver auth failure: verify `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` are correct and enabled for Search API.
2) (Optional) Use real Claude in `ContentWritingAgent` (currently mock content); backend is now ready to persist results.
3) Consider wiring real keyword output into UI if needed (trend results now stored server-side but not displayed).

## Notes
- No frontend files were modified.
- Environment: local server on `http://localhost:3000`.
