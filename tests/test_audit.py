"""Tests for audit logging."""

import tempfile
from pathlib import Path

from audit import AuditLogger, AuditAction


def test_record_and_read():
    with tempfile.TemporaryDirectory() as tmpdir:
        logger = AuditLogger(audit_dir=Path(tmpdir))
        logger.record(AuditAction.READ_PULSE, detail="test pulse")
        logger.record(AuditAction.DRAFT_CREATE, actor="alice", detail="draft 1")

        entries = logger.read_entries()
        assert len(entries) == 2
        assert entries[0].action == AuditAction.READ_PULSE
        assert entries[1].actor == "alice"


def test_read_empty_date():
    with tempfile.TemporaryDirectory() as tmpdir:
        logger = AuditLogger(audit_dir=Path(tmpdir))
        entries = logger.read_entries("2020-01-01")
        assert entries == []
