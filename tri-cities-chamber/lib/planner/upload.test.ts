import { describe, expect, it } from 'vitest';
import { checkFile, extractFromFileName, formatFileSize, idleUpload, uploadReducer } from './upload';

describe('uploadReducer', () => {
  it('moves idle -> uploading -> success', () => {
    let s = uploadReducer(idleUpload, { type: 'start', fileName: 'a.pdf', size: 1000 });
    expect(s).toMatchObject({ status: 'uploading', percent: 0, fileName: 'a.pdf' });
    s = uploadReducer(s, { type: 'progress', percent: 64 });
    expect(s).toMatchObject({ status: 'uploading', percent: 64 });
    s = uploadReducer(s, { type: 'succeed' });
    expect(s).toMatchObject({ status: 'success', fileName: 'a.pdf', size: 1000 });
  });

  it('ignores progress when not uploading', () => {
    expect(uploadReducer(idleUpload, { type: 'progress', percent: 10 })).toBe(idleUpload);
  });

  it('fails with a message and can retry the same file', () => {
    const up = uploadReducer(idleUpload, { type: 'start', fileName: 'a.pdf', size: 5 });
    const failed = uploadReducer(up, { type: 'fail' });
    expect(failed).toMatchObject({ status: 'error', fileName: 'a.pdf' });
    expect(uploadReducer(failed, { type: 'retry' })).toMatchObject({ status: 'uploading', percent: 0, fileName: 'a.pdf' });
  });

  it('cancel clears everything back to idle', () => {
    const up = uploadReducer(idleUpload, { type: 'start', fileName: 'a.pdf', size: 5 });
    expect(uploadReducer(up, { type: 'cancel' })).toEqual(idleUpload);
  });
});

describe('checkFile', () => {
  it('accepts a normal PDF and rejects other types or huge files', () => {
    expect(checkFile('a.pdf', 1000)).toBe(true);
    expect(checkFile('A.PDF', 1000)).toBe(true);
    expect(checkFile('a.xlsx', 1000)).toBe(false);
    expect(checkFile('a.pdf', 50 * 1024 * 1024)).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1.8 * 1024 * 1024)).toBe('1.8 MB');
  });
});

describe('extractFromFileName', () => {
  it('guesses a title from the file name', () => {
    expect(extractFromFileName('mayors-bbq_report.pdf')).toEqual({ title: 'Mayors Bbq Report' });
  });
});
