import { main } from "./tagger";
import { setFailed } from "@actions/core";

try {
  main();
} catch (error: any) {
  setFailed(error);
}
