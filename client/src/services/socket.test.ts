import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocketService } from "./socket";

describe("SocketService", () => {
  let service: SocketService;
  let socket: any;

  beforeEach(() => {
    service = new SocketService();
    socket = {
      connected: true,
      emit: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
      removeAllListeners: vi.fn(),
    };
    (service as any).socket = socket;
  });

  it("syncMessages includes the barter id and the last message id", () => {
    service.syncMessages("barter-123", "msg-456");

    expect(socket.emit).toHaveBeenCalledWith("sync_messages", {
      barterId: "barter-123",
      lastMessageId: "msg-456",
    });
  });
});
