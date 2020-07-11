import {
  WorkerHandlers,
  PlayableItem,
  MainItem,
  Source,
} from "@watchedcom/sdk";
import { makeRequest } from "./ard.service";
import { CompilationResponse, ItemResponse, TeaserTypes } from "./types";

const DIRECTORY_TYPES: TeaserTypes[] = ["compilation"];

export const directoryHandler: WorkerHandlers["directory"] = async (
  input,
  ctx
) => {
  console.log("directory", input);
  await ctx.requestCache(input);

  return makeRequest<CompilationResponse>(
    `https://api.ardmediathek.de/page-gateway/widgets/ard/editorials/${input.id}`,
    {
      pageNumber: input.cursor || 0,
    }
  ).then((data) => {
    const {
      pagination: { pageNumber, pageSize, totalElements },
    } = data;
    console.log({ pageNumber, pageSize, totalElements });
    return {
      items: data.teasers.map<MainItem>((teaser) => {
        return {
          type:
            DIRECTORY_TYPES.indexOf(teaser.type) !== -1 ? "directory" : "movie",
          id: teaser.links.target.id,
          ids: {
            id: teaser.links.target.id,
          },
          name: teaser.shortTitle,
          images: {
            poster: Object.values(teaser.images)[0]
              .src.replace("{width}", "900")
              .split("?")[0],
          },
        };
      }),
      nextCursor: pageNumber + 1,
    };
  });
};

export const itemHandler: WorkerHandlers["item"] = async (input, ctx) => {
  console.log("item", input);

  /** Geo restrictions based on IP */
  return ctx
    .fetch(
      `https://api.ardmediathek.de/page-gateway/pages/ard/item/${input.ids.id}`
    )
    .then<ItemResponse>((data) => data.json())
    .then((data) => {
      const widget = data.widgets[0];
      return {
        type: "movie",
        ids: {
          id: input.ids.id,
        },
        name: widget.title,
        description: widget.synopsis,
        sources: widget.mediaCollection.embedded._mediaArray[0]._mediaStreamArray
          .filter((_) => typeof _._quality === "number" && _._height)
          .map<Source>((_) => {
            return {
              type: "url",
              name: `ARD Mediathek (${_._height}p)`,
              url: (_._stream as string).replace(/^\/\//, "http://"),
            };
          }),
      };
    });
};
