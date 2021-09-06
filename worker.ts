import { worker } from "workerpool";
import { VM } from "vm2";
import { inspect } from "util"

const run = (code:string) => inspect(new VM().run(code), { depth: null, maxArrayLength: null });

worker({ run: run });