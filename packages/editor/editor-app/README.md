# ESEngine Editor

A cross-platform desktop visual editor built with Tauri 2.x + React 18.

## Prerequisites

Before running the editor, ensure you have the following installed:

- **Node.js** >= 18.x
- **pnpm** >= 10.x
- **Rust** >= 1.70 (for Tauri)
- **Platform-specific dependencies**:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/esengine/esengine.git
cd esengine
pnpm install
```

### 2. Build Dependencies

From the project root:

```bash
pnpm build:editor
```

### 3. Run Editor

```bash
cd packages/editor/editor-app
pnpm tauri:dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm tauri:dev` | Run editor in development mode with hot-reload |
| `pnpm tauri:build` | Build production application |
| `pnpm build:sdk` | Build editor-runtime SDK |

## Project Structure

```
editor-app/
├── src/                    # React application source
│   ├── components/         # UI components
│   ├── panels/             # Editor panels
│   └── services/           # Core services
├── src-tauri/              # Tauri (Rust) backend
├── public/                 # Static assets
└── scripts/                # Build scripts
```

## Troubleshooting

### Build Errors

```bash
pnpm clean
pnpm install
pnpm build:editor
```

### Rust/Tauri Errors

```bash
rustup update
```

## Documentation

- [ESEngine Documentation](https://esengine.cn/)
- [Tauri Documentation](https://tauri.app/)

## License

MIT License
