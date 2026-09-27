import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { readLocalRecords, removeLocalRecords } from "@/entities/record";
import { mergeLocalRecords } from "../api/play-actions";

// 로그인하면 이 브라우저에 남은 오늘 기록을 계정에 저장하고, 저장된 기록은 브라우저에서 지운다.
// 지난 날짜 기록은 병합하지 않고 브라우저에 그대로 둔다.
export function useLocalRecordSync(signedIn: boolean, today: string) {
  const router = useRouter();

  useEffect(() => {
    if (!signedIn) {
      return;
    }
    const pending = readLocalRecords().filter(
      (record) => record.date === today && record.playToken !== null,
    );
    if (pending.length === 0) {
      return;
    }
    mergeLocalRecords(pending)
      .then((merged) => {
        const stored = merged.filter((record) => record.stored).map((record) => record.id);
        if (stored.length > 0) {
          removeLocalRecords(stored);
          // 계정의 내 최고 기록을 다시 읽는다.
          router.refresh();
        }
      })
      .catch(() => {
        // 다음 방문 때 다시 시도한다.
      });
  }, [signedIn, today, router]);
}
