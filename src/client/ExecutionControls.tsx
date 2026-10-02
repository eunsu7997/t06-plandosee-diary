import { useEffect, useRef, useState } from 'react';
import type { ExecutionLog, Task } from '../shared/types';
import { api } from './api';

type Run = (operation: () => Promise<void>, message: string) => Promise<boolean>;
const stamp = (value: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value));

export default function ExecutionControls({ task, logs, busy, run }: { task: Task; logs: ExecutionLog[]; busy: boolean; run: Run }) {
  const active = logs.find(log => log.ended_at === null);
  const [now, setNow] = useState(Date.now());
  const startRequest = useRef<string | null>(null);
  const finishRequests = useRef(new Map<string, string>());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active?.id]);
  function start() {
    const id = startRequest.current ??= crypto.randomUUID();
    void run(async () => {
      await api(`/tasks/${task.id}/start`, { method: 'POST', body: JSON.stringify({ request_id: id }) });
      startRequest.current = null;
    }, '실행 시작 시각을 서버 DB에 저장했습니다.');
  }
  function finish(log: ExecutionLog) {
    const id = finishRequests.current.get(log.id) ?? crypto.randomUUID();
    finishRequests.current.set(log.id, id);
    void run(async () => {
      await api(`/tasks/${task.id}/executions/${log.id}/finish`, { method: 'POST', body: JSON.stringify({ request_id: id }) });
    }, '종료 시각과 실제 시간을 저장했습니다. 예상 시간은 그대로 유지됩니다.');
  }
  return <div className="execution-controls">
    {active ? <p className="running" data-testid="active-execution">실행 중 · 시작 {stamp(active.started_at)} · 경과 {Math.max(0, Math.floor((now - Date.parse(active.started_at)) / 1000))}초</p> : null}
    <div className="actions">
      {active ? <button className="primary" disabled={busy} onClick={() => finish(active)}>완료</button>
        : task.status === 'completed' ? <button disabled={busy} onClick={() => void run(async () => { await api(`/tasks/${task.id}/reopen`, { method: 'POST', body: '{}' }); }, '진행 중으로 되돌렸습니다. 이전 실행 기록은 보존됩니다.')}>진행 중으로 되돌리기</button>
          : <button className="primary" disabled={busy} onClick={start}>시작</button>}
    </div>
    <details className="execution-history"><summary>실행 기록 ({logs.length}개)</summary>
      {logs.length ? <ol>{logs.map(log => <li key={log.id} data-testid="execution-record">
        <p>시작: {stamp(log.started_at)}<br />종료: {log.ended_at ? stamp(log.ended_at) : '진행 중'}</p>
        <p>실제 걸린 시간: {log.actual_seconds === null ? '완료 후 확정' : `${log.actual_seconds}초`} · 시작 당시 예상 시간: {log.estimated_seconds_at_start}초</p>
        <p className="id">실행 ID: <code>{log.id}</code></p>
      </li>)}</ol> : <p className="muted">아직 실행 기록이 없습니다.</p>}
    </details>
  </div>;
}
