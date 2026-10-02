-- Closed execution evidence cannot be changed, reopened or deleted.
CREATE TRIGGER execution_closed_immutable BEFORE UPDATE ON execution_logs
WHEN OLD.ended_at IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'closed execution is immutable'); END;

CREATE TRIGGER execution_identity_immutable BEFORE UPDATE ON execution_logs
WHEN NEW.id IS NOT OLD.id OR NEW.task_id IS NOT OLD.task_id
  OR NEW.started_at IS NOT OLD.started_at OR NEW.start_request_id IS NOT OLD.start_request_id
  OR NEW.estimated_seconds_at_start IS NOT OLD.estimated_seconds_at_start
BEGIN SELECT RAISE(ABORT, 'execution identity is immutable'); END;

CREATE TRIGGER execution_preserve_delete BEFORE DELETE ON execution_logs
BEGIN SELECT RAISE(ABORT, 'execution records must be preserved'); END;

CREATE TRIGGER execution_start_guard BEFORE INSERT ON execution_logs
WHEN NOT EXISTS (SELECT 1 FROM tasks WHERE id = NEW.task_id AND status = 'in_progress' AND deleted_at IS NULL)
BEGIN SELECT RAISE(ABORT, 'task is not available for execution'); END;

-- Integer millisecond arithmetic avoids floating point rounding at second boundaries.
CREATE TRIGGER execution_duration_guard BEFORE UPDATE ON execution_logs
WHEN OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL AND (
  typeof(NEW.actual_seconds) <> 'integer' OR
  NEW.actual_seconds <> (
    (CAST(strftime('%s', NEW.ended_at) AS INTEGER) * 1000 + CAST(substr(NEW.ended_at, 21, 3) AS INTEGER)) -
    (CAST(strftime('%s', NEW.started_at) AS INTEGER) * 1000 + CAST(substr(NEW.started_at, 21, 3) AS INTEGER))
  ) / 1000
)
BEGIN SELECT RAISE(ABORT, 'execution duration does not match timestamps'); END;

-- Closing a log and marking its task complete happen in one transaction.
CREATE TRIGGER execution_complete_task AFTER UPDATE OF ended_at ON execution_logs
WHEN OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL
BEGIN
  UPDATE tasks SET status = 'completed', completed_at = NEW.ended_at, updated_at = NEW.ended_at
  WHERE id = NEW.task_id;
END;

CREATE TRIGGER task_complete_guard BEFORE UPDATE OF status ON tasks
WHEN NEW.status = 'completed' AND EXISTS (SELECT 1 FROM execution_logs WHERE task_id = NEW.id AND ended_at IS NULL)
BEGIN SELECT RAISE(ABORT, 'task still has an active execution'); END;

CREATE TRIGGER task_delete_active_guard BEFORE UPDATE OF deleted_at ON tasks
WHEN NEW.deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM execution_logs WHERE task_id = NEW.id AND ended_at IS NULL)
BEGIN SELECT RAISE(ABORT, 'task still has an active execution'); END;

CREATE TRIGGER task_copy_source_guard BEFORE INSERT ON tasks
WHEN NEW.copied_from_task_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM tasks WHERE id = NEW.copied_from_task_id AND status = 'completed' AND deleted_at IS NULL
)
BEGIN SELECT RAISE(ABORT, 'copy source is no longer completed'); END;
