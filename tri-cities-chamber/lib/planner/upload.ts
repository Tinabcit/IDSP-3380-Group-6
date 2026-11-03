/** Where a PDF upload is: nothing chosen, sending, done, or failed. */
export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; fileName: string; size: number; percent: number }
  | { status: 'success'; fileName: string; size: number }
  | { status: 'error'; fileName: string; size: number };

/** What can happen to an upload. */
export type UploadAction =
  | { type: 'start'; fileName: string; size: number }
  | { type: 'progress'; percent: number }
  | { type: 'succeed' }
  | { type: 'fail' }
  | { type: 'retry' }
  | { type: 'cancel' };

/** The starting state: no file chosen. */
export const idleUpload: UploadState = { status: 'idle' };

/** The biggest file we accept, in bytes (10 MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Works out the next upload state from the current one and an action. */
export function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'start':
      return { status: 'uploading', fileName: action.fileName, size: action.size, percent: 0 };
    case 'progress':
      if (state.status !== 'uploading') return state;
      return { ...state, percent: Math.max(0, Math.min(100, Math.round(action.percent))) };
    case 'succeed':
      if (state.status !== 'uploading') return state;
      return { status: 'success', fileName: state.fileName, size: state.size };
    case 'fail':
      if (state.status !== 'uploading') return state;
      return { status: 'error', fileName: state.fileName, size: state.size };
    case 'retry':
      if (state.status !== 'error') return state;
      return { status: 'uploading', fileName: state.fileName, size: state.size, percent: 0 };
    case 'cancel':
      return idleUpload;
  }
}

/** True when the file is a PDF and not too big. */
export function checkFile(fileName: string, size: number): boolean {
  return /\.pdf$/i.test(fileName) && size <= MAX_UPLOAD_BYTES;
}

/** Turns a byte count into text like "500 B", "2.0 KB" or "1.8 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Pretend document reading: guesses an event title from the file name. */
export function extractFromFileName(fileName: string): { title: string } {
  const base = fileName.replace(/\.[^.]+$/, '');
  const title = base
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { title };
}
