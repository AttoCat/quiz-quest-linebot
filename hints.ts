import { format } from "https://deno.land/std@0.187.0/datetime/format.ts";
import {
  FlexCarouselMessage,
  FlexMessageBubble,
  FlexMessageContent,
} from "./types.ts";

const HINT_LABELS = "ABCDEFGHIJKLMN".split("").concat([
  "文書X",
  "文書Y",
]);

const getTemplateCarousel = async (): Promise<
  FlexCarouselMessage
> => JSON.parse(await Deno.readTextFile("./templates/hint-template.json"));

const getTemplateExtraBubble = async (): Promise<FlexMessageBubble> =>
  JSON.parse(await Deno.readTextFile("./templates/bubble-template.json"));

type milliseconds = number;
type numberOfHints = number;
type isoDatetime = string;

export const getAvailableHints = (
  currentDatetime: isoDatetime,
  timeTable: isoDatetime[],
): [numberOfHints, milliseconds | undefined] => {
  const unixCurrentDatetime: milliseconds = Date.parse(currentDatetime);
  const unixTimeTable: milliseconds[] = timeTable.map((time) =>
    Date.parse(time)
  );
  for (const [index, time] of unixTimeTable.entries()) {
    if (unixCurrentDatetime < time) return [index, time];
  }
  return [timeTable.length, undefined];
};

export const composeHintMessage = async (
  availableHints: numberOfHints,
  nextMilliSeconds: milliseconds | undefined,
) => {
  const buttons: FlexMessageContent[] = [...Array(availableHints).keys()].map(
    (n) => {
      return {
        type: "button",
        action: {
          type: "message",
          label: `${HINT_LABELS[n]}のヒント`,
          text: `#ヒント${HINT_LABELS[n]}`,
        },
      };
    },
  );
  const carousel: FlexCarouselMessage = await getTemplateCarousel();
  const currentHintsText = (availableHints == 16)
    ? "すべて"
    : `現在${availableHints}個`;
  carousel.contents[0].body.contents.push({
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: `${currentHintsText}公開済です。`,
        size: "xs",
      },
    ],
    paddingBottom: "20px",
  });
  if (availableHints >= 0) {
    carousel.contents[0].body.contents.push({
      type: "box",
      layout: "vertical",
      contents: buttons.slice(0, 4),
    });
  }
  if (availableHints >= 5) {
    carousel.contents.push(await getTemplateExtraBubble());
    carousel.contents[1].body.contents.push({
      type: "box",
      layout: "vertical",
      contents: buttons.slice(4, 10),
    });
  }
  if (availableHints >= 11) {
    carousel.contents.push(await getTemplateExtraBubble());
    carousel.contents[2].body.contents.push({
      type: "box",
      layout: "vertical",
      contents: buttons.slice(10, 16),
    });
  }
  const nextTimeText = (nextMilliSeconds === undefined) ? " " : format(
    new Date(
      nextMilliSeconds +
        ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000),
    ),
    "次の更新: HH:mm(20分毎)",
  );
  const footer: FlexMessageContent = {
    type: "text",
    text: nextTimeText,
    size: "xxs",
  };
  carousel.contents[0].footer.contents.push(footer);
  return { type: "flex", altText: "ヒント一覧", contents: carousel };
};
