export type Recipient = { id: string; name: string; email: string };
export type MessageType = "text" | "audio" | "video" | "files";
export type Message = {
  id: string;
  title?: string;
  kind: MessageType;
  status: "draft" | "scheduled" | "delivered";
  deliverAt?: string | null;
  recipients: string[];
};
