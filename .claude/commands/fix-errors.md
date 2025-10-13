Read and analyze errors from .claude/errors.json, then propose fixes for each error.

Steps:

1. Read the error log file using the Read tool: /Users/mogedi/dev/yourtoyotapicks/.claude/errors.json
2. If no errors found, tell the user all tests are passing
3. For each error:
   - Identify the failing test and error type
   - Read the relevant source file if a file path is provided
   - Analyze the root cause
   - Propose a specific fix
4. After proposing all fixes, ask if the user wants you to apply them
5. If approved, apply fixes using the Edit tool
6. Suggest running tests again to verify fixes
