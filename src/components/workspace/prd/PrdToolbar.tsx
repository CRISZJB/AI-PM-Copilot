"use client";

import { Button } from "@/components/ui/Button";

export function PrdToolbar({
  onSave,
  onDownload,
  onCopy,
  onMarkSynced,
  showMarkSynced,
  statusMessage,
}: {
  onSave: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onMarkSynced?: () => void;
  showMarkSynced?: boolean;
  statusMessage?: string | null;
}) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onSave} className="px-3 py-1.5 text-xs">
          保存补充
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onDownload}
          className="px-3 py-1.5 text-xs"
        >
          下载 Markdown
        </Button>
        <Button type="button" variant="secondary" onClick={onCopy} className="px-3 py-1.5 text-xs">
          复制 Markdown
        </Button>
        {showMarkSynced && onMarkSynced ? (
          <Button
            type="button"
            variant="primary"
            onClick={onMarkSynced}
            className="px-3 py-1.5 text-xs"
          >
            标记已同步
          </Button>
        ) : null}
      </div>
      {statusMessage ? (
        <p className="text-xs text-ink-faint sm:text-right">{statusMessage}</p>
      ) : null}
    </div>
  );
}
