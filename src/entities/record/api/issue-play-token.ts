import "server-only";
import { createPlayToken } from "../model/play-token";
import { playTokenSecret } from "./play-token-secret";

// 발급할 때 DB에 쓰지 않는다. 오늘 열린 게임인지는 일정을 아는 호출하는 쪽이 확인한다.
export function issuePlayToken(gameId: string, date: string, now = new Date()) {
  return createPlayToken({ gameId, date, issuedAt: now.getTime() }, playTokenSecret());
}
