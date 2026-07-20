# /commit — Smart Commit

Look at `git diff --staged`. Write a commit message following this format:

```
<type>(<scope>): <short summary>

<optional body — what changed and why>
```

Types: feat, fix, refactor, docs, test, chore, style

Rules:
- Summary line: max 72 chars, imperative mood ("add" not "added")
- No period at the end
- Body only if the change needs explanation

Then run `git commit -m "<message>"`.
