
"use client";

import { useEffect, useState } from "react";

// Type for each uploaded document
type DocumentFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
};

export default function DocumentReaderPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(null);

  const [documentText, setDocumentText] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Find the selected document
  const selectedDocument = documents.find(
    (document) => document.id === selectedDocumentId
  );

  // Read the selected document
  useEffect(() => {
    if (!selectedDocument) {
      setDocumentText("");
      setPdfUrl("");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let url = "";

    setDocumentText("");
    setPdfUrl("");
    setError("");
    setLoading(true);

    if (selectedDocument.type === "TXT") {
      selectedDocument.file
        .text()
        .then((text) => {
          if (!cancelled) {
            setDocumentText(text);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError("Unable to read this document.");
            setLoading(false);
          }
        });
    }

    if (selectedDocument.type === "PDF") {
      url = URL.createObjectURL(selectedDocument.file);
      setPdfUrl(url);
      setLoading(false);
    }

    return () => {
      cancelled = true;

      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [selectedDocument]);

  // Upload PDF or TXT documents
  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files) return;

    setError("");

    const newDocuments: DocumentFile[] = [];
    let invalidFiles = false;

    Array.from(files).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension !== "txt" && extension !== "pdf") {
        invalidFiles = true;
        return;
      }

      newDocuments.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: extension.toUpperCase(),
        file: file,
      });
    });

    if (invalidFiles) {
      setError("Some files were skipped. Only PDF and TXT files are allowed.");
    }

    if (newDocuments.length > 0) {
      setDocuments((previous) => [...previous, ...newDocuments]);
      setSelectedDocumentId(newDocuments[0].id);
      setSearchTerm("");
    }

    event.target.value = "";
  }

  // View a document
  function handleViewDocument(id: string) {
    setSelectedDocumentId(id);
    setSearchTerm("");
    setError("");
  }

  // Delete a document
  function handleDeleteDocument(id: string) {
    const remainingDocuments = documents.filter(
      (document) => document.id !== id
    );

    setDocuments(remainingDocuments);

    if (selectedDocumentId === id) {
      setSelectedDocumentId(remainingDocuments[0]?.id || null);
      setSearchTerm("");
    }
  }

  // Count matching words in TXT documents
  const searchCount =
    searchTerm.trim() && selectedDocument?.type === "TXT"
      ? documentText.toLowerCase().split(searchTerm.toLowerCase()).length - 1
      : 0;

  // Highlight matching words
  function highlightText() {
    if (!searchTerm.trim()) {
      return documentText;
    }

    const result = [];
    const lowerText = documentText.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();

    let start = 0;
    let index = lowerText.indexOf(lowerSearch, start);

    while (index !== -1) {
      result.push(documentText.slice(start, index));

      result.push(
        <mark
          key={index}
          className="rounded bg-yellow-200 px-1 text-slate-900"
        >
          {documentText.slice(index, index + searchTerm.length)}
        </mark>
      );

      start = index + searchTerm.length;
      index = lowerText.indexOf(lowerSearch, start);
    }

    result.push(documentText.slice(start));

    return result;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            Document Management
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Document Reader
          </h1>

          <p className="mt-3 text-slate-600">
            Upload, organize, search, and preview your documents in one place.
          </p>
        </header>

        {/* Upload Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Upload Documents
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose PDF or TXT files from your computer.
          </p>

          <div className="mt-5 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
            <div className="mb-3 text-4xl">📁</div>

            <p className="font-medium text-slate-800">
              Select documents to get started
            </p>

            <p className="mt-1 text-sm text-slate-500">
              PDF and TXT formats supported
            </p>

            <input
              type="file"
              accept=".pdf,.txt"
              multiple
              onChange={handleFileChange}
              aria-label="Select documents"
              className="mx-auto mt-5 block max-w-full text-sm text-slate-600
                file:mr-4 file:rounded-lg file:border-0
                file:bg-blue-600 file:px-4 file:py-2
                file:font-medium file:text-white
                hover:file:bg-blue-700"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </section>

        {/* Main Content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left Column */}
          <div className="space-y-6 lg:col-span-1">

            {/* Saved Documents */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Saved Documents
                </h2>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {documents.length}
                </span>
              </div>

              {documents.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  No documents uploaded yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {documents.map((document) => (
                    <li
                      key={document.id}
                      className={`rounded-xl border p-3 transition ${
                        selectedDocumentId === document.id
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {document.type === "PDF" ? "📕" : "📄"}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="break-all text-sm font-medium text-slate-800">
                            {document.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {document.type} ·{" "}
                            {(document.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDocument(document.id)}
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(document.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Document Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Document Information
              </h2>

              {selectedDocument ? (
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">File Name</p>
                    <p className="mt-1 break-all font-medium text-slate-800">
                      {selectedDocument.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">File Size</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {(selectedDocument.size / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">File Type</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {selectedDocument.type}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Select a document to view its information.
                </p>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-2">

            {/* Search */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Search Document
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Find and highlight words in TXT documents.
              </p>

              <input
                type="text"
                placeholder="Search for a word..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                disabled={selectedDocument?.type !== "TXT"}
                className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              {searchTerm.trim() && selectedDocument?.type === "TXT" && (
                <p className="mt-3 text-sm font-medium text-blue-700">
                  {searchCount} match{searchCount === 1 ? "" : "es"} found
                </p>
              )}
            </section>

            {/* Preview */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Document Preview
                </h2>

                {selectedDocument && (
                  <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {selectedDocument.type}
                  </span>
                )}
              </div>

              {!selectedDocument && (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl bg-slate-50 p-6 text-center">
                  <span className="mb-3 text-4xl">📄</span>

                  <p className="font-medium text-slate-700">
                    No document selected
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Upload a document or choose one from your list.
                  </p>
                </div>
              )}

              {loading && (
                <p className="mt-4 text-sm text-blue-600">
                  Loading document...
                </p>
              )}

              {selectedDocument?.type === "TXT" && !loading && (
                <div className="max-h-[550px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-800">
                    {documentText
                      ? highlightText()
                      : "This document is empty."}
                  </pre>
                </div>
              )}

              {selectedDocument?.type === "PDF" && pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="PDF Document Preview"
                  className="h-[650px] w-full rounded-xl border border-slate-200"
                />
              )}
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-500">
          Document Reader · IDSP 3380 Group 6 · Frontend Demo
        </footer>
      </div>
    </main>
  );
}
