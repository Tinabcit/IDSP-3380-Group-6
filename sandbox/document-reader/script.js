// Get the HTML elements
const documentInput = document.getElementById("documentInput");
const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");
const fileSize = document.getElementById("fileSize");
const clearButton = document.getElementById("clearButton");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResult = document.getElementById("searchResult");
const documentPreview = document.getElementById("documentPreview");

// Store the document text
let currentDocumentText = "";

// Listen for a file being selected
documentInput.addEventListener("change", function () {
    const file = documentInput.files[0];

    if (!file) {
        return;
    }

    // Display file information
    fileName.textContent = file.name;
    fileType.textContent = file.type || "Unknown";
    fileSize.textContent = (file.size / 1024).toFixed(2) + " KB";

    // Check the file type
    if (file.name.toLowerCase().endsWith(".txt")) {
        readTextFile(file);
    } else if (file.name.toLowerCase().endsWith(".pdf")) {
        readPdfFile(file);
    } else if (file.name.toLowerCase().endsWith(".docx")) {
        readDocxFile(file);
    } else {
        documentPreview.textContent = "This file type is not supported.";
    }
});

// Read TXT file
function readTextFile(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        currentDocumentText = event.target.result;
        documentPreview.textContent = currentDocumentText;
    };

    reader.readAsText(file);
}

// Read PDF file
async function readPdfFile(file) {
    documentPreview.textContent = "Reading PDF...";

    try {
        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;

        let fullText = "";

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();

            const pageText = content.items
                .map(function (item) {
                    return item.str;
                })
                .join(" ");

            fullText += "Page " + pageNumber + "\n";
            fullText += pageText + "\n\n";
        }

        currentDocumentText = fullText;
        documentPreview.textContent = currentDocumentText;

    } catch (error) {
        documentPreview.textContent = "Unable to read this PDF.";
        console.error(error);
    }
}

// Read DOCX file
async function readDocxFile(file) {
    documentPreview.textContent = "Reading Word document...";

    try {
        const arrayBuffer = await file.arrayBuffer();

        const result = await mammoth.extractRawText({
            arrayBuffer: arrayBuffer
        });

        currentDocumentText = result.value;
        documentPreview.textContent = currentDocumentText;

    } catch (error) {
        documentPreview.textContent = "Unable to read this Word document.";
        console.error(error);
    }
}

// Search the document
searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!currentDocumentText) {
        searchResult.textContent = "Please upload a document first.";
        return;
    }

    if (!searchTerm) {
        searchResult.textContent = "Please enter a word to search.";
        return;
    }

    const documentText = currentDocumentText.toLowerCase();

    if (documentText.includes(searchTerm)) {
        searchResult.textContent =
            '"' + searchInput.value + '" was found in the document.';
    } else {
        searchResult.textContent =
            '"' + searchInput.value + '" was not found in the document.';
    }
});

// Clear the document
clearButton.addEventListener("click", function () {
    documentInput.value = "";

    fileName.textContent = "No file selected";
    fileType.textContent = "-";
    fileSize.textContent = "-";

    searchInput.value = "";
    searchResult.textContent = "";

    currentDocumentText = "";

    documentPreview.innerHTML =
        "<p>Your document content will appear here.</p>";
});