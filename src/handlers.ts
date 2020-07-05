import { WorkerHandlers } from "@watchedcom/sdk";

export const directoryHandler: WorkerHandlers["directory"] = async (
  input,
  ctx
) => {
  console.log("directory", input);
};

export const itemHandler: WorkerHandlers["item"] = async (input, ctx) => {
  console.log("item", input);
};
