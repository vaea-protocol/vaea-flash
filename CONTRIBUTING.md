# Contributing to VAEA Flash

Thanks for considering contributing to VAEA Flash. This document outlines the process for contributing to this repository.

## What can I contribute to?

- **SDKs** (`sdk/typescript`, `sdk/rust`, `sdk/python`) — Bug fixes, new features, better error handling
- **Frontend** (`frontend/web`) — UI improvements, new pages, accessibility
- **Examples** (`examples/`) — New use case examples, better documentation
- **Documentation** — Typo fixes, better explanations, new guides

> **Note:** The on-chain program and backend are maintained in a private repository. Core protocol changes are handled by the VAEA team.

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.75+ (for Rust SDK)
- Python 3.10+ (for Python SDK)

### Setup

```bash
git clone https://github.com/vaeaprotocol/vaea-flash.git
cd vaea-flash

# Frontend
cd frontend/web && npm install && npm run dev

# TypeScript SDK
cd sdk/typescript && npm install && npm run build

# Rust SDK
cd sdk/rust && cargo build

# Python SDK
cd sdk/python && pip install -e .
```

## Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Name your branch** with a prefix: `feat/`, `fix/`, `docs/`, `refactor/`
3. **Write clear commit messages** following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add mSOL support to Python SDK`
   - `fix: handle timeout in capacity endpoint`
   - `docs: update fee model explanation`
4. **Test your changes** — ensure existing tests pass and add new ones if applicable
5. **Open a PR** against `main` with a clear description of what changed and why

## Code Style

- **TypeScript:** Follow the existing ESLint config. Use strict types, avoid `any`.
- **Rust:** Run `cargo fmt` and `cargo clippy` before committing.
- **Python:** Follow PEP 8. Use type hints. Run `ruff` for linting.
- **Frontend:** Follow the existing design system in `globals.css`. Use the existing component patterns.

## Reporting Issues

Open an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- SDK version and environment details

## Security

If you discover a security vulnerability, **do not** open a public issue. Email security@vaea.fi with details.

## License

By contributing, you agree that your contributions will be licensed under the [BSL-1.1](LICENSE).
