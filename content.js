// Generate or retrieve user ID
function getUserId() {
    return new Promise((resolve, reject) => {
        if (!chrome.storage || !chrome.storage.local) {
            reject(new Error("Chrome storage API is not available"));
            return;
        }

        chrome.storage.local.get(["user_id"], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            if (result.user_id) {
                resolve(result.user_id);
            } else {
                // Generate a new random ID if none exists
                const newId = crypto.randomUUID();
                chrome.storage.local.set({ user_id: newId }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    resolve(newId);
                });
            }
        });
    });
}

setTimeout(async () => {
    let courseRows = document.querySelectorAll('tr[class*="css-"]');

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
    chrome.runtime.sendMessage({ courses: course, user_id: await getUserId() });
}, 7000);
