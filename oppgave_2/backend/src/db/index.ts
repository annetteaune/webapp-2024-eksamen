import db from "./db";
import { setup } from "./setup";

// hentet fra emnerepo
(async () => {
  await setup(db);
})();
