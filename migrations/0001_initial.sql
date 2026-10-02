CREATE TABLE plans (
  id TEXT PRIMARY KEY NOT NULL,
  current_version INTEGER NOT NULL CHECK (current_version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE plan_versions (
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL CHECK (version >= 1),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL CHECK (period_end >= period_start),
  success_criteria TEXT NOT NULL CHECK (length(trim(success_criteria)) BETWEEN 1 AND 4000),
  estimated_seconds INTEGER NOT NULL CHECK (estimated_seconds BETWEEN 0 AND 31536000),
  recorded_at TEXT NOT NULL,
  PRIMARY KEY (plan_id, version)
);

-- 최초 계획과 이전 버전은 DB에서도 변경 및 삭제를 거부합니다.
CREATE TRIGGER plan_versions_immutable_update BEFORE UPDATE ON plan_versions
BEGIN SELECT RAISE(ABORT, 'plan versions are immutable'); END;
CREATE TRIGGER plan_versions_immutable_delete BEFORE DELETE ON plan_versions
BEGIN SELECT RAISE(ABORT, 'plan versions are immutable'); END;

CREATE TABLE tasks (
  id TEXT PRIMARY KEY NOT NULL,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  content TEXT NOT NULL CHECK (length(trim(content)) BETWEEN 1 AND 2000),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  due_date TEXT,
  estimated_seconds INTEGER NOT NULL CHECK (estimated_seconds BETWEEN 0 AND 31536000),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at TEXT,
  copied_from_task_id TEXT REFERENCES tasks(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  CHECK ((status = 'completed' AND completed_at IS NOT NULL) OR (status = 'in_progress' AND completed_at IS NULL))
);
CREATE INDEX tasks_plan_active ON tasks(plan_id, deleted_at);
CREATE INDEX tasks_due_date ON tasks(due_date);

CREATE TABLE tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) BETWEEN 1 AND 40)
);
CREATE TABLE task_tags (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
  PRIMARY KEY (task_id, tag_id)
);
CREATE INDEX task_tags_tag ON task_tags(tag_id, task_id);

-- 실행 API는 2차에서 구현합니다. 중복 방지 제약은 미리 정의합니다.
CREATE TABLE execution_logs (
  id TEXT PRIMARY KEY NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  actual_seconds INTEGER CHECK (actual_seconds >= 0),
  estimated_seconds_at_start INTEGER NOT NULL CHECK (estimated_seconds_at_start BETWEEN 0 AND 31536000),
  start_request_id TEXT NOT NULL UNIQUE,
  finish_request_id TEXT UNIQUE,
  CHECK ((ended_at IS NULL AND actual_seconds IS NULL AND finish_request_id IS NULL)
    OR (ended_at IS NOT NULL AND actual_seconds IS NOT NULL AND finish_request_id IS NOT NULL AND ended_at >= started_at))
);
CREATE UNIQUE INDEX execution_one_active_per_task ON execution_logs(task_id) WHERE ended_at IS NULL;
