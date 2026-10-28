import { dts, ts } from "@tommy-mitchell/configs/tsdown";
import { defineConfig } from "tsdown";

export default defineConfig([{
	...ts,
	unbundle: false,
}, dts]);
