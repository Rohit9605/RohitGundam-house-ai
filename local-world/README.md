# Local image-to-world backend

This is the bridge between House AI and a local HunyuanWorld installation. No paid API is required.

## Target pipeline

reference image -> HunyuanWorld image-to-panorama -> scene generation -> exported 3D world -> House AI viewer

Tencent's HunyuanWorld repository is intentionally kept outside this Next.js repo because its CUDA/PyTorch environment is large and Linux-oriented.

## Setup

1. Install HunyuanWorld following its official README:
   https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0
2. Verify its own example works first.
3. Copy .env.local.example to .env.local and set HUNYUAN_WORLD_DIR to the cloned repository.
4. Start this bridge:
   python local-world/server.py
5. Start Next.js normally with npm run dev.

The bridge accepts POST /generate as multipart/form-data with an image field. It creates a job, runs demo_panogen.py followed by demo_scenegen.py, and exposes job status under GET /jobs/<id>.

This is scaffolding for the real local pipeline; output discovery can differ between HunyuanWorld releases, so server.py returns the generated output directory and searches common mesh extensions rather than assuming one fixed filename.
