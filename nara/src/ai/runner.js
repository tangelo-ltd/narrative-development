import { spawn } from 'node:child_process';

export async function runAI(prompt, aiConfig, options = {}) {
  if (!aiConfig || aiConfig.provider === 'none') {
    throw new Error('AI provider not configured');
  }

  const command = aiConfig.command || aiConfig.provider;
  const args = [...(aiConfig.args || [])];
  const promptMode = aiConfig.promptMode || 'stdin';

  if (promptMode === 'arg') {
    args.push(prompt);
  }

  const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', data => {
    stdout += data.toString();
  });

  child.stderr.on('data', data => {
    stderr += data.toString();
  });

  if (promptMode === 'stdin') {
    child.stdin.write(prompt);
    child.stdin.end();
  }

  const timeoutMs = options.timeoutMs ?? 60000;
  let timeoutId;
  let aborted = false;

  const onAbort = () => {
    aborted = true;
    child.kill('SIGINT');
  };

  if (options.signal) {
    if (options.signal.aborted) {
      onAbort();
    } else {
      options.signal.addEventListener('abort', onAbort, { once: true });
    }
  }

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      aborted = true;
      child.kill('SIGKILL');
    }, timeoutMs);
  }

  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (options.signal) {
        options.signal.removeEventListener('abort', onAbort);
      }
      if (aborted && timeoutMs > 0) {
        reject(new Error('AI command timed out'));
        return;
      }
      resolve({ stdout, stderr, code });
    });
  });
}
