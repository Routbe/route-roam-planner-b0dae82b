/**
 * SHA-384 of the committed anonymous booking engine (wasm/rout-zk, ABI 5:
 * BBS / Blind BBS, Pedersen + Bulletproofs, Poseidon SMT, forward-secure host
 * keys, slot credentials, window presentations and capacity pools)
 * (src/lib/crypto-enclave/wasm/rout-zk.wasm, embedded in zk-wasm-bytes.ts),
 * built deterministically by wasm/rout-zk/build.sh with the official rustup
 * rustc 1.95.0 (commit 59807616e, LLVM 22.1.2) and Cargo.lock; two builds in
 * fresh target directories gave the same bytes. The loader refuses any other
 * bytes before compiling; CI (.github/workflows/wasm-reproducible.yml) rebuilds
 * and compares. Rebuild only with build.sh and update this pin in the same change.
 */
export const ROUT_ZK_WASM_SHA384: string | null = "a4a02c5f14e0fd6979a7327eaa31cfdc5e2c2e79a3b1887fa48c8bd38781765556132eab08b74fd63a0d06d8074a540c";
