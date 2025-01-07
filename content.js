// Get all table rows
let courseRows = [];

setTimeout(() => {
    courseRows = document.querySelectorAll('tr[class*="css-"]');

    const headerRows = [
        ...courseRows[0].querySelectorAll("th"),
        ...courseRows[1].querySelectorAll("th"),
    ];

    // Extract column names
    const columnNames = Array.from(headerRows)
        .filter((row) => row.getAttribute("scope") !== "colgroup")
        .flatMap((row) => {
            return Array.from(row.querySelectorAll("button[title]")).map(
                (button) => button.getAttribute("title").split(" - ")[0]
            );
        });

    // Parse each row
    const courses = Array.from(courseRows)
        .map((row) => {
            // Get all td elements in this row
            const cells = row.querySelectorAll("td");

            // Create object to store the cell data
            const rowData = {};

            // Add each cell's text content to the object with index as key
            cells.forEach((cell, index) => {
                const innerDiv = cell.querySelector(
                    'div[class*="gwt-Label WNNO WGMO"]'
                );
                const attributeName = columnNames[index - 1];
                let attribute = innerDiv?.getAttribute("title");

                if (!attribute) {
                    attribute = cell.textContent.trim();
                }

                rowData[attributeName] = attribute;
            });

            return {
                section: rowData["Section"],
                instructor: rowData["Instructor"],
                meeting_pattern: rowData["Meeting Patterns"],
                start_date: rowData["Start Date"],
                end_date: rowData["End Date"],
                waitlisted: row.textContent.includes("Waitlisted"),
            };
        })
        .filter((course) => course !== null && !course.waitlisted);

    // Log results
    console.log(JSON.stringify(courses, null, 2));

    // Send courses object to the background script
    chrome.runtime.sendMessage({ courses: courses });
}, 7000);

// Add message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "FETCH_COMPLETE") {
        // Create and show popup
        fetch(chrome.runtime.getURL("popup.html"))
            .then((response) => response.text())
            .then((html) => {
                const div = document.createElement("div");
                div.innerHTML = html;
                document.body.appendChild(div.firstChild);

                // Remove popup after 3 seconds
                setTimeout(() => {
                    document.querySelector(".popup").remove();
                }, 3000);
            });
    } else if (message.type === "FETCH_ERROR") {
        // Handle error case
        console.error("Failed to update calendar:", message.error);
    }
});
