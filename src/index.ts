import { createWorkerAddon, runCli } from "@watchedcom/sdk";
import { directoryHandler, itemHandler } from "./handlers";

const ardMediathekAddon = createWorkerAddon({
  id: "watched-addon-ard-mediathek",
  name: "ARD Mediathek",
  version: "0.0.0",
  itemTypes: ["movie", "series"],
});

ardMediathekAddon.registerActionHandler("directory", directoryHandler);
ardMediathekAddon.registerActionHandler("item", itemHandler);

runCli([ardMediathekAddon]);
