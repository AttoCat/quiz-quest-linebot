export interface BaseMessage {
  type: string;
}

export interface FlexCarouselMessage extends BaseMessage {
  type: "carousel";
  contents: FlexMessageBubble[];
}

export interface FlexMessageBubble {
  type: "bubble";
  size: string;
  header: FlexMessageBox;
  body: FlexMessageBody;
  footer: FlexMessageBox;
}

type FlexMessageBody = FlexMessageBox;

export interface FlexMessageBox {
  type: "box";
  layout: string;
  contents: Array<FlexMessageBox | FlexMessageContent>;
  spacing?: string;
  paddingAll?: string;
  paddingTop?: string;
  paddingBottom?: string;
}

export interface FlexMessageContent {
  type: string;
  action?: Action;
  text?: string;
  weight?: string;
  size?: string;
  wrap?: boolean;
}

export interface Action {
  type: string;
  label: string;
  text: string;
}

export interface Webhook {
  destination: string;
  events: WebhookEvent[];
}

export interface WebhookEvent {
  type: "message" | string;
  mode: "active" | "stanby";
  timestam: number;
  source?: WebhookSource;
  webhookEventId: string;
  deliveryContext: { isRedelivery: boolean };
}

export interface WebhookSource {
  type: string;
  groupId?: string;
  roomId?: string;
  userId?: string;
}

export interface MessageEvent extends WebhookEvent {
  type: "message";
  replyToken: string;
  message:
    | TextMessage
    | ImageMessage
    | VideoMessage
    | AudioMessage
    | FileMessage
    | LocationMessage;
}

export interface TextMessage {
  id: string;
  type: "text";
  text: string;
  emojis?: Array<
    { index: number; length: number; productId: string; emojiId: string }
  >;
  mention?: {
    mentionees: Array<
      { index: number; length: number; type: "user" | "all"; userId?: string }
    >;
  };
}

interface ImageMessage {
  id: string;
  type: "image";
  contentProvider: {
    type: "line" | "external";
    originalContentUrl?: string;
    previewImageUrl?: string;
  };
  imageSet: { id: string; index: number; total: number };
}

interface VideoMessage extends Omit<ImageMessage, "type" | "imageSet"> {
  type: "video";
  duration?: number;
}

interface AudioMessage extends Omit<VideoMessage, "type"> {
  type: "audio";
}

interface FileMessage {
  id: string;
  type: "file";
  fileName: string;
  fileSize: number;
}

interface LocationMessage {
  id: string;
  type: "location";
  title?: string;
  address?: string;
  latitude: number;
  longitude: number;
}
