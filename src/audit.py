"""
Audit logger — records all DevPulse operations for compliance review.
Stores entries in a local JSON-lines file (one JSON object per line).
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from models import AuditAction, AuditEntry

log = logging.getLogger(__name__)

AUDIT_DIR = Path(__file__).parent.parent / "audit_logs"


class AuditLogger:
    def __init__(self, audit_dir: Path = AUDIT_DIR):
        self._audit_dir = audit_dir
        self._audit_dir.mkdir(parents=True, exist_ok=True)

    def _current_file(self) -> Path:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return self._audit_dir / f"audit_{date_str}.jsonl"

    def record(
        self,
        action: AuditAction,
        actor: str = "system",
        detail: str = "",
        success: bool = True,
    ) -> AuditEntry:
        entry = AuditEntry(
            id=uuid.uuid4().hex[:12],
            timestamp=datetime.now(timezone.utc),
            action=action,
            actor=actor,
            detail=detail,
            success=success,
        )
        line = entry.model_dump_json() + "\n"
        filepath = self._current_file()
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(line)
        log.info("AUDIT action=%s actor=%s success=%s detail=%s",
                 action.value, actor, success, detail[:120])
        return entry

    def read_entries(self, date_str: str | None = None) -> list[AuditEntry]:
        if date_str is None:
            date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        filepath = self._audit_dir / f"audit_{date_str}.jsonl"
        if not filepath.exists():
            return []
        entries = []
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    entries.append(AuditEntry.model_validate_json(line))
        return entries
