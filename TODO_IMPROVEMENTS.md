## TODO: Future Improvements

### 1. Create Automated Check for Name Violations
- Run a daily `grep` sweep across all files
- Automatically flag policy violations in memory/alerts

### 2. Migrate to Full File-Based Redaction
- Remove references manually is error-prone
- Instead: Use `sed` or similar to do full project search/replace

### 3. Standardize Memory Organization
- Create function to write to Memory.md, and always write using the method
- This will alow better writing and more safe automated updates 

### 4. Clean all commit name references and reorganize all folder related to /orchestration/ - has a very bad structure there, needs review.