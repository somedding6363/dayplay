import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// id, name, email, emailVerified, image는 Auth.js Drizzle adapter가 요구하는 모양이다.
export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    // 순위에 보이는 이름. OAuth 이름은 노출하지 않는다. 처음 필요할 때 자동으로 만든다.
    nickname: text("nickname"),
  },
  // 영문 대소문자만 다른 닉네임은 같은 닉네임으로 본다.
  (user) => [uniqueIndex("users_nickname_lower_unique").on(sql`lower(${user.nickname})`)],
);
