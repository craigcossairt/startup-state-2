"use client";

import { BonusPage } from "@/components/bonus-page";
import { applicationChecklist } from "@/lib/bonus/checklist";

export default function ChecklistPage() {
  return (
    <BonusPage title="Application checklist" active="/map/checklist">
      {(payload) => {
        const items = applicationChecklist(payload.cards);
        if (items.length === 0) {
          return <p>No next steps on the current cards.</p>;
        }
        return (
          <ol className="list-decimal space-y-3 pl-5">
            {items.map((item) => (
              <li key={item.id}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-midnight underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="font-semibold">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        );
      }}
    </BonusPage>
  );
}
