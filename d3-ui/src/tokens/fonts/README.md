# Fonts

Inter and JetBrains Mono, both under the **SIL Open Font License 1.1**, self-hosted
as variable woff2 subsets (latin and latin-ext).

They are here because no app in the audit actually loaded the face it declared —
every one of them specified Inter and rendered a system fallback. These files are
the fix, and the licence requires they travel with their licence text:

- `Inter-OFL.txt` — Copyright (c) 2016 The Inter Project Authors
- `JetBrainsMono-OFL.txt` — Copyright 2020 The JetBrains Mono Project Authors

The OFL permits bundling and redistribution, including in this repository. It does
not permit selling the fonts on their own, and any modified version must not use
the reserved names.
