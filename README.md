# Database Migration Tool
A Node.js CLI tool to run SQL migrations. 

## Installation
```bash
git clone https://github.com/sternerr/migrator
cd migrator
pnpm install
pnpm link --global
migrator file.sql postgresql://username:password@host:port/dbname
```
