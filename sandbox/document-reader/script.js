// Get the HTML elements
const documentInput = document.getElementById("documentInput");
const fileName = document.getElementById("fileName");
const documentPreview = document.getElementById("documentPreview");

// Listen for a file being selected
documentInput.addEventListener("change", function () {

    const file = documentInput.files[0];

    // Check if a file was selected
    if (!file) { fileName.textContent = "No file selected"; documentPreview.textContent = "Your document content will appear here.";
        return;
    }

    // Display the file name
    fileName.textContent = file.name;

    // Create a FileReader
    const reader = new FileReader();

    // Read and display the file
    reader.onload = function (event) {
        documentPreview.textContent = event.target.result;
    };

    reader.readAsText(file);
});